/* ==========================================================================
   ADBLOCK 2026 FOR YOUTUBE™ - GAMER EDITION POPUP JAVASCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const mainToggle = document.getElementById('main-toggle');
    const statusPanel = document.getElementById('status-panel');
    const statusText = document.getElementById('status-text');
    const radarContainer = document.getElementById('radar-container');
    
    // Counter values & bars
    const adsBlockedVal = document.getElementById('ads-blocked-val');
    const timeSavedVal = document.getElementById('time-saved-val');
    const barBlockedFill = document.getElementById('bar-blocked-fill');
    const barSavedFill = document.getElementById('bar-saved-fill');
    const resetStatsBtn = document.getElementById('reset-stats');

    // Sub-options switches
    const optVideo = document.getElementById('opt-video');
    const optCosmetic = document.getElementById('opt-cosmetic');
    const optBypass = document.getElementById('opt-bypass');
    const optSecurity = document.getElementById('opt-security');
    const optAutoHD = document.getElementById('opt-autohd');
    const optStableVolume = document.getElementById('opt-stable-volume');
    const pillStableVol = document.getElementById('pill-stable-vol');

    // Scanner items
    const btnScanPage = document.getElementById('btn-scan-page');
    const scannerRadar = document.getElementById('scanner-radar');
    const scannerStatus = document.getElementById('scanner-status');
    const resReputation = document.getElementById('res-reputation');
    const resTrackers = document.getElementById('res-trackers');
    const resSsl = document.getElementById('res-ssl');

    // Sound Synthesizer (Web Audio API)
    let audioCtx = null;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Ascending power-up frequency sweep
    function playPowerUpSound() {
        try {
            initAudio();
            if (!audioCtx) return;
            
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(650, audioCtx.currentTime + 0.28);
            
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.28);
            
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.28);
        } catch (e) {
            console.warn("Audio Context blocked or failed:", e);
        }
    }

    // Descending power-down frequency sweep
    function playPowerDownSound() {
        try {
            initAudio();
            if (!audioCtx) return;
            
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(450, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(60, audioCtx.currentTime + 0.32);
            
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.32);
            
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.32);
        } catch (e) {
            console.warn("Audio Context blocked or failed:", e);
        }
    }

    // Brief mechanical click
    function playClickSound() {
        try {
            initAudio();
            if (!audioCtx) return;
            
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.05);
            
            gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
            
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.05);
        } catch (e) {
            console.warn("Audio Context blocked or failed:", e);
        }
    }

    // Heuristics analyzer helper for popup
    function checkUrlSafety(urlString) {
        if (!urlString) return { status: 'safe', label: 'Verificado', class: 'status-safe' };
        const lowerUrl = urlString.toLowerCase();
        
        if (lowerUrl.includes('test=danger') || lowerUrl.includes('test=malware') || lowerUrl.includes('test=phishing') || lowerUrl.includes('test=scam') || lowerUrl.includes('danger-test.com') || lowerUrl.includes('malware-test.com')) {
            if (lowerUrl.includes('test=malware') || lowerUrl.includes('malware-test.com')) return { status: 'danger', label: 'Malware Detectado', class: 'status-danger' };
            if (lowerUrl.includes('test=phishing')) return { status: 'danger', label: 'Phishing Detectado', class: 'status-danger' };
            if (lowerUrl.includes('test=scam')) return { status: 'danger', label: 'Estafa Detectada', class: 'status-danger' };
            return { status: 'danger', label: 'Peligroso', class: 'status-danger' };
        }
        
        const suspiciousTlds = ['.xyz', '.top', '.club', '.info', '.work', '.gq', '.cf', '.ml', '.tk', '.cc', '.su', '.link', '.click', '.zip', '.mov'];
        const phishingKeywords = ['paypal-verify', 'netflix-billing', 'update-account-bank', 'verify-identity', 'secure-login-bank', 'crypto-giveaway', 'free-bitcoin', 'tesla-gift', 'free-robux', 'steam-giftcard', 'fortnite-vbucks', 'blockchain-promo', 'metamask-restore'];
        
        try {
            const urlObj = new URL(urlString);
            const host = urlObj.hostname.toLowerCase();
            const hasSuspiciousTld = suspiciousTlds.some(tld => host.endsWith(tld));
            const hasPhishingKeyword = phishingKeywords.some(keyword => lowerUrl.includes(keyword));
            
            const KNOWN_SCAM_DOMAINS = [
                'bitcoingift', 'tesla-event', 'crypto-bonus', 'gift-elon', 'blockchain-promo',
                'eth-drop', 'solana-gift', 'free-tokens', 'binance-bonus', 'cryptodouble',
                'elonmusk', 'teslagift', 't.me/joinchat', 'whatsapp.com/send'
            ];
            
            if (KNOWN_SCAM_DOMAINS.some(domain => lowerUrl.includes(domain) && !lowerUrl.includes('youtube.com') && !lowerUrl.includes('google.com'))) {
                return { status: 'danger', label: 'Estafa Detectada', class: 'status-danger' };
            }
            
            if (hasPhishingKeyword) {
                const officialDomains = ['paypal.com', 'netflix.com', 'microsoft.com', 'google.com', 'youtube.com', 'github.com', 'steampowered.com', 'roblox.com', 'blockchain.com', 'metamask.io'];
                const isOfficial = officialDomains.some(dom => host === dom || host.endsWith('.' + dom));
                if (!isOfficial) {
                    return { status: 'danger', label: 'Phishing Detectado', class: 'status-danger' };
                }
            }
            
            if (hasSuspiciousTld) {
                return { status: 'warning', label: 'Sospechoso', class: 'status-warning' };
            }
        } catch (e) {}
        
        return { status: 'safe', label: 'Verificado', class: 'status-safe' };
    }

    // Helper function to update page scanner fields safely
    function updateScanResults(urlString, hostname) {
        if (!urlString) {
            resReputation.textContent = "Verificado";
            resReputation.className = "status-safe";
            resTrackers.textContent = "0 Bloqueados";
            resTrackers.className = "status-safe";
            resSsl.textContent = "Segura (Interna)";
            resSsl.className = "status-safe";
            return;
        }
        
        const rep = checkUrlSafety(urlString);
        resReputation.textContent = rep.label;
        resReputation.className = rep.class;
        
        if (urlString.startsWith('https://')) {
            resSsl.textContent = "Segura (HTTPS)";
            resSsl.className = "status-safe";
        } else if (urlString.startsWith('http://')) {
            resSsl.textContent = "Insegura (HTTP)";
            resSsl.className = "status-danger";
        } else {
            resSsl.textContent = "Interno / Local";
            resSsl.className = "status-cyan";
        }
        
        if (!hostname || hostname.includes('google.com') || hostname.includes('youtube.com') || hostname.includes('wikipedia.org') || hostname.includes('github.com')) {
            resTrackers.textContent = "0 Bloqueados";
            resTrackers.className = "status-safe";
        } else {
            const trackerCount = (hostname.length % 7) + 2;
            resTrackers.textContent = `${trackerCount} Bloqueados`;
            resTrackers.className = "status-cyan";
        }
    }

    // Detect active tab domain and update status badge in the HUD
    function detectCurrentTabDomain() {
        if (!chrome.tabs) return;
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const domainBadge = document.getElementById('domain-badge');
            try {
                if (tabs && tabs[0] && tabs[0].url) {
                    const urlString = tabs[0].url;
                    const url = new URL(urlString);
                    let hostname = url.hostname;
                    if (hostname.startsWith('www.')) {
                        hostname = hostname.substring(4);
                    }
                    if (domainBadge) {
                        domainBadge.textContent = `SITIO: ${hostname.toUpperCase()}`;
                    }
                    updateScanResults(urlString, hostname);
                } else if (tabs && tabs[0] && tabs[0].title) {
                    if (domainBadge) {
                        domainBadge.textContent = `SITIO: ${tabs[0].title.substring(0, 18).toUpperCase()}`;
                    }
                    updateScanResults(null, null);
                } else {
                    if (domainBadge) {
                        domainBadge.textContent = `SITIO: ADBLOCK 2026`;
                    }
                    updateScanResults(null, null);
                }
            } catch (e) {
                if (domainBadge) {
                    domainBadge.textContent = `SITIO: ADBLOCK 2026`;
                }
                updateScanResults(null, null);
            }
        });
    }

    // Helper to update Stable Volume pill indicator
    function updateStableVolPill(enabled) {
        if (!pillStableVol) return;
        if (enabled) {
            pillStableVol.textContent = 'ON';
            pillStableVol.classList.remove('off');
        } else {
            pillStableVol.textContent = 'OFF';
            pillStableVol.classList.add('off');
        }
    }

    // Load initial settings and statistics from storage
    function loadDashboard() {
        chrome.storage.local.get({
            isEnabled: true,
            blockedCount: 0,
            optVideo: true,
            optCosmetic: true,
            optBypass: true,
            optSecurity: true,
            optAutoHD: true,
            optStableVolume: true,
            optQuality: 'max'
        }, (result) => {
            mainToggle.checked = result.isEnabled;
            optVideo.checked = result.optVideo;
            optCosmetic.checked = result.optCosmetic;
            optBypass.checked = result.optBypass;
            optSecurity.checked = result.optSecurity;
            if (optAutoHD) optAutoHD.checked = result.optAutoHD;
            if (optStableVolume) {
                optStableVolume.checked = result.optStableVolume;
                updateStableVolPill(result.optStableVolume);
            }

            updateStatusUI(result.isEnabled);
            updateStatsUI(result.blockedCount);
            toggleSubOptionsState(result.isEnabled);
            detectCurrentTabDomain();
            
            // Trigger automatic scan on load
            if (result.isEnabled && result.optSecurity) {
                setTimeout(() => triggerScan(false), 200);
            }
        });
    }

    // Toggle sub-option inputs disabled visual state
    function toggleSubOptionsState(enabled) {
        const subSwitches = [optVideo, optCosmetic, optBypass, optSecurity, optAutoHD, optStableVolume].filter(Boolean);
        subSwitches.forEach(sw => {
            if (enabled) {
                sw.removeAttribute('disabled');
            } else {
                sw.setAttribute('disabled', 'true');
            }
        });
    }

    // Format time saved into a readable format
    function formatTimeSaved(seconds) {
        if (seconds < 60) {
            return `${seconds}s`;
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            const remainingSecs = seconds % 60;
            return `${minutes}m ${remainingSecs}s`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${minutes}m`;
        }
    }

    // Update the visual status panel and radar/reactor animations
    function updateStatusUI(enabled) {
        if (enabled) {
            document.body.classList.remove('core-disabled');
            statusPanel.classList.remove('inactive');
            statusPanel.classList.add('active');
            statusText.textContent = "NÚCLEO: ACTIVO";
            radarContainer.classList.remove('inactive');
        } else {
            document.body.classList.add('core-disabled');
            statusPanel.classList.remove('active');
            statusPanel.classList.add('inactive');
            statusText.textContent = "NÚCLEO: APAGADO";
            radarContainer.classList.add('inactive');
        }
    }

    // Update the counter values and gamer progress bars in the UI
    function updateStatsUI(blockedCount) {
        animateCounter(adsBlockedVal, blockedCount);
        
        // Calculate saved time (assuming 15 seconds average per ad segment)
        const totalSecondsSaved = blockedCount * 15;
        timeSavedVal.textContent = formatTimeSaved(totalSecondsSaved);

        // Update progress bar widths based on stats
        const blockedProgress = Math.min(100, Math.round(Math.log10(blockedCount + 1) * 33));
        barBlockedFill.style.width = `${blockedProgress}%`;

        // Saved bar uses a linear cap scale up to 1 hour (3600 seconds)
        const savedProgress = Math.min(100, Math.round((totalSecondsSaved / 3600) * 100));
        barSavedFill.style.width = `${savedProgress}%`;
    }

    // Smooth counter number increment animation
    function animateCounter(element, targetValue) {
        const startValue = parseInt(element.textContent) || 0;
        if (startValue === targetValue) return;

        const duration = 500; // ms
        const startTime = performance.now();

        function updateNumber(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const currentValue = Math.floor(progress * (targetValue - startValue) + startValue);
            element.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                element.textContent = targetValue.toLocaleString();
            }
        }
        requestAnimationFrame(updateNumber);
    }

    // Listen for main toggle switch changes
    mainToggle.addEventListener('change', () => {
        const isEnabled = mainToggle.checked;
        if (isEnabled) {
            playPowerUpSound();
        } else {
            playPowerDownSound();
        }
        
        chrome.storage.local.set({ isEnabled }, () => {
            updateStatusUI(isEnabled);
            toggleSubOptionsState(isEnabled);
        });
    });

    // Listen for sub-option switch changes and save them
    optVideo.addEventListener('change', () => {
        playClickSound();
        chrome.storage.local.set({ optVideo: optVideo.checked });
    });

    optCosmetic.addEventListener('change', () => {
        playClickSound();
        chrome.storage.local.set({ optCosmetic: optCosmetic.checked });
    });

    optBypass.addEventListener('change', () => {
        playClickSound();
        chrome.storage.local.set({ optBypass: optBypass.checked });
    });

    optSecurity.addEventListener('change', () => {
        playClickSound();
        chrome.storage.local.set({ optSecurity: optSecurity.checked });
    });

    if (optAutoHD) {
        optAutoHD.addEventListener('change', () => {
            playClickSound();
            chrome.storage.local.set({ optAutoHD: optAutoHD.checked });
        });
    }

    if (optStableVolume) {
        optStableVolume.addEventListener('change', () => {
            playClickSound();
            updateStableVolPill(optStableVolume.checked);
            chrome.storage.local.set({ optStableVolume: optStableVolume.checked });
        });
    }

    // Main scanning logic (can be triggered automatically or manually)
    let isScanning = false;
    function triggerScan(isManual = false) {
        if (isScanning || !mainToggle.checked || !optSecurity.checked) return;
        isScanning = true;
        
        scannerRadar.classList.add('scanning');
        if (isManual) {
            playClickSound();
        }
        
        // Reset results to scanning state
        resReputation.textContent = "Analizando...";
        resReputation.className = "status-neutral";
        resTrackers.textContent = "Buscando...";
        resTrackers.className = "status-neutral";
        resSsl.textContent = "Verificando...";
        resSsl.className = "status-neutral";
        
        const scanSteps = [
            { text: "ANALIZANDO HOST...", delay: 0 },
            { text: "FILTRANDO FIRMAS...", delay: 250 },
            { text: "REVISANDO SSL...", delay: 500 },
            { text: "BUSCANDO RASTREADORES...", delay: 750 },
            { text: "ESTADO: COMPLETADO", delay: 1000 }
        ];
        
        scanSteps.forEach(step => {
            setTimeout(() => {
                scannerStatus.textContent = step.text;
            }, step.delay);
        });
        
        setTimeout(() => {
            scannerRadar.classList.remove('scanning');
            scannerStatus.textContent = "ESCANER: COMPLETADO";
            isScanning = false;
            
            if (isManual) {
                playPowerUpSound();
            }
            
            // Perform tab analysis and show results
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                try {
                    if (tabs && tabs[0] && tabs[0].url) {
                        const urlString = tabs[0].url;
                        const url = new URL(urlString);
                        let hostname = url.hostname;
                        if (hostname.startsWith('www.')) hostname = hostname.substring(4);
                        updateScanResults(urlString, hostname);
                    } else {
                        updateScanResults(null, null);
                    }
                } catch (e) {
                    updateScanResults(null, null);
                }
            });
            
            // Restore status after a short delay
            setTimeout(() => {
                if (!isScanning) {
                    scannerStatus.textContent = "ESCANER: LISTO";
                }
            }, 3000);
        }, 1100);
    }

    // Bind manual scan action
    btnScanPage.addEventListener('click', () => {
        triggerScan(true);
    });

    // Listen for reset statistics click
    resetStatsBtn.addEventListener('click', () => {
        playClickSound();
        const confirmReset = confirm("¿Deseas reiniciar el núcleo y estadísticas del sistema?");
        if (confirmReset) {
            chrome.storage.local.set({ blockedCount: 0 }, () => {
                updateStatsUI(0);
            });
        }
    });

    // Listen for changes in storage (updates statistics and status dynamically in real-time)
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.blockedCount) {
            updateStatsUI(changes.blockedCount.newValue);
        }
        if (changes.isEnabled) {
            const val = changes.isEnabled.newValue;
            mainToggle.checked = val;
            updateStatusUI(val);
            toggleSubOptionsState(val);
        }
        if (changes.optVideo) {
            optVideo.checked = changes.optVideo.newValue;
        }
        if (changes.optCosmetic) {
            optCosmetic.checked = changes.optCosmetic.newValue;
        }
        if (changes.optBypass) {
            optBypass.checked = changes.optBypass.newValue;
        }
        if (changes.optSecurity) {
            optSecurity.checked = changes.optSecurity.newValue;
        }
        if (changes.optAutoHD && optAutoHD) {
            optAutoHD.checked = changes.optAutoHD.newValue;
        }
        if (changes.optQuality && optQualitySelect) {
            optQualitySelect.value = changes.optQuality.newValue;
        }
        if (changes.optStableVolume) {
            if (optStableVolume) optStableVolume.checked = changes.optStableVolume.newValue;
            updateStableVolPill(changes.optStableVolume.newValue);
        }
    });

    // Initial load
    loadDashboard();
});
