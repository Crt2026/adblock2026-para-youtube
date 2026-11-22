/* ==========================================================================
   ADBLOCK 2026 FOR YOUTUBE(TM) & WEB - SENTINEL v3.0 (MAIN WORLD)
   ========================================================================== */

(function() {
    "use strict";

    if (window.__ADBLOCK_2026_INJECTED__) return;
    window.__ADBLOCK_2026_INJECTED__ = true;

    const IS_YOUTUBE = window.location.hostname.includes("youtube.com");

    /* --------------------------------------------------------------------------
       1. GLOBAL ANTI-ADBLOCK DEFUSER & AD LIBRARY STUBS
       -------------------------------------------------------------------------- */
    try {
        window.canRunAds = true;
        window.isAdBlockActive = false;
        window.adblock = false;
        window.adblocker = false;
        window.hasAdBlock = false;

        const dummyDetector = {
            on: function(isAdblock, fn) { if (!isAdblock && typeof fn === "function") { try { fn(); } catch (e) {} } return this; },
            onDetected: function() { return this; },
            onNotDetected: function(fn) { if (typeof fn === "function") { try { fn(); } catch (e) {} } return this; },
            check: function() { return false; },
            clearEvent: function() { return this; },
            setOption: function() { return this; }
        };
        window.fuckAdBlock = dummyDetector; window.FuckAdBlock = dummyDetector;
        window.blockAdBlock = dummyDetector; window.BlockAdBlock = dummyDetector;
        window.snackBar = dummyDetector;

        if (!window.adsbygoogle) {
            const arr = []; arr.push = function() { return 1; }; arr.loaded = true;
            try { Object.defineProperty(window, "adsbygoogle", { get: () => arr, set: () => {}, configurable: true }); }
            catch (e) { window.adsbygoogle = arr; }
        }

        if (!window.googletag) {
            const dp = {
                setTargeting: () => dp, clearTargeting: () => dp, enableSingleRequest: () => dp,
                collapseEmptyDivs: () => dp, disableInitialLoad: () => dp,
                addEventListener: () => dp, refresh: () => dp, getSlots: () => []
            };
            const ds = { addService: () => ds, setTargeting: () => ds, setCollapseEmptyDiv: () => ds };
            const gt = {
                cmd: { push: function(fn) { if (typeof fn === "function") { try { fn(); } catch (e) {} } return 1; } },
                defineSlot: () => ds, defineOutOfPageSlot: () => ds, display: () => {},
                enableServices: () => {}, pubads: () => dp, destroySlots: () => {},
                companionAds: () => ({ setRefreshUnfilledSlots: () => {} }),
                sizeMapping: () => ({ addSize: () => ({ build: () => [] }), build: () => [] })
            };
            try { Object.defineProperty(window, "googletag", { get: () => gt, set: () => {}, configurable: true }); }
            catch (e) { window.googletag = gt; }
        }

        const dq = () => { const q = []; q.push = function() { return 1; }; return q; };
        if (!window._taboola) window._taboola = dq();
        if (!window.outbrain) window.outbrain = dq();
        if (!window.criteo_q) window.criteo_q = dq();
        if (!window.apstag) window.apstag = {
            init: () => {}, fetchBids: (c, cb) => { if (typeof cb === "function") cb([]); },
            setDisplayBids: () => {}, targetingKeys: () => []
        };
    } catch (e) {}

    /* --------------------------------------------------------------------------
       2. NOTIFICATION HIJACK
       -------------------------------------------------------------------------- */
    try {
        if ("Notification" in window) {
            window.Notification.requestPermission = function(cb) {
                if (typeof cb === "function") { try { cb("denied"); } catch (e) {} }
                return Promise.resolve("denied");
            };
            try { Object.defineProperty(window.Notification, "permission", { get: () => "denied", set: () => {}, configurable: true }); } catch (e) {}
        }
    } catch (e) {}

    /* --------------------------------------------------------------------------
       3. SHADOW DOM TRACKER
       -------------------------------------------------------------------------- */
    window.__adblock_shadows = window.__adblock_shadows || [];
    try {
        const origAS = Element.prototype.attachShadow;
        Element.prototype.attachShadow = function(init) {
            const s = origAS.apply(this, arguments);
            try { window.__adblock_shadows.push(s); } catch (e) {}
            return s;
        };
    } catch (e) {}

    /* --------------------------------------------------------------------------
       4. AD SCRIPT INJECTION INTERCEPTOR (non-YouTube only)
       -------------------------------------------------------------------------- */
    const AD_SCRIPT_KW = [
        "adsterra","alwingulla","thubanoa","paupeewh","whouphoo","monetag","propeller",
        "propush","bidgear","1xbet","adcash","yllix","clickadu","hilltop","exoclick",
        "juicyads","popads","popcash","evadav","rollerads","richpush","richads","dtiserv",
        "exdynsrv","tsyndicate","doubleclick","googlesyndication","adnxs","criteo",
        "taboola","outbrain","mgid","revcontent","socialbar","inpagepush","pushwoosh",
        "notix","trafficjunky","trafficstars","clickopen","effectivecpmgate","highcpmgate",
        "profitablecpmgate","topcreativeformat","deliveryad","clkmc","adxxx","adtrue",
        "pushground","popunder","clickunder","promoteserv","zeroredirect","adtrackers",
        "fastclick","bidvertiser","chatmate","hiredify","stripchat","magsrv","deloton"
    ];

    if (!IS_YOUTUBE) {
        try {
            const origSA = Element.prototype.setAttribute;
            Element.prototype.setAttribute = function(name, value) {
                if (this.tagName === "SCRIPT" && String(name).toLowerCase() === "src" && value) {
                    if (AD_SCRIPT_KW.some(kw => String(value).toLowerCase().includes(kw))) return;
                }
                return origSA.apply(this, arguments);
            };
            const ssd = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src");
            if (ssd && ssd.set) {
                Object.defineProperty(HTMLScriptElement.prototype, "src", {
                    set(value) {
                        if (value && AD_SCRIPT_KW.some(kw => String(value).toLowerCase().includes(kw))) return;
                        ssd.set.call(this, value);
                    },
                    get: ssd.get, configurable: true
                });
            }
        } catch (e) {}
    }

    /* --------------------------------------------------------------------------
       5. POPUP BLOCKER
       -------------------------------------------------------------------------- */
    try {
        const origOpen = window.open;
        const AD_URL_KW = [
            "adsterra","exoclick","popads","popcash","propellerads","onclickads","admaven",
            "juicyads","fastclick","bidvertiser","yllix","clickadu","adcash","monetag",
            "hilltopads","rollerads","evadav","richpush","richads","trafficjunky","trafee",
            "bet365","1xbet","1x-bet","melbet","betwinner","mostbet","pin-up","vulkan",
            "adsystem","doubleclick","googlesyndication","adnxs","alwingulla","thubanoa",
            "paupeewh","whouphoo","chatmate","hiredify","deloton","stripchat","magsrv",
            "t.me/","telegram.me/","free-robux","crypto-bonus"
        ];
        window.open = function(url, name, specs) {
            if (url) {
                const lu = String(url).toLowerCase();
                if (lu.startsWith("blob:") || lu.startsWith("data:") || lu.includes("download") || lu.includes(".edu")) {
                    return origOpen.apply(this, arguments);
                }
                if (AD_URL_KW.some(kw => lu.includes(kw))) return null;
            }
            return origOpen.apply(this, arguments);
        };
    } catch (e) {}

    /* --------------------------------------------------------------------------
       6. NON-YOUTUBE FLOATING AD PURGER
       -------------------------------------------------------------------------- */
    if (!IS_YOUTUBE) {
        function purgeMainWorldAdElements() {
            const host = (window.location.hostname || "").toLowerCase();
            if (host.includes("google.") || host.includes("bing.com")) return;
            try {
                document.querySelectorAll("div, section, aside, iframe").forEach(el => {
                    if (el.closest("nav, header, form, main, [role=search]")) return;
                    const style = window.getComputedStyle(el);
                    if (style.position === "fixed" || style.position === "absolute") {
                        const text = (el.innerText || el.textContent || "").toLowerCase();
                        if (text.includes("chatmate") || text.includes("1xbet") ||
                            text.includes("casino") || text.includes("wps")) { el.remove(); }
                    }
                });
            } catch (e) {}
        }
        setInterval(purgeMainWorldAdElements, 300);
    }

    /* ==========================================================================
       7. YOUTUBE ADVANCED AD INTERCEPTOR v3.0
       ========================================================================== */
    if (IS_YOUTUBE) {

        /* --- Deep Player Response Sanitizer --- */
        function cleanPlayerResponse(data) {
            if (!data || typeof data !== "object") return data;
            try {
                data.adPlacements = [];
                data.adSlots = [];
                data.playerAds = [];
                data.adBreaks = [];

                [
                    "adPlacement","adBreakHeartbeatParams","adBreakServiceRenderer",
                    "instreamAdPlayerResponse","adSignalsInfo","adLayoutRenderer",
                    "paidContentOverlay","auxiliaryUi","adActionInterstitialRenderer",
                    "linearAdSequenceRenderer","adPreviewRenderer","adInfoRenderer",
                    "adBadgeRenderer","adDurationRemaining","adProgressRenderer",
                    "adBreakRenderer","companionAdRenderer","promotedSparklesWebRenderer",
                    "promotedVideoRenderer","ctaFeatureButtonRenderer"
                ].forEach(k => { if (k in data) delete data[k]; });

                if (data.playerConfig) {
                    delete data.playerConfig.adPlacementConfig;
                    delete data.playerConfig.adsConfig;
                    delete data.playerConfig.adBreakParams;
                }
                if (data.streamingData) { delete data.streamingData.adSupportedPlayerResponse; }

                if (data.playabilityStatus) {
                    if (data.playabilityStatus.errorScreen) delete data.playabilityStatus.errorScreen;
                    const s = data.playabilityStatus.status;
                    if (s === "ERROR" || s === "LOGIN_REQUIRED") {
                        const r = (data.playabilityStatus.reason || "").toLowerCase();
                        if (r.includes("ad") || r.includes("premium") || r.includes("sign in")) {
                            data.playabilityStatus.status = "OK";
                            delete data.playabilityStatus.reason;
                            delete data.playabilityStatus.messages;
                        }
                    }
                }
                if (data.playbackTracking) {
                    delete data.playbackTracking.youtubeRemarketingUrl;
                    delete data.playbackTracking.ptrackingUrl;
                    delete data.playbackTracking.atrUrl;
                }
                if (data.contents) filterAdRenderers(data.contents);
                if (data.onResponseReceivedActions) {
                    data.onResponseReceivedActions.forEach(a => {
                        if (a.appendContinuationItemsAction &&
                            a.appendContinuationItemsAction.continuationItems) {
                            filterAdRenderers(a.appendContinuationItemsAction.continuationItems);
                        }
                    });
                }
            } catch (e) {}
            return data;
        }

        function filterAdRenderers(contents) {
            if (!Array.isArray(contents)) return;
            try {
                for (let i = contents.length - 1; i >= 0; i--) {
                    const item = contents[i];
                    if (!item || typeof item !== "object") continue;
                    if (item.adSlotRenderer || item.inFeedAdLayoutRenderer ||
                        item.statementBannerRenderer || item.bannerPromoRenderer ||
                        item.adBreakServiceRenderer || item.promotedSparklesWebRenderer ||
                        item.searchPyvRenderer) {
                        contents.splice(i, 1); continue;
                    }
                    if (item.richItemRenderer && item.richItemRenderer.content) {
                        const c = item.richItemRenderer.content;
                        if (c.adSlotRenderer || c.inFeedAdLayoutRenderer || c.promotedSparklesWebRenderer) {
                            contents.splice(i, 1); continue;
                        }
                    }
                    if (item.richSectionRenderer && item.richSectionRenderer.content) {
                        const sc = item.richSectionRenderer.content;
                        if (sc.statementBannerRenderer || sc.bannerPromoRenderer ||
                            sc.mastheadAd || sc.promotedSparklesWebRenderer) {
                            contents.splice(i, 1); continue;
                        }
                    }
                }
            } catch (e) {}
        }

        let lastNotify = 0;
        function notifyAdBlocked() {
            const now = Date.now();
            if (now - lastNotify > 800) {
                lastNotify = now;
                try {
                    window.postMessage({ type: "YOUTUBE_AD_INTERCEPTED" }, "*");
                    window.postMessage({ type: "ADBLOCK_2026_AD_BLOCKED" }, "*");
                } catch (e) {}
            }
        }

        /* --- JSON.parse Hook --- */
        try {
            const origParse = JSON.parse;
            JSON.parse = function(text, reviver) {
                const parsed = origParse.apply(this, arguments);
                if (parsed && typeof parsed === "object") {
                    if (parsed.adPlacements || parsed.adSlots || parsed.playerAds ||
                        parsed.adBreakHeartbeatParams || parsed.instreamAdPlayerResponse ||
                        (parsed.playerConfig && parsed.playerConfig.adPlacementConfig)) {
                        cleanPlayerResponse(parsed);
                        notifyAdBlocked();
                    }
                }
                return parsed;
            };
        } catch (e) {}

        /* --- Fetch Interceptor --- */
        if (window.fetch) {
            const origFetch = window.fetch;
            window.fetch = async function(resource, init) {
                let url = "";
                try {
                    if (typeof resource === "string") url = resource;
                    else if (resource instanceof Request) url = resource.url;
                    else if (resource && resource.url) url = resource.url;
                } catch (e) {}

                const AD_EP = [
                    "/youtubei/v1/player/ad_break", "/youtubei/v1/player/ad_next",
                    "/api/stats/ads", "/pagead/", "/get_midroll_info",
                    "/ptracking", "/api/stats/atr",
                    "ad.youtube.com", "ad-g.doubleclick.net"
                ];

                if (AD_EP.some(ep => url.includes(ep))) {
                    notifyAdBlocked();
                    return new Response(
                        JSON.stringify({ status: "OK", adBreakHeartbeatParams: {}, adPlacements: [], playerAds: [] }),
                        { status: 200, headers: { "Content-Type": "application/json" } }
                    );
                }

                const response = await origFetch.apply(this, arguments);

                if ((url.includes("/youtubei/v1/player") && !url.includes("/ad_")) ||
                    url.includes("/youtubei/v1/browse") ||
                    url.includes("/youtubei/v1/search")) {
                    try {
                        const clone = response.clone();
                        const text = await clone.text();
                        let data;
                        try { data = JSON.parse(text); } catch (e) { return response; }
                        if (data && (data.adPlacements || data.playerAds || data.adSlots ||
                            data.adBreakHeartbeatParams || data.contents)) {
                            cleanPlayerResponse(data);
                            if (data.adPlacements !== undefined) notifyAdBlocked();
                            const newH = new Headers(response.headers);
                            newH.delete("content-encoding");
                            newH.delete("content-length");
                            newH.set("content-type", "application/json; charset=utf-8");
                            return new Response(JSON.stringify(data), {
                                status: response.status,
                                statusText: response.statusText,
                                headers: newH
                            });
                        }
                        return response;
                    } catch (e) { return response; }
                }

                return response;
            };
        }

        /* --- XHR Hook --- */
        try {
            const origXHROpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url) {
                this._ytUrl = typeof url === "string" ? url : (url ? url.toString() : "");
                return origXHROpen.apply(this, arguments);
            };
            const origXHRSend = XMLHttpRequest.prototype.send;
            XMLHttpRequest.prototype.send = function() {
                const xhr = this;
                if (xhr._ytUrl) {
                    const AD_XHR = [
                        "/youtubei/v1/player/ad_break", "/youtubei/v1/player/ad_next",
                        "/api/stats/ads", "/pagead/", "/get_midroll_info",
                        "/ptracking", "/api/stats/atr"
                    ];
                    if (AD_XHR.some(ep => xhr._ytUrl.includes(ep))) {
                        notifyAdBlocked();
                        Object.defineProperty(xhr, "status", { get: () => 200, configurable: true });
                        Object.defineProperty(xhr, "readyState", { get: () => 4, configurable: true });
                        const fakeR = "{\"status\":\"OK\",\"adPlacements\":[],\"playerAds\":[]}";
                        Object.defineProperty(xhr, "responseText", { get: () => fakeR, configurable: true });
                        Object.defineProperty(xhr, "response", {
                            get: () => (xhr.responseType === "json"
                                ? { status: "OK", adPlacements: [], playerAds: [] }
                                : fakeR),
                            configurable: true
                        });
                        setTimeout(() => {
                            try { xhr.dispatchEvent(new Event("readystatechange")); } catch(e) {}
                            try { xhr.dispatchEvent(new Event("load")); } catch(e) {}
                        }, 0);
                        return;
                    }
                    if (xhr._ytUrl.includes("/youtubei/v1/player") && !xhr._ytUrl.includes("/ad_")) {
                        xhr.addEventListener("readystatechange", function() {
                            if (xhr.readyState === 4 && xhr.responseText) {
                                try {
                                    let p = JSON.parse(xhr.responseText);
                                    if (p.adPlacements || p.playerAds || p.adSlots) {
                                        cleanPlayerResponse(p);
                                        const cs = JSON.stringify(p);
                                        Object.defineProperty(xhr, "responseText", { get: () => cs, configurable: true });
                                        Object.defineProperty(xhr, "response", {
                                            get: () => (xhr.responseType === "json" ? p : cs),
                                            configurable: true
                                        });
                                        notifyAdBlocked();
                                    }
                                } catch (e) {}
                            }
                        }, true);
                    }
                }
                return origXHRSend.apply(this, arguments);
            };
        } catch (e) {}

        /* --- ytInitialPlayerResponse Hook --- */
        try {
            let prVal;
            Object.defineProperty(window, "ytInitialPlayerResponse", {
                get() { return prVal; },
                set(val) { prVal = val ? cleanPlayerResponse(val) : val; },
                configurable: true
            });
            if (window.ytInitialPlayerResponse) {
                window.ytInitialPlayerResponse = cleanPlayerResponse(window.ytInitialPlayerResponse);
            }
        } catch (e) {}

        /* --- ytplayer Hook --- */
        function cleanYtPlayerConfig(obj) {
            if (!obj || typeof obj !== "object") return;
            try {
                if (obj.args) {
                    ["raw_player_response","player_response"].forEach(key => {
                        if (obj.args[key] && typeof obj.args[key] === "string") {
                            try {
                                const p = JSON.parse(obj.args[key]);
                                cleanPlayerResponse(p);
                                obj.args[key] = JSON.stringify(p);
                            } catch (e) {}
                        }
                    });
                }
            } catch (e) {}
        }
        try {
            let ytpVal = window.ytplayer;
            Object.defineProperty(window, "ytplayer", {
                get() { return ytpVal; },
                set(val) { ytpVal = val; if (val && val.config) cleanYtPlayerConfig(val.config); },
                configurable: true
            });
            if (ytpVal && ytpVal.config) cleanYtPlayerConfig(ytpVal.config);
        } catch (e) {}

        /* --- ytcfg Sanitizer --- */
        function sanitizeYtCfg(config) {
            if (!config || typeof config !== "object") return;
            const keys = [
                "ad_blocker_detection","ab_enforce_adblock","ab_detection_wave",
                "yt_adblock_detection","ad_blocker_enforce_bypass","gsvb_ad_blocker_detection",
                "web_enable_adblock_detection","web_enable_adblock_detection_warning",
                "web_enable_adblock_detection_warning_messenger",
                "web_enable_adblock_detection_warning_dialog",
                "web_enable_adblock_detection_warning_modal",
                "web_enable_adblock_detection_warning_interstitial",
                "ad_blocker_detection_experiment_id","ad_blocker_detection_trigger_count",
                "ad_blocker_detection_bypass_flag","h5_companion_ad_renderer","web_ad_signals",
                "ab_enforce_adblock_trigger","is_ad_playback","enable_ad_signals",
                "enable_adblock_detection_wave_experiment"
            ];
            keys.forEach(k => { if (k in config) config[k] = false; });
            if (config.EXPERIMENT_FLAGS) {
                keys.forEach(k => { if (k in config.EXPERIMENT_FLAGS) config.EXPERIMENT_FLAGS[k] = false; });
            }
        }
        try {
            function hookYtCfg(obj) {
                if (!obj || typeof obj !== "object") return;
                if (typeof obj.set === "function" && !obj._adblockHooked) {
                    obj._adblockHooked = true;
                    const origSet = obj.set;
                    obj.set = function(first) {
                        if (first && typeof first === "object") sanitizeYtCfg(first);
                        return origSet.apply(this, arguments);
                    };
                }
                if (obj.data_) sanitizeYtCfg(obj.data_);
            }
            let ytcVal = window.ytcfg;
            Object.defineProperty(window, "ytcfg", {
                get() { return ytcVal; },
                set(val) { ytcVal = val; hookYtCfg(val); },
                configurable: true
            });
            if (ytcVal) hookYtCfg(ytcVal);
        } catch (e) {}

        /* --- HTMLMediaElement Prototype Hooks --- */
        try {
            const prDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "playbackRate");
            if (prDesc && prDesc.set && prDesc.get) {
                Object.defineProperty(HTMLMediaElement.prototype, "playbackRate", {
                    set(val) {
                        if (this.hasAttribute("data-adblock-speedup")) {
                            if (this.hasAttribute("data-adblock-live")) { prDesc.set.call(this, val); }
                            else { if (val !== 16.0) { prDesc.set.call(this, 16.0); return; } prDesc.set.call(this, val); }
                        } else { prDesc.set.call(this, val); }
                    },
                    get() {
                        const v = prDesc.get.call(this);
                        if (this.hasAttribute("data-adblock-speedup") &&
                            !this.hasAttribute("data-adblock-live") && v === 16.0) return 1.0;
                        return v;
                    },
                    configurable: true
                });
            }
            const muteDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "muted");
            if (muteDesc && muteDesc.set && muteDesc.get) {
                Object.defineProperty(HTMLMediaElement.prototype, "muted", {
                    set(val) {
                        if (this.hasAttribute("data-adblock-speedup") && !val) {
                            muteDesc.set.call(this, true); return;
                        }
                        muteDesc.set.call(this, val);
                    },
                    get() {
                        if (this.hasAttribute("data-adblock-speedup")) return false;
                        return muteDesc.get.call(this);
                    },
                    configurable: true
                });
            }
        } catch (e) {}

        /* --- Skip Button Selectors --- */
        const SKIP_SEL = [
            "button.ytp-ad-skip-button", "button.ytp-ad-skip-button-modern",
            "button.ytp-skip-ad-button", "button.ytp-skip-ad-button-modern",
            ".ytp-ad-skip-button-slot button", ".ytp-ad-skip-button-container button",
            "[id*='skip-button'] button", "button[id*='skip-button']",
            "button[class*='ytp-ad-skip-button']", "button[class*='ytp-skip-ad-button']",
            "button[aria-label*='Skip']", "button[aria-label*='Saltar']",
            "button[aria-label*='Omitir']", "button[aria-label*='Passer']",
            "[role='button'][aria-label*='Skip']", "[role='button'][aria-label*='Saltar']",
            "[role='button'][aria-label*='Omitir']"
        ].join(",");

        function isVisibleEl(el) {
            if (!el || !el.isConnected) return false;
            const s = window.getComputedStyle(el);
            if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false;
            return el.getClientRects().length > 0;
        }

        function findSkipBtns(root) {
            if (!root) return [];
            const containers = Array.from(root.querySelectorAll(
                SKIP_SEL + ",[class*='skip-button'],[id*='skip-button']"
            ));
            const candidates = new Set([
                ...containers,
                ...root.querySelectorAll("button,[role='button'],[tabindex]")
            ]);
            containers.forEach(container => {
                container.querySelectorAll("button,[role='button'],[tabindex]").forEach(el => candidates.add(el));
            });
            return [...candidates].filter(el => {
                const lb = (el.getAttribute("aria-label") || "") + " " +
                           (el.getAttribute("title") || "") + " " + (el.textContent || "");
                const isSkipControl = /\b(skip|saltar|omitir|passer)\b/i.test(lb) ||
                    /\b(skip|saltar|omitir|passer)\b/i.test((el.id || "") + " " + el.className);
                return isSkipControl && (el.matches("button,[role='button'],[tabindex]") ||
                    el.matches(".ytp-ad-skip-button,.ytp-ad-skip-button-modern,.ytp-skip-ad-button,.ytp-skip-ad-button-modern"));
            })
                .filter(el => !el.hasAttribute("disabled") && el.getAttribute("aria-disabled") !== "true")
                .filter(isVisibleEl);
        }

        function hasVisibleAdEl(root, sel) {
            return !!root && Array.from(root.querySelectorAll(sel)).some(isVisibleEl);
        }

        /* --- Core Ad Skip Engine --- */
        function skipAdViaPlayerAPI() {
            try {
                const player = document.getElementById("movie_player") ||
                               document.querySelector(".html5-video-player");
                if (!player) return false;

                const isAdState = !!(
                    player.classList.contains("ad-showing") ||
                    player.classList.contains("ad-interrupting") ||
                    player.classList.contains("ytp-ad-showing") ||
                    (typeof player.getAdState === "function" && player.getAdState() > 0) ||
                    (typeof player.getVideoData === "function" &&
                     player.getVideoData() && player.getVideoData().isAd)
                );

                const isAdOverlay = hasVisibleAdEl(player,
                    ".ytp-ad-player-overlay,.ytp-ad-player-overlay-layout,.ytp-ad-text," +
                    ".ytp-ad-preview-container,.ytp-ad-preview-text,.ytp-preview-ad__text,.ytp-ad-badge," +
                    ".ytp-ad-duration-remaining,.ytp-ad-simple-ad-badge," +
                    ".ytp-ad-action-interstitial,.ytp-ad-module:not(:empty)," +
                    ".ytp-ad-overlay-container,.ytp-ad-overlay-image," +
                    ".ytp-ad-visit-advertiser-button"
                );

                const isGlobalAd = !!(
                    player.matches("ytd-player[has-ad]") ||
                    player.querySelector(".ad-showing,.ad-interrupting")
                );

                const skipBtns = findSkipBtns(player);
                const isAd = isAdState || isAdOverlay || isGlobalAd || skipBtns.length > 0;
                const videos = Array.from(document.querySelectorAll(
                    "#movie_player video,.html5-video-player video,video"
                ));

                if (isAd) {
                    videos.forEach(video => {
                        if (!video.hasAttribute("data-adblock-speedup")) {
                            video.setAttribute("data-adblock-speedup", "true");
                        }
                        const isLive = !Number.isFinite(video.duration) ||
                            video.duration === Infinity ||
                            player.classList.contains("ytp-live") ||
                            !!document.querySelector(".ytp-live-badge");

                        if (!isLive) {
                            if (!video.muted) { try { video.muted = true; } catch(e) {} }
                            if (video.playbackRate !== 16.0) {
                                try { video.playbackRate = 16.0; } catch(e) {}
                            }
                            if (Number.isFinite(video.duration) && video.duration > 0 &&
                                video.duration - video.currentTime > 0.3) {
                                try { video.currentTime = video.duration - 0.05; } catch(e) {}
                            }
                            if (typeof player.seekTo === "function") {
                                const dur = typeof player.getDuration === "function"
                                    ? player.getDuration() : (video.duration || 0);
                                if (Number.isFinite(dur) && dur > 0) {
                                    try { player.seekTo(Math.max(0, dur - 0.05), true); } catch(e) {}
                                }
                            }
                            if (video.paused && Number.isFinite(video.duration) &&
                                video.currentTime < video.duration - 0.5) {
                                video.play().catch(() => {});
                            }
                        }
                        if (isLive) {
                            if (!video.hasAttribute("data-adblock-live")) {
                                video.setAttribute("data-adblock-live","true");
                            }
                        } else {
                            video.removeAttribute("data-adblock-live");
                        }
                    });

                    if (typeof player.skipAd === "function") {
                        try { player.skipAd(); } catch(e) {}
                    }

                    const skipBtn = skipBtns.find(btn => !btn.disabled);
                    if (skipBtn && typeof skipBtn.click === "function") {
                        try { skipBtn.click(); } catch(e) {}
                    }

                    notifyAdBlocked();
                    return true;
                } else {
                    videos.forEach(video => {
                        if (video.hasAttribute("data-adblock-speedup")) {
                            video.removeAttribute("data-adblock-speedup");
                            video.removeAttribute("data-adblock-live");
                            if (video.playbackRate >= 16.0) {
                                try { video.playbackRate = 1.0; } catch(e) {}
                            }
                            if (video.muted) { try { video.muted = false; } catch(e) {} }
                            if (video.paused) video.play().catch(() => {});
                        }
                    });
                }
            } catch(e) {}
            return false;
        }

        /* --- Ultra-Fast Sentinel Loop (25ms + rAF) --- */
        let loopSched = false;
        function runSentinel() {
            skipAdViaPlayerAPI();
            if (!loopSched) {
                loopSched = true;
                requestAnimationFrame(() => { loopSched = false; skipAdViaPlayerAPI(); });
            }
        }
        setInterval(runSentinel, 25);

        /* --- Quality Engine --- */
        let userSelectedQ = false;
        let prefQ = "max";

        function applyQ(q, force) {
            if (q) prefQ = q;
            if (userSelectedQ && !force) return;
            try {
                const player = document.getElementById("movie_player") ||
                               document.querySelector(".html5-video-player");
                if (!player || typeof player.getAvailableQualityLevels !== "function") return;
                const levels = player.getAvailableQualityLevels();
                if (!levels || !levels.length) return;
                let chosen = null;
                if (prefQ === "1080premium" || prefQ === "max") {
                    for (const p of ["highres","hd2880","hd2160","hd1440","hd1080","hd720"]) {
                        if (levels.includes(p)) { chosen = p; break; }
                    }
                } else if (prefQ === "hd1080") {
                    chosen = levels.includes("hd1080") ? "hd1080" :
                             (levels.includes("hd720") ? "hd720" : levels[0]);
                } else if (prefQ === "hd720") {
                    chosen = levels.includes("hd720") ? "hd720" : levels[0];
                } else if (prefQ !== "auto") {
                    chosen = levels.includes(prefQ) ? prefQ : levels[0];
                }
                if (!chosen && levels[0] !== "auto") chosen = levels[0];
                if (chosen && typeof player.setPlaybackQuality === "function") {
                    player.setPlaybackQuality(chosen);
                    window.postMessage({ type: "QUALITY_APPLIED", quality: chosen, availableLevels: levels }, "*");
                }
            } catch(e) {}
        }

        /* --- Stable Volume --- */
        let stableVol = true;
        function setStableVol(enable) {
            stableVol = !!enable;
            try {
                const player = document.getElementById("movie_player") ||
                               document.querySelector(".html5-video-player");
                if (player && typeof player.setOption === "function") {
                    player.setOption("audio","loudnessNormalization", stableVol);
                    player.setOption("audio","stableVolume", stableVol);
                }
            } catch(e) {}
            window.postMessage({ type: "STABLE_VOLUME_STATE_CHANGED", enabled: stableVol }, "*");
        }

        setInterval(() => {
            try {
                const player = document.getElementById("movie_player") ||
                               document.querySelector(".html5-video-player");
                if (player && typeof player.setOption === "function") {
                    player.setOption("audio","stableVolume", stableVol);
                    player.setOption("audio","loudnessNormalization", stableVol);
                }
            } catch(e) {}
        }, 3000);

        document.addEventListener("click", (e) => {
            if (e.target && e.target.closest &&
                e.target.closest(".ytp-settings-menu,.ytp-quality-menu,.ytp-panel-menu")) {
                userSelectedQ = true;
            }
        }, true);

        /* --- Message Bridge with content.js --- */
        window.addEventListener("message", (event) => {
            if (event.source !== window || !event.data) return;
            const d = event.data;
            if (d.type === "TRY_SKIP_AD") skipAdViaPlayerAPI();
            else if (d.type === "FORCE_MAX_QUALITY") {
                if (!userSelectedQ) applyQ(d.quality || "max", false);
            } else if (d.type === "SELECT_QUALITY") {
                userSelectedQ = true; applyQ(d.quality || "hd1080", true);
            } else if (d.type === "SET_STABLE_VOLUME") {
                setStableVol(d.enabled);
            } else if (d.type === "GET_PLAYER_STATE") {
                try {
                    const player = document.getElementById("movie_player") ||
                                   document.querySelector(".html5-video-player");
                    const levels = (player && typeof player.getAvailableQualityLevels === "function")
                        ? player.getAvailableQualityLevels() : [];
                    const curQ = (player && typeof player.getPlaybackQuality === "function")
                        ? player.getPlaybackQuality() : "";
                    window.postMessage({
                        type: "PLAYER_STATE_RESPONSE",
                        quality: curQ, levels, stableVolume: stableVol
                    }, "*");
                } catch(e) {}
            }
        });

    } // end IS_YOUTUBE

})();
