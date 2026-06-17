import * as analytics from "../analytics";
import * as constants from "../constants";

function init() {
    analytics.setUserIdFromUrlQueryParam();
    analytics.attachDynamicEeventListener();
    console.log("firing event thank you page for ", LANDER_DOMAIN);
    analytics.fireEvent(constants.eventNames.tyimp);
    analytics.fireGAEvent(constants.gaEventNames.thankyoupage);
}

init();