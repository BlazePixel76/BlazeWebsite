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

let currentActivePage = 'index';
let typingTimer = null;

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
    
    console.log('typeEffect called with html:', html);
    
    if (typingTimer) clearInterval(typingTimer);
    
    element.innerHTML = "";
    element.textContent = "";
    element.classList.add('typing');
    
    console.log('Element cleared, ready to type');
    
    if (html.includes('<span')) {
        console.log('Detected span HTML, processing...');
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
        console.log('spanHTML:', spanHTML);
        console.log('textContent to type:', textContent);
        
        element.innerHTML = spanHTML;
        console.log('Spans inserted, now typing:', textContent);
        
        if (textContent.length > 0) {
            let i = 0;
            typingTimer = setInterval(() => {
                if (i < textContent.length) {
                    element.append(textContent.charAt(i));
                    i++;
                } else {
                    clearInterval(typingTimer);
                    typingTimer = null;
                    console.log('Typing complete!');
                }
            }, speed);
        } else {
            console.log('No additional text to type');
        }
        return;
    }

    // Standard typing for Material (or fallback)
    console.log('Standard typing mode');
    let i = 0;
    typingTimer = setInterval(() => {
        if (i < html.length) {
            element.append(html.charAt(i));
            i++;
        } else {
            clearInterval(typingTimer);
            typingTimer = null;
            console.log('Typing complete!');
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
    element.classList.remove('typing');
    element.classList.remove('material-greeting-ready');
    element.classList.add('material-greeting');
    element.innerHTML = '';

    [...text].forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'material-greeting-char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.setProperty('--char-delay', `${index * 38}ms`);
        element.appendChild(span);
    });

    requestAnimationFrame(() => {
        element.classList.add('material-greeting-ready');
    });
}

function updateTitles(forcedPage) {
    if (forcedPage) currentActivePage = forcedPage;
    
    const currentTheme = localStorage.getItem('theme-pref') || 'hacker';
    const isHacker = (currentTheme === 'hacker');
    const greeting = pageGreetings[currentActivePage];
    
    const titleElement = document.getElementById(`hero-title-${currentActivePage}`);
    
    console.log(`updateTitles called: page=${currentActivePage}, theme=${currentTheme}, element=${titleElement ? 'FOUND' : 'NOT FOUND'}`);
    
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
    
    titleElement.innerHTML = "";
    titleElement.classList.remove('material-greeting', 'material-greeting-ready');
    titleElement.classList.add('typing');

    if (isHacker) {
        console.log('Applying hacker theme typing:', greeting.typed);
        typeEffect(titleElement, greeting.typed);
    } else {
        console.log('Applying material theme animated:', greeting.static);
        animateMaterialGreeting(titleElement, greeting.static);
    }
}

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
    
    document.body.classList.add('theme-fade-out');
    closeDropdown();

    setTimeout(() => {
        const switchToMaterial = themeLink.href.includes('style.css');
        const nextTheme = switchToMaterial ? 'material' : 'hacker';
        const nextHref = switchToMaterial ? './css/material.css' : './css/style.css';
        let transitionDone = false;

        localStorage.setItem('theme-pref', nextTheme);
        applyThemeState(nextTheme);
        updateThemeButtonIcon(nextTheme, true);
        resetIdentityGlow();

        const completeOnce = () => {
            if (transitionDone) return;
            transitionDone = true;
            finishThemeTransition();
        };

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
    const savedTheme = localStorage.getItem('theme-pref') || 'hacker';
    const themeLink = document.getElementById('theme-link');
    
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    
    applyThemeState(savedTheme);
    updateThemeButtonIcon(savedTheme);
    
    if (savedTheme === 'material') {
        themeLink.href = "./css/material.css";
    } else {
        themeLink.href = "./css/style.css";
    }
    
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
    
    if (inputBuffer.length > 10) inputBuffer = inputBuffer.substring(1);

    if (inputBuffer.includes("mine")) {
        console.log("ACCESS_GRANTED: Redirecting to Mining Node...");
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
                    switchPage('index');
                }
                pekkaClicks = 0;
                this.style.textShadow = `0 0 0px transparent`;
            }, 800);
        }
    });
}

function initiateSystemOverride() {
    console.log("SYSTEM_OVERRIDE_INITIATED");
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.5s ease";
    
    setTimeout(() => {
        openClickerPage();
    }, 500);
}