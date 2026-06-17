import { initLander } from '../core/lander.js';
import {eventNames} from "../constants";

let tbinit = {
    [eventNames.ic] : {notify: 'event', name: 'Maps_CTA-Click', id: 1795853},
    [eventNames.tyimp] :{notify: 'event', name: 'AIBrowser_Maps_Install', id: 1795853}

}

initLander('Maps',tbinit,'Maps');