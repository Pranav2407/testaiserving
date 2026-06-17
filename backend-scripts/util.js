import * as CONSTANTS from "./constants.js";
import {fireEvent} from "./analytics";

const ls = (function () {
    const store = Object.create(null);
    return {
        getItem: function (key) {
            if (key in store) {
                return store[key];
            }
            const value = localStorage.getItem(key);
            if (value !== null) {
                store[key] = value;
            }
            return value;
        },
        setItem: function (key, value) {
            const str = String(value);
            store[key] = str;
            localStorage.setItem(key, str);
        }
    };
})();

const cs = (function() {
    return {
        getItem: function(key){
            return document.cookie.split("; ").reduce((acc, cookie) => {
                const [name, value] = cookie.split("=");
                return name === key ? decodeURIComponent(value) : acc;
            }, "");
        },
        setItem: function(key, value, path="/", expires=1){ 
            document.cookie = `${key}=${encodeURIComponent(value)}; path=${path}; Domain=.${LANDER_DOMAIN}; max-age=${expires*31536000}`;
        }
    }
})();


export function getUserId() {
    let userId = ls.getItem(CONSTANTS.lskeys.userid);
    let userIdFromCookie = cs.getItem(CONSTANTS.lskeys.userid);
    if(userId && !userIdFromCookie){
        cs.setItem(CONSTANTS.lskeys.userid,userId);
    }
    return userId;
}

export function setUserId(userid){
    ls.setItem(CONSTANTS.lskeys.userid,userid);
    cs.setItem(CONSTANTS.lskeys.userid,userid);
}

function getCssSelector(el) {
    if (el == null || !(el instanceof Element)) return '';
  
    const path = [];
  
    while (el != null && el.nodeType === Node.ELEMENT_NODE) {
      let selector = el.nodeName.toLowerCase();
  
      // If element has ID, use it and stop (IDs should be unique)
      if (el.id) {
        selector += `#${CSS.escape(el.id)}`;
        path.unshift(selector);
        break;
      }
  
      // Add classes if available
      if (el.classList.length) {
        selector += '.' + [...el.classList]
          .map(cls => CSS.escape(cls))
          .join('.');
      }
  
      // Add :nth-child if needed for uniqueness
      const parent = el.parentNode;
      if (parent) {
        const siblings = [...parent.children].filter(
          sibling => sibling.nodeName === el.nodeName
        );
        if (siblings.length > 1) {
          const index = siblings.indexOf(el) + 1;
          selector += `:nth-of-type(${index})`;
        }
      }
  
      path.unshift(selector);
      el = el.parentNode;
    }
  
    return path.join(' > ');
  }
  

/**
 * @param {string} className - CSS class to match (no dot).
 * @param {function} cb - Callback (event, targetElement) when click matches.
 * @param {{ firePageClick?: boolean }} [options] - firePageClick: if true, fire page_click for this listener (default true). Set false to avoid duplicate page_click when multiple listeners use this.
 */
export function fireEventsByClassName(className, cb, options = {}){
    const firePageClick = options.firePageClick !== false;
    document.addEventListener("click", function(event) {
        const targetElement = event.target.closest("."+className);
        // CTA click = clicked element or any of its parents has class download-ai
        const isCtaClick = !!event.target.closest(".download-ai");
        const cssSelectorPath = getCssSelector(event.target);

        if (firePageClick) {
            fireEvent("page_click", {
                [CONSTANTS.eventDimensions.datmp]: !!window.downloadAttempts,
                [CONSTANTS.eventDimensions.eltg]: cssSelectorPath,
                [CONSTANTS.eventDimensions.ctac]: isCtaClick,
            });
        }

        if (targetElement) {
            cb(event,targetElement);
        }
    });
}

export function generateUserID(uIdParam){
    function getCode(domain) {
        if(domain &&domain.includes("aibrowser.com")){
            return "";
        }
        domain = domain.replace(/^https?:\/\//, "").toLowerCase();
    
        const hostname = domain.split("/")[0];
    
        const parts = hostname.split(".");
    
        if (parts.length < 2) {
            return "";
        }
    
        const main = parts[0]; 
        const tld = parts[1];  
    
        const c1 = main[0] || "x";                 
        const c2 = tld[0] || "x";                  
        const c3 = main[main.length - 1] || "x";    
    
        const randomizeCase = (char) => Math.random() < 0.5 ? char.toUpperCase() : char.toLowerCase();
        
        return randomizeCase(c1) + randomizeCase(c2) + randomizeCase(c3);
    }

    function getPrefix() {
        try{
            const pathname = window.location.pathname;
            if(pathname.includes("thank-you")){
                return "ty-";
            }
            return "";
        }catch(error){
            return "";
        }
    }
    

    function makeid(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        let prefix = getPrefix();
        return prefix + result;
    }

    let userid = getUserId();

    if(!userid){
        userid = uIdParam || cs.getItem(CONSTANTS.lskeys.userid) || makeid(15);
        setUserId(userid);
    }

    return userid;
}
