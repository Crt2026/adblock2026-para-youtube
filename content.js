/* ==========================================================================
   ADBLOCK 2026 FOR YOUTUBE™ - GAMER EDITION CONTENT SCRIPT (HIGH-PERFORMANCE)
   ========================================================================== */

let isEnabled = true;
let optVideo = true;
let optCosmetic = true;
let optBypass = true;
let optSecurity = true;
let optAutoHD = true;
let optStableVolume = true;
let optQuality = 'max'; // 'max', 'hd1080', 'hd720', 'auto'
let is1080pPremiumActive = true;

const CHECKMARK_SVG = `<svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"></path></svg>`;

const IS_YOUTUBE = window.location.hostname.includes('youtube.com');

let originalPlaybackRate = 1.0;
let originalMuted = false;
let isAdSpeedUpActive = false;
let lastLoggedAdTime = 0;
let observerInstance = null;
let isMutationScheduled = false; // Throttling helper

// Configured keywords for sponsored content detection in various languages
const SPONSORED_KEYWORDS = [
    'sponsored', 'patrocinado', 'anuncio', 'publicidad', 
    'promoted', 'promocionado', 'patrocinados', 'anuncios',
    'advertisement', 'anuncios patrocinados'
];

// Helper to verify if the extension context is still valid (not reloaded/invalidated)
function isContextValid() {
    try {
        return !!(chrome.runtime && chrome.runtime.id);
    } catch (e) {
        return false;
    }
}

// Helper to safely send runtime messages without throwing context-invalidation errors
function safeSendMessage(message) {
    try {
        if (isContextValid()) {
            chrome.runtime.sendMessage(message);
        }
    } catch (e) {
        // Context invalidated, extension was reloaded. Fail silently.
    }
}



// Safely configure and load options from storage
try {
    if (isContextValid()) {
        chrome.storage.local.get({
            isEnabled: true,
            optVideo: true,
            optCosmetic: true,
            optBypass: true,
            optSecurity: true,
            optAutoHD: true,
            optStableVolume: true,
            optQuality: 'max',
            is1080pPremiumActive: true
        }, (result) => {
            try {
                if (isContextValid()) {
                    isEnabled = result.isEnabled;
                    optVideo = result.optVideo;
                    optCosmetic = result.optCosmetic;
                    optBypass = result.optBypass;
                    optSecurity = result.optSecurity;
                    optAutoHD = result.optAutoHD;
                    optStableVolume = result.optStableVolume;
                    optQuality = result.optQuality || 'max';
                    is1080pPremiumActive = (result.is1080pPremiumActive !== false);

                    if (IS_YOUTUBE) {
                        window.postMessage({ type: 'SET_STABLE_VOLUME', enabled: optStableVolume }, '*');
                        
                        if (typeof applyVideoEnhancementFilter === 'function') {
                            
                        }
                    }
                }
            } catch (e) {}
        });

        // Watch for configuration changes
        chrome.storage.onChanged.addListener((changes) => {
            try {
                if (!isContextValid()) return;
                
                if (changes.isEnabled) {
                    isEnabled = changes.isEnabled.newValue;
                    if (!isEnabled && isAdSpeedUpActive) {
                        restoreVideoSettings();
                    }
                }
                if (changes.optVideo) {
                    optVideo = changes.optVideo.newValue;
                    if (!optVideo && isAdSpeedUpActive) {
                        restoreVideoSettings();
                    }
                }
                if (changes.optCosmetic) {
                    optCosmetic = changes.optCosmetic.newValue;
                }
                if (changes.optBypass) {
                    optBypass = changes.optBypass.newValue;
                }
                if (changes.optSecurity) {
                    optSecurity = changes.optSecurity.newValue;
                }
                if (changes.optAutoHD) {
                    optAutoHD = changes.optAutoHD.newValue;
                    if (optAutoHD && IS_YOUTUBE) {
                        window.postMessage({ type: 'FORCE_MAX_QUALITY', quality: is1080pPremiumActive ? '1080premium' : optQuality }, '*');
                    }
                }
                if (changes.optQuality) {
                    optQuality = changes.optQuality.newValue;
                    if (IS_YOUTUBE) {
                        window.postMessage({ type: 'SELECT_QUALITY', quality: optQuality }, '*');
                    }
                }
                if (changes.is1080pPremiumActive !== undefined) {
                    is1080pPremiumActive = changes.is1080pPremiumActive.newValue;
                    if (typeof applyVideoEnhancementFilter === 'function') {
                        
                    }
                    if (typeof updateMainSettingsQualityLabel === 'function') {
                        updateMainSettingsQualityLabel();
                    }
                }
                if (changes.optStableVolume) {
                    optStableVolume = changes.optStableVolume.newValue;
                    if (typeof updateCompressorRouting === 'function') {
                        updateCompressorRouting(optStableVolume);
                    }
                    if (typeof updateQuickButtonsState === 'function') {
                        
                    }
                    if (IS_YOUTUBE) {
                        window.postMessage({ type: 'SET_STABLE_VOLUME', enabled: optStableVolume }, '*');
                    }
                }
            } catch (e) {}
        });
    }
} catch (err) {
    // Fail silently on context invalidation
}

// Helper function to restore video settings back to user's originals
function restoreVideoSettings() {
    if (!isContextValid()) return;
    const video = document.querySelector('#movie_player video') || document.querySelector('video');
    if (video) {
        video.removeAttribute('data-adblock-speedup');
        video.removeAttribute('data-adblock-live');
        if (video.playbackRate === 16.0) {
            video.playbackRate = (originalPlaybackRate === 16.0) ? 1.0 : originalPlaybackRate;
        }
        if (video.muted !== originalMuted) {
            video.muted = originalMuted;
        }
    }
    isAdSpeedUpActive = false;
}

// Function to simulate a realistic, trusted human-like click event sequence on an element
function simulateClick(element) {
    if (!element || !isContextValid()) return;
    
    // Get target coordinates on the element
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 4;
    const y = rect.top + rect.height / 2 + (Math.random() - 0.5) * 4;
    
    const eventInit = {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        screenX: x + window.screenX,
        screenY: y + window.screenY,
        isTrusted: true
    };
    
    // Dispatch mouse click sequence to bypass bot-checks
    const events = ['mouseover', 'mousedown', 'focus', 'mouseup', 'click'];
    events.forEach(eventType => {
        const event = new MouseEvent(eventType, eventInit);
        element.dispatchEvent(event);
    });
}

// Comprehensive skip button selectors
const SKIP_BUTTON_SELECTORS = [
    'button.ytp-ad-skip-button',
    'button.ytp-ad-skip-button-modern',
    'button.ytp-skip-ad-button',
    'button.ytp-skip-ad-button-modern',
    '.ytp-ad-skip-button-slot button',
    '.ytp-ad-skip-button-container button',
    '[id*="skip-button"] button',
    'button[class*="ytp-ad-skip-button"]',
    'button[class*="ytp-skip-ad-button"]',
    'button[aria-label*="Skip"]',
    'button[aria-label*="Saltar"]',
    'button[aria-label*="Omitir"]',
    '[role="button"][aria-label*="Skip"]',
    '[role="button"][aria-label*="Saltar"]',
    '[role="button"][aria-label*="Omitir"]'
].join(', ');

// Main logic to speed up and skip video ads
function isVisibleAdElement(element) {
    if (!element || !element.isConnected) return false;
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
    return element.getClientRects().length > 0;
}

function hasVisibleAdElement(root, selector) {
    return !!root && Array.from(root.querySelectorAll(selector)).some(isVisibleAdElement);
}

function findVisibleSkipButton(root) {
    if (!root) return null;
    const skipContainers = Array.from(root.querySelectorAll(
        `${SKIP_BUTTON_SELECTORS}, [class*="skip-button"], [id*="skip-button"]`
    ));
    const controls = Array.from(root.querySelectorAll('button, [role="button"], [tabindex]'));
    const candidates = new Set([...skipContainers, ...controls]);

    skipContainers.forEach((container) => {
        container.querySelectorAll('button, [role="button"], [tabindex]').forEach((control) => {
            candidates.add(control);
        });
    });

    return [...candidates].filter((element) => {
        const label = `${element.getAttribute('aria-label') || ''} ${element.getAttribute('title') || ''} ${element.textContent || ''}`;
        const isSkipControl = /\b(skip|saltar|omitir)\b/i.test(label) ||
            /\b(skip|saltar|omitir)\b/i.test(`${element.id} ${element.className}`);
        return isSkipControl &&
            !element.hasAttribute('disabled') &&
            element.getAttribute('aria-disabled') !== 'true';
    }).find(isVisibleAdElement) || null;
}

function handleVideoAds() {
    if (!isContextValid() || !isEnabled || !optVideo) return;

    const player = document.querySelector('#movie_player') || document.querySelector('.html5-video-player');
    const video = player ? player.querySelector('video') : document.querySelector('video');
    
    if (!video) return;

    // Detection: Check player class, API state, ad container, or visible ad badge
    const isPlayerAdState = !!(player && (
        player.classList.contains('ad-showing') || 
        player.classList.contains('ad-interrupting') ||
        player.classList.contains('ytp-ad-showing') ||
        (typeof player.getAdState === 'function' && player.getAdState() > 0) ||
        (typeof player.getVideoData === 'function' && player.getVideoData() && player.getVideoData().isAd)
    ));

    const isAdOverlayPresent = hasVisibleAdElement(player,
        '.ytp-ad-player-overlay, .ytp-ad-player-overlay-layout, .ytp-ad-preview-container, .ytp-ad-text, .ytp-ad-preview-text, .ytp-preview-ad__text, .ytp-ad-badge, .ytp-ad-duration-remaining, .ytp-ad-simple-ad-badge, .ytp-ad-action-interstitial, .ytp-ad-module:not(:empty), .ytp-ad-overlay-container, .ytp-ad-overlay-image, .ytp-ad-visit-advertiser-button, .ytp-ad-skip-button-container'
    );

    const isGlobalAdState = !!(player && (
        player.matches('ytd-player[has-ad]') ||
        player.querySelector('.ad-showing, .ad-interrupting')
    ));

    let isSkipBtnVisible = false;
    let skipBtn = null;
    if (player) {
        skipBtn = findVisibleSkipButton(player);
        if (skipBtn) {
            isSkipBtnVisible = true;
        }
    }

    const isAdShowing = isPlayerAdState || isAdOverlayPresent || isGlobalAdState || isSkipBtnVisible;

    if (isAdShowing) {
        // Guard values before changing them
        if (!isAdSpeedUpActive) {
            originalPlaybackRate = (video.playbackRate >= 16.0) ? 1.0 : (video.playbackRate || 1.0);
            originalMuted = video.muted;
            isAdSpeedUpActive = true;
            
            // Log statistics with throttling (max once every 3 seconds)
            const currentTime = Date.now();
            if (currentTime - lastLoggedAdTime > 3000) {
                safeSendMessage({ action: "adBlocked" });
                lastLoggedAdTime = currentTime;
            }
        }

        // Check if the current video is a Live stream
        const isLive = !Number.isFinite(video.duration) || 
                       (player && player.classList.contains('ytp-live')) ||
                       !!document.querySelector('.ytp-live, .ytp-live-badge');

        // Configure attributes safely on the video element
        if (!video.hasAttribute('data-adblock-speedup')) {
            video.setAttribute('data-adblock-speedup', 'true');
        }
        if (isLive) {
            if (!video.hasAttribute('data-adblock-live')) {
                video.setAttribute('data-adblock-live', 'true');
            }
        } else {
            if (video.hasAttribute('data-adblock-live')) {
                video.removeAttribute('data-adblock-live');
            }
        }

        // Apply muting during ad
        if (!video.muted) {
            video.muted = true;
        }

        // Apply 16x speed rate during ad (if non-live)
        const targetRate = isLive ? ((originalPlaybackRate >= 16.0) ? 1.0 : originalPlaybackRate) : 16.0;
        if (video.playbackRate !== targetRate) {
            try { video.playbackRate = targetRate; } catch (e) {}
        }

        // Seek to the end of the ad once without thrashing seeking loop
        if (!isLive && Number.isFinite(video.duration) && video.duration > 0) {
            const remaining = video.duration - video.currentTime;
            if (remaining > 0.3) {
                try {
                    video.currentTime = video.duration - 0.05;
                } catch (e) {
                    try { video.currentTime = video.duration; } catch (e2) {}
                }
            }
        }

        // If ad paused video playback, unpause immediately
        if (video.paused) {
            video.play().catch(() => {});
        }

        // Try to skip using the native player API first (via inject.js listener)
        window.postMessage({ type: 'TRY_SKIP_AD' }, '*');

        // Click visible skip button
        if (skipBtn) {
            try { skipBtn.click(); } catch(e) {}
        }
    } else {
        // If ad has stopped or is not showing, restore settings immediately
        if (isAdSpeedUpActive || video.hasAttribute('data-adblock-speedup')) {
            restoreVideoSettings();
        }
    }
}

// Logic to bypass the "Ad blocker detected" popups and warnings
function handleEnforcementPopups() {
    if (!isContextValid() || !isEnabled || !optBypass) return;

    // Targeted warning dialogs/error screens
    const popupSelectors = [
        'ytd-enforcement-message-view-model',
        'tp-yt-paper-dialog:has(yt-playability-error-supported-renderers)',
        'tp-yt-paper-dialog:has(#yt-playability-error-supported-renderers)',
        'tp-yt-paper-dialog:has(ytd-enforcement-message-view-model)',
        'yt-playability-error-supported-renderers',
        '#playability-error',
        'ytd-popup-container:has(ytd-enforcement-message-view-model)',
        'ytd-popup-container:has(yt-playability-error-supported-renderers)',
        'ytd-mealbar-promo-renderer'
    ];

    let foundPopup = false;
    for (const selector of popupSelectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            const parentDialog = element.closest('tp-yt-paper-dialog');
            if (parentDialog) {
                parentDialog.remove();
            } else {
                element.remove();
            }
            foundPopup = true;
        });
    }

    // Unfreeze page scrolling and remove lingering backdrops
    unfreezeYouTubeScroll();

    if (foundPopup) {
        // Resume video playback if it was paused by YouTube's popup logic
        const video = document.querySelector('#movie_player video') || document.querySelector('video');
        if (video && video.paused) {
            video.play().catch(e => {
                const playBtn = document.querySelector('.ytp-play-button');
                if (playBtn) simulateClick(playBtn);
            });
        }
    }
}

// Scans grid items, search results and side panels to hide sponsored listings
function hideSponsoredElements() {
    if (!isContextValid() || !isEnabled || !optCosmetic) return;

    // Direct match on ad slot elements or player ads
    const directAds = document.querySelectorAll('ytd-ad-slot-renderer, ytd-in-feed-ad-layout-renderer, ytd-banner-promo-renderer, ytd-statement-banner-renderer, #player-ads, #masthead-ad, .ytd-carousel-ad-renderer');
    directAds.forEach(item => {
        item.style.setProperty('display', 'none', 'important');
    });

    // Check individual video cards for sponsored badges
    const items = document.querySelectorAll('ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-video-renderer');
    items.forEach(item => {
        if (item.querySelector('ytd-ad-slot-renderer, ytd-in-feed-ad-layout-renderer, #content-ad')) {
            item.style.setProperty('display', 'none', 'important');
            return;
        }

        const badges = item.querySelectorAll('ytd-badge-supported-renderer, .ytd-badge-supported-renderer');
        let isSponsored = false;
        for (const badge of badges) {
            const text = badge.textContent.toLowerCase().trim();
            if (SPONSORED_KEYWORDS.some(kw => text === kw || text.startsWith(kw + ' ') || text.endsWith(' ' + kw))) {
                isSponsored = true;
                break;
            }
        }

        if (isSponsored) {
            item.style.setProperty('display', 'none', 'important');
        }
    });
}

// Scans active YouTube Shorts and automatically skips them if they are ads
function handleShortsAds() {
    if (!isContextValid() || !isEnabled || !optVideo) return;

    const activeShort = document.querySelector('ytd-reel-video-renderer[is-active]') || document.querySelector('ytd-reel-video-renderer');
    if (!activeShort) return;

    // Strictly check for official YouTube Shorts ad slot renderers or badges inside ad slots
    const isAd = !!(
        activeShort.querySelector('ytd-ad-slot-renderer') ||
        activeShort.querySelector('ytd-reel-player-overlay-renderer ytd-ad-slot-renderer') ||
        activeShort.getAttribute('has-ad') === 'true'
    );

    if (isAd) {
        const video = activeShort.querySelector('video');
        if (video) {
            video.setAttribute('data-adblock-speedup', 'true');
            video.muted = true;
            video.playbackRate = 16.0;
            if (Number.isFinite(video.duration) && video.duration > 0) {
                video.currentTime = video.duration - 0.05;
            }
            setTimeout(() => {
                if (video) video.removeAttribute('data-adblock-speedup');
            }, 1000);
        }
        
        // Skip current Short by simulating an ArrowDown keypress
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowDown',
            keyCode: 40,
            code: 'ArrowDown',
            which: 40,
            bubbles: true,
            cancelable: true
        });
        window.dispatchEvent(event);
        
        const currentTime = Date.now();
        if (currentTime - lastLoggedAdTime > 5000) {
            safeSendMessage({ action: "adBlocked" });
            lastLoggedAdTime = currentTime;
        }
        console.log('Shorts Ad Blocked: Skipped sponsored Short.');
    }
}

// Generic Video Ads Handler across non-YouTube websites (JWPlayer, VideoJS, generic HTML5 players)
function handleGenericVideoAds() {
    if (!isContextValid() || !isEnabled || !optVideo) return;

    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        // Detect if the video is an advertisement
        const parent = video.closest('.jwplayer, .video-js, [class*="player"], [class*="video-container"]') || video.parentElement;
        if (!parent) return;

        const isAdPlayer = (
            parent.classList.contains('jw-flag-ads') ||
            parent.classList.contains('vjs-ad-playing') ||
            parent.classList.contains('ad-showing') ||
            parent.classList.contains('is-ad') ||
            !!parent.querySelector('[class*="ad-container"], [class*="ad-overlay"], [class*="skip-button"], .jw-skip, .vjs-skip') ||
            video.hasAttribute('data-ad-playing') ||
            video.classList.contains('ad-video')
        );

        if (isAdPlayer) {
            video.muted = true;
            if (video.playbackRate !== 16.0) {
                video.playbackRate = 16.0;
            }
            if (Number.isFinite(video.duration) && video.duration > 0 && video.currentTime < video.duration - 0.1) {
                video.currentTime = video.duration - 0.05;
            }

            // Look for and click skip button on generic video players
            const skipBtn = parent.querySelector('.jw-skip, .vjs-skip, [class*="skip-button"], [class*="skip-ad"], [id*="skip-button"]');
            if (skipBtn && skipBtn.offsetHeight > 0) {
                simulateClick(skipBtn);
            }

            const currentTime = Date.now();
            if (currentTime - lastLoggedAdTime > 5000) {
                safeSendMessage({ action: "adBlocked" });
                lastLoggedAdTime = currentTime;
            }
        }
    });
}

// Intelligent Floating Ad, In-Page Push (Social Bar), Anuncio Badges, Video Overlays, and Sticky Promo Annihilator
function destroyFloatingAdsAndOverlays() {
    if (!isContextValid() || !isEnabled || !optCosmetic) return;

    // Do not run aggressive destructive cleaner on search engines or vital tools
    const hostname = (window.location.hostname || '').toLowerCase();
    if (hostname.includes('google.') || hostname.includes('bing.com') || hostname.includes('duckduckgo.com') || hostname.includes('yahoo.com')) {
        return;
    }

    try {
        // 1. Direct match on known aggressive floating ad classes and containers
        const directSelectors = [
            'div[class*="social-bar"]',
            'div[class*="socialbar"]',
            'div[id*="social-bar"]',
            'div[id*="socialbar"]',
            'div[class*="in-page-push"]',
            'div[class*="inpage-push"]',
            'div[class*="in_page_push"]',
            'div[id*="in-page-push"]',
            'div[id*="inpage-push"]',
            'div[id*="in_page_push"]',
            'div[class*="ipp-container"]',
            'div[id*="ipp-container"]',
            'div[class*="push-notification"]',
            'div[id*="push-notification"]',
            'div[class*="push-box"]',
            'div[id*="push-box"]',
            'div[class*="push-toast"]',
            'div[id*="push-toast"]',
            'div[class*="push-alert"]',
            'div[id*="push-alert"]',
            'div[class*="toast-ad"]',
            'div[id*="toast-ad"]',
            'div[class*="native-push"]',
            'div[id*="native-push"]',
            'div[class*="floating-card"]',
            'div[class*="float-card"]',
            'div[class*="float-banner"]',
            'div[class*="banner-float"]',
            'div[class*="corner-ad"]',
            'div[id*="corner-ad"]',
            'div[id^="container-"][style*="fixed"]',
            'div[id^="container-"][style*="z-index"]',
            'div[id*="on5023"]',
            'div[class*="on5023"]',
            'div[class*="wps-ad"]',
            'div[id*="wps-ad"]',
            'div[id*="adsterra"]',
            'div[class*="adsterra"]',
            'div[id*="propeller"]',
            'div[class*="propeller"]',
            'div[id*="monetag"]',
            'div[class*="monetag"]',
            'div[id*="propush"]',
            'div[class*="propush"]',
            'div[id*="richpush"]',
            'div[class*="richpush"]',
            'div[id*="richads"]',
            'div[class*="richads"]',
            'div[id*="evadav"]',
            'div[class*="evadav"]',
            'div[id*="rollerads"]',
            'div[class*="rollerads"]',
            'div[id*="clickadu"]',
            'div[class*="clickadu"]',
            'div[id*="hilltop"]',
            'div[class*="hilltop"]',
            'div[id*="notix"]',
            'div[class*="notix"]',
            'div[class*="chatmate"]',
            'div[id*="chatmate"]',
            'div[class*="hiredify"]',
            'div[id*="hiredify"]',
            'div[class*="vignette"]',
            'div[id*="vignette"]',
            'div[class*="video-interstitial"]',
            'div[id*="video-interstitial"]',
            'div[class*="interstitial-ad"]',
            'div[id*="interstitial-ad"]',
            'a[href*="1xbet"]',
            'a[href*="1x-bet"]',
            'a[href*="melbet"]',
            'a[href*="betwinner"]',
            'a[href*="mostbet"]',
            'a[href*="pin-up"]'
        ];

        directSelectors.forEach(sel => {
            const elements = document.querySelectorAll(sel);
            elements.forEach(el => {
                const parentFloating = el.closest('div[style*="fixed"], div[style*="sticky"], div[style*="absolute"], [class*="bar"], [class*="banner"], [class*="alert"]') || el;
                // Never remove critical navigation or search headers
                if (parentFloating && !parentFloating.closest('nav, header, #header, .navbar, #navbar, form, #searchform, #tsf, .sfbg, main, #main, [role="search"], [role="navigation"]')) {
                    parentFloating.remove();
                }
            });
        });

        // 2. Comprehensive heuristic scan across all elements in the DOM
        const bodyChildren = document.body ? Array.from(document.body.children) : [];
        const docChildren = document.documentElement ? Array.from(document.documentElement.children) : [];
        const topElements = [...new Set([...bodyChildren, ...docChildren, ...document.querySelectorAll('div, section, aside, iframe, video')])];

        topElements.forEach(el => {
            if (!el || !el.isConnected) return;

            // Skip primary site navigation, search forms, and headers
            if (el.closest('nav, header, #header, .navbar, #navbar, #menu, .menu, #main-nav, form, #searchform, #tsf, .sfbg, main, #main, [role="search"], [role="navigation"]')) return;
            if (el.querySelector('input, textarea, form, [role="search"]')) return;

            const style = window.getComputedStyle(el);
            const isFloating = (style.position === 'fixed' || style.position === 'sticky' || (style.position === 'absolute' && (parseInt(style.zIndex, 10) >= 20 || style.top !== 'auto' || style.right !== 'auto' || style.bottom !== 'auto')));

            if (isFloating) {
                const text = (el.innerText || el.textContent || '').toLowerCase().trim();

                // Explicit Ad badge detection: elements with "Anuncio", "Anuncios", "Publicidad", "Sponsored", "Ad", "Patrocinado"
                const allSubElements = Array.from(el.querySelectorAll('*'));
                const hasAdBadge = allSubElements.some(sub => {
                    const subText = (sub.innerText || sub.textContent || '').trim().toLowerCase();
                    return subText === 'anuncio' || subText === 'anuncios' || subText === 'publicidad' || 
                           subText === 'sponsored' || subText === 'patrocinado' || subText === 'advertisement' ||
                           subText === 'promoted' || subText === 'ads by' || subText === 'anuncio patrocinado';
                });

                // Check for ad and intrusive signature keywords
                const hasAdKeywords = (
                    hasAdBadge ||
                    text.includes('oficina de wps') ||
                    text.includes('la mejor alternativa a ms office') ||
                    text.includes('nuevo mensaje [') ||
                    text.includes('chatmate') ||
                    text.includes('hiredify') ||
                    text.includes('start free video chat') ||
                    text.includes('install chatmatetv app') ||
                    text.includes('ir al sitio web') ||
                    text.includes('1xbet') || 
                    text.includes('melbet') || 
                    text.includes('betwinner') || 
                    text.includes('buy now') || 
                    text.includes('sorteo') || 
                    text.includes('canal de telegram') || 
                    text.includes('ultimate edition') || 
                    text.includes('top up and get') || 
                    text.includes('get your bonus') || 
                    text.includes('apuesta') || 
                    text.includes('casino') || 
                    text.includes('ganar dinero') ||
                    text.includes('free robux') ||
                    text.includes('crypto bonus')
                );

                const hasCloseBtn = !!el.querySelector('[class*="close"], [id*="close"], [aria-label*="close"], svg, span.close, .btn-close');
                const hasExternalLinks = !!el.querySelector('a[href*="1xbet"], a[href*="melbet"], a[href*="chatmate"], a[href*="hiredify"], a[href*="t.me"], a[href*="telegram"], a[href*="http"]:not([href*="' + window.location.hostname + '"])');

                // If it's a floating box containing ad keywords, Anuncio badge, or external push link with close button, eliminate it
                if (hasAdKeywords || (hasCloseBtn && hasExternalLinks)) {
                    el.remove();
                    console.log("[Adblock 2026] Annihilated floating ad / Social Bar / In-Page Push widget.");
                    return;
                }
            }
        });
    } catch (e) {}
}

// Scans and hides generic ads, banners, floating video players, and sticky ad footers on non-YouTube sites
function hideGenericAds() {
    if (!isContextValid() || !isEnabled || !optCosmetic) return;

    // First annihilate floating banners and Social Bars
    destroyFloatingAdsAndOverlays();

    const genericAdSelectors = [
        'ins.adsbygoogle',
        'div[id^="google_ads_iframe"]',
        'iframe[id^="google_ads_iframe"]',
        'iframe[src*="doubleclick.net"]',
        'iframe[src*="googlesyndication.com"]',
        '.adsbygoogle',
        '.ad-container',
        '.ad-slot',
        '.ad-wrapper',
        '.ad-wrap',
        '.ad-holder',
        '.ad-bar',
        '.ad-placement',
        '.ad-zone',
        '.ad-box',
        '.ad-spot',
        '.ad-space',
        '.ad-frame',
        '.main-ad',
        '.banner-ad',
        '.top-ad',
        '.bottom-ad',
        '.sidebar-ad',
        '.inline-ad',
        '.sticky-ad',
        '.sticky-ad-bottom',
        '.floating-ad',
        '.floating-banner',
        '.sponsored-post',
        '.sponsored-label',
        '.sponsored-content',
        '.sponsored-article',
        '.promoted-content',
        '.promoted-post',
        '.promoted-item',
        'div.ad-banner',
        'div.ad-unit',
        'div.ad_unit',
        '.taboola-ad',
        '.outbrain-ad',
        '.criteo-ad',
        '.mgid-ad',
        '.revcontent-ad',
        '.trc_rbox_container',
        '.trc_related_container',
        '.OUTBRAIN',
        '.rc-item',
        '.rc-widget',
        '.ezoic-ad',
        '.ez-ad',
        '.mediavine-ad',
        '.adthrive-ad',
        '.raptive-ad',
        '.playwire-ad',
        '.connatix-ad',
        '.primis-ad',
        '.anyclip-widget',
        '.vidoomy-container',
        '.brid-ad',
        '.aniview-ad',
        '.pubmatic-ad',
        '.rubicon-ad',
        '.infolinks-ad',
        '.chitika-ad',
        '.adblade-ad',
        '.buysellads-ad',
        '.carbonads',
        '#carbonads',
        'amp-embed[type="adsense"]',
        'amp-ad',
        '.native-ad',
        '.native-ads',
        '.sponsored-links',
        '.sponsored-ad',
        '[class*="ad-banner"]',
        '[class*="ad-slot"]',
        '[id*="ad-slot"]',
        '[class*="ad-container"]',
        '[id*="ad-container"]',
        '[class*="ad-wrapper"]',
        '[id*="ad-wrapper"]',
        'div[id^="div-gpt-ad"]',
        '[data-ad-client]',
        '[data-ad-slot]',
        '[data-ad-unit]',
        '[data-ad-format]',
        '[data-ad-zone]',
        '[data-ad-type]',
        '[data-advertisement]',
        '[data-dfp-id]',
        '[class*="outbrain"]',
        '[class*="taboola"]',
        '[id*="outbrain"]',
        '[id*="taboola"]',
        '[id^="taboola-"]',
        '[id^="outbrain_"]',
        '[class*="popunder"]',
        '[class*="popup-ad"]',
        '[id*="popunder"]',
        '[id*="popup-ad"]',
        'iframe[src*="adserver"]',
        'iframe[src*="adsystem"]',
        'iframe[src*="adtech"]',
        'iframe[src*="trafficjunky"]',
        'iframe[src*="exoclick"]',
        'iframe[src*="adsterra"]',
        'iframe[src*="propellerads"]',
        'iframe[src*="popads"]',
        'iframe[src*="popcash"]',
        'iframe[src*="monetag"]',
        'iframe[src*="yieldmo"]',
        'iframe[src*="smartadserver"]',
        'iframe[src*="trafficstars"]',
        '.download-timer-ad',
        'div[class*="adblock-overlay"]',
        'div[id*="adblock-overlay"]',
        'div[class*="adblock-modal"]',
        'div[id*="adblock-modal"]',
        'div[class*="adblock-dialog"]',
        'div[id*="adblock-dialog"]',
        'div[class*="adblock-wall"]',
        'div[id*="adblock-wall"]',
        'div[class*="adblock-popup"]',
        'div[id*="adblock-popup"]',
        'div[class*="anti-adblock"]',
        'div[id*="anti-adblock"]'
    ];

    let count = 0;
    genericAdSelectors.forEach(selector => {
        const ads = document.querySelectorAll(selector);
        ads.forEach(ad => {
            // Never hide navigation or search forms
            if (ad.closest('form, #searchform, #tsf, .sfbg, header, nav, #header, main, #main, [role="search"], [role="navigation"]')) {
                return;
            }
            if (!ad.hasAttribute('data-adblock-hidden')) {
                ad.setAttribute('data-adblock-hidden', 'true');
                ad.style.setProperty('display', 'none', 'important');
                ad.style.setProperty('visibility', 'hidden', 'important');
                ad.style.setProperty('height', '0px', 'important');
                ad.style.setProperty('min-height', '0px', 'important');
                ad.style.setProperty('max-height', '0px', 'important');
                ad.style.setProperty('width', '0px', 'important');
                ad.style.setProperty('opacity', '0', 'important');
                ad.style.setProperty('pointer-events', 'none', 'important');
                count++;
            }
        });
    });

    // Unfreeze scroll if anti-adblock modals tried to freeze the page
    if (document.body && (document.body.style.overflow === 'hidden' || document.documentElement.style.overflow === 'hidden')) {
        const hasOverlayModal = document.querySelector('div[class*="adblock"], div[id*="adblock"], div[class*="anti-adblock"], .fc-ab-root');
        if (hasOverlayModal) {
            document.body.style.removeProperty('overflow');
            document.documentElement.style.removeProperty('overflow');
        }
    }

    if (count > 0) {
        const currentTime = Date.now();
        if (currentTime - lastLoggedAdTime > 3000) {
            safeSendMessage({ action: "adBlocked" });
            lastLoggedAdTime = currentTime;
        }
    }
}

// Bridge to YouTube native Stable Volume (Loudness Normalization)
function applyStableVolumeToVideo(video) {
    if (!video || !IS_YOUTUBE) return;
    try {
        window.postMessage({ type: 'SET_STABLE_VOLUME', enabled: optStableVolume }, '*');
    } catch (e) {}
}

function updateCompressorRouting(enabled) {
    if (!IS_YOUTUBE) return;
    try {
        window.postMessage({ type: 'SET_STABLE_VOLUME', enabled: enabled }, '*');
    } catch (e) {}
}

// On-player toast feedback
function showPlayerToast(text) {
    try {
        const player = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
        if (!player) return;
        let toast = player.querySelector('.adblock-player-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'adblock-player-toast';
            player.appendChild(toast);
        }
        toast.textContent = text;
        toast.classList.remove('show');
        void toast.offsetWidth;
        toast.classList.add('show');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.classList.remove('show');
        }, 2200);
    } catch (e) {}
}

// Maintain player controls (Cleanup only - leaves YouTube settings menu 100% native)
function maintainPlayerControls() {
    if (!IS_YOUTUBE || !isContextValid()) return;

    try {
        // Completely remove any intrusive player bar buttons
        const quickVol = document.getElementById('adblock-quick-stable-vol');
        if (quickVol) quickVol.remove();
        const quickBadge = document.getElementById('adblock-quick-quality-badge');
        if (quickBadge) quickBadge.remove();
        document.querySelectorAll('.adblock-yt-quick-btn, .adblock-yt-quality-badge').forEach(el => el.remove());
    } catch (e) {}
}

// Native video rendering without artificial filters
function applyVideoEnhancementFilter() {
    if (!IS_YOUTUBE) return;
    const video = document.querySelector('#movie_player video') || document.querySelector('video');
    if (video) video.style.filter = '';
}

// Close YouTube settings menu cleanly
function closeSettingsMenu() {
    try {
        const settingsBtn = document.querySelector('.ytp-settings-button');
        const settingsMenu = document.querySelector('.ytp-popup.ytp-settings-menu, .ytp-settings-menu');
        if (settingsMenu && settingsMenu.style.display !== 'none') {
            if (settingsBtn) {
                settingsBtn.click();
            } else {
                settingsMenu.style.display = 'none';
            }
        }
    } catch (e) {}
}

// Bind event listeners to video elements for event-driven ad checks and enhancements
function setupVideoListeners() {
    if (!isContextValid()) return;
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        if (!video._adblockListenersAttached) {
            video._adblockListenersAttached = true;
            const events = ['play', 'playing', 'timeupdate', 'durationchange'];
            events.forEach(evt => {
                if (IS_YOUTUBE) {
                    video.addEventListener(evt, handleVideoAds);
                    video.addEventListener(evt, handleShortsAds);
                } else {
                    video.addEventListener(evt, handleGenericVideoAds);
                }
            });

            if (IS_YOUTUBE) {
                applyStableVolumeToVideo(video);
                maintainPlayerControls();
                unfreezeYouTubeScroll();
            }

        }
    });
}

// Clean up and disconnect observers if context is invalidated
function cleanupObserver() {
    if (observerInstance) {
        observerInstance.disconnect();
        observerInstance = null;
    }
}

// Initialize MutationObserver with requestAnimationFrame throttling for gaming-grade performance
function initObserver() {
    if (!isContextValid()) return;
    const targetNode = document.body || document.documentElement;
    if (!targetNode) {
        setTimeout(initObserver, 100);
        return;
    }

    const config = { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] };
    observerInstance = new MutationObserver(() => {
        if (!isContextValid()) {
            cleanupObserver();
            return;
        }
        if (isMutationScheduled) return;
        isMutationScheduled = true;

        // Throttle checks to 60fps max to avoid micro-stutters during heavy gaming/watching
        requestAnimationFrame(() => {
            isMutationScheduled = false;
            if (!isContextValid()) return;
            if (IS_YOUTUBE) {
                setupVideoListeners();
                handleVideoAds();
                handleShortsAds();
                handleEnforcementPopups();
                hideSponsoredElements();
                maintainPlayerControls();
            } else {
                setupVideoListeners();
                handleGenericVideoAds();
                hideGenericAds();
            }
            scanAndFlagLinks();
        });
    });

    observerInstance.observe(targetNode, config);
}

// Run initial checks on page loads
function runInitialChecks() {
    if (!isContextValid()) return;
    if (IS_YOUTUBE) {
        setupVideoListeners();
        handleVideoAds();
        handleShortsAds();
        handleEnforcementPopups();
        hideSponsoredElements();
        maintainPlayerControls();
    } else {
        setupVideoListeners();
        handleGenericVideoAds();
        hideGenericAds();
    }
    scanAndFlagLinks();
}

// Reset states and re-initialize on Single Page Application (SPA) navigation
function handleSpanavigation() {
    if (!isContextValid()) return;
    isAdSpeedUpActive = false;
    
    // Safely retrieve the new video's playback rate if possible
    const video = document.querySelector('#movie_player video') || document.querySelector('video');
    if (video) {
        originalPlaybackRate = (video.playbackRate === 16.0) ? 1.0 : video.playbackRate;
        originalMuted = video.muted;
    } else {
        originalPlaybackRate = 1.0;
        originalMuted = false;
    }
    
    // Re-run initial setups for the new page
    runInitialChecks();
    maintainPlayerControls();
    unfreezeYouTubeScroll();
}


// Bind to YouTube SPA navigation finish and standard history navigation events
if (IS_YOUTUBE) {
    window.addEventListener('yt-navigate-finish', handleSpanavigation);
    window.addEventListener('popstate', handleSpanavigation);

    // Continuous ultra-fast ad killer (every 80ms)
    setInterval(() => {
        if (isContextValid() && isEnabled && optVideo) {
            handleVideoAds();
            handleShortsAds();
        }
    }, 80);
} else {
    // Continuous fast ad & popup/push killer for all other websites (every 150ms)
    setInterval(() => {
        if (isContextValid() && isEnabled && optCosmetic) {
            hideGenericAds();
            destroyFloatingAdsAndOverlays();
        }
        if (isContextValid() && isEnabled && optVideo) {
            handleGenericVideoAds();
        }
    }, 150);
}

// Start execution safely immediately at document_start
if (isContextValid()) {
    initObserver();
    runInitialChecks();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initObserver();
            runInitialChecks();
        });
    }
}

// Listen to messages from inject.js (running in the MAIN world context)
window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data || !isContextValid()) return;

    if (event.data.type === 'YOUTUBE_AD_INTERCEPTED' || event.data.type === 'ADBLOCK_2026_AD_BLOCKED') {
        if (!isEnabled) return;
        
        const currentTime = Date.now();
        if (currentTime - lastLoggedAdTime > 1200) {
            safeSendMessage({ action: "adBlocked" });
            lastLoggedAdTime = currentTime;
        }
    } else if (event.data.type === 'STABLE_VOLUME_STATE_CHANGED') {
        optStableVolume = !!event.data.enabled;
        updateCompressorRouting(optStableVolume);
        
    } else if (event.data.type === 'TOGGLE_STABLE_VOLUME_FROM_MENU') {
        optStableVolume = !!event.data.enabled;
        updateCompressorRouting(optStableVolume);
        chrome.storage.local.set({ optStableVolume });
        
        showPlayerToast(optStableVolume ? '🔊 Volumen Estable: Activado' : '🔇 Volumen Estable: Desactivado');
    } else if (event.data.type === 'PREMIUM_1080P_CLICKED') {
        is1080pPremiumActive = true;
        optQuality = 'max';
        chrome.storage.local.set({ optQuality: 'max', is1080pPremiumActive: true });
        
        updateMainSettingsQualityLabel();
        showPlayerToast('✨ 1080p Premium HD (Mayor Tasa de Bits) Seleccionado');
        const qBadge = document.getElementById('adblock-quick-quality-badge');
        if (qBadge) {
            const span = qBadge.querySelector('span');
            if (span) span.textContent = '1080p Prem';
        }
        setTimeout(closeSettingsMenu, 220);
    } else if (event.data.type === 'QUALITY_APPLIED') {
        const qBadge = document.getElementById('adblock-quick-quality-badge');
        if (qBadge && event.data.quality) {
            let label = is1080pPremiumActive ? '1080p Prem' : '1080p HD';
            const q = event.data.quality;
            if (q === 'highres' || q === 'hd2160' || q === 'hd2880') label = '4K HD';
            else if (q === 'hd1440') label = '1440p';
            else if (q === 'hd1080') label = is1080pPremiumActive ? '1080p Prem' : '1080p HD';
            else if (q === 'hd720') label = '720p HD';
            const span = qBadge.querySelector('span');
            if (span) span.textContent = label;
        }
    }
});

/* ==========================================================================
   SECURITY GUARD MODULE - ANTIPHISHING & SCAM PREVENTER
   ========================================================================== */

// Heuristic patterns for suspicious spam/scam link detection
const SCAM_PATTERNS = [
    /giveaway/i, /free.*crypto/i, /crypto.*free/i, /elon.*musk/i, /tesla.*gift/i,
    /bit\.ly\/.*crypto/i, /wa\.me\//i, /whatsapp.*group/i, /telegram.*bot/i,
    /t\.me\/.*joinchat/i, /profit.*percent/i, /invest.*double/i, /t\.me\/.*crypto/i,
    /regalo.*tesla/i, /regalo.*bitcoin/i, /sorteo.*cripto/i, /cripto.*gratis/i,
    /verificar.*cuenta/i, /banco.*seguro/i, /iniciar.*sesion/i, /claim.*airdrop/i
];

const KNOWN_SCAM_DOMAINS = [
    'bitcoingift', 'tesla-event', 'crypto-bonus', 'gift-elon', 'blockchain-promo',
    'eth-drop', 'solana-gift', 'free-tokens', 'binance-bonus', 'cryptodouble',
    'elonmusk', 'teslagift', 't.me/joinchat', 'whatsapp.com/send',
    'paypal-verify', 'netflix-billing', 'banco-verificacion', 'santander-seguro',
    'bbva-cancelacion', 'bancoestado-clave', 'mercadopago-actualizar'
];

// Major brands monitored for domain spoofing / phishing attempts
const TARGETED_BRANDS = [
    { name: 'PayPal', domain: 'paypal.com', keywords: ['paypal', 'pay-pal'] },
    { name: 'Netflix', domain: 'netflix.com', keywords: ['netflix', 'net-flix'] },
    { name: 'MercadoPago', domain: 'mercadopago.com', keywords: ['mercadopago', 'mercado-pago'] },
    { name: 'MercadoLibre', domain: 'mercadolibre.com', keywords: ['mercadolibre', 'mercado-libre'] },
    { name: 'Banco Santander', domain: 'santander.com', keywords: ['santander'] },
    { name: 'BBVA', domain: 'bbva.com', keywords: ['bbva'] },
    { name: 'BancoEstado', domain: 'bancoestado.cl', keywords: ['bancoestado', 'banco-estado'] },
    { name: 'BCP', domain: 'viabcp.com', keywords: ['viabcp', 'bcp-banco'] },
    { name: 'Chase', domain: 'chase.com', keywords: ['chase-bank', 'chaseonline'] },
    { name: 'Wells Fargo', domain: 'wellsfargo.com', keywords: ['wellsfargo'] },
    { name: 'Google', domain: 'google.com', keywords: ['accounts-google', 'google-login', 'gdrive-login'] },
    { name: 'Microsoft', domain: 'microsoft.com', keywords: ['microsoft-login', 'outlook-verify', 'office365-login'] },
    { name: 'MetaMask', domain: 'metamask.io', keywords: ['metamask', 'meta-mask'] },
    { name: 'Binance', domain: 'binance.com', keywords: ['binance-verify', 'binance-login'] },
    { name: 'Steam', domain: 'steampowered.com', keywords: ['steamcommunity-login', 'steam-giftcard'] },
    { name: 'Roblox', domain: 'roblox.com', keywords: ['roblox-robux', 'free-robux'] }
];

const SUSPICIOUS_TLDS = [
    '.xyz', '.top', '.club', '.info', '.work', '.gq', '.cf', '.ml', '.tk', '.cc',
    '.su', '.link', '.click', '.zip', '.mov', '.online', '.site', '.website', '.fun', '.icu'
];

const PHISHING_ACTION_TERMS = [
    'verify', 'verificar', 'verificacion', 'login', 'iniciar-sesion', 'iniciar_sesion',
    'secure', 'seguridad', 'account', 'cuenta', 'actualizar', 'update', 'billing',
    'facturacion', 'cancelacion', 'bloqueo', 'banco', 'clave', 'pass', 'restore', 'claim'
];

const SAFE_FILE_EXTENSIONS = [
    // Word documents
    '.doc', '.docx', '.docm', '.dotx', '.dotm', '.rtf', '.odt',
    // Excel spreadsheets
    '.xls', '.xlsx', '.xlsm', '.xlsb', '.xltx', '.xltm', '.csv', '.tsv', '.ods',
    // PowerPoint presentations
    '.ppt', '.pptx', '.pptm', '.pps', '.ppsx', '.potx', '.potm', '.odp',
    // PDFs & e-books
    '.pdf', '.epub', '.mobi', '.djvu',
    // Compressed archives
    '.zip', '.rar', '.7z', '.tar', '.gz', '.tgz', '.bz2', '.xz', '.iso',
    // Academic, code & data files
    '.txt', '.py', '.ipynb', '.java', '.cpp', '.c', '.cs', '.sql', '.r', '.mat', '.sav', '.dta', '.json', '.xml', '.tex',
    // Media & images
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.mp4', '.mp3', '.wav', '.m4a', '.mov', '.avi',
    // Installers
    '.exe', '.msi', '.apk', '.dmg', '.pkg'
];

// Helper to determine if a host is an educational portal, university intranet, or cloud storage platform
function isWhitelistedSafeHost(host) {
    if (!host) return false;
    const h = host.toLowerCase();
    return (
        h.includes('.edu') || h.includes('.ac.') || h.includes('.gob.') || h.includes('.gov.') ||
        h.includes('moodle') || h.includes('canvas') || h.includes('blackboard') || h.includes('classroom') ||
        h.includes('sharepoint.com') || h.includes('onedrive') || h.includes('office.com') || h.includes('live.com') ||
        h.includes('microsoft.com') || h.includes('google.com') || h.includes('drive.google.com') ||
        h.includes('dropbox.com') || h.includes('box.com') || h.includes('github.com') ||
        h.includes('mega.nz') || h.includes('mediafire.com') || h.includes('weblms') || h.includes('sice') ||
        h.includes('intranet') || h.includes('portal') || h.includes('alumno') || h.includes('universidad') ||
        h.includes('ucursos') || h.includes('u-cursos') || h.includes('inacap') || h.includes('duoc') ||
        h.includes('uchile') || h.includes('uc.cl') || h.includes('usach') || h.includes('unab') ||
        h.includes('udec') || h.includes('pucv') || h.includes('utfsm') || h.includes('uai') ||
        h.includes('uautonoma') || h.includes('santotomas') || h.includes('aiep')
    );
}

function isSuspiciousLink(url, element) {
    if (!url) return false;
    if (url.startsWith('blob:') || url.startsWith('data:')) return false;

    try {
        const parsed = new URL(url, window.location.origin);
        const host = parsed.hostname.toLowerCase();
        
        // Never flag same origin links or whitelisted safe domains
        if (host === window.location.hostname.toLowerCase()) return false;
        if (isWhitelistedSafeHost(host) || isWhitelistedSafeHost(window.location.hostname)) return false;

        const pathAndSearch = (parsed.pathname + parsed.search).toLowerCase();
        if (pathAndSearch.includes('download') || pathAndSearch.includes('attachment') || pathAndSearch.includes('export=download') || SAFE_FILE_EXTENSIONS.some(ext => pathAndSearch.includes(ext))) {
            return false;
        }

        // Always permit official and internal YouTube navigation
        if (host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtu.be') {
            return false;
        }
        if (host === 'google.com' || host.endsWith('.google.com')) {
            return false;
        }
    } catch (e) {
        return false;
    }

    const lowerUrl = url.toLowerCase();
    
    // Check if URL evaluates to a threat via threat engine
    const threat = evaluateUrlThreat(url);
    if (threat) return true;
    
    // Check if the text context contains suspicious phrases
    const contextText = element ? element.textContent.toLowerCase() : '';
    const hasCryptoSpam = SCAM_PATTERNS.some(pattern => pattern.test(lowerUrl));
    
    const isContactScam = (lowerUrl.includes('wa.me') || lowerUrl.includes('t.me') || lowerUrl.includes('whatsapp.com/send')) && 
                          (contextText && (
                              contextText.includes('whatsapp') || 
                              contextText.includes('telegram') || 
                              contextText.includes('escríbeme') || 
                              contextText.includes('contacto') || 
                              contextText.includes('ganador') || 
                              contextText.includes('winner') || 
                              contextText.includes('escribeme')
                          ));

    return hasCryptoSpam || isContactScam;
}

// Scans comments, chats, descriptions for links and highlights them
function scanAndFlagLinks() {
    if (!isContextValid() || !isEnabled) return;
    
    // Find all links inside comments, live chats, and description boxes
    const links = document.querySelectorAll('ytd-comment-renderer a, #description a, yt-live-chat-text-message-renderer a, ytd-comment-thread-renderer a');
    links.forEach(link => {
        if (link.hasAttribute('data-adblock-scanned')) return;
        link.setAttribute('data-adblock-scanned', 'true');
        
        if (isSuspiciousLink(link.href, link)) {
            // Apply distinct high-contrast warning styles
            link.style.setProperty('color', '#ff4b4b', 'important');
            link.style.setProperty('text-decoration', 'line-through', 'important');
            
            const badge = document.createElement('span');
            badge.textContent = ' ⚠️ [Estafa / Phishing]';
            badge.style.cssText = `
                color: #ff4b4b !important;
                font-weight: 700 !important;
                font-size: 11px !important;
                margin-left: 5px !important;
                text-decoration: none !important;
                background: rgba(255, 75, 75, 0.1) !important;
                border: 1px solid rgba(255, 75, 75, 0.2) !important;
                padding: 1px 5px !important;
                border-radius: 4px !important;
                display: inline-block !important;
            `;
            link.appendChild(badge);
        }
    });
}

// Injects glassmorphic warning modal if suspicious link is clicked
function showSecurityWarning(targetUrl) {
    const existing = document.getElementById('adblock-security-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'adblock-security-modal';
    modal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(10, 10, 10, 0.85) !important;
        backdrop-filter: blur(15px) !important;
        -webkit-backdrop-filter: blur(15px) !important;
        z-index: 9999999999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        color: #fff !important;
        opacity: 0;
        transition: opacity 0.2s ease !important;
    `;

    const container = document.createElement('div');
    container.style.cssText = `
        background: linear-gradient(135deg, rgba(30, 20, 20, 0.95), rgba(15, 10, 10, 0.95)) !important;
        border: 1px solid rgba(255, 75, 75, 0.3) !important;
        border-radius: 24px !important;
        padding: 40px !important;
        max-width: 500px !important;
        width: 90% !important;
        text-align: center !important;
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), 0 0 50px rgba(255, 75, 75, 0.15) !important;
        transform: scale(0.9);
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    `;

    // Inject styles and keyframes
    if (!document.getElementById('adblock-security-styles')) {
        const style = document.createElement('style');
        style.id = 'adblock-security-styles';
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
            .sec-btn {
                border-radius: 12px;
                padding: 14px 28px;
                font-family: 'Outfit', sans-serif;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s ease;
                border: none;
            }
            .sec-btn-back {
                background: #ff4b4b;
                color: #fff;
                box-shadow: 0 4px 20px rgba(255, 75, 75, 0.4);
            }
            .sec-btn-back:hover {
                background: #e03b3b;
                transform: translateY(-2px);
                box-shadow: 0 6px 25px rgba(255, 75, 75, 0.5);
            }
            .sec-btn-proceed {
                background: transparent;
                color: #aaa;
                border: 1px solid rgba(255,255,255,0.15);
            }
            .sec-btn-proceed:hover {
                color: #fff;
                border-color: rgba(255,255,255,0.3);
                background: rgba(255,255,255,0.05);
            }
        `;
        document.head.appendChild(style);
    }

    container.innerHTML = `
        <div style="font-size: 72px; margin-bottom: 24px; filter: drop-shadow(0 0 15px rgba(255,75,75,0.3));">🛡️</div>
        <h2 style="font-size: 26px; font-weight: 700; color: #ff4b4b; margin: 0 0 12px 0; letter-spacing: -0.5px; font-family: 'Outfit', sans-serif;">Detector de Phishing y Estafas</h2>
        <p style="font-size: 15px; color: #ccc; line-height: 1.6; margin: 0 0 24px 0; font-family: 'Outfit', sans-serif;">
            Hemos interceptado este enlace sospechoso porque contiene indicios de estafas financieras, robo de cuentas (phishing) o suplantación de identidad.
        </p>
        <div style="background: rgba(255, 75, 75, 0.05); border: 1px solid rgba(255, 75, 75, 0.15); border-radius: 12px; padding: 14px 18px; font-size: 13px; font-family: monospace; word-break: break-all; color: #ffa3a3; margin-bottom: 30px; text-align: left; max-height: 80px; overflow-y: auto;">
            ${targetUrl}
        </div>
        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <button class="sec-btn sec-btn-back" id="btn-sec-back">Volver a Salvo (Recomendado)</button>
            <button class="sec-btn sec-btn-proceed" id="btn-sec-proceed">Ignorar y Continuar</button>
        </div>
    `;

    modal.appendChild(container);
    document.body.appendChild(modal);

    // Trigger smooth fade-in
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
        container.style.transform = 'scale(1)';
    });

    // Handle button actions
    document.getElementById('btn-sec-back').addEventListener('click', () => {
        modal.style.opacity = '0';
        container.style.transform = 'scale(0.9)';
        setTimeout(() => modal.remove(), 200);
    });

    document.getElementById('btn-sec-proceed').addEventListener('click', () => {
        modal.style.opacity = '0';
        container.style.transform = 'scale(0.9)';
        setTimeout(() => {
            modal.remove();
            window.open(targetUrl, '_blank', 'noopener,noreferrer');
        }, 200);
    });
}

// Heuristas avanzadas para el análisis de amenazas de URLs
function evaluateUrlThreat(url) {
    if (!url) return null;
    const lowerUrl = url.toLowerCase();

    // 1. Explicit Test parameters for user testing on any website
    if (lowerUrl.includes('test=danger') || lowerUrl.includes('test=malware') || lowerUrl.includes('test=phishing') || lowerUrl.includes('test=scam') || lowerUrl.includes('danger-test.com') || lowerUrl.includes('malware-test.com')) {
        if (lowerUrl.includes('test=malware') || lowerUrl.includes('malware-test.com')) return 'malware';
        if (lowerUrl.includes('test=phishing')) return 'phishing';
        if (lowerUrl.includes('test=scam')) return 'scam';
        return 'danger';
    }

    try {
        const parsed = new URL(url);
        const host = parsed.hostname.toLowerCase();

        // Safe official and educational domains bypass
        if (isWhitelistedSafeHost(host)) return null;

        const isOfficialSafe = [
            'google.com', 'youtube.com', 'microsoft.com', 'apple.com', 'amazon.com',
            'github.com', 'wikipedia.org', 'cloudflare.com'
        ].some(safe => host === safe || host.endsWith('.' + safe));

        if (isOfficialSafe) return null;

        // Never flag document/file downloads or cloud drives
        const pathAndSearch = (parsed.pathname + parsed.search).toLowerCase();
        if (pathAndSearch.includes('download') || pathAndSearch.includes('attachment') || pathAndSearch.includes('export=download') || SAFE_FILE_EXTENSIONS.some(ext => pathAndSearch.endsWith(ext) || pathAndSearch.includes(ext + '?') || pathAndSearch.includes(ext + '&'))) {
            return null;
        }

        // 2. Direct match on known scam domains
        if (KNOWN_SCAM_DOMAINS.some(domain => lowerUrl.includes(domain))) {
            return 'scam';
        }

        // 3. Brand Spoofing / Typosquatting Check
        for (const brand of TARGETED_BRANDS) {
            const isOfficialBrand = host === brand.domain || host.endsWith('.' + brand.domain);
            if (!isOfficialBrand) {
                // Check if host contains brand keywords combined with phishing action terms
                const matchesBrandKeyword = brand.keywords.some(kw => host.includes(kw));
                if (matchesBrandKeyword) {
                    const matchesAction = PHISHING_ACTION_TERMS.some(action => lowerUrl.includes(action));
                    if (matchesAction && (host.includes('-') || SUSPICIOUS_TLDS.some(tld => host.endsWith(tld)))) {
                        return 'phishing';
                    }
                }
            }
        }

        // 4. Raw IP Address URL serving HTTP with phishing action terms
        const isRawIp = /^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(lowerUrl);
        if (isRawIp && PHISHING_ACTION_TERMS.some(term => lowerUrl.includes(term))) {
            return 'phishing';
        }

        // 5. Suspicious TLD combined with hook terms
        const hasSuspiciousTld = SUSPICIOUS_TLDS.some(tld => host.endsWith(tld));
        if (hasSuspiciousTld) {
            const matchesScamHook = ['free-robux', 'crypto-bonus', 'airdrop-claim', 'giveaway-elon'].some(kw => lowerUrl.includes(kw));
            if (matchesScamHook) {
                return 'scam';
            }
        }
    } catch (e) {}

    return null;
}

// Bloquea la carga del sitio y muestra una pantalla completa de advertencia
function blockPageWithWarning(url, threatType) {
    // Estilos de bloqueo inmediato
    const css = `
        html, body {
            overflow: hidden !important;
            height: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #06060c !important;
        }
        body > :not(#adblock-fullpage-warning) {
            display: none !important;
        }
        #adblock-fullpage-warning {
            all: initial !important;
        }
    `;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'adblock-block-style';
    styleEl.textContent = css;
    document.documentElement.appendChild(styleEl);
    
    const injectWarning = () => {
        if (document.getElementById('adblock-fullpage-warning')) return;
        
        // Ocultar elementos actuales de la página
        if (document.body) {
            Array.from(document.body.children).forEach(child => {
                if (child.id !== 'adblock-fullpage-warning' && child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
                    child.style.setProperty('display', 'none', 'important');
                }
            });
        }
        
        const warningDiv = document.createElement('div');
        warningDiv.id = 'adblock-fullpage-warning';
        warningDiv.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: radial-gradient(circle at center, #150a0a 0%, #06060c 100%) !important;
            z-index: 2147483647 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            color: #ffffff !important;
            font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            text-align: center !important;
            padding: 20px !important;
            box-sizing: border-box !important;
            overflow: auto !important;
        `;
        
        let threatTitle = "⚠️ ¡ADVERTENCIA! Esta página no es segura";
        let threatIcon = `<svg viewBox="0 0 24 24" fill="none" width="76" height="76" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(255, 51, 51, 0.15)" stroke="#ff3333"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
        let threatDesc = "El Escudo de Seguridad Avanzado ha bloqueado este sitio porque NO ES SEGURO DE VERDAD y puede intentar robar tus datos personales y comprometer tu privacidad.";
        let threatColor = "#ff3333";
        let badgeText = "SITIO NO SEGURO DETECTADO";
        
        if (threatType === 'malware') {
            threatTitle = "⚠️ ¡ADVERTENCIA! La página no es segura (Malware)";
            threatIcon = `<svg viewBox="0 0 24 24" fill="none" width="76" height="76" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3" fill="#ff3333"/><circle cx="12" cy="12" r="9" stroke-dasharray="4 2"/><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/></svg>`;
            threatDesc = "Este sitio intenta infectar tu dispositivo con software dañino (Malware). El sitio NO ES SEGURO DE VERDAD y te puede robar datos personales, archivos o dañar tu equipo.";
            threatColor = "#ff3333";
            badgeText = "SITIO NO SEGURO - MALWARE";
        } else if (threatType === 'phishing') {
            threatTitle = "⚠️ ¡ADVERTENCIA! La página no es segura (Phishing)";
            threatIcon = `<svg viewBox="0 0 24 24" fill="none" width="76" height="76" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M12 2v2"/><line x1="2" y1="2" x2="22" y2="22" stroke="#ffaa00" stroke-width="2.2"/></svg>`;
            threatDesc = "Este sitio intenta imitar a una marca legítima para engañarte. El sitio NO ES SEGURO DE VERDAD y te puede robar datos personales, credenciales de acceso, contraseñas o detalles bancarios.";
            threatColor = "#ffaa00";
            badgeText = "SITIO NO SEGURO - PHISHING";
        } else if (threatType === 'scam') {
            threatTitle = "⚠️ ¡ADVERTENCIA! La página no es segura (Estafa)";
            threatIcon = `<svg viewBox="0 0 24 24" fill="none" width="76" height="76" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="rgba(255, 51, 119, 0.15)" stroke="#ff3377"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
            threatDesc = "Hemos identificado indicios de estafas financieras o engaños interactivos en este sitio. El sitio NO ES SEGURO DE VERDAD y te puede robar datos personales o dinero.";
            threatColor = "#ff3377";
            badgeText = "SITIO NO SEGURO - ESTAFA";
        }
        
        warningDiv.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: linear-gradient(rgba(255, 51, 51, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 51, 51, 0.02) 1px, transparent 1px); background-size: 20px 20px; pointer-events: none; z-index: 1;"></div>
            
            <div style="max-width: 600px; width: 100%; border: 1px solid rgba(255, 51, 51, 0.3); border-radius: 24px; background: rgba(10, 10, 15, 0.95); padding: 40px; box-shadow: 0 0 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 51, 51, 0.15); box-sizing: border-box; z-index: 2; position: relative;">
                <div style="margin-bottom: 20px; color: ${threatColor}; filter: drop-shadow(0 0 20px ${threatColor});">${threatIcon}</div>
                
                <div style="display: inline-block; background: rgba(255, 51, 51, 0.15); border: 1px solid ${threatColor}; border-radius: 6px; padding: 6px 12px; font-size: 11px; font-family: monospace; font-weight: 700; color: ${threatColor}; letter-spacing: 1px; margin-bottom: 20px;">
                    ${badgeText}
                </div>
                
                <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 16px 0; letter-spacing: 0.5px;">
                    ${threatTitle}
                </h1>
                
                <p style="font-size: 14px; color: #a0a5c0; line-height: 1.6; margin: 0 0 24px 0;">
                    ${threatDesc}
                </p>
                
                <div style="background: rgba(255, 51, 51, 0.04); border: 1px solid rgba(255, 51, 51, 0.15); border-radius: 12px; padding: 14px 18px; font-size: 12px; font-family: monospace; word-break: break-all; color: #ffa3a3; margin-bottom: 30px; text-align: center;">
                    URL: ${url}
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <button id="adblock-btn-back" style="background: ${threatColor}; color: #ffffff; border: none; border-radius: 12px; padding: 14px 28px; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; box-shadow: 0 4px 20px rgba(255, 51, 51, 0.4); transition: all 0.2s ease;">
                        VOLVER A SALVO (Recomendado)
                    </button>
                    <button id="adblock-btn-ignore" style="background: transparent; color: #8e9cae; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 14px 28px; font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s ease;">
                        Ignorar Advertencia
                    </button>
                </div>
            </div>
        `;
        
        if (document.body) {
            document.body.appendChild(warningDiv);
        } else {
            document.documentElement.appendChild(warningDiv);
        }
        
        document.getElementById('adblock-btn-back').addEventListener('click', () => {
            window.location.href = 'https://www.google.com';
        });
        
        document.getElementById('adblock-btn-ignore').addEventListener('click', () => {
            if (confirm("¿Estás seguro de que deseas ignorar esta advertencia? Navegar por este sitio puede poner en riesgo tu seguridad.")) {
                const host = window.location.hostname;
                chrome.storage.local.get({ whitelist: [] }, (res) => {
                    const newWhitelist = res.whitelist || [];
                    if (!newWhitelist.includes(host)) {
                        newWhitelist.push(host);
                    }
                    chrome.storage.local.set({ whitelist: newWhitelist }, () => {
                        warningDiv.remove();
                        const styleNode = document.getElementById('adblock-block-style');
                        if (styleNode) styleNode.remove();
                        window.location.reload();
                    });
                });
            }
        });
    };
    
    if (document.body) {
        injectWarning();
    } else {
        document.addEventListener('DOMContentLoaded', injectWarning);
    }
}

// Verifica la seguridad de la página actual
function checkCurrentPageSafety() {
    if (!isContextValid()) return;
    
    chrome.storage.local.get({ isEnabled: true, optSecurity: true, whitelist: [] }, (result) => {
        if (!result.isEnabled || !result.optSecurity) return;
        
        const currentUrl = window.location.href;
        const currentHost = window.location.hostname;
        
        // Skip university, intranet, educational, official portals, or whitelisted sites
        if (isWhitelistedSafeHost(currentHost)) return;

        // Evitar el bloqueo si ya está en la whitelist
        if (result.whitelist && result.whitelist.includes(currentHost)) {
            console.log(`[Overdrive Security] El host ${currentHost} está en la lista blanca.`);
            return;
        }
        
        const threat = evaluateUrlThreat(currentUrl);
        if (threat) {
            blockPageWithWarning(currentUrl, threat);
        }
    });
}

// Global click event capture logic
function handleSecurityClick(event) {
    if (!isEnabled || !optSecurity) return;
    const link = event.target.closest('a');
    if (!link || !link.href) return;

    // Never intercept download links, blob URLs, or safe portals
    if (link.hasAttribute('download') || link.href.startsWith('blob:') || link.href.startsWith('data:')) return;
    if (isWhitelistedSafeHost(window.location.hostname)) return;
    
    // Never intercept YouTube internal links
    if (IS_YOUTUBE) {
        try {
            const parsed = new URL(link.href, window.location.origin);
            const host = parsed.hostname.toLowerCase();
            if (host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtu.be') {
                return;
            }
        } catch (e) {
            return;
        }
    }
    if (isSuspiciousLink(link.href, link)) {
        event.preventDefault();
        event.stopPropagation();
        showSecurityWarning(link.href);
    }
}

// Registrar el detector de seguridad y el interceptor de clics a nivel global (sitios web de terceros, nunca en YouTube)
if (isContextValid() && !IS_YOUTUBE) {
    checkCurrentPageSafety();
    document.addEventListener('click', handleSecurityClick, true);
}

/* --------------------------------------------------------------------------
   6. YOUTUBE EMPTY HOME FEED RESTORE ASSISTANT
   -------------------------------------------------------------------------- */
if (IS_YOUTUBE) {
    function setupYouTubeFeedAssistant() {
        if (window.location.pathname !== '/' && window.location.pathname !== '') return;

        const nudge = document.querySelector('yt-feed-nudge-layout-renderer, ytd-feed-nudge-renderer, ytd-browse[page-subtype="home"] ytd-message-renderer');
        if (nudge && !document.getElementById('adblock-feed-restore-bar')) {
            const bar = document.createElement('div');
            bar.id = 'adblock-feed-restore-bar';
            bar.className = 'adblock-feed-restore-container';
            bar.innerHTML = `
                <div class="adblock-restore-card">
                    <div class="adblock-restore-title">
                        <span>⚡</span>
                        <span>Explorar contenido sin historial / sin cuenta</span>
                    </div>
                    <div class="adblock-restore-subtitle">
                        Haz clic para ver videos populares y categorías de inmediato:
                    </div>
                    <div class="adblock-restore-actions">
                        <a href="/feed/trending" class="adblock-restore-btn primary">🔥 Tendencias y Populares</a>
                        <a href="/gaming" class="adblock-restore-btn">🎮 Videojuegos</a>
                        <a href="/channel/UC-9-kyTW8ZkZNDHQJ6FgpwQ" class="adblock-restore-btn">🎵 Música</a>
                        <a href="/feed/news" class="adblock-restore-btn">📰 Noticias</a>
                    </div>
                </div>
            `;
            nudge.parentNode.insertBefore(bar, nudge.nextSibling);
        }
    }

    // Run periodically on navigation
    setInterval(setupYouTubeFeedAssistant, 1500);
}


/* --------------------------------------------------------------------------
   7. YOUTUBE SHORTS FAST-FORWARD & REWIND CONTROLS (AVANZAR Y RETROCEDER)
   -------------------------------------------------------------------------- */
function formatShortsTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function setupShortsSeekControls() {
    if (!IS_YOUTUBE || !isEnabled) return;

    const shortsContainers = document.querySelectorAll('ytd-reel-video-renderer, ytm-reel-video-renderer, [is-active][class*="reel"], ytd-shorts');
    
    shortsContainers.forEach(container => {
        const video = container.querySelector('video');
        if (!video) return;

        if (container.querySelector('.adblock-shorts-controller')) {
            const controller = container.querySelector('.adblock-shorts-controller');
            const slider = controller.querySelector('.adblock-shorts-slider');
            const timeLabel = controller.querySelector('.adblock-shorts-time');
            if (slider && timeLabel && Number.isFinite(video.duration) && video.duration > 0) {
                if (!slider.matches(':active')) {
                    slider.max = Math.floor(video.duration);
                    slider.value = Math.floor(video.currentTime);
                }
                timeLabel.textContent = `${formatShortsTime(video.currentTime)} / ${formatShortsTime(video.duration)}`;
            }
            return;
        }

        const controller = document.createElement('div');
        controller.className = 'adblock-shorts-controller';
        controller.innerHTML = `
            <button type="button" class="adblock-shorts-btn rewind-btn" title="Retroceder 5s (Flecha Izquierda)">⏪ -5s</button>
            <input type="range" class="adblock-shorts-slider" min="0" max="100" value="0" title="Deslizar para avanzar o retroceder">
            <button type="button" class="adblock-shorts-btn forward-btn" title="Avanzar 5s (Flecha Derecha)">⏩ +5s</button>
            <span class="adblock-shorts-time">0:00 / 0:00</span>
        `;

        const rewindBtn = controller.querySelector('.rewind-btn');
        const forwardBtn = controller.querySelector('.forward-btn');
        const slider = controller.querySelector('.adblock-shorts-slider');
        const timeLabel = controller.querySelector('.adblock-shorts-time');

        rewindBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            video.currentTime = Math.max(0, video.currentTime - 5);
        });

        forwardBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (Number.isFinite(video.duration)) {
                video.currentTime = Math.min(video.duration, video.currentTime + 5);
            } else {
                video.currentTime += 5;
            }
        });

        slider.addEventListener('input', (e) => {
            e.stopPropagation();
            video.currentTime = parseFloat(slider.value);
            timeLabel.textContent = `${formatShortsTime(video.currentTime)} / ${formatShortsTime(video.duration)}`;
        });

        slider.addEventListener('click', (e) => e.stopPropagation());

        video.addEventListener('timeupdate', () => {
            if (!slider.matches(':active') && Number.isFinite(video.duration) && video.duration > 0) {
                slider.max = Math.floor(video.duration);
                slider.value = Math.floor(video.currentTime);
                timeLabel.textContent = `${formatShortsTime(video.currentTime)} / ${formatShortsTime(video.duration)}`;
            }
        });

        const targetOverlay = container.querySelector('#overlay, .ytd-reel-player-overlay-renderer, .player-controls') || container;
        targetOverlay.appendChild(controller);
    });
}

// Global Keyboard Navigation for Shorts
window.addEventListener('keydown', (e) => {
    if (!IS_YOUTUBE || !window.location.pathname.includes('/shorts')) return;
    const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || document.activeElement.isContentEditable) return;

    const activeVideo = document.querySelector('ytd-reel-video-renderer[is-active] video') || 
                        document.querySelector('ytd-reel-video-renderer video') || 
                        document.querySelector('video');
    if (!activeVideo) return;

    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        activeVideo.currentTime = Math.max(0, activeVideo.currentTime - 5);
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        if (Number.isFinite(activeVideo.duration)) {
            activeVideo.currentTime = Math.min(activeVideo.duration, activeVideo.currentTime + 5);
        } else {
            activeVideo.currentTime += 5;
        }
    }
}, true);

// ==========================================================================
// YOUTUBE SCROLL UNFREEZER & CONTROLS HELPER
// ==========================================================================
function unfreezeYouTubeScroll() {
    if (!IS_YOUTUBE) return;

    // Remove YouTube's no-scroll class and lingering hidden overflow styles
    if (document.body) {
        if (document.body.classList.contains('no-scroll')) {
            document.body.classList.remove('no-scroll');
        }
        if (document.body.style.overflow === 'hidden' || document.body.style.overflowY === 'hidden') {
            document.body.style.removeProperty('overflow');
            document.body.style.removeProperty('overflow-y');
        }
    }
    if (document.documentElement) {
        if (document.documentElement.classList.contains('no-scroll')) {
            document.documentElement.classList.remove('no-scroll');
        }
        if (document.documentElement.style.overflow === 'hidden' || document.documentElement.style.overflowY === 'hidden') {
            document.documentElement.style.removeProperty('overflow');
            document.documentElement.style.removeProperty('overflow-y');
        }
    }

    // Clean lingering iron overlays and orphaned modal dialogs if no visible user dialog is open
    const openUserDialog = document.querySelector(
        'tp-yt-paper-dialog:not([style*="display: none"]):not([aria-hidden="true"]) ytd-add-to-playlist-renderer, ' +
        'tp-yt-paper-dialog:not([style*="display: none"]):not([aria-hidden="true"]) ytd-unified-share-panel-renderer, ' +
        'tp-yt-paper-dialog:not([style*="display: none"]):not([aria-hidden="true"]) ytd-report-form-modal-renderer, ' +
        'ytd-playlist-add-to-option-renderer'
    );

    if (!openUserDialog) {
        const backdrops = document.querySelectorAll('tp-yt-iron-overlay-backdrop, iron-overlay-backdrop');
        backdrops.forEach(b => {
            b.remove();
        });

        // Clean orphaned or empty dialog containers left behind in popup container
        const emptyDialogs = document.querySelectorAll('ytd-popup-container tp-yt-paper-dialog');
        emptyDialogs.forEach(d => {
            if (d.querySelector('ytd-enforcement-message-view-model, yt-playability-error-supported-renderers') ||
                (!d.querySelector('ytd-unified-share-panel-renderer, ytd-add-to-playlist-renderer, ytd-report-form-modal-renderer, ytd-playlist-add-to-option-renderer') && (!d.textContent || d.textContent.trim().length === 0))) {
                d.remove();
            }
        });
    }
}

if (IS_YOUTUBE) {
    unfreezeYouTubeScroll();
    setInterval(unfreezeYouTubeScroll, 500);
    setInterval(setupShortsSeekControls, 1000);
}
