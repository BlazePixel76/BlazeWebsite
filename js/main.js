const savedTheme = localStorage.getItem('theme-pref') || 'material';
const themeLink = document.getElementById('theme-link');
applyThemeState(savedTheme);
if (themeLink) {
    themeLink.href = savedTheme === 'material' ? "./css/material.css" : "./css/style.css";
}

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
        static: 'My Developments',
        typed: '<span class="text-accent">cd</span> ~/projects'
    },
    socials: {
        static: 'Contact Me',
        typed: '<span class="text-accent">cd</span> ~/socials'
    }
};

let currentActivePage = 'index';
let typingTimer = null;
let materialGreetingTimer = null;
let asciiExpressionInterval = null;
let asciiExpressionTimeout = null;

const themeIcons = {
    material: `
        <svg class="theme-icon w-5 h-5 text-zinc-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3l7.5 4.25v8.5L12 20 4.5 15.75v-8.5L12 3z"></path>
            <path d="M12 8.5l3.5 2v4L12 16.5l-3.5-2v-4L12 8.5z"></path>
        </svg>
    `,
    hacker: `
        <svg class="theme-icon w-5 h-5 text-zinc-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 8l4 4-4 4"></path>
            <path d="M11 17h8"></path>
        </svg>
    `
};

function updateThemeButtonIcon(currentTheme, animate = false) {
    const button = document.getElementById('themeToggleBtn');
    if (!button) return;

    const targetTheme = currentTheme === 'material' ? 'hacker' : 'material';
    const applyIcon = () => {
        button.innerHTML = themeIcons[targetTheme];
        button.title = targetTheme === 'material' ? 'Switch to Material Theme' : 'Switch to Hacker Theme';
        button.setAttribute('aria-label', button.title);
    };

    if (animate) {
        button.classList.remove('theme-btn-switching');
        void button.offsetWidth;
        button.classList.add('theme-btn-switching');
        setTimeout(applyIcon, 250);
        setTimeout(() => button.classList.remove('theme-btn-switching'), 760);
        return;
    }

    applyIcon();
}

function applyThemeState(theme) {
    const isMaterial = theme === 'material';
    if (isMaterial) {
        document.documentElement.setAttribute('data-theme', 'material');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }

    if (document.body) {
        if (isMaterial) {
            document.body.setAttribute('data-theme', 'material');
        } else {
            document.body.removeAttribute('data-theme');
        }
    }
}

const materialShapeMotion = new WeakMap();
let materialShapeFrameTime = 0;

function chooseMaterialShapeDirection(motion, hitX = false, hitY = false) {
    const angle = Math.random() * Math.PI * 2;
    let vx = Math.cos(angle);
    let vy = Math.sin(angle);

    if (hitX) {
        vx = motion.x <= 1 ? Math.abs(vx) : -Math.abs(vx);
    }
    if (hitY) {
        vy = motion.y <= 1 ? Math.abs(vy) : -Math.abs(vy);
    }

    const length = Math.hypot(vx, vy) || 1;
    motion.vx = (vx / length) * motion.speed;
    motion.vy = (vy / length) * motion.speed;
    motion.spin = (Math.random() < 0.5 ? -1 : 1) * (12 + Math.random() * 12);
}

function animateMaterialShapes(timestamp) {
    requestAnimationFrame(animateMaterialShapes);

    if (document.documentElement.dataset.theme !== 'material') {
        materialShapeFrameTime = 0;
        return;
    }

    const delta = materialShapeFrameTime
        ? Math.min((timestamp - materialShapeFrameTime) / 1000, 0.05)
        : 0;
    materialShapeFrameTime = timestamp;

    document.querySelectorAll('.material-shape').forEach(shape => {
        let motion = materialShapeMotion.get(shape);
        const shapeSize = getComputedStyle(shape);
        const width = parseFloat(shapeSize.width);
        const height = parseFloat(shapeSize.height);
        if (!width || !height) return;

        const maxX = Math.max(0, window.innerWidth - width);
        const maxY = Math.max(0, window.innerHeight - height);

        if (!motion) {
            const startPositions = {
                'material-shape-flower': [0.08, 0.08],
                'material-shape-gem': [0.72, 0.12],
                'material-shape-cookie': [0.38, 0.62]
            };
            const [startX, startY] = Object.entries(startPositions)
                .find(([className]) => shape.classList.contains(className))?.[1]
                || [Math.random(), Math.random()];
            motion = {
                x: Math.min(startX * window.innerWidth, maxX),
                y: Math.min(startY * window.innerHeight, maxY),
                vx: 0,
                vy: 0,
                angle: Math.random() * 360,
                spin: 0,
                speed: 40 + Math.random() * 12
            };
            materialShapeMotion.set(shape, motion);
            chooseMaterialShapeDirection(motion);
        }

        motion.x += motion.vx * delta;
        motion.y += motion.vy * delta;

        let hitX = false;
        let hitY = false;
        if (maxX > 0 && (motion.x <= 0 || motion.x >= maxX)) {
            motion.x = Math.max(0, Math.min(motion.x, maxX));
            hitX = true;
        }
        if (maxY > 0 && (motion.y <= 0 || motion.y >= maxY)) {
            motion.y = Math.max(0, Math.min(motion.y, maxY));
            hitY = true;
        }
        if (hitX || hitY) chooseMaterialShapeDirection(motion, hitX, hitY);

        motion.angle = (motion.angle + motion.spin * delta) % 360;
        shape.style.transform = `translate3d(${motion.x}px, ${motion.y}px, 0) rotate(${motion.angle}deg)`;
    });
}

requestAnimationFrame(animateMaterialShapes);

function finishThemeTransition() {
    document.body.classList.remove('theme-fade-out');
    document.body.classList.add('theme-fade-in');
    requestAnimationFrame(() => document.body.classList.add('theme-fade-in-active'));
    setTimeout(() => {
        document.body.classList.remove('theme-fade-in', 'theme-fade-in-active');
    }, 400);
}

function resetIdentityGlow() {
    const trigger = document.getElementById('identity-trigger');
    if (!trigger) return;

    trigger.classList.remove('active-link');
    trigger.style.textShadow = '';
    trigger.style.transform = '';
    pekkaClicks = 0;
    clearTimeout(comboTimer);
}

function typeEffect(element, html, speed = 80) { 
    if (!element) {
        console.warn('typeEffect: element is NULL!');
        return;
    }
    
    
    if (typingTimer) clearInterval(typingTimer);
    
    element.innerHTML = "";
    element.textContent = "";
    element.classList.add('typing');
    
    
    if (html.includes('<span')) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        const spans = tempDiv.querySelectorAll('span');
        let spanHTML = "";
        let combinedSpanText = "";
        
        spans.forEach(span => {
            spanHTML += span.outerHTML + " ";
            combinedSpanText += span.textContent;
        });

        const textContent = tempDiv.textContent.replace(combinedSpanText, '').trim();
        
        element.innerHTML = spanHTML;
        
        if (textContent.length > 0) {
            let i = 0;
            typingTimer = setInterval(() => {
                if (i < textContent.length) {
                    element.append(textContent.charAt(i));
                    i++;
                } else {
                    clearInterval(typingTimer);
                    typingTimer = null;
                }
            }, speed);
        } else {
        }
        return;
    }

    let i = 0;
    typingTimer = setInterval(() => {
        if (i < html.length) {
            element.append(html.charAt(i));
            i++;
        } else {
            clearInterval(typingTimer);
            typingTimer = null;
        }
    }, speed);
}

function revealBody() {
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
    setTimeout(() => {
        document.body.classList.add("ready");
    }, 100);

    setTimeout(() => {
        document.documentElement.classList.add("scroll-ready");
        document.body.classList.add("scroll-ready");
        document.documentElement.style.removeProperty('overflow');
        document.documentElement.style.removeProperty('height');
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('height');
    }, 750); 
}

function switchPage(pageName) {
    const currentPage = document.querySelector('.page.active');
    const newPage = document.getElementById(`page-${pageName}`);

    if (!newPage || currentPage === newPage) return;

    document.documentElement.classList.add('animating');
    document.body.classList.add('animating');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    if (currentPage) {
        currentPage.classList.remove('active');
        currentPage.classList.add('exiting');

        setTimeout(() => {
            currentPage.classList.remove('exiting');
            currentPage.style.display = 'none';
            newPage.style.display = 'block';
            void newPage.offsetWidth;
            newPage.classList.add('active');

            currentActivePage = pageName;
            updateTitles(pageName);
            closeDropdown();
            closeMobileMenu();
            updateNavAnimation(pageName);
            unlockPageAnimation();
        }, 350);
    } else {
        newPage.style.display = 'block';
        void newPage.offsetWidth;
        newPage.classList.add('active');

        currentActivePage = pageName;
        updateTitles(pageName);
        updateNavAnimation(pageName);
        unlockPageAnimation();
    }
}

function unlockPageAnimation() {
    setTimeout(() => {
        document.documentElement.classList.remove('animating');
        document.body.classList.remove('animating');
        document.documentElement.style.removeProperty('overflow');
        document.documentElement.style.removeProperty('height');
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('height');
    }, 600);
}

function updateNavAnimation(pageName) {
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active-link');
    });

    const navLink = document.querySelector(`nav a:not(#identity-trigger)[onclick*="switchPage('${pageName}')"]`);
    if (navLink) {
        navLink.classList.add('active-link');
    }
}

function animateMaterialGreeting(element, text) {
    stopAsciiExpressionCycle();

    element.classList.remove('typing');
    element.classList.remove('material-greeting-ready');
    element.classList.remove('material-greeting-exit');
    element.classList.add('material-greeting');
    element.innerHTML = '';

    [...text].forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'material-greeting-char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.setProperty('--char-delay', `${index * 38}ms`);
        element.appendChild(span);
    });

    if (text === 'Hello There') {
        const face = document.createElement('span');
        face.id = 'ascii-face';
        face.className = 'terminal-expression material-greeting-face';
        face.textContent = '(•‿•)';
        element.appendChild(face);
        startAsciiExpressionCycle(face);
    }

    requestAnimationFrame(() => {
        element.classList.add('material-greeting-ready');
    });
}

function stopAsciiExpressionCycle() {
    if (asciiExpressionInterval !== null) {
        clearInterval(asciiExpressionInterval);
        asciiExpressionInterval = null;
    }
    if (asciiExpressionTimeout !== null) {
        clearTimeout(asciiExpressionTimeout);
        asciiExpressionTimeout = null;
    }
}

function startAsciiExpressionCycle(element) {
    const expressions = ['(•‿•)', '(^_-)', '(⌐■_■)', '(•̀ω•́)✧', '¯\\_(ツ)_/¯'];
    let expressionIndex = 0;

    asciiExpressionInterval = setInterval(() => {
        element.classList.add('fade-out');
        asciiExpressionTimeout = setTimeout(() => {
            expressionIndex = (expressionIndex + 1) % expressions.length;
            element.textContent = expressions[expressionIndex];
            element.classList.remove('fade-out');
            asciiExpressionTimeout = null;
        }, 200);
    }, 3500);
}

function startMaterialGreetingCycle(element) {
    const greetings = ['Hello There', 'I Make Websites', 'A Linux Enthusiast', 'I Mod Phones'];
    let greetingIndex = 0;
    const greetingDuration = () => greetings[greetingIndex] === 'Hello There' ? 5500 : 3500;

    animateMaterialGreeting(element, greetings[greetingIndex]);

    const showNextGreeting = () => {
        stopAsciiExpressionCycle();
        element.classList.remove('material-greeting-ready');
        const characters = [...element.querySelectorAll('.material-greeting-char')];
        const exitStagger = 24;
        const exitDuration = 650;
        characters.forEach((char, index) => {
            char.style.setProperty('--exit-delay', `${index * exitStagger}ms`);
        });
        element.classList.add('material-greeting-exit');

        materialGreetingTimer = setTimeout(() => {
            greetingIndex = (greetingIndex + 1) % greetings.length;
            animateMaterialGreeting(element, greetings[greetingIndex]);
            materialGreetingTimer = setTimeout(showNextGreeting, greetingDuration());
        }, (characters.length - 1) * exitStagger + exitDuration);
    };

    materialGreetingTimer = setTimeout(showNextGreeting, greetingDuration());
}

function updateTitles(forcedPage) {
    if (forcedPage) currentActivePage = forcedPage;
    
    const currentTheme = localStorage.getItem('theme-pref') || 'material';
    const isHacker = (currentTheme === 'hacker');
    const greeting = pageGreetings[currentActivePage];
    
    const titleElement = document.getElementById(`hero-title-${currentActivePage}`);
    
    
    if (!titleElement) {
        console.warn(`Title element hero-title-${currentActivePage} not found!`);
        return;
    }
    
    if (!greeting) {
        console.warn(`No greeting found for page: ${currentActivePage}`);
        return;
    }

    if (typingTimer) {
        clearInterval(typingTimer);
        typingTimer = null;
    }
    if (materialGreetingTimer) {
        clearTimeout(materialGreetingTimer);
        materialGreetingTimer = null;
    }
    stopAsciiExpressionCycle();
    
    titleElement.innerHTML = "";
    titleElement.classList.remove('material-greeting', 'material-greeting-ready');
    titleElement.classList.add('typing');

    if (isHacker) {
        typeEffect(titleElement, greeting.typed);
    } else if (currentActivePage === 'index') {
        startMaterialGreetingCycle(titleElement);
    } else {
        animateMaterialGreeting(titleElement, greeting.static);
    }
}

let suppressNextClick = false;
let dropdownPointerActive = false;
let dropdownPointerMoved = false;
let dropdownPointerStartX = 0;
let dropdownPointerStartY = 0;
let pointerDownClickable = false;

function toggleDropdown(id, arrowId) {

    if (!id) {
        const dropdown = document.getElementById('projectDropdown');
        const arrow = document.getElementById('arrowIcon');
        if (!dropdown) return;
        
        dropdown.classList.toggle('show');
        if (arrow) arrow.classList.toggle('rotate-180');
        return;
    }
    
    const dropdown = document.getElementById(id);
    const arrow = document.getElementById(arrowId);
    document.querySelectorAll('.dropdown-content').forEach(d => { 
        if (d.id !== id) {
            d.classList.remove('show');
        }
    });
    document.querySelectorAll('nav svg[id$="Arrow"]').forEach(svg => { if (svg.id !== arrowId) svg.classList.remove('rotate-180'); });
    dropdown.classList.toggle('show');
    arrow.classList.toggle('rotate-180');
}

function closeDropdown() {
    const dropdown = document.getElementById('projectDropdown');
    const arrow = document.getElementById('arrowIcon');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
    if (arrow) arrow.classList.remove('rotate-180');
    document.querySelectorAll('.dropdown-content').forEach(d => {
        d.classList.remove('show');
    });
    document.querySelectorAll('nav svg[id$="Arrow"]').forEach(svg => svg.classList.remove('rotate-180'));
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const projectMenu = document.getElementById('mobileProjectsMenu');
    const socialsMenu = document.getElementById('mobileSocialsMenu');
    if (!menu) return;
    
    menu.classList.toggle('show');
    
    if (!menu.classList.contains('show')) {
        if (projectMenu) projectMenu.classList.remove('show');
        if (socialsMenu) socialsMenu.classList.remove('show');
    }
}

function toggleMobileSubmenu(id) {
    const submenu = document.getElementById(id);
    if (!submenu) return;
    const otherId = id === 'mobileProjectsMenu' ? 'mobileSocialsMenu' : 'mobileProjectsMenu';
    const other = document.getElementById(otherId);
    
    submenu.classList.toggle('show');
    
    if (submenu.classList.contains('show') && other) {
        other.classList.remove('show');
    }
}

function closeMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.remove('show');
    document.querySelectorAll('.mobile-submenu.show').forEach(sub => sub.classList.remove('show'));
}

function openProjectAnchor(anchorId) {
    const alreadyOnProjects = document.getElementById('page-projects')?.classList.contains('active');
    switchPage('projects');
    closeDropdown();
    setTimeout(() => {
        const target = document.getElementById(anchorId);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, alreadyOnProjects ? 50 : 1000);
}

function openClickerPage() {
    if (document.getElementById('page-clicker')) {
        document.body.style.opacity = '1';
        document.body.style.removeProperty('transition');
        switchPage('clicker');
        return;
    }

    window.location.href = 'clicker.html';
}

function toggleTheme() {
    const themeLink = document.getElementById('theme-link');
    if (!themeLink) return;

    const currentTheme = localStorage.getItem('theme-pref') || 'material';
    const nextTheme = currentTheme === 'material' ? 'hacker' : 'material';
    const nextHref = nextTheme === 'material' ? './css/material.css' : './css/style.css';

    document.body.classList.add('theme-fade-out');
    closeDropdown();

    setTimeout(() => {
        let transitionDone = false;

        localStorage.setItem('theme-pref', nextTheme);
        applyThemeState(nextTheme);
        updateThemeButtonIcon(nextTheme, true);
        resetIdentityGlow();

        const completeOnce = () => {
            if (transitionDone) return;
            transitionDone = true;
            themeLink.onload = null;
            finishThemeTransition();
            document.body.classList.remove('theme-fade-out');
        };

        themeLink.onload = null;
        themeLink.onload = completeOnce;
        themeLink.href = nextHref;

        setTimeout(() => {
            updateTitles(currentActivePage);
        }, 50);

        setTimeout(completeOnce, 250);
    }, 50);
}

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

document.addEventListener('DOMContentLoaded', () => {
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    
    updateThemeButtonIcon(savedTheme);
    
    revealBody();
    
    setTimeout(() => {
        updateTitles(currentActivePage);
    }, 100);
    
    closeDropdown();
    initMatrix();
});

setInterval(drawMatrix, 50);
window.addEventListener('resize', initMatrix);

window.addEventListener('click', (e) => {
    if (suppressNextClick) {
        suppressNextClick = false;
        const projectBtn = document.getElementById('projectBtn');
        const dropdown = document.getElementById('projectDropdown');
        if ((projectBtn && projectBtn.contains(e.target)) || (dropdown && dropdown.contains(e.target))) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
    }

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

window.addEventListener('pointerdown', (e) => {
    const projectBtn = document.getElementById('projectBtn');
    const dropdown = document.getElementById('projectDropdown');
    dropdownPointerActive = !!(projectBtn && projectBtn.contains(e.target));
    dropdownPointerMoved = false;
    dropdownPointerStartX = e.clientX;
    dropdownPointerStartY = e.clientY;
    pointerDownClickable = !!(projectBtn && projectBtn.contains(e.target));

    if (dropdown && projectBtn && !dropdown.contains(e.target) && !projectBtn.contains(e.target)) {
        closeDropdown();
    }

    const mobileMenu = document.getElementById('mobileMenu');
    const mobileButton = document.getElementById('mobileMenuBtn');
    if (mobileMenu && mobileButton && !mobileMenu.contains(e.target) && !mobileButton.contains(e.target)) {
        mobileMenu.classList.remove('show');
        document.querySelectorAll('.mobile-submenu.show').forEach(sub => sub.classList.remove('show'));
    }
});

window.addEventListener('pointermove', (e) => {
    if (Math.abs(e.clientX - dropdownPointerStartX) > 8 || Math.abs(e.clientY - dropdownPointerStartY) > 8) {
        dropdownPointerMoved = true;
    }
});

window.addEventListener('pointerup', (e) => {
    if (pointerDownClickable && dropdownPointerMoved) {
        suppressNextClick = true;
    }

    const projectBtn = document.getElementById('projectBtn');
    const dropdown = document.getElementById('projectDropdown');
    if (dropdownPointerActive && dropdown && projectBtn && !dropdown.contains(e.target) && !projectBtn.contains(e.target) && dropdownPointerMoved) {
        closeDropdown();
    }
    dropdownPointerActive = false;
    dropdownPointerMoved = false;
    pointerDownClickable = false;
});

window.addEventListener('pointercancel', () => {
    dropdownPointerActive = false;
    dropdownPointerMoved = false;
    pointerDownClickable = false;
    closeDropdown();
});

let redirectTimer = null;

function redirectTo(type) {
    const overlay = document.getElementById('redirect-overlay');
    const text = document.getElementById('redirect-text');
    if (!overlay || !text) return;
    const routes = {
        source: "https://github.com/BlazePixel76/BlazeWebsite",
        instagram: "https://www.instagram.com/blazepixel75/"
    };
    const targetUrl = routes[type] || type;
    const platform = getRedirectPlatform(targetUrl);
    text.textContent = `Redirecting To ${platform}`;
    overlay.classList.remove('hidden');
    clearTimeout(redirectTimer);
    redirectTimer = setTimeout(() => {
        window.location.href = targetUrl;
    }, 1600);
}

function cancelRedirect() {
    const overlay = document.getElementById('redirect-overlay');
    if (!overlay) return;
    clearTimeout(redirectTimer);
    overlay.classList.add('hidden');
}

const closeButton = document.getElementById('redirect-close-btn');
if (closeButton) {
    closeButton.addEventListener('click', cancelRedirect);
}

function getRedirectPlatform(url) {
    try {
        const hostname = new URL(url).hostname.replace(/^www\./i, '').toLowerCase();
        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'YouTube';
        if (hostname.includes('tiktok.com')) return 'TikTok';
        if (hostname.includes('instagram.com')) return 'Instagram';
        if (hostname.includes('github.com')) return 'GitHub';
        if (hostname.includes('x.com') || hostname.includes('twitter.com')) return 'X';
        if (hostname.includes('facebook.com')) return 'Facebook';
        if (hostname.includes('linkedin.com')) return 'LinkedIn';
        if (hostname.includes('pinterest.com')) return 'Pinterest';
        return hostname.replace('.com', '').replace('.net', '').replace('.org', '');
    } catch (error) {
        return 'website';
    }
}

let inputBuffer = "";
window.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('redirect-overlay');
    if (e.key === 'Escape' && overlay && !overlay.classList.contains('hidden')) {
        e.preventDefault();
        cancelRedirect();
        return;
    }

    inputBuffer += e.key.toLowerCase();
    
    if (inputBuffer.length > 10) inputBuffer = inputBuffer.substring(1);

    if (inputBuffer.includes("mine")) {
        openClickerPage();
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

        const themeColor = getComputedStyle(this).color;

        this.style.textShadow = `0 0 ${pekkaClicks * 10}px ${themeColor}`;
        this.style.transform = "scale(0.96)";
        
        setTimeout(() => this.style.transform = "scale(1)", 50);

        if (pekkaClicks === 7) {
            pekkaClicks = 0;
            initiateSystemOverride();
        } else {
            comboTimer = setTimeout(() => {
                if (pekkaClicks === 1) {
                    switchPage('index');
                }
                pekkaClicks = 0;
                this.style.textShadow = `0 0 0px transparent`;
            }, 800);
        }
    });
}

function initiateSystemOverride() {
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.5s ease";
    
    setTimeout(() => {
        openClickerPage();
    }, 500);
}
