/* ==========================================================================
   ADBLOCK 2026 FOR YOUTUBE™ - BACKGROUND SERVICE WORKER (MANIFEST V3)
   ========================================================================== */

// Helper to format badge numbers cleanly (e.g. 1.2k, 99+)
function formatBadgeCount(count) {
    if (!count || count <= 0) return "";
    if (count > 9999) return "10k+";
    if (count >= 1000) return (count / 1000).toFixed(1) + "k";
    return count.toString();
}

// Update Chrome action badge (icon counter and status)
function updateBadge(isEnabled, count) {
    if (!chrome.action) return;

    if (!isEnabled) {
        chrome.action.setBadgeText({ text: "OFF" });
        chrome.action.setBadgeBackgroundColor({ color: "#FF2A55" });
        if (chrome.action.setBadgeTextColor) {
            chrome.action.setBadgeTextColor({ color: "#FFFFFF" });
        }
    } else {
        const text = formatBadgeCount(count);
        chrome.action.setBadgeText({ text });
        chrome.action.setBadgeBackgroundColor({ color: "#9333EA" });
        if (chrome.action.setBadgeTextColor) {
            chrome.action.setBadgeTextColor({ color: "#FFFFFF" });
        }
    }
}

// Helper function to enable/disable declarative net request rulesets
function toggleNetworkRules(enable) {
    if (chrome.declarativeNetRequest) {
        const updateRuleset = {
            enableRulesetIds: enable ? ["ruleset_1"] : [],
            disableRulesetIds: enable ? [] : ["ruleset_1"]
        };
        chrome.declarativeNetRequest.updateEnabledRulesets(updateRuleset, () => {
            if (chrome.runtime.lastError) {
                console.warn("[Adblock 2026] Error updating ruleset status:", chrome.runtime.lastError.message);
            } else {
                console.log(`[Adblock 2026] Network blocking ruleset: ${enable ? "ENABLED" : "DISABLED"}`);
            }
        });
    }
}

// Clean up any previously registered dynamic scripts (manifest.json already declares inject.js natively in MAIN world)
if (chrome.scripting && chrome.scripting.getRegisteredContentScripts) {
    chrome.scripting.getRegisteredContentScripts({ ids: ["inject_script"] }).then((scripts) => {
        if (scripts && scripts.length > 0) {
            chrome.scripting.unregisterContentScripts({ ids: ["inject_script"] }).catch(() => {});
        }
    }).catch(() => {});
}

function updateContentScripts(enable) {
    return Promise.resolve();
}

// Synchronize all settings, badges, and rules
function syncState() {
    chrome.storage.local.get({ isEnabled: true, blockedCount: 0 }, (result) => {
        const enabled = result.isEnabled !== false;
        const count = result.blockedCount || 0;
        toggleNetworkRules(enabled);
        updateContentScripts(enabled);
        updateBadge(enabled, count);
    });
}

// Initialize on install or extension update
chrome.runtime.onInstalled.addListener((details) => {
    chrome.storage.local.get(["isEnabled", "blockedCount"], (result) => {
        const toSet = {};
        if (result.isEnabled === undefined) toSet.isEnabled = true;
        if (result.blockedCount === undefined) toSet.blockedCount = 0;
        if (Object.keys(toSet).length > 0) {
            chrome.storage.local.set(toSet, () => {
                syncState();
            });
        } else {
            syncState();
        }
    });
});

// Startup listener
chrome.runtime.onStartup.addListener(() => {
    syncState();
});

// Initial boot check
syncState();

// Listen to storage changes to keep badge, network rules, and inject.js in sync
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    
    if (changes.isEnabled || changes.blockedCount) {
        chrome.storage.local.get({ isEnabled: true, blockedCount: 0 }, (result) => {
            const enabled = result.isEnabled !== false;
            const count = result.blockedCount || 0;
            if (changes.isEnabled) {
                toggleNetworkRules(enabled);
                updateContentScripts(enabled);
            }
            updateBadge(enabled, count);
        });
    }
});

// Listen to messages from content scripts and popups
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "adBlocked") {
        chrome.storage.local.get({ blockedCount: 0, isEnabled: true }, (result) => {
            const newCount = (result.blockedCount || 0) + (message.count || 1);
            chrome.storage.local.set({ blockedCount: newCount }, () => {
                updateBadge(result.isEnabled !== false, newCount);
                sendResponse({ success: true, newCount });
            });
        });
        return true; // Keep message channel open for async response
    }
    
    if (message.action === "getState") {
        chrome.storage.local.get(null, (allData) => {
            sendResponse({ success: true, data: allData });
        });
        return true;
    }
});
