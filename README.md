# ⚠️ WARNING

This Website May Be Heavy On Some Mobile Devices Because of The CSS Animations So You Will Experience Lag On Some Devices That Are Older!

# BLAZEWEBISTE GUIDE

**This Is A Repo For Hosting Not Nessesarlly To Distrubute But To Host And Souce Code.**
---

## 🔧 Whats Its Purpose
`BlazeWebiste` is a website/repo made with **HTML,CSS,JS** Bascially the Big 3 And Hosted Here In GitHub.  

It Makes it So That People Know About Me Or Learn More About Me And Make It So That They Can Source this Code If They Wanna Build Their Own **Website** With my Souces.

---
## 🤝 Wanna Contribute?
Pull requests are welcome.  
For major changes, please open an issue first to discuss what you’d like to change.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚙ Wanna Create Your Own Firebase Config?
**To Create Your Own Firebase Config You Can Go To This Repo Directory:**
```bash
Tree = /js/configexample.js
```
You Will See Where To Put Your **Firebase Configs Or Credentials**

**Then On Any JS Importing From The Backend Data:**

```bash
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction, onDisconnect } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { firebaseConfig } from "(Example Directory)/config.js"; <----Replace It With correct Directory@ 
```
**Then Build The Initalization:**

```bash
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const pixelRef = ref(db, 'global_pixel_total');

document.addEventListener('DOMContentLoaded', () => {
    const pixelCounter = document.getElementById('pixel-count');
    const mineCore = document.getElementById('mine-core');
    const activityLog = document.getElementById('activity-log');
    const liveNodesIndicator = document.querySelector('[class*="text-[#10b981]"]')?.parentElement;
```
Then The Whatever The Front End Will Show Like Odometer Displaying the Server Side Integer More Can Be Found In The **clicker.js** in **/js/clicker.js**

---

**V2.0.0 KALEIDO** | SPA Introduction

**Major release with architectural changes:**
- Consolidated all 5 pages into single index.html SPA
- Smooth page transition animations
- Adaptive theme-aware scrollbar
- Mobile menu & dropdown animations
- Removed deprecated individual page files (socials.html, projects.html, about.html)

---

**V2.0.1 KALEIDO** | Minor Addon & Start Page Tweaks And enhancments

**What's New?**

**Project Addition**
- Addition Of Start Page In Project
- Overall Overhaul Of Start Page 
- Changes And Display Res Tweaks To Start Page
- Offline Capable With Cache Integration (Reminder: Dont Reload The Page!) **<--- Mostly This one is Startpage.html And NOT The Main**

#### Minor Tweaks And Fixes
---

## V2.1.0 KALEIDO | Minor Tweaks & Fixes

### What's Fixed?
* **Theme Leakage:** Fixed a bug where the "Hacker" theme colors would leak or fail to update properly on the Material UI, specifically within the **About** section.
* **Project Hover Visuals:** Tweaked the project card hover box effects. Reduced the intensity of the purple overlay which was previously too bright.
* **Social Links Dynamics:** Updated the social link cards so each platform now utilizes its own unique, brand-specific accent color on hover.

### Codebase & Under-the-Hood
* **Comment Stripping:** Began removing comments across multiple project files to deliver a cleaner, production-ready codebase. *Note: Navigation might be slightly harder in source, but the final footprint is much tidier.*

### Known Issues
* **Project Dropdowns:** The dropdown menu behavior when hovering over project items is currently broken. A fix is planned for an upcoming patch.
---

## V2.1.1 KALEIDO | Interaction & Pipeline Fixes

### What's Fixed?
* **Dropdown & Hover Overhauls**: Fully patched the project dropdown menu behavior when hovering over project items, which was previously listed as a known bug. 
* **Testing Input Lockups**: Resolved an edge-case thread lock encountered during development testing where drag-clicking over navigation links and Material 3 elements would intercept browser inputs. Decoupled layout transforms during active mouse-down states using `:not(:active)` selectors to ensure smooth local debugging.
* **Global Text-Selection Safeguards**: Implemented strict `user-select: none;` boundaries across the navigation structure to prevent accidental text-highlight dragging from hijacking layout states.
* **Hacker Theme 2nd Button Click color fix**: Fixed Where The Material Color When Clicking the 2nd button on main section on Hacker Theme is purple now its white and fixed.

  #### More Updates Coming Soon ;)
---

## V2.1.2 KALEIDO | Updates And Additions

### What's Added / Redesigned
* **The Redirect Redesign**: Redesigned The Redirect To Have A OneUI Style Loader And A Bubble Like Loading Screen Instead of a full black lockscreen.
* **Addition Of Social Card**: Added My Tiktok Card For Better Finding Or Wanting To Find My Profile
* **Some Glow Fixes On Cards**: Fixed Glow On Cards That Were glowing differently beforehand.

  #### More Updates Coming Soon ;)
---

## V2.6.0 KALEIDO | Website Polish & Visual Overhaul
### What's Added / Redesigned
* **Dynamic Terminal Expression Cycler**: Integrated a lightweight JavaScript ticker paired with smooth CSS opacity transitions to dynamically cycle through expressive ASCII kaomojis ((•‿•), (^_-), (⌐■_■)) right inside the main header.
* **Multi-Colored Blaze_Pixel Wordmark**: Upgraded the navigation header logo from plain text to the stylistic, multi-colored brand wordmark.
* **Fluid Mesh Gradient Overhaul**: Shifted the ambient background from warm tones to a cooler, deeper electric teal and vibrant purple fluid mesh aligned with the Material Expressive UI design language.
* **Font Changes**: Notice the "Hello There" Or Maybe The Nav Bar font being different? Well We Used `Google Sans Rounded` To Make it more appealing and intuitive.

### What's Optimized / Cleaned
* **Streamlined Fastfetch Readout**: Updated the terminal block OS configuration to OneUI 8.5 / Android 16 (QPR2) and completely pruned verbose, unused kernel version strings to maximize terminal legibility.
* **Development Grid Curation**: Cleaned up the portfolio matrix by removing unreleased drafts (such as the AOD Wallpaper Enabler) and fully standardizing "Developments" and "Contacts" nomenclature across all navigation menus.
* **Card Border & Glow Standardization**: Fixed inconsistent container shadows and border highlights across cards, ensuring uniform glassmorphic presentation throughout the UI.

  ### More Updates Coming Soon ;)
---
**© 2026 BlazePixel - All rights reserved**
