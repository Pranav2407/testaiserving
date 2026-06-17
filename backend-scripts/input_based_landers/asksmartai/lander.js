import * as constants from "../../constants.js";
import * as util from "../../util.js";
import * as analytics from "../../analytics.js";
import {initInstructionOverlay, showInstructionOverlay} from "../../instruction-overlay";
import axios from 'axios';
import {cfDownloadDomains} from "../../constants.js";

export function initLander(productType, tbInit, downloadFileName = null) {
    window.islanding = true;
    util.generateUserID();
    const installClass = constants.classNames.download;
    let downloadAttempts = 0; // Track number of download attempts

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
        let installLink = constants.installLink + "?id=" + util.getUserId();
        let campaignParams = analytics.getCampaignParams();
        if (campaignParams["ai5"] && cfDownloadDomains.includes(campaignParams["ai5"]))
            installLink = constants.cfInstallLink + "?id=" + util.getUserId();
        if (productType) {
            installLink += "&Product=" + productType;
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
            downloadEndTime = Date.now();
            const blob = new Blob([response.data]);
            const downloadStats = {
                totalTime: downloadEndTime - downloadStartTime,
                bytesReceived: bytesReceived,
                downloadAttempt: downloadAttempts
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
                downloadAttempt: downloadAttempts,
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

    // Update the click handler to use new download function
    util.fireEventsByClassName(installClass, function (event, target) {
        // addMoreAttributeForHotJar();
        event.preventDefault();
        showInstructionOverlay();

        if (target.classList.contains('loading')) return;
        target.classList.add('loading');

        downloadAttempts++; // Increment download counter

        analytics.fireEvent(constants.eventNames.ic, {
            [constants.eventDimensions.elcp]: target.innerText,
            [constants.eventDimensions.ec]: target.getAttribute("download-position"),
            [constants.eventDimensions.rsn]: JSON.stringify({
                downloadAttempt: downloadAttempts
            })
        });
        console.log("firing ga event cta click");
        analytics.fireGAEvent(constants.gaEventNames.ctaClick, {
            [constants.eventDimensions.elcp]: target.innerText,
            [constants.eventDimensions.ec]: target.getAttribute("download-position"),
            [constants.eventDimensions.rsn]: JSON.stringify({
                downloadAttempt: downloadAttempts
            })
        });

        
        

        const installLink = getInstallLink();
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
    analytics.fireEvent(constants.eventNames.lp);
    console.log("firing ga event landing imp");
    analytics.fireGAEvent(constants.gaEventNames.landingImpression);
    initInstructionOverlay();
}