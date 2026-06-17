import { initLander } from '../core/lander.js';

import {eventNames} from "../constants";

let tbinit = {
    [eventNames.ic] :  {notify: 'event', name: 'Package_CTA-Click', id: 1795853},
    [eventNames.tyimp] :{notify: 'event', name: 'AIBrowser_Package_Install', id: 1795853}
}


initLander('Package',tbinit,'Package');