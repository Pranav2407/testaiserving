import * as CONSTANTS from "./constants.js";
import * as util from "./util.js";
import * as constants from "./constants";
import * as helper from "./helper";

async function getBrowserAndOSInfo() {
    const ua = navigator.userAgent || "";
    const uaLower = ua.toLowerCase();
    const uaData = navigator.userAgentData;

    let browserName = "unknown";
    let browserVersion = "unknown";
    let osName = "unknown";
    let osVersion = "unknown";
    let device = "Desktop";

    // -----------------------------
    // Utilities
    // -----------------------------
    const mapWindowsPlatformVersion = (platformVersion) => {
        if (!platformVersion) return "unknown";
        const major = parseInt(platformVersion.split(".")[0], 10);

        if (major >= 13) return "11";          // Windows 11+
        if (major >= 10) return "10";          // Windows 10
        if (major >= 6) return "7/8/8.1";      // Legacy
        return "unknown";
    };

    // -----------------------------
    // 1. BROWSER (UA-CH first)
    // -----------------------------
    if (uaData?.brands?.length) {
        const brand = uaData.brands.find(b => !/not|chromium/i.test(b.brand));
        if (brand) {
            browserName = brand.brand || "unknown";
            browserVersion = brand.version || "unknown";
        }
    }

    // Secondary: UA regex → more reliable
    if (browserName === "unknown") {
        const browserRegexList = [
            { name: "Microsoft Edge", regex: /\bedg(?:e|)\/([\d.]+)/i },
            { name: "Opera", regex: /\bopr\/([\d.]+)/i },
            { name: "Chrome", regex: /\bchrome\/([\d.]+)/i },
            { name: "Firefox", regex: /\bfirefox\/([\d.]+)/i },
            { name: "Safari", regex: /\bversion\/([\d.]+).*safari/i },
        ];

        for (const b of browserRegexList) {
            const match = ua.match(b.regex);
            if (match) {
                browserName = b.name;
                browserVersion = match[1];
                break;
            }
        }
    }

    // Fallback
    if (browserName === "unknown") {
        if (uaLower.includes("safari")) browserName = "Safari";
        else if (uaLower.includes("chrome")) browserName = "Chrome";
        else if (uaLower.includes("firefox")) browserName = "Firefox";
    }


    // -----------------------------
    // 2. OS (UA-CH first)
    // -----------------------------
    if (uaData?.platform) {
        osName = uaData.platform;

        if (uaData.getHighEntropyValues) {
            const high = await uaData.getHighEntropyValues(["platformVersion"]);
            const pv = high.platformVersion;

            if (osName === "Windows" && pv) {
                osVersion = mapWindowsPlatformVersion(pv);
            } else {
                osVersion = pv || "unknown";
            }
        }
    }

    // Secondary: UA
    if (osName === "unknown") {
        if (/windows nt/i.test(ua)) {
            osName = "Windows";
            const nt = ua.match(/windows nt ([\d.]+)/i)?.[1] || "";

            const winMap = {
                "10.0": "10",
                "6.3": "8.1",
                "6.2": "8",
                "6.1": "7",
                "6.0": "Vista",
                "5.1": "XP",
                "5.2": "XP",
            };
            osVersion = winMap[nt] || nt || "unknown";
        }

        else if (/macintosh|mac os x/i.test(ua)) {
            osName = "macOS";
            osVersion = ua.match(/mac os x ([\d_]+)/i)?.[1]?.replace(/_/g, ".") || "unknown";
        }

        else if (/android/i.test(ua)) {
            osName = "Android";
            osVersion = ua.match(/android ([\d.]+)/i)?.[1] || "unknown";
        }

        else if (/iphone|ipad|ipod/i.test(ua)) {
            osName = "iOS";
            osVersion = ua.match(/os ([\d_]+)/i)?.[1]?.replace(/_/g, ".") || "unknown";
        }

        else if (/linux/i.test(ua)) {
            osName = "Linux";
            osVersion = "unknown";
        }
    }

    // Fallback OS heuristics
    if (osName === "unknown") {
        if (/cros/i.test(ua)) osName = "Chrome OS";
        else if (/tizen/i.test(ua)) osName = "Tizen";
        else if (/tv|smart[- ]?tv|hbbtv/i.test(ua)) osName = "Smart TV OS";
    }


    // -----------------------------
    // 3. DEVICE TYPE
    // -----------------------------
    if (uaData?.mobile) {
        device = "Mobile";
    }
    else if (/ipad|tablet/i.test(ua)) {
        device = "Tablet";
    }
    else if (/iphone|ipod|android.*mobile/i.test(ua)) {
        device = "Mobile";
    }
    else if (/android/i.test(ua)) {
        device = "Tablet";
    }

    // Fallback screen-based logic
    if (device === "Desktop") {
        if (screen.width < 600) device = "Mobile";
        else if (screen.width < 1000) device = "Tablet";
    }

    return {
        [CONSTANTS.eventDimensions.b_name]: browserName,
        [CONSTANTS.eventDimensions.b_ver]: browserVersion,
        [CONSTANTS.eventDimensions.os_name]: osName,
        [CONSTANTS.eventDimensions.os_ver]: osVersion,
        [CONSTANTS.eventDimensions.device]: device
    };
}

function getAnalyticsID(){
    const gclid = new URLSearchParams(window.location.search).get("gclid");
    const msclkid = new URLSearchParams(window.location.search).get("msclkid");

    const analyticsIds = {};
    if(gclid) analyticsIds[CONSTANTS.eventDimensions.gci] = gclid;
    if(msclkid) analyticsIds[CONSTANTS.eventDimensions.msci] = msclkid;
    return analyticsIds;
}

function getABTestParams(){
    const abTestParams = {};
    // I might receive mv1 or mv2
    const mv1 = new URLSearchParams(window.location.search).get("mv1");
    const mv2 = new URLSearchParams(window.location.search).get("mv2");
    if(mv1) abTestParams[CONSTANTS.eventDimensions.mv1] = mv1;
    if(mv2) abTestParams[CONSTANTS.eventDimensions.mv2] = mv2;
    return abTestParams;
}


function getWindowAndScreenDimensions() {
    return {
        [CONSTANTS.eventDimensions.win_w]: window.innerWidth,
        [CONSTANTS.eventDimensions.win_h]: window.innerHeight,
        [CONSTANTS.eventDimensions.scr_w]: window.screen.width,
        [CONSTANTS.eventDimensions.scr_h]: window.screen.height
    };
}

function attachDynamicEeventListener() {
    util.fireEventsByClassName(constants.classNames.logger, function (event, target){
        let targetAttributes = helper.getDataAttributes(target);
        let eventName = targetAttributes[constants.eventDimensions.en];
        delete targetAttributes[constants.eventDimensions.en];
        fireEvent(eventName, targetAttributes);
    }, { firePageClick: false });
}

function fireTabolaEvents(name) {
    try {
        const taboolaConfig = JSON.parse(localStorage.getItem(constants.localStorageDimension.taboolaConfig));
        if (taboolaConfig && taboolaConfig[name]) {
            _tfa.push(taboolaConfig[name]);
        }
    } catch (error) {
        // console.error('Error handling Taboola config:', error);
    }
}

function getCampaignParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const campaignData = {};
    for (let i = 1; i <= 10; i++) {
        const paramName = `ai${i}`;
        if (urlParams.has(paramName)) {
            campaignData[paramName] = urlParams.get(paramName);
        }
    }
    return campaignData;
}

function getCampaignId() {
    try{
        if(
            (LANDER_DOMAIN == "aibrowser.com" && 
                (window.location.pathname.includes("/lander/5hGF7b/") || window.location.pathname.includes("/lander/76Ju4l/") || window.location.pathname.includes("/lander/oPGl4b/") || window.location.pathname.includes("/lander/1Hfy7/"))
            ) ||
            (LANDER_DOMAIN == "chatsmarter.ai" && 
                (window.location.pathname.includes("/lander/a1GLh3/") || window.location.pathname.includes("/lander/G5dR7/") || window.location.pathname.includes("/lander/97MN3o/") || window.location.pathname.includes("/lander/3rd7lt/"))
            ) ||
            (LANDER_DOMAIN == "manualschat.ai" && 
                (window.location.pathname.includes("/lander/q6TW4g/") || window.location.pathname.includes("/lander/Rh9da5/") || window.location.pathname.includes("/lander/p9SV6t/") || window.location.pathname.includes("/lander/7jrfv1/"))
            ) ||
            (LANDER_DOMAIN == "pictureeditor.ai" && 
                (window.location.pathname.includes("/lander/2Dp7x1/") || window.location.pathname.includes("/lander/2sCr9Q/") || window.location.pathname.includes("/lander/7har4/"))
            ) ||
            (LANDER_DOMAIN == "quickdirections.ai" && 
                (window.location.pathname.includes("/lander/0Kl1b7/") || window.location.pathname.includes("/lander/8jLZd1/") || window.location.pathname.includes("/lander/8jsta0/"))
            ) ||
            (LANDER_DOMAIN == "packagetracker.ai" && 
                (window.location.pathname.includes("/lander/6hj0K3/") || window.location.pathname.includes("/lander/2Rt6vd/") || window.location.pathname.includes("/lander/25zi4/"))
            ) ||
            (LANDER_DOMAIN == "convertpdfs.ai" && 
                (window.location.pathname.includes("/lander/9HxP3v/") || window.location.pathname.includes("/lander/7p2Ksy/") || window.location.pathname.includes("/lander/2Tzx8/"))
            )
            
        ){
                return "68654";
            }
    }catch(error){
        return "";
    }
}

async function fireEvent(name, params) {
    async function getEventData() {
        const userId = util.getUserId();
        const browserAndOSInfo = await getBrowserAndOSInfo();
        const basicEventData = {
            [CONSTANTS.eventDimensions.id]: userId,
            [CONSTANTS.eventDimensions.en]: name,
            ...browserAndOSInfo,
            ...getWindowAndScreenDimensions(),
            ...getAnalyticsID(),
            ...getABTestParams()
        };
        if (window.islanding) {
            basicEventData[CONSTANTS.eventDimensions.lgp] = window.location.origin + window.location.pathname;
            basicEventData[CONSTANTS.eventDimensions.cu] = window.location.href;
        }

        let finalEventData = {};
        Object.assign(finalEventData, basicEventData, params, getCampaignParams());
        return finalEventData;
    }

    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            fireTabolaEvents(name);
            const eventData = await getEventData();
            if(name === constants.eventNames.lp){
                window.landingImpressionTime = "init_"+Date.now();
            }
            Object.assign(eventData, {
                [constants.eventDimensions.limp]: window.landingImpressionTime
            });

            if (typeof navigator.sendBeacon === "function") {
                const body = new Blob([JSON.stringify(eventData)], { type: "application/json" });
                let success = navigator.sendBeacon(CONSTANTS.eventUrl, body);
                if(name === constants.eventNames.lp){
                    if(success){
                        window.landingImpressionTime = "success_"+Date.now();
                    }else {
                        window.landingImpressionTime = "failed_"+Date.now();
                    }
                }
            } else {
            const queryString = new URLSearchParams(eventData).toString();
            const url = `${CONSTANTS.eventUrl}?${queryString}`;
            const img = new Image();
            img.src = url;
            img.width = 1;
            img.height = 1;
            img.style.display = "none";
            document.body.appendChild(img);
            }
            break;
        } catch (error) {
            if (attempt === maxRetries) {
                navigator.sendBeacon(CONSTANTS.eventUrl, JSON.stringify({
                    [constants.eventDimensions.id]: util.getUserId(),
                    [constants.eventDimensions.en]: "event_send_failed",
                    [constants.eventDimensions.fen]: name,
                    [constants.eventDimensions.cu]: window.location.href,
                    [constants.eventDimensions.error]: error.message,
                }));
            } else {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    }

}

  

/**
 * Fires a Google Analytics event
 * Supports both gtag (GA4) and ga (Universal Analytics)
 * @param {string} eventName - The name of the event
 * @param {object} eventParams - Optional parameters for the event
 * @param {string} eventCategory - Optional category (for Universal Analytics)
 * @param {string} eventAction - Optional action (for Universal Analytics)
 * @param {string} eventLabel - Optional label (for Universal Analytics)
 * @param {number} eventValue - Optional value (for Universal Analytics)
 */
async function fireGAEvent(eventName, eventParams = {}, eventCategory = null, eventAction = null, eventLabel = null, eventValue = null) {
    try {
        const browserAndOSInfo = await getBrowserAndOSInfo();
        const commonParams = {
            browserName: browserAndOSInfo[CONSTANTS.eventDimensions.b_name],
            browserVersion: browserAndOSInfo[CONSTANTS.eventDimensions.b_ver],
            osName: browserAndOSInfo[CONSTANTS.eventDimensions.os_name],
            osVersion: browserAndOSInfo[CONSTANTS.eventDimensions.os_ver],
            device: browserAndOSInfo[CONSTANTS.eventDimensions.device]
        };
        eventParams = {
            ...commonParams,
            ...eventParams
        };
        // Check for gtag (GA4)
        if (typeof gtag !== 'undefined') {
            console.log("firing ga event using gtag", eventName, eventParams);
            gtag('event', eventName, eventParams);
            return;
        }
        
        // Check for ga (Universal Analytics)
        if (typeof ga !== 'undefined') {
            console.log("firing ga event using ga", eventName, eventParams);
            // If category, action, label, value are provided, use Universal Analytics format
            if (eventCategory && eventAction) {
                ga('send', 'event', eventCategory, eventAction, eventLabel, eventValue);
            } else {
                // Otherwise, send as custom event
                ga('send', 'event', {
                    eventCategory: eventCategory || 'Custom',
                    eventAction: eventAction || eventName,
                    eventLabel: eventLabel,
                    eventValue: eventValue,
                    ...eventParams
                });
            }
            return;
        }
        
        // Check for dataLayer (GTM)
        window.dataLayer = window.dataLayer || [];
        console.log("firing ga event using dataLayer", eventName, eventParams);
        window.dataLayer.push({
            'event': eventName,
            ...eventParams
        });
        
        // Fallback: log to console if GA is not available (for debugging)
        // if (console && console.log) {
        //     console.log('Google Analytics not available. Event:', eventName, 'Params:', eventParams);
        // }
    } catch (error) {
        // Silently fail if there's an error
        if (console && console.error) {
            console.error('Error firing GA event:', error);
        }
    }
}


function getCodeMapping(){
    const encodedString = 'eyJjYXIiOiJodHRwczovL2NoYXRzbWFydGVyLmFpL3N1Y2Nlc3MiLCJjYXMiOiJodHRwczovL2NvbnZlcnRwZGZzLmFpL3N1Y2Nlc3MiLCJtYXQiOiJodHRwczovL21hbnVhbHNjaGF0LmFpL3N1Y2Nlc3MiLCJwYXIiOiJodHRwczovL3BpY3R1cmVlZGl0b3IuYWkvc3VjY2VzcyIsInFhcyI6Imh0dHBzOi8vcXVpY2tkaXJlY3Rpb25zLmFpL3N1Y2Nlc3MiLCJwYXQiOiJodHRwczovL3BhY2thZ2V0cmFja2VyLmFpL3N1Y2Nlc3MifQ==';
    const decodedString = atob(encodedString);
    const jsonMapping = JSON.parse(decodedString);
    return jsonMapping;
}

function attachIframe(){
    function getIframeUrl(userId){
        if(userId.length > 15){
            const code = userId.slice(-3).toLowerCase();
            const mapping = getCodeMapping();
            return mapping[code];
        }
        return null;
        
    }

    const userId = new URLSearchParams(window.location.search).get('u');
    if(!window.location.hostname.includes("aibrowser.com")){
        return;
    }
    
    const iframeUrl = userId ? getIframeUrl(userId) : "https://chatsmarter.ai/success";
    if(userId) {
        iframeUrl = iframeUrl + "?u=" + userId;
    }
    
    const iframe = document.createElement('iframe');
    iframe.src = iframeUrl;
    iframe.style.display = 'none';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    document.body.appendChild(iframe);
}

function setUserIdFromUrlQueryParam(){
    const userId = new URLSearchParams(window.location.search).get('u');
    if(userId){
        util.setUserId(userId);
    }
}

export {fireEvent, attachDynamicEeventListener, getCampaignParams, getCampaignId, fireGAEvent, setUserIdFromUrlQueryParam, getAnalyticsID, attachIframe};


