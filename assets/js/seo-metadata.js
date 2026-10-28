/**
 * INVAMAX SEO & Open Graph Metadata Utility
 * Provides client-side helpers, metadata validation, and Schema.org generators
 * for standardizing social link previews across all platforms.
 */
var INVAMAX_SEO = (function () {
    const BASE_URL = "https://invamax.com";
    const DEFAULT_OG_IMAGE = BASE_URL + "/assets/images/og/og-default-invamax.jpg";

    /**
     * Generates a standard metadata object for any article
     */
    function buildArticleMeta(config) {
        const lang = config.lang || (window.location.pathname.includes('/en/') ? 'en' : 'vi');
        const isVi = lang === 'vi';
        
        const path = config.path || window.location.pathname;
        const canonicalUrl = BASE_URL + (path.startsWith('/') ? path : '/' + path);
        const imageUrl = config.imageUrl || DEFAULT_OG_IMAGE;

        return {
            title: config.title || document.title,
            description: config.description || "",
            url: canonicalUrl,
            imageUrl: imageUrl,
            imageWidth: 1200,
            imageHeight: 630,
            imageType: "image/jpeg",
            imageAlt: config.imageAlt || config.title || "INVAMAX",
            siteName: "INVAMAX",
            locale: isVi ? "vi_VN" : "en_US",
            datePublished: config.datePublished || new Date().toISOString().split('T')[0],
            dateModified: config.dateModified || new Date().toISOString().split('T')[0]
        };
    }

    /**
     * Dynamically verifies or injects metadata into <head> (for previews/SPA)
     */
    function syncDOMMeta(meta) {
        if (typeof document === 'undefined') return;

        function setMeta(attr, key, val) {
            let el = document.querySelector(`meta[${attr}="${key}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attr, key);
                document.head.appendChild(el);
            }
            el.setAttribute('content', val);
        }

        if (meta.title) document.title = meta.title;
        if (meta.description) setMeta('name', 'description', meta.description);

        // Open Graph
        setMeta('property', 'og:type', 'article');
        setMeta('property', 'og:site_name', meta.siteName);
        setMeta('property', 'og:locale', meta.locale);
        setMeta('property', 'og:title', meta.title);
        setMeta('property', 'og:description', meta.description);
        setMeta('property', 'og:url', meta.url);
        setMeta('property', 'og:image', meta.imageUrl);
        setMeta('property', 'og:image:secure_url', meta.imageUrl);
        setMeta('property', 'og:image:width', String(meta.imageWidth));
        setMeta('property', 'og:image:height', String(meta.imageHeight));
        setMeta('property', 'og:image:alt', meta.imageAlt);
        setMeta('property', 'og:image:type', meta.imageType);

        // Twitter Card
        setMeta('name', 'twitter:card', 'summary_large_image');
        setMeta('name', 'twitter:title', meta.title);
        setMeta('name', 'twitter:description', meta.description);
        setMeta('name', 'twitter:image', meta.imageUrl);
    }

    return {
        BASE_URL: BASE_URL,
        DEFAULT_OG_IMAGE: DEFAULT_OG_IMAGE,
        buildArticleMeta: buildArticleMeta,
        syncDOMMeta: syncDOMMeta
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = INVAMAX_SEO;
}
