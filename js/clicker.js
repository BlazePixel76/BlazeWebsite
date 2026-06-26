import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction, onDisconnect } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const pixelRef = ref(db, 'global_pixel_total');

document.addEventListener('DOMContentLoaded', () => {
    const pixelCounter = document.getElementById('pixel-count');
    const mineCore = document.getElementById('mine-core');
    const activityLog = document.getElementById('activity-log');
    const liveNodesIndicator = document.querySelector('[class*="text-[#10b981]"]')?.parentElement;

    const odometer = new Odometer({
        el: pixelCounter,
        value: 0, 
        format: '(,ddd)',
        theme: 'minimal',
        duration: 900 
    });

    let updateTimeout;
    let lastUpdateTime = 0;
    const DEBOUNCE_DELAY = 1000;

    const scheduleOdometerUpdate = (newValue) => {
        clearTimeout(updateTimeout);
        const timeSinceLastUpdate = Date.now() - lastUpdateTime;
        const delay = Math.max(0, DEBOUNCE_DELAY - timeSinceLastUpdate);

        updateTimeout = setTimeout(() => {
            odometer.update(newValue);
            lastUpdateTime = Date.now();
            logActivity('Network sync...');
        }, delay);
    };

    const logActivity = (message) => {
        if (activityLog) {
            activityLog.textContent = `> ${message}`;
        }
    };

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

    onValue(pixelRef, (snapshot) => {
        const serverCount = snapshot.val();
        
        if (serverCount === null) {
            runTransaction(pixelRef, () => 0);
        } else {
            scheduleOdometerUpdate(serverCount);
            updateConnectionStatus(true);
        }
    }, (error) => {
        console.error('Firebase error:', error);
        updateConnectionStatus(false);
    });

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

    const stats = getPersonalStats();
    if (stats.clicks > 0) {
        logActivity(`You've contributed ${stats.clicks} pixels!`);
    }

    let isLocalClick = false;

    const handleMine = (e) => {
        if (e) e.preventDefault();

        isLocalClick = true;

        const newStats = updatePersonalStats();

        runTransaction(pixelRef, (currentCount) => {
            return (currentCount || 0) + 1;
        });
        
        mineCore.classList.remove('shake');
        void mineCore.offsetWidth;
        mineCore.classList.add('shake');

        if (navigator.vibrate) {
            navigator.vibrate(12);
        }

        logActivity(`Personal: ${newStats.clicks} | Mining...`);

        setTimeout(() => {
            isLocalClick = false;
        }, 100);
    };

    let lastOdometerValue = 0;
    
    pixelCounter.addEventListener('odometerdone', () => {
        const currentValue = parseInt(pixelCounter.innerText.replace(/,/g, ''), 10) || 0;
        
        if (!isLocalClick && currentValue > lastOdometerValue) {
            mineCore.classList.remove('remote-pulse');
            void mineCore.offsetWidth;
            mineCore.classList.add('remote-pulse');

            if (navigator.vibrate) {
                navigator.vibrate([5, 5, 5]);
            }

            logActivity('Remote click detected!');
        }
        
        lastOdometerValue = currentValue;
    });

    mineCore.addEventListener('click', handleMine);
    mineCore.addEventListener('touchstart', handleMine, { passive: false });
});

const exitBtn = document.getElementById('exit-btn');

if (exitBtn) {
    exitBtn.addEventListener('click', () => {
        console.log("Exit button clicked!");
        window.location.href = 'index.html'; 
    });
} else {
    console.error("Could not find the exit-btn element in the DOM.");
}