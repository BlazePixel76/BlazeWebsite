// Greeting Constants
const pageGreetings = {
    index: {
        static: 'Hello There',
        typed: '<span class="text-accent">echo</span> $USER'
    },
    about: {
        static: 'About Me!',
        typed: '<span class="text-accent">cd</span> ~/about'
    },
    projects: {
        static: 'My Projects',
        typed: '<span class="text-accent">cd</span> ~/projects'
    },
    socials: {
        static: 'My Socials',
        typed: '<span class="text-accent">cd</span> ~/socials'
    }
};

// --- TYPING ANIMATION ENGINE ---
function typeEffect(element, html, speed = 50) {
    if (!element) return;
    element.innerHTML = "";
    element.classList.add('typing'); // Ensure typing class is applied for CSS animations
    
    // If it's the hacker greeting, we type the spans first, then the remaining text
    if (html.includes('<span')) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // 1. Get all spans (like echo, cd, or icons)
        const spans = tempDiv.querySelectorAll('span');
        let spanHTML = "";
        let combinedSpanText = "";
        
        spans.forEach(span => {
            spanHTML += span.outerHTML + " ";
            combinedSpanText += span.textContent;
        });

        // 2. Determine what needs to be typed (whatever is left after spans)
        // This handles $USER, ~/about, or anything else dynamically
        const textContent = tempDiv.textContent.replace(combinedSpanText, '');
        
        element.innerHTML = spanHTML;
        let i = 0;
        const timer = setInterval(() => {
            if (i < textContent.length) {
                element.append(textContent.charAt(i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, speed);
        return;
    }

    // Standard typing for Material (or fallback)
    let i = 0;
    const timer = setInterval(() => {
        if (i < html.length) {
            element.append(html.charAt(i));
            i++;
        } else {
            clearInterval(timer);
        }
    }, speed);
}

// --- ANTI-GHOSTING UTILITY ---
function revealBody() {
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
    setTimeout(() => {
        document.body.classList.add("ready");
    }, 100); 
}

// --- UNIVERSAL DROPDOWN LOGIC ---
function toggleDropdown(id, arrowId) {
    // For index.html (single dropdown)
    if (!id) {
        const dropdown = document.getElementById('projectDropdown');
        const arrow = document.getElementById('arrowIcon');
        if (!dropdown) return;
        if (dropdown.classList.contains('show')) {
            closeDropdown();
        } else {
            dropdown.classList.add('show');
            if (arrow) arrow.classList.add('rotate-180');
        }
        return;
    }
    
    // For About.html (multiple dropdowns)
    const dropdown = document.getElementById(id);
    const arrow = document.getElementById(arrowId);
    document.querySelectorAll('.dropdown-content').forEach(d => { if (d.id !== id) d.classList.remove('show'); });
    document.querySelectorAll('nav svg[id$="Arrow"]').forEach(svg => { if (svg.id !== arrowId) svg.classList.remove('rotate-180'); });
    dropdown.classList.toggle('show');
    arrow.classList.toggle('rotate-180');
}

function closeDropdown() {
    const dropdown = document.getElementById('projectDropdown');
    const arrow = document.getElementById('arrowIcon');
    if (dropdown) dropdown.classList.remove('show');
    if (arrow) arrow.classList.remove('rotate-180');
    document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
    document.querySelectorAll('nav svg[id$="Arrow"]').forEach(svg => svg.classList.remove('rotate-180'));
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const projectMenu = document.getElementById('mobileProjectsMenu');
    const socialsMenu = document.getElementById('mobileSocialsMenu');
    if (!menu) return;
    const isOpen = menu.classList.toggle('show');
    if (!isOpen) {
        if (projectMenu) projectMenu.classList.remove('show');
        if (socialsMenu) socialsMenu.classList.remove('show');
    }
}

function toggleMobileSubmenu(id) {
    const submenu = document.getElementById(id);
    if (!submenu) return;
    const otherId = id === 'mobileProjectsMenu' ? 'mobileSocialsMenu' : 'mobileProjectsMenu';
    const other = document.getElementById(otherId);
    const isOpen = submenu.classList.toggle('show');
    if (isOpen && other) other.classList.remove('show');
}

// --- THEME SWAP LOGIC ---
function toggleTheme() {
    const themeLink = document.getElementById('theme-link');
    const heroTitle = document.getElementById('hero-title');
    const pageType = document.body.dataset.page;
    const pageGreeting = pageGreetings[pageType] || { static: '', typed: null };
    
    document.body.classList.add('theme-fade-out');
    closeDropdown();

    setTimeout(() => {
        const switchToMaterial = themeLink.href.includes('style.css');

        if (switchToMaterial) {
            themeLink.href = "./css/material.css";
            localStorage.setItem('theme-pref', 'material');
            if (heroTitle) {
                heroTitle.innerHTML = pageGreeting.static;
                heroTitle.classList.remove('typing'); // Remove typing class for static text
            }
        } else {
            themeLink.href = "./css/style.css";
            localStorage.setItem('theme-pref', 'hacker');
            if (heroTitle && pageGreeting.typed) typeEffect(heroTitle, pageGreeting.typed);
        }

        themeLink.onload = () => {
            document.body.classList.remove('theme-fade-out');
            document.body.classList.add('theme-fade-in');
            requestAnimationFrame(() => document.body.classList.add('theme-fade-in-active'));
            setTimeout(() => {
                document.body.classList.remove('theme-fade-in', 'theme-fade-in-active');
            }, 400);
        };

        if (!switchToMaterial) {
            // style.css is usually faster, so also ensure the fade restores if load event doesn't fire.
            setTimeout(() => {
                document.body.classList.remove('theme-fade-out');
                document.body.classList.add('theme-fade-in');
                requestAnimationFrame(() => document.body.classList.add('theme-fade-in-active'));
                setTimeout(() => {
                    document.body.classList.remove('theme-fade-in', 'theme-fade-in-active');
                }, 400);
            }, 200);
        }
    }, 50);
}

// --- MATRIX BACKGROUND ---
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let width, height, columns, drops;
const fontSize = 16;
const characters = "01"; 

function initMatrix() {
    if (!canvas) return;
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    columns = Math.floor(width / fontSize);
    drops = Array(columns).fill(1);
}

function drawMatrix() {
    if (localStorage.getItem('theme-pref') === 'material' || !ctx) return;
    ctx.fillStyle = "rgba(2, 2, 2, 0.1)"; 
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#10b981"; 
    ctx.font = `${fontSize}px monospace`;
    for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme-pref');
    const themeLink = document.getElementById('theme-link');
    const heroTitle = document.getElementById('hero-title');
    const pageType = document.body.dataset.page;
    const pageGreeting = pageGreetings[pageType] || { static: '', typed: null };
    
    closeDropdown();

    if (savedTheme === 'material') {
        themeLink.href = "./css/material.css";
        if (heroTitle) heroTitle.innerHTML = pageGreeting.static;
        themeLink.onload = revealBody;
        if (themeLink.complete) revealBody();
    } else {
        themeLink.href = "./css/style.css";
        if (heroTitle && pageGreeting.typed) {
            typeEffect(heroTitle, pageGreeting.typed);
        } else if (heroTitle) {
            heroTitle.innerHTML = pageGreeting.static;
            heroTitle.classList.add('typing'); // Add typing class for cursor even on static text
        }
        revealBody();
    }
    
    initMatrix();
});

setInterval(drawMatrix, 50);
window.addEventListener('resize', initMatrix);

window.addEventListener('click', (e) => {
    if (document.getElementById('projectBtn') && !document.getElementById('projectBtn').contains(e.target)) {
        closeDropdown();
    }

    const mobileMenu = document.getElementById('mobileMenu');
    const mobileButton = document.getElementById('mobileMenuBtn');
    if (mobileMenu && mobileButton && !mobileMenu.contains(e.target) && !mobileButton.contains(e.target)) {
        mobileMenu.classList.remove('show');
        document.querySelectorAll('.mobile-submenu.show').forEach(sub => sub.classList.remove('show'));
    }
});

function redirectTo(type) {
    const overlay = document.getElementById('redirect-overlay');
    const bar = document.getElementById('progress-bar');
    if(!overlay || !bar) return;

    overlay.classList.remove('hidden');
    bar.style.width = "0%";
    setTimeout(() => { bar.style.width = "100%"; }, 50);
    setTimeout(() => {
        window.location.href = (type === 'source') 
            ? "https://github.com/BlazePixel76/BlazeWebsite" 
            : "https://www.instagram.com/blazepixel75/";
    }, 2100);
}

let inputBuffer = "";
window.addEventListener('keydown', (e) => {
    inputBuffer += e.key.toLowerCase();
    
    // Keep the buffer short so it doesn't eat memory
    if (inputBuffer.length > 10) inputBuffer = inputBuffer.substring(1);

    // If the user types "mine"
    if (inputBuffer.includes("mine")) {
        console.log("ACCESS_GRANTED: Redirecting to Mining Node...");
        window.location.href = 'clicker.html'; // Adjust path as needed
    }
});

let pekkaClicks = 0;
let comboTimer;

const trigger = document.getElementById('identity-trigger');

if (trigger) {
    trigger.addEventListener('click', function(e) {
        e.preventDefault();
        pekkaClicks++;
        clearTimeout(comboTimer);

        // This grabs the color from whichever CSS is currently active
        const themeColor = getComputedStyle(document.documentElement)
                           .getPropertyValue('--current-glow').trim();

        // Apply the glow based on the click count
        this.style.textShadow = `0 0 ${pekkaClicks * 10}px ${themeColor}`;
        this.style.transform = "scale(0.96)";
        
        setTimeout(() => this.style.transform = "scale(1)", 50);

        if (pekkaClicks === 7) {
            pekkaClicks = 0;
            initiateSystemOverride();
        } else {
            comboTimer = setTimeout(() => {
                if (pekkaClicks === 1) {
                    window.location.href = this.href;
                } else {
                    // Smoothly fade out using the CSS transition
                    pekkaClicks = 0;
                    this.style.textShadow = `0 0 0px transparent`;
                }
            }, 800);
        }
    });
}

function initiateSystemOverride() {
    console.log("SYSTEM_OVERRIDE_INITIATED");
    // Add a simple fade-out or glitch before moving
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.5s ease";
    
    setTimeout(() => {
        // Points to the page we created earlier
        window.location.href = 'clicker.html'; 
    }, 500);
}

setTimeout(() => {
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
    document.body.classList.remove('theme-fade-out'); // Just in case this is stuck
}, 1000);
