import { initLander } from '../core/lander.js';
import {eventNames} from "../constants";

let tbinit = {
    [eventNames.ic] : {notify: 'event', name: 'Chat_CTA-Click', id: 1795853},
    [eventNames.tyimp]:{notify: 'event', name: 'AIBrowser_Chat_Install', id: 1795853}
}

initLander('AI', tbinit, 'AIChat');
