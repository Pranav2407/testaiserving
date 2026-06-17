const fs = require('fs');
const path = require('path');

// The rest of your code remains the same...
const here = __dirname;
const htmlPath = path.join(here, 'lander_btf.html');
const outPath = path.join(here, 'lander-btf-element.js');

try {
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const b64 = Buffer.from(htmlContent).toString('base64');

    const jsTemplate = `/* Generated from lander_btf.html - run "node build.js" after edits. */
(function () {
    var B64 = '${b64}';
    function b64ToUtf8(b64) {
        var bin = atob(b64);
        var n = bin.length;
        var bytes = new Uint8Array(n);
        for (var i = 0; i < n; i++) bytes[i] = bin.charCodeAt(i);
        return new TextDecoder('utf-8').decode(bytes);
    }
    var HTML = b64ToUtf8(B64);

    function addClasses(el, classAttr) {
        if (!el || !classAttr) return;
        classAttr.trim().split(/\\s+/).filter(Boolean).forEach(function (c) { el.classList.add(c); });
    }

    var CTA_ATTR_SELECTORS = {
        'browse-cta-class': 'a.browse-securely-button',
        'getmore-cta-class': '.get-more-section a.download-button'
    };

    function applyHostClasses(host) {
        addClasses(host.querySelector(CTA_ATTR_SELECTORS['browse-cta-class']), host.getAttribute('browse-cta-class'));
        addClasses(host.querySelector(CTA_ATTR_SELECTORS['getmore-cta-class']), host.getAttribute('getmore-cta-class'));
    }

    function syncCtaAttrClasses(host, attrName, oldVal, newVal) {
        var sel = CTA_ATTR_SELECTORS[attrName];
        if (!sel) return;
        var el = host.querySelector(sel);
        if (!el) return;
        if (oldVal) {
            oldVal.trim().split(/\\s+/).filter(Boolean).forEach(function (c) { el.classList.remove(c); });
        }
        if (newVal) {
            newVal.trim().split(/\\s+/).filter(Boolean).forEach(function (c) { el.classList.add(c); });
        }
    }

    function wireScrollToTop(root) {
        var btn = root.querySelector('#scrollToTop');
        if (!btn) return;
        window.addEventListener('scroll', function () {
            btn.classList.toggle('show', window.pageYOffset > 200);
        });
        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    class LanderBtf extends HTMLElement {
        static get observedAttributes() { return ['browse-cta-class', 'getmore-cta-class']; }
        connectedCallback() {
            if (this.dataset.landerBtfLoaded === '1') return;
            this.style.display = 'contents';
            this.innerHTML = HTML;
            applyHostClasses(this);
            this.dataset.landerBtfLoaded = '1';
            wireScrollToTop(this);
        }
        attributeChangedCallback(name, oldVal, newVal) {
            if (this.dataset.landerBtfLoaded !== '1') return;
            syncCtaAttrClasses(this, name, oldVal, newVal);
        }
    }

    if (!customElements.get('lander-btf')) {
        customElements.define('lander-btf', LanderBtf);
    }
})();`;

    fs.writeFileSync(outPath, jsTemplate, 'utf8');
    console.log("Success: Wrote " + outPath);

} catch (err) {
    console.error('Build failed: ' + err.message);
    process.exit(1);
}
