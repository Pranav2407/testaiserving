addEventListener('fetch', event => {
    event.respondWith(handleRequest(event))
})

const paramRenameMap = {
    "elcp": "element_copy",
    "elac": "element_action",
    "eltg": "element_tag",
    "exty": "ext_type",
    "en": "event",
    "insv": "install_version",
    "ec": "event_category",
    "insd":"install_date",
    "als":"auto_launch_status",
    "rsn":"failure_reason",
    "attno": "attempt_count",
    "ints":"init_source",
    "start_at_login":"start_at_login",
    "import_settings":"import_settings",
    "run_in_background":"run_in_background",
    "set_as_default":"set_as_default",
    "bnm":"$browser",
    "bver":"$browser_version",
    "osnm":"$os",
    "osver":"$os_version",
    "dvc": "device",
    "browser_nm":"browser_name",
    "browser_ver":"browser_ver",
    "os_nm":"os_name",
    "os_ver":"os_ver",
    "device": "device_name",
    "winw":"window_width",
    "winh":"window_height",
    "scrw":"screen_width",
    "scrh":"screen_height",
    "lgp":"landing_page"
};

function getBrowserInfo(userAgent) {
    if (!userAgent) return {
        [paramRenameMap.bnm]: "unknown",
        [paramRenameMap.bver]: "unknown"
    };

    let browserName = "unknown";
    let browserVersion = "unknown";

    if (userAgent.includes("Firefox")) {
        browserName = "Firefox";
        browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || "unknown";
    } else if (userAgent.includes("Edge")) {
        browserName = "Microsoft Edge";
        browserVersion = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || userAgent.match(/Edg\/([0-9.]+)/)?.[1] || "unknown";
    } else if (userAgent.includes("Chrome")) {
        browserName = "Chrome";
        browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || "unknown";
    } else if (userAgent.includes("Safari")) {
        browserName = "Safari";
        browserVersion = userAgent.match(/Version\/([0-9.]+)/)?.[1] || "unknown";
    } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
        browserName = "Opera";
        browserVersion = userAgent.match(/(?:Opera|OPR)\/([0-9.]+)/)?.[1] || "unknown";
    }

    return {
        [paramRenameMap.bnm]: browserName,
        [paramRenameMap.bver]: browserVersion,
        [paramRenameMap.browser_nm] : browserName,
        [paramRenameMap.browser_ver] : browserVersion
    };
}

function getOSInfo(userAgent) {
    if (!userAgent) return {
        [paramRenameMap.osnm]: "unknown",
        [paramRenameMap.osver]: "unknown"
    };

    let osName = "unknown";
    let osVersion = "unknown";

    if (userAgent.includes("Windows")) {
        osName = "Windows";
        const ntVersion = userAgent.match(/Windows NT ([0-9.]+)/)?.[1] || "unknown";
        const windowsVersions = {
            "10.0": "10",
            "6.3": "8.1",
            "6.2": "8",
            "6.1": "7",
            "6.0": "Vista",
            "5.2": "XP",
            "5.1": "XP"
        };
        osVersion = windowsVersions[ntVersion] || ntVersion;
    } else if (userAgent.includes("Mac OS X")) {
        osName = "Mac OS X";
        osVersion = userAgent.match(/Mac OS X ([0-9._]+)/)?.[1]?.replace(/_/g, '.') || "unknown";
    } else if (userAgent.includes("Linux")) {
        osName = "Linux";
        osVersion = userAgent.match(/Linux ([0-9.]+)/)?.[1] || "unknown";
    } else if (userAgent.includes("Android")) {
        osName = "Android";
        osVersion = userAgent.match(/Android ([0-9.]+)/)?.[1] || "unknown";
    } else if (userAgent.includes("iOS")) {
        osName = "iOS";
        osVersion = userAgent.match(/OS ([0-9_]+)/)?.[1]?.replace(/_/g, '.') || "unknown";
    }

    return {
        [paramRenameMap.osnm]: osName,
        [paramRenameMap.osver]: osVersion,
        [paramRenameMap.os_nm]: osName,
        [paramRenameMap.os_ver]: osVersion
    };
}

function getDeviceInfo(userAgent) {
    if (!userAgent) return {
        [paramRenameMap.dvc]: "unknown"
    };

    let device = "Desktop"; // Default to Desktop

    if (/iPhone|iPad|iPod/.test(userAgent)) {
        device = "iOS";
    } else if (/Android/.test(userAgent)) {
        device = "Android";
    } else if (/Windows Phone|IEMobile/.test(userAgent)) {
        device = "Windows Phone";
    } else if (/Tablet|iPad/.test(userAgent)) {
        device = "Tablet";
    } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/.test(userAgent)) {
        device = "Mobile";
    }

    return {
        [paramRenameMap.dvc]: device,
        [paramRenameMap.device]: device
    };
}

function getSystemInfo(userAgent) {
    return {
        ...getBrowserInfo(userAgent),
        ...getOSInfo(userAgent),
        ...getDeviceInfo(userAgent)
    };
}

function getUpdatedParams(event){
    const { request } = event;
    let urlObj = new URL(request.url);
    let params = Object.fromEntries(urlObj.searchParams.entries());

    let updatedParams = {event_src : "website"};
    const clientIP = request.headers.get("CF-Connecting-IP") || "";
    let ip = (request.headers.get("X-Forwarded-For")||"").split(",")[0];
    const effectiveIP = clientIP || ip || "";

    // First, map all provided parameters
    Object.keys(params).forEach(key => {
        let newKey = key;
        if (paramRenameMap[key]) {
            newKey = paramRenameMap[key];
        }else if (key.startsWith("ai")) {
            newKey = "t" + key.substring(2);
        }
        updatedParams[newKey] = params[key];
    });

    // Check if browser, OS, and device info are missing
    const userAgent = request.headers.get("User-Agent");
    const needSystemInfo = !params.bnm || !params.osnm || !params.dvc;

    if (needSystemInfo && userAgent) {
        const systemInfo = getSystemInfo(userAgent);
        // Only add missing properties
        if (!params.bnm) {
            updatedParams[paramRenameMap.bnm] = systemInfo[paramRenameMap.bnm];
            updatedParams[paramRenameMap.bver] = systemInfo[paramRenameMap.bver];

        }
        if (!params.osnm) {
            updatedParams[paramRenameMap.osnm] = systemInfo[paramRenameMap.osnm];
            updatedParams[paramRenameMap.osver] = systemInfo[paramRenameMap.osver];

        }
        if (!params.dvc) {
            updatedParams[paramRenameMap.dvc] = systemInfo[paramRenameMap.dvc]
        }

        console.log("server event : "+JSON.stringify(updatedParams));
    } else if(updatedParams[paramRenameMap.osnm] && updatedParams[paramRenameMap.bnm] && updatedParams[paramRenameMap.dvc]){
        updatedParams[paramRenameMap.os_nm] = updatedParams[paramRenameMap.osnm];
        updatedParams[paramRenameMap.os_ver] = updatedParams[paramRenameMap.osver];
        updatedParams[paramRenameMap.browser_nm] = updatedParams[paramRenameMap.bnm];
        updatedParams[paramRenameMap.browser_ver] = updatedParams[paramRenameMap.bver];
        updatedParams[paramRenameMap.device] = updatedParams[paramRenameMap.dvc];
    }

    // updatedParams["logid"] = "kfk";
    // updatedParams["evtid"] = "tron";
    updatedParams["distinct_id"] = updatedParams['id'];
    updatedParams["domain"] = "aibrowser.com";
    updatedParams["app"] = "aibrowser";
    updatedParams["ip"] = effectiveIP;

    let pathParts = urlObj.pathname.split('/').filter(Boolean);

    if (pathParts[0] === "ld") {
        if (pathParts.length == 2){
            updatedParams["event"] = pathParts[1];
            updatedParams["event_src"] = "browser";
        }else if (pathParts.length >= 2)
            updatedParams["path"] = "InvalidPath_" + urlObj.pathname;
    } else {
        updatedParams["path"] = "InvalidPath_" + urlObj.pathname;
    }

    if(updatedParams[paramRenameMap.en] == "browser_install_success") {
        updatedParams[paramRenameMap.insd] = new Date().toString();
    }

    console.log("updated: "+JSON.stringify(updatedParams));
    return updatedParams;
}

async function handleRequest(event) {
    try {
        const { request } = event;
        let urlObj = new URL(request.url);
        let updatedParams = getUpdatedParams(event);

        if (request.method === "GET" && urlObj.search !== "") {
            event.waitUntil(fireMixPanel(updatedParams, request.headers));
        } else if (request.method === "POST") {
            const postData = await request.text();
            urlObj = new URL("https://tron-a.akamaihd.net/log?" + postData);
            event.waitUntil(fireMixPanel(updatedParams, request.headers));
        }

        return new Response(null, { "status": 204, "statusText": "No Content" });
    } catch (e) {
        console.log(e);
    }
    return new Response("", { status: 500 });
}

async function fireMixPanel(params, headers){
    let eventObject = {event: 'something',properties: {token: 'cab08272d58b882d951fb17c81933fee'}};

    const options = {
        method: 'POST',
        headers: {accept: 'text/plain', 'content-type': 'application/json'},
        body: JSON.stringify([
            eventObject
        ])
    };
    function extractUserProperties(){
        const userParams = {
            "install_version": 1,
            "install_date": 1,
            "auto_launch_status": 1,
            "start_at_login": 1,
            "import_settings": 1,
            "run_in_background": 1,
            "set_as_default": 1,
            "landing_page": 1,
            "t1": 1,
            "t2": 1,
            "t3": 1,
            "t4": 1,
            "t5": 1,
            "t6": 1,
            "t7": 1,
            "t8": 1,
            "t9": 1,
            "t10": 1,
            "browser_name":1,
            "browser_ver":1,
            "os_name":1,
            "os_ver":1,
            "device_name":1
        };

        var finUP = {}
        Object.keys(params).forEach(key=>{
            if(userParams[key]){
                finUP[key] = params[key]
            }
        })
        return finUP;
    }


    await setUserParams(params.distinct_id,extractUserProperties());
    eventObject.event = params.event
    Object.assign(eventObject.properties,params);
    options.body = JSON.stringify([eventObject]);
    console.log("final "+ JSON.stringify(eventObject))
    console.log("renamed "+JSON.stringify(params))

    return fetch('https://api.mixpanel.com/track', options);
}

async function setUserParams(id,params){
    if(Object.keys(params).length<1) return;

    const options = {
        method: 'POST',
        headers: {accept: 'text/plain', 'content-type': 'application/json'},
        body: JSON.stringify([
            {
                $token: 'cab08272d58b882d951fb17c81933fee',
                $distinct_id: id,
                $set: params
            }
        ])
    };

    console.log("user "+JSON.stringify(options));
    return fetch('https://api.mixpanel.com/engage?ip=0#profile-set', options)

}

function firePixels(params, headers) {
    let pixelPromises = [];
    try {
        var loggingPixels = ["https://tron-a.akamaihd.net/log"];
        var customHeaders = new Headers();
        var paramHeaders = [];
        for (const [header, value] of headers) {
            customHeaders.set(header, value);
            paramHeaders["client_header_" + header] = value;
        }
        if (!customHeaders.get('user-agent')) {
            customHeaders.set('user-agent', 'Apps-CloudFlare Logger/1.0');
        }
        pixelPromises = loggingPixels.map(pixel => {
            pixel = appendAllParams(pixel, {...params, ...paramHeaders});
            console.log(pixel);
            return firePixelPromise(pixel, {headers: customHeaders});
        });
    } catch (e) {
        console.log(e);
    }
    return Promise.all(pixelPromises);
}

async function firePixelPromise(pixel, headers) {
    return new Promise(async function (resolve, reject) {
        console.log("Firing " + pixel);
        try {
            let response = await fetch(pixel, {
                headers: headers
            });
            if (response.status != "200") {
                let queryString = new URL(pixel).searchParams.toString();
                await fetch("https://aibrowser.com/logerror.gif?" + queryString);
            }
        } catch (err) {
            console.log(err);
        }
        resolve();
    });
}

function appendAllParams(url, parameters) {
    let queryString = Object.keys(parameters).map(key => key + "=" + encodeURIComponent(parameters[key])).join("&");
    url += (url.indexOf("?") != -1) ? "&" : "?";
    return url + queryString;
}
