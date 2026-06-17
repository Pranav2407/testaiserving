export const eventUrl = `https://l.${LANDER_DOMAIN}/ld`;
export const lskeys = {
    userid: "userid"
};
export const eventNames = {
    lp: "lander_loaded",
    limp: "landing_impression",
    dlimp: "dlimp",
    ic: "download_initiated",
    tyimp: "ty_page_opened",
    dwnsc: "file_returned",
    inovsh: "instruction_overlay_shown",
    inovcn: "instruction_overlay_closed",
    dwnfl: "download_failure",
    dwnPg: "download_progress",
    dwnRyStCh: "download_ready_state_change",
    dwnNtCg: "download_network_change",
    ccpaSubmit: "ccpa_form_submit",
    adBlDt: "ad_blocker_detection",
    dlPg: "download_progress",
    hjDf: "hotJarFunctionDefined"
}

export const gaEventNames = {
    landingImpression: "LandingImp",
    ctaClick: "CTAClick",
    thankyoupage: "ThankYouPage",
}


export const localStorageDimension = {
    taboolaConfig: "taboolaConfig"
};

export const eventDimensions = {
    en: "en",
    id: "id",
    elcp: "elcp",
    elac: "elac",
    eltg: "eltg",
    lgp: "lgp",
    cu: "cu",
    gci: "gci",
    msci: "msci",
    mv1: "mv1",
    mv2: "mv2",
    ec: "ec",
    b_name: "bnm",
    b_ver: "bver",
    os_name: "osnm",
    os_ver: "osver",
    device: "dvc",
    win_w: "winw",
    win_h: "winh",
    scr_w: "scrw",
    scr_h: "scrh",
    rsn:"rsn",
    dwul: "dwul",
    Product: "pty",
    ci: "ci",
    campaignId: "campid",
    splash: "spl",
    d: "dmn",
    datmp: "datmp",
    ctac: "ctac",
    limp: "limp",
    fen: "fen",
    error: "error"
};
export const classNames = {
    download: "download-ai",
    logger: "logger"
};
export const cfDownloadDomains = [
    "easyautopolicy.net",
    "jobmatchesonline.com",
    "americanbenefitsalliance.com",
    "foxsports.com",
    "espn.com"
]
export const installLink = "https://api.aibrowserapps.com/download"
export const proxyInstallLink = `https://${LANDER_DOMAIN}/api/download`;
export const cfInstallLink = "https://d.aibrowser.com/"