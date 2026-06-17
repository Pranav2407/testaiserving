import * as constants from "../constants.js";
import * as util from "../util.js";
import * as analytics from "../analytics.js";
import {initInstructionOverlay, showInstructionOverlay} from "../instruction-overlay";
import axios from 'axios';
import {cfDownloadDomains} from "../constants.js";
import {proxyInstallLink} from "../constants.js";

export function initLander(productType, tbInit, downloadFileName = null) {
    window.islanding = true;
    util.generateUserID();
    setTimeout(() => {
        try{
            navigator.sendBeacon(constants.eventUrl, JSON.stringify({
                [constants.eventDimensions.id]: util.getUserId(),
                [constants.eventDimensions.en]: constants.eventNames.limp,
                [constants.eventDimensions.cu]: window.location.href,
            }));
        }catch(ignore){}
    });

    const installClass = constants.classNames.download;
    window.downloadAttempts = 0; // Track number of download attempts
    window.landingImpressionTime = "start_"+Date.now();

    if (tbInit) {
        localStorage.setItem(constants.localStorageDimension.taboolaConfig, JSON.stringify(tbInit));
    }

    function getDownloadFileName() {
        if (downloadFileName) {
            return  `${downloadFileName}_aiBrowserSetup.exe`;
        }else{
            return  'aiBrowserSetup.exe';
        }
    }



    function getInstallLink() {
        let installLink = (constants.installLink) + "?id=" + util.getUserId() + "&d=" + LANDER_DOMAIN;
        let campaignId = analytics.getCampaignId();
        if(campaignId){
            installLink += "&campaignId=" + campaignId;
        }
        // let installLink = constants.installLink + "?id=" + util.getUserId();
        let campaignParams = analytics.getCampaignParams();
        if (campaignParams["ai5"] && cfDownloadDomains.includes(campaignParams["ai5"]))
            installLink = constants.cfInstallLink + "?id=" + util.getUserId();
        if (productType) {
            installLink += "&Product=" + productType;
        }
        const analyticsIDObj = analytics.getAnalyticsID();
        if(analyticsIDObj && Object.keys(analyticsIDObj).length > 0){
            Object.keys(analyticsIDObj).forEach(key => {
                installLink += "&ci=" + analyticsIDObj[key];
            });
        }
        return installLink
    }

    function removeLoader() {
        document.querySelectorAll('.' + installClass).forEach(button => {
            button.classList.remove('loading');
        });
    }

    async function downloadWithAxios(url) {
        const downloadStartTime = Date.now();
        let bytesReceived = 0;
        let downloadEndTime;

        try {
            const response = await axios({
                method: 'get',
                url: url,
                responseType: 'blob',
                timeout: 60000, // 30 second timeout
                onDownloadProgress: (progressEvent) => {
                    bytesReceived = progressEvent.loaded;
                }
            });
            navigator.sendBeacon(constants.eventUrl, JSON.stringify({
                [constants.eventDimensions.id]: util.getUserId(),
                [constants.eventDimensions.en]: "pre_file_returned",
                [constants.eventDimensions.cu]: window.location.href,
            }));
            downloadEndTime = Date.now();
            const blob = new Blob([response.data]);
            const downloadStats = {
                totalTime: downloadEndTime - downloadStartTime,
                bytesReceived: bytesReceived,
                downloadAttempt: window.downloadAttempts
            };
            const networkDetails = {
                speed: navigator.connection?.downlink || 'unknown',
                type: navigator.connection?.type || 'unknown',
                effectiveType: navigator.connection?.effectiveType || 'unknown',
                downlink: navigator.connection?.downlink || 'unknown',
                rtt: navigator.connection?.rtt || 'unknown',
                saveData: navigator.connection?.saveData || 'unknown'
            }

            analytics.fireEvent(constants.eventNames.dwnsc, {
                [constants.eventDimensions.ec]: "Download Flow",
                [constants.eventDimensions.dwul]: url,
                [constants.eventDimensions.rsn]: JSON.stringify(downloadStats),
                [constants.eventDimensions.elac]: JSON.stringify(networkDetails),

            });

            return blob;
        } catch (error) {
            downloadEndTime = Date.now();
            let errorDetails = {
                message: error.message,
                code: error.code || 'unknown',
                status: error.response?.status || 'no_status',
                statusText: error.response?.statusText || 'no_status_text',
                downloadAttempt: window.downloadAttempts,
                bytesReceived: bytesReceived,
                totalTime: downloadEndTime - downloadStartTime,
                headers: error.response?.headers || {}
            };

            const networkDetails = {
                speed: navigator.connection?.downlink || 'unknown',
                type: navigator.connection?.type || 'unknown',
                effectiveType: navigator.connection?.effectiveType || 'unknown',
                downlink: navigator.connection?.downlink || 'unknown',
                rtt: navigator.connection?.rtt || 'unknown',
                saveData: navigator.connection?.saveData || 'unknown'
            }

            if (error.response) {
                errorDetails.type = 'server_error';
                errorDetails.data = error.response.data;
                errorDetails.serverTime = error.response.headers['date'];
            } else if (error.request) {
                errorDetails.type = 'network_error';
            } else {
                errorDetails.type = 'request_setup_error';
            }

            analytics.fireEvent(constants.eventNames.dwnfl, {
                [constants.eventDimensions.ec]: "Download Flow",
                [constants.eventDimensions.rsn]: JSON.stringify(errorDetails),
                [constants.eventDimensions.elac]: JSON.stringify(networkDetails),
                [constants.eventDimensions.eltg]: errorDetails.type,
                [constants.eventDimensions.dwul]: url
            });
            throw error;
        }
    }

    function save(object, name) {
        var a = document.createElement('a');
        var url = URL.createObjectURL(object);
        a.href = url;
        a.download = name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    function extractInstallUrlParamsAsDimensions(installLink) {
        const url = new URL(installLink);
        const params = new URLSearchParams(url.search);
        const dimensions = {};
        for(const [key, value] of params.entries()) {
            if(Object.keys(constants.eventDimensions).includes(key)) {
                dimensions[constants.eventDimensions[key]] = value;
            }
        }
        return dimensions;
    }

    // Update the click handler to use new download function
    util.fireEventsByClassName(installClass, function (event, target) {
        // addMoreAttributeForHotJar();
        event.preventDefault();
        showInstructionOverlay();

        if (target.classList.contains('loading')) return;
        target.classList.add('loading');

        window.downloadAttempts++; // Increment download counter
        const installLink = getInstallLink();

        analytics.fireEvent(constants.eventNames.ic, {
            [constants.eventDimensions.elcp]: target.innerText,
            [constants.eventDimensions.ec]: target.getAttribute("download-position"),
            [constants.eventDimensions.rsn]: JSON.stringify({
                downloadAttempt: window.downloadAttempts
            }),
            ...extractInstallUrlParamsAsDimensions(installLink)
        });
        console.log("firing ga event cta click");
        analytics.fireGAEvent(constants.gaEventNames.ctaClick, {
            [constants.eventDimensions.elcp]: target.innerText,
            [constants.eventDimensions.ec]: target.getAttribute("download-position"),
            [constants.eventDimensions.rsn]: JSON.stringify({
                downloadAttempt: window.downloadAttempts
            })
        });

        downloadWithAxios(installLink).then(function (blob) {
            event.preventDefault();
            save(blob, getDownloadFileName());
            removeLoader();
        }).catch(function (error) {
            removeLoader();
        });
    });

    // function addMoreAttributeForHotJar() {
    //     if (typeof window.hj === 'function') {
    //         analytics.fireEvent(constants.eventNames.hjDf);
    //         let userId = util.getUserId();
    //         let campaignParams = analytics.getCampaignParams();
    //         window.hj('identify', userId, {
    //             'ai1': campaignParams['ai1'],
    //             'ai2': campaignParams['ai2'],
    //             'ai5': campaignParams['ai5'],
    //             'landerUrl': window.location.href
    //         });
    //     }
    // }


    // for (let i = 0; i < 5; i++) {
    //     setTimeout(addMoreAttributeForHotJar, i*500);
    // }
    analytics.attachDynamicEeventListener();
    // document.addEventListener('DOMContentLoaded', () => {
    analytics.fireEvent(constants.eventNames.lp);
    console.log("firing ga event landing imp");
    analytics.fireGAEvent(constants.gaEventNames.landingImpression);
    // });
    initInstructionOverlay();
}