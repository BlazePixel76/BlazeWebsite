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

**© 2026 BlazePixel - All rights reserved**
