import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction, onDisconnect } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { firebaseConfig } from "./config.js";

// --- 1. FIREBASE CONFIGURATION ---
// Credentials are loaded from config.js file (keep this file local, don't commit to GitHub)

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const pixelRef = ref(db, 'global_pixel_total');

document.addEventListener('DOMContentLoaded', () => {
    const pixelCounter = document.getElementById('pixel-count');
    const mineCore = document.getElementById('mine-core');
    const activityLog = document.getElementById('activity-log');
    const liveNodesIndicator = document.querySelector('[class*="text-[#10b981]"]')?.parentElement;

    // 2. Initialize Odometer (now we'll actually use it)
    const odometer = new Odometer({
        el: pixelCounter,
        value: 0, 
        format: '(,ddd)',
        theme: 'minimal',
        duration: 900 
    });

    // --- 3. DEBOUNCE SYSTEM FOR ODOMETER UPDATES ---
    // Instead of a fixed delay, only update once per 600ms max
    let updateTimeout;
    let lastUpdateTime = 0;
    const DEBOUNCE_DELAY = 1000; // ms

    const scheduleOdometerUpdate = (newValue) => {
        clearTimeout(updateTimeout);
        const timeSinceLastUpdate = Date.now() - lastUpdateTime;
        const delay = Math.max(0, DEBOUNCE_DELAY - timeSinceLastUpdate);

        updateTimeout = setTimeout(() => {
            // Use Odometer's native update() method instead of innerHTML
            odometer.update(newValue);
            lastUpdateTime = Date.now();
            logActivity('Network sync...');
        }, delay);
    };

    // --- 4. ACTIVITY LOG HELPER ---
    const logActivity = (message) => {
        if (activityLog) {
            activityLog.textContent = `> ${message}`;
        }
    };

    // --- 5. CONNECTION STATUS INDICATOR ---
    let isConnected = true;

    const updateConnectionStatus = (connected) => {
        isConnected = connected;
        if (liveNodesIndicator) {
            const indicator = liveNodesIndicator.querySelector('.w-2.h-2');
            if (indicator) {
                if (connected) {
                    indicator.style.backgroundColor = '#10b981';
                    indicator.classList.add('animate-ping');
                    logActivity('Network sync complete.');
                } else {
                    indicator.style.backgroundColor = '#ef4444';
                    indicator.classList.remove('animate-ping');
                    logActivity('Connection lost. Retrying...');
                }
            }
        }
    };

    // --- 6. LISTEN FOR GLOBAL UPDATES ---
    onValue(pixelRef, (snapshot) => {
        const serverCount = snapshot.val();
        
        if (serverCount === null) {
            // First time ever running? Seed the database
            runTransaction(pixelRef, () => 0);
        } else {
            // Schedule the odometer update using debounce
            scheduleOdometerUpdate(serverCount);
            updateConnectionStatus(true);
        }
    }, (error) => {
        // Handle connection errors
        console.error('Firebase error:', error);
        updateConnectionStatus(false);
    });

    // --- 7. PERSONAL CLICK STATS (localStorage) ---
    const getPersonalStats = () => {
        const stats = JSON.parse(localStorage.getItem('pixelClickStats') || '{"clicks": 0, "sessionStart": 0}');
        return stats;
    };

    const updatePersonalStats = () => {
        const stats = getPersonalStats();
        stats.clicks += 1;
        if (!stats.sessionStart) {
            stats.sessionStart = Date.now();
        }
        localStorage.setItem('pixelClickStats', JSON.stringify(stats));
        return stats;
    };

    // Show personal contribution on page load
    const stats = getPersonalStats();
    if (stats.clicks > 0) {
        logActivity(`You've contributed ${stats.clicks} pixels!`);
    }

    // --- 8. THE MINE INTERACTION (Enhanced) ---
    let isLocalClick = false; // Track if current update is from user or remote

    const handleMine = (e) => {
        if (e) e.preventDefault(); // Prevents double-firing on mobile

        isLocalClick = true;

        // Update personal stats
        const newStats = updatePersonalStats();

        // Safely add +1 to the global database
        runTransaction(pixelRef, (currentCount) => {
            return (currentCount || 0) + 1;
        });
        
        // Visual Feedback (Shake) - optimized with transform
        mineCore.classList.remove('shake');
        void mineCore.offsetWidth; // Trigger reflow
        mineCore.classList.add('shake');

        // Haptic Feedback - User click gets a short buzz
        if (navigator.vibrate) {
            navigator.vibrate(12); // Slightly stronger for user action
        }

        logActivity(`Personal: ${newStats.clicks} | Mining...`);

        // Reset the local click flag after update completes
        setTimeout(() => {
            isLocalClick = false;
        }, 100);
    };

    // --- 9. REMOTE CLICK DETECTION & HAPTICS ---
    let lastOdometerValue = 0;
    
    // Listen to odometer update events to detect remote clicks
    pixelCounter.addEventListener('odometerdone', () => {
        const currentValue = parseInt(pixelCounter.innerText.replace(/,/g, ''), 10) || 0;
        
        if (!isLocalClick && currentValue > lastOdometerValue) {
            // This was a REMOTE click (not ours)
            
            // Subtle pulse animation via CSS
            mineCore.classList.remove('remote-pulse');
            void mineCore.offsetWidth;
            mineCore.classList.add('remote-pulse');

            // Different haptic pattern for remote clicks
            if (navigator.vibrate) {
                navigator.vibrate([5, 5, 5]); // Pulsing pattern
            }

            logActivity('Remote click detected!');
        }
        
        lastOdometerValue = currentValue;
    });

    // --- 10. CLICK LISTENERS (click + touch) ---
    mineCore.addEventListener('click', handleMine);
    mineCore.addEventListener('touchstart', handleMine, { passive: false });
});

// --- THE EXIT LOGIC ---
const exitBtn = document.getElementById('exit-btn');

if (exitBtn) {
    exitBtn.addEventListener('click', () => {
        console.log("Exit button clicked!");
        window.location.href = './assets/index.html'; 
    });
} else {
    console.error("Could not find the exit-btn element in the DOM.");
}
