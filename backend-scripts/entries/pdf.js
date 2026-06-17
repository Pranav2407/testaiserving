import { initLander } from '../core/lander.js';
import {eventNames} from "../constants";

let tbinit = {
    [eventNames.ic] :  {notify: 'event', name: 'PDF_CTA-Click', id: 1795853},
    [eventNames.tyimp] :{notify: 'event', name: 'AIBrowser_PDF_Install', id: 1795853}
}


initLander('PDF',tbinit,'PDF');