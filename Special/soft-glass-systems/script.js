/* Soft-Glass Systems — JS bridge layer (DOM + animations only)
   Heavy processing stays in engine.wasm (C XOR).
*/

const WASM_URL = "./engine.wasm";

const els = {
  timeDubai: document.getElementById("timeDubai"),
  timeSharjah: document.getElementById("timeSharjah"),
  wxDubai: document.getElementById("wxDubai"),
  wxSharjah: document.getElementById("wxSharjah"),
  atmosphereIcon: document.getElementById("atmosphereIcon"),

  vaultInput: document.getElementById("vaultInput"),
  vaultBtn: document.getElementById("vaultBtn"),
  vaultStatus: document.getElementById("vaultStatus"),
  vaultOutputPreview: document.getElementById("vaultOutputPreview"),
  vaultKey: document.getElementById("vaultKey"),

  statusBadge: document.getElementById("statusBadge"),
  statusBadgeText: document.getElementById("statusBadgeText"),

  sigModal: document.getElementById("sigModal"),
  sigLines: document.getElementById("sigLines"),
  sigCloseBtn: document.getElementById("sigCloseBtn"),
};

const state = {
  wasm: null,
  xor_bytes: null,
  memory: null,
  locked: false,
  key: 0x5a,

  // typing animation state
  typingTimer: null,
  isTyping: false,
};

els.vaultKey.textContent = `0x${state.key.toString(16).toUpperCase().padStart(2, "0")}`;

function updateDubaiSharjahClocks() {
  const now = new Date();

  const tz = "Asia/Dubai";
  const dubaiHour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      hour12: false,
    }).format(now)
  );
  const toHMS = (d, timeZone) => {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(d);

    const get = (type) => parts.find((p) => p.type === type)?.value;
    return `${get("hour")}:${get("minute")}:${get("second")}`;
  };

  const hms = toHMS(now, tz);
  if (els.timeDubai) els.timeDubai.textContent = hms;
  if (els.timeSharjah) els.timeSharjah.textContent = hms;
  updateAtmosphereIcon(dubaiHour);

  // Do NOT overwrite weather temp/desc here.
  // Weather fetch updates the DOM after WASM init.
  // (updateDubaiSharjahClocks is only for the clocks.)
}

function getAtmosphereIcon(hour) {
  if (hour >= 5 && hour < 7) return { icon: "🌅", label: "sunrise" };
  if (hour >= 7 && hour < 17) return { icon: "☀️", label: "daytime" };
  if (hour >= 17 && hour < 19) return { icon: "🌇", label: "sunset" };
  if (hour >= 19 && hour < 22) return { icon: "🌙", label: "evening" };
  return { icon: "🌌", label: "night" };
}

function updateAtmosphereIcon(hour) {
  if (!els.atmosphereIcon) return;

  const { icon, label } = getAtmosphereIcon(hour);
  if (els.atmosphereIcon.textContent === icon) return;

  els.atmosphereIcon.textContent = icon;
  els.atmosphereIcon.setAttribute("title", label);
  els.atmosphereIcon.classList.remove("icon-swap");
  void els.atmosphereIcon.offsetWidth;
  els.atmosphereIcon.classList.add("icon-swap");
}

function getWeatherIcon(code) {
  const icons = { 0: '☀️', 1: '🌤️', 2: '🌤️', 3: '☁️', 45: '🌫️', 48: '🌫️', 51: '🌧️', 61: '🌧️', 71: '❄️', 95: '⛈️' };
  return icons[code] || '☁️';
}

function getWeatherDescription(code) {
  const desc = { 0: 'Clear', 1: 'Mostly Clear', 3: 'Overcast', 45: 'Foggy', 61: 'Rainy', 71: 'Snowy', 95: 'Thunderstorm' };
  return desc[code] || 'Cloudy';
}

async function fetchWeatherData(lat, lon, targetTempEl, targetDescEl) {
  try {
    const response = await fetch( 
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
    );

    if (!response.ok) {
      throw new Error(`Weather HTTP ${response.status}`);
    }

    const data = await response.json();

    if (targetTempEl) {
      targetTempEl.textContent = `${Math.round(data.current.temperature_2m)}°`;
    }

    if (targetDescEl) {
      targetDescEl.textContent = getWeatherDescription(data.current.weather_code);
    }
  } catch (e) {
    console.error('Weather API failed', e);

    if (targetTempEl) targetTempEl.textContent = '--°';
    if (targetDescEl) targetDescEl.textContent = '--';
  }
}

// --- WASM loading + bridge ---
async function initWasm() {
  els.vaultStatus.textContent = "WASM: loading…";

  const wasmModule = await (async () => {
    try {
      const res = await fetch(WASM_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await WebAssembly.instantiateStreaming(res, {});
    } catch (e) {
      const buf = await (await fetch(WASM_URL)).arrayBuffer();
      return await WebAssembly.instantiate(buf, {});
    }
  })();

  state.wasm = wasmModule;
  state.memory = wasmModule.instance.exports.memory;
  state.xor_bytes = wasmModule.instance.exports.xor_bytes;

  if (!state.memory || !state.xor_bytes) {
    throw new Error("WASM exports missing: expected memory and xor_bytes");
  }

  els.vaultStatus.textContent = "WASM: ready";
  if (els.statusBadgeText) els.statusBadgeText.textContent = "soft-glass live";
  if (els.statusBadge) els.statusBadge.classList.add("is-live");
}

function utf8ToBytes(str) {
  return new TextEncoder().encode(str);
}

function bytesToUtf8(bytes) {
  try {
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    return null;
  }
}

let heapOffset = 0;
function ensureHeapOffset() {
  if (heapOffset !== 0) return;
  heapOffset = 0x10000;
}

function wasmAlloc(bytesLength) {
  ensureHeapOffset();

  const align = 16;
  const aligned = (heapOffset + (align - 1)) & ~(align - 1);

  const ptr = aligned;
  const end = ptr + bytesLength;

  const pageSize = 65536;
  const neededPages = Math.ceil(end / pageSize);
  const currentPages = state.memory.buffer.byteLength / pageSize;

  if (neededPages > currentPages) {
    const delta = neededPages - currentPages;
    state.memory.grow(delta);
  }

  heapOffset = end;
  return ptr;
}

function xorTransform(inputStr, key) {
  const inputBytes = utf8ToBytes(inputStr);
  const len = inputBytes.length;

  const inPtr = wasmAlloc(len);
  const outPtr = wasmAlloc(len);

  const memU8 = new Uint8Array(state.memory.buffer);
  memU8.set(inputBytes, inPtr);

  state.xor_bytes(inPtr, len, key, outPtr);

  return memU8.slice(outPtr, outPtr + len);
}

function bytesToHex(bytes) {
  const hex = [];
  for (let i = 0; i < bytes.length; i++) hex.push(bytes[i].toString(16).padStart(2, "0"));
  return hex.join("");
}

function setVaultButtonText() {
  els.vaultBtn.textContent = state.locked ? "Unlock" : "Lock";
}

async function handleVaultToggle() {
  if (!state.xor_bytes || !state.memory) {
    els.vaultStatus.textContent = "WASM not ready";
    return;
  }

  // Vault UX: show processing label briefly on Lock.
  // (Only on first press, i.e. when we're about to lock.)
  if (!state.locked) {
    // Phase-3 UX: show a short processing delay before actually locking.
    els.vaultStatus.textContent = "C-Engine: Processing…";

    // Wait ~550ms, then continue with locking logic.
    await new Promise((resolve) => setTimeout(resolve, 550));
  }


  const current = els.vaultInput.value ?? "";


  if (!state.locked) {
    const outBytes = xorTransform(current, state.key);
    els.vaultOutputPreview.textContent = `locked (${outBytes.length} bytes)`;

    const hex = bytesToHex(outBytes);
    els.vaultInput.value = hex;
    state.locked = true;
    setVaultButtonText();
    return;
  }

  const hex = (els.vaultInput.value || "").trim();
  if (!hex || hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) {
    els.vaultStatus.textContent = "Unlock failed: invalid hex";
    return;
  }

  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);

  const len = bytes.length;
  const inPtr = wasmAlloc(len);
  const outPtr = wasmAlloc(len);

  const memU8 = new Uint8Array(state.memory.buffer);
  memU8.set(bytes, inPtr);

  state.xor_bytes(inPtr, len, state.key, outPtr);

  const outBytes = memU8.slice(outPtr, outPtr + len);
  const decoded = bytesToUtf8(outBytes);

  if (decoded == null) {
    els.vaultStatus.textContent = "Unlock produced non-UTF8 text";
    els.vaultOutputPreview.textContent = `unlocked (${outBytes.length} bytes)`;
    els.vaultInput.value = bytesToHex(outBytes);
  } else {
    els.vaultStatus.textContent = "Unlocked";
    els.vaultOutputPreview.textContent = `unlocked text (${decoded.length} chars)`;
    els.vaultInput.value = decoded;
  }

  state.locked = false;
  setVaultButtonText();
}

function openSignatureModal() {
  if (!els.sigModal) return;

  // backdrop focus
  document.body.classList.add("console-active");

  // ensure modal shows (CSS animation handles the rest)
  els.sigModal.classList.remove("closing");
  els.sigModal.classList.add("show");
  els.sigModal.setAttribute("aria-hidden", "false");

  const lines = [
    "$ npm run soft-glass",
    "→ compiling UI…",
    "→ attaching C-engine hook (xor_bytes)…",
    "→ ready to lock / unlock",
    "",
    "BlazePixel // Soft-Glass Systems",
  ];

  // typing effect
  state.isTyping = true;
  els.sigLines.textContent = "";

  let i = 0;
  const step = () => {
    if (!els.sigModal || !els.sigModal.classList.contains("show") || !state.isTyping) return;

    const prefix = lines[i] ?? "";
    els.sigLines.textContent =
      (els.sigLines.textContent ? els.sigLines.textContent + "\n" : "") + prefix;
    i++;

    if (i < lines.length) {
      const delay = i === 1 ? 220 : 140;
      state.typingTimer = setTimeout(step, delay);
    } else {
      state.isTyping = false;
    }
  };

  state.typingTimer = setTimeout(step, 120);
}

function closeSignatureModal() {
  if (!els.sigModal) return;

  // stop typing
  state.isTyping = false;
  if (state.typingTimer) clearTimeout(state.typingTimer);
  state.typingTimer = null;

  // Trigger close animation.
  // CSS listens on `.modal-overlay.closing .modal`.
  els.sigModal.classList.add("closing");
  els.sigModal.classList.remove("show");
  document.body.classList.remove("console-active");

  // Remove after animation ends (CSS: 300ms)
  setTimeout(() => {
    els.sigModal.classList.remove("closing");
    els.sigModal.setAttribute("aria-hidden", "true");
  }, 300);
}

function initCardHoverEffects() {
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canHover || reduceMotion) return;

  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      const tiltY = ((x - 50) / 50) * 4;
      const tiltX = -((y - 50) / 50) * 4;

      card.style.setProperty("--card-shine-x", `${x.toFixed(1)}%`);
      card.style.setProperty("--card-shine-y", `${y.toFixed(1)}%`);
      card.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--card-shine-x", "50%");
      card.style.setProperty("--card-shine-y", "0%");
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
}

// --- Boot ---
initCardHoverEffects();

els.vaultBtn.addEventListener("click", handleVaultToggle);

els.sigCloseBtn && els.sigCloseBtn.addEventListener("click", closeSignatureModal);

// click outside terminal closes (overlay handles this)
els.sigModal &&
  els.sigModal.addEventListener("click", (e) => {
    if (e.target === els.sigModal) closeSignatureModal();
  });

// Cute easter-egg: clicking the status badge opens terminal.
els.statusBadge && els.statusBadge.addEventListener("click", openSignatureModal);

updateDubaiSharjahClocks();
setInterval(updateDubaiSharjahClocks, 1000);

  // Trigger weather fetch AFTER WASM init (as you requested)
initWasm()

  .then(async () => {
    // Use cached coords if later you want; for now hardcode UAE locations for demo UI.
    // (Same as your startpage behavior: it's location-based, but this page needs explicit coords.)
    const dubai = { lat: 25.2048, lon: 55.2708 };
    const sharjah = { lat: 25.3463, lon: 55.4211 };

    console.log('[SoftGlass] fetching weather…');

    // Ensure elements exist
    const wxDubaiDescEl = document.getElementById('wxDubaiDesc');
    const wxSharjahDescEl = document.getElementById('wxSharjahDesc');
    console.log('[SoftGlass] DOM', {
      wxDubai: els.wxDubai,
      wxSharjah: els.wxSharjah,
      wxDubaiDescEl,
      wxSharjahDescEl,
    });

    // Force refresh: fetch both cities + log raw JSON
    const fetchCity = async (cityName, { lat, lon }, tempEl, descEl) => {
      try {
        console.log(`[SoftGlass][${cityName}] fetching…`, { lat, lon });
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
        );

        console.log(`[SoftGlass][${cityName}] HTTP`, response.status);
        const json = await response.json();
        console.log(`[SoftGlass][${cityName}] JSON`, json);

        if (!response.ok) throw new Error(`Weather HTTP ${response.status}`);

        if (tempEl) tempEl.textContent = `${Math.round(json.current.temperature_2m)}°`;
        if (descEl) descEl.textContent = getWeatherDescription(json.current.weather_code);
      } catch (e) {
        console.error(`[SoftGlass][${cityName}] Weather fetch failed`, e);
        if (tempEl) tempEl.textContent = '--°';
        if (descEl) descEl.textContent = '--';
      }
    };

    // Kick both fetches
    await Promise.all([
      fetchCity('Dubai', dubai, els.wxDubai, wxDubaiDescEl),
      fetchCity('Sharjah', sharjah, els.wxSharjah, wxSharjahDescEl),
    ]);

    console.log('[SoftGlass] weather done');
  })
  .catch((e) => {
    console.error(e);
    els.vaultStatus.textContent = "WASM failed to load";
  });

