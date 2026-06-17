import * as analytics from "./analytics";
import * as constants from "./constants";
import * as util from "./util";

function init() {
    const id = new URLSearchParams(window.location.search).get('u') || "";
    util.generateUserID(id);
    analytics.attachDynamicEeventListener();
    // document.addEventListener("DOMContentLoaded", () => {
    analytics.fireEvent(constants.eventNames.tyimp, {
        tyUid: id
    });
    // console.log("firing ga event thank you page");
    analytics.fireGAEvent(constants.gaEventNames.thankyoupage);
    // document.addEventListener("DOMContentLoaded", () => {
    //     analytics.attachIframe();
    // });
    // });
}

init();