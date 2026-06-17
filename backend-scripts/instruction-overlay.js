import {fireEvent} from "./analytics";
import {eventNames} from "./constants";

let overlayElement = null;
const TEMPLATE_PATHS = {
    default: "/instruction-overlay/index_v1.html",
    landingpage: "/instruction-overlay/index.html",
    overlay3: "/instruction-overlay/index_v3.html",
};
function getTemplatePath() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    if(hostname.includes("chatsmarter.ai") && (pathname.includes("a1GLh3") || pathname.includes("97MN3o") || pathname.includes("3rd7lt")) ) {
        return TEMPLATE_PATHS.overlay3;
    }
    if(hostname.includes("manualschat.ai") && (pathname.includes("q6TW4g") || pathname.includes("p9SV6t") || pathname.includes("7jrfv1")) ) {
        return TEMPLATE_PATHS.overlay3;
    }
    if(hostname.includes("aibrowser.com") && (pathname.includes("5hGF7b") || pathname.includes("oPGl4b") || pathname.includes("1Hfy7")) ) {
        return TEMPLATE_PATHS.overlay3;
    }
    if(hostname.includes("pictureeditor.ai") && (pathname.includes("2Dp7x1") || pathname.includes("2sCr9Q") || pathname.includes("7har4")) ) {
        return TEMPLATE_PATHS.overlay3;
    }
    if(hostname.includes("quickdirections.ai") && (pathname.includes("0Kl1b7") || pathname.includes("8jLZd1") || pathname.includes("8jsta0")) ) {
        return TEMPLATE_PATHS.overlay3;
    }
    if(hostname.includes("packagetracker.ai") && (pathname.includes("6hj0K3") || pathname.includes("2Rt6vd") || pathname.includes("25zi4")) ) {
        return TEMPLATE_PATHS.overlay3;
    }
    if(hostname.includes("convertpdfs.ai") && (pathname.includes("9HxP3v") || pathname.includes("7p2Ksy") || pathname.includes("2Tzx8")) ) {
        return TEMPLATE_PATHS.overlay3;
    }
    return TEMPLATE_PATHS[pathname] || TEMPLATE_PATHS.default;
}
export async function initInstructionOverlay() {
    try {
        // PAGE_TYPE is injected by webpack at build time
        const templatePath = getTemplatePath();
        
        let response = await fetch(templatePath);
        
        if (!response.ok) {
            console.error(`Failed to load template: ${templatePath}`);
            response = await fetch(TEMPLATE_PATHS.default);
        }
        
        let overlayHtml = await response.text();

        overlayElement = document.createElement("div");
        overlayElement.className = "wrapperOverlay";
        overlayElement.style.display = "none"; // Initially hidden
        overlayElement.style.position = "fixed"; // Fixed position relative to viewport
        overlayElement.style.top = "0";
        overlayElement.style.left = "0";
        overlayElement.style.width = "100%";
        overlayElement.style.height = "100%";
        overlayElement.style.zIndex = "9999"; // Ensure it's above other content
        overlayElement.innerHTML = overlayHtml;
        document.body.appendChild(overlayElement);
        if (navigator.userAgent.includes("OPR") || navigator.userAgent.includes("Opera")) {
            document.querySelector(".setupBadge").style.right = "45px";
        }
        // Add click handler to close button
        const closeBtn = overlayElement.querySelector('.crossBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                overlayElement.style.display = "none";
                document.body.style.overflow = "auto"; // Re-enable scrolling
                document.body.style.height = "auto";
                fireEvent(eventNames.inovcn);
            });
        }
    } catch (error) {
        // console.error('Failed to initialize instruction overlay:', error);
        // Handle error appropriately
    }
}

export function showInstructionOverlay(){
    if (overlayElement && overlayElement.style.display !== "block") {
        overlayElement.style.display = "block";
        document.body.style.overflow = "hidden"; // Disable scrolling
        document.body.style.height = "100vh";
        fireEvent(eventNames.inovsh)
    }
}