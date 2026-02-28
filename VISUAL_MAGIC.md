# 🎨 ARES-X — Visual Magic: The Complete Technical Breakdown

> Every animation, every trick, every pixel-perfect detail —
> explained in full: **what** it is, **how** it works, **what** technology powers it,
> **what** the professional term is, and **how** it looks on screen.

---

## Table of Contents

| # | Feature | Tech |
|---|---------|------|
| 1 | [Boot Sequence — CRT Startup](#1-boot-sequence--crt-startup) | Framer Motion, setInterval |
| 2 | [Realistic Mars Globe — CSS-Only 3D Planet](#2-realistic-mars-globe--css-only-3d-planet) | CSS Gradients, GSAP ScrollTrigger |
| 3 | [Kinetic Title — Exploding Typography](#3-kinetic-title--exploding-typography) | GSAP per-letter animation |
| 4 | [Magnetic Buttons — Cursor-Following UI](#4-magnetic-buttons--cursor-following-ui) | Framer Motion springs |
| 5 | [Star Field — Canvas Parallax Night Sky](#5-star-field--canvas-parallax-night-sky) | Canvas 2D, rAF |
| 6 | [Nebula Background — CSS Gas Clouds](#6-nebula-background--css-gas-clouds) | CSS keyframes, gradients |
| 7 | [Scanline Overlay — CRT Monitor Effect](#7-scanline-overlay--crt-monitor-effect) | CSS repeating-gradient, Framer Motion |
| 8 | [Solar Flythrough — Scroll-Pinned Space Journey](#8-solar-flythrough--scroll-pinned-space-journey) | GSAP ScrollTrigger pin+scrub |
| 9 | [ARES-7 Ship SVG — Animated Spacecraft](#9-ares-7-ship-svg--animated-spacecraft) | Inline SVG, SMIL |
| 10 | [Custom Cursor — Tactical HUD Reticle](#10-custom-cursor--tactical-hud-reticle) | Framer Motion, SVG |
| 11 | [Glitch Text — Cyberpunk Hover Effect](#11-glitch-text--cyberpunk-hover-effect) | CSS pseudo-elements, keyframes |
| 12 | [Scroll Progress Bar — Gradient Fire Track](#12-scroll-progress-bar--gradient-fire-track) | Framer Motion spring |
| 13 | [Launch Shake — Screen Rumble](#13-launch-shake--screen-rumble) | GSAP ScrollTrigger, CSS keyframes |
| 14 | [Reveal Text — Word-by-Word Fade](#14-reveal-text--word-by-word-fade) | GSAP ScrollTrigger, stagger |
| 15 | [Animated Counters — Rolling Numbers](#15-animated-counters--rolling-numbers) | rAF, easeOutExpo |
| 16 | [Launch Countdown — Flip-Clock Timer](#16-launch-countdown--flip-clock-timer) | Framer Motion AnimatePresence |
| 17 | [Trajectory Map — SVG Hohmann Transfer](#17-trajectory-map--svg-hohmann-transfer) | SVG animateMotion, Framer Motion |
| 18 | [Dust Storm — Environmental Event System](#18-dust-storm--environmental-event-system) | SVG feTurbulence, CSS, Framer Motion |
| 19 | [Copy Coordinates — Data Stream Particle Implosion](#19-copy-coordinates--data-stream-particle-implosion) | Framer Motion particles |
| 20 | [Incoming Transmission — Surprise Notification](#20-incoming-transmission--surprise-notification) | Typing effect, sessionStorage |
| 21 | [Window to Mars — Interactive Porthole](#21-window-to-mars--interactive-porthole-with-canvas-landscape) | Canvas 2D, parallax |
| 22 | [Page Transitions — Blur/Scale Morph](#22-page-transitions--blurscale-morph) | Framer Motion AnimatePresence |
| 23 | [Asteroid Game — Canvas Mini-Game](#23-asteroid-game--canvas-mini-game) | Canvas 2D, game loop |
| 24 | [Mars Gallery — Cinematic Carousel](#24-mars-gallery--cinematic-carousel-lightbox) | Framer Motion, keyboard/touch |
| 25 | [Landing Simulator — 6-Phase Scroll Descent](#25-landing-simulator--6-phase-scroll-descent) | GSAP ScrollTrigger, procedural SVG |
| 26 | [Oura Ring — SVG Rotating Halo](#26-oura-ring--svg-rotating-halo) | SVG dasharray, Framer Motion |
| 27 | [Mars Clock — Real-Time Sol Calculator](#27-mars-clock--real-time-sol-calculator-with-gears) | Mars time math, SVG gears |
| 28 | [Geological Scale — Mountain Comparisons](#28-geological-scale--animated-mountain-comparisons) | GSAP, SVG silhouettes |
| 29 | [Mars Weight Calculator — Tilting Scale](#29-mars-weight-calculator--tilting-scale-animation) | GSAP, confetti particles |
| 30 | [Telemetry Bar — Live Data Strip](#30-telemetry-bar--live-data-strip) | setInterval, sine-wave data |
| 31 | [Space Audio — Procedural Soundscape](#31-space-audio--procedural-web-audio-soundscape) | Web Audio API synthesis |
| 32 | [Soundscape Engine — Interactive Sound Design](#32-soundscape-engine--interactive-sound-design) | Web Audio API, MutationObserver |
| 33 | [Boarding Pass — Personal Mission Credential](#33-boarding-pass--personal-mission-credential) | localStorage, Framer Motion |
| 34 | [Command Terminal — CLI + Theme Engine](#34-command-terminal--in-app-cli-with-theme-engine) | CSS custom properties |
| 35 | [Command Palette — Spotlight Search](#35-command-palette--spotlight-search) | Fuzzy search, keyboard nav |
| 36 | [Crew Chat — AI Conversation System](#36-crew-chat--ai-conversation-system) | Groq LLM / offline keyword matching |
| 37 | [Achievement System — Gamification](#37-achievement-system--gamification-layer) | React Context, localStorage |
| 38 | [Mission Complete — Confetti Ceremony](#38-mission-complete--confetti-ceremony) | Canvas confetti, Framer Motion |
| 39 | [Mission Log — Auto-Recorded Timeline](#39-mission-log--auto-recorded-timeline) | React Context, localStorage |
| 40 | [Discovery Hints — Progressive Nudges](#40-discovery-hints--progressive-feature-nudges) | Timed reveal, localStorage |
| 41 | [Mobile Action Hub — Radial FAB Menu](#41-mobile-action-hub--radial-fab-menu) | Framer Motion, lazy loading |
| 42 | [Battery Saver Mode — Performance Throttling](#42-battery-saver-mode--performance-throttling) | React Context, Battery API |
| 43 | [Cinema Mode — Distraction-Free View](#43-cinema-mode--distraction-free-view) | React Context, CSS class |
| 44 | [Dynamic Favicon — Route-Based Tab Icons](#44-dynamic-favicon--route-based-tab-icons) | SVG emoji favicon |
| 45 | [Tab-Away Detection — "Come Back, Commander!"](#45-tab-away-detection--come-back-commander) | Page Visibility API |
| 46 | [Konami Code — Hidden Easter Egg](#46-konami-code--hidden-easter-egg) | Keyboard sequence detection |
| 47 | [Terraformed Mars — Double-Click Easter Egg](#47-terraformed-mars--double-click-easter-egg) | CSS hue-rotate filter |

---

## 1. Boot Sequence — CRT Startup

| | |
|---|---|
| **File** | `src/components/BootSequence.tsx` |
| **Professional term** | Typewriter / Intro Sequence / Splash Screen |
| **Technology** | `setInterval` typing, Framer Motion `AnimatePresence`, `sessionStorage` |

### What it is
A full-screen spacecraft computer startup animation that plays **once per browser session**.

### How it looks
Black screen → blinking cursor → green "OK" status lines type out one by one → ASCII-style loading bar fills → "ALL SYSTEMS NOMINAL" flashes → the overlay **shrinks away** to reveal the site beneath, like a camera pulling back.

### How it works
1. **Phase `boot`** — 14 terminal lines type out character-by-character (`setInterval` at 15ms/char). Each line has a preset delay (0–3300ms stagger).
2. **Phase `progress`** — A progress bar advances 2–6% per 40ms tick for organic acceleration feel.
3. **Phase `reveal`** — Framer Motion scales the overlay down with blur: `scale: 1 → 0.95`, `filter: blur → 0px`, revealing the page.
4. **Phase `done`** — Overlay unmounts. Calls `ScrollTrigger.refresh()` because during boot the page was `position: fixed` (giving GSAP wrong layout measurements).

### Key detail
`sessionStorage.getItem('ares-x-booted')` — returns visitors skip straight to `done` phase on first render (no flash of boot screen).

---

## 2. Realistic Mars Globe — CSS-Only 3D Planet

| | |
|---|---|
| **File** | `src/components/RealisticMars.tsx` |
| **Professional term** | CSS Sphere Illusion / Faux-3D Globe / Texture Mapping |
| **Technology** | CSS `@keyframes`, `radial-gradient` stacking, GSAP ScrollTrigger |

### What it is
A photorealistic rotating Mars sphere built **entirely with CSS** — no WebGL, no Three.js, no Canvas. A real Mars texture scrolls horizontally inside a circular clip.

### How it looks
900px sphere slowly rotating (80s per revolution). Atmospheric orange glow around edges, specular sun highlight upper-left, shadow terminator on the right, soft ground shadow below. On scroll, it scales up 1.6× and fades out.

### How it works

**Rotation:**
```css
@keyframes mars-rotate {
  from { background-position-x: 0; }
  to   { background-position-x: -300%; }
}
```
The texture image is `background-size: 300% 100%` and `repeat-x`. Scrolling `-300%` over 80s creates seamless planetary rotation.

**3D Illusion — 5 stacked overlay divs:**

| Layer | Purpose | CSS technique |
|-------|---------|---------------|
| 1. Terminator | Right-side shadow | `linear-gradient(100deg, transparent → rgba(0,0,0,0.95))` |
| 2. Specular | Sun highlight (upper-left) | `radial-gradient(ellipse 50% 45% at 32% 28%, rgba(255,220,180,0.15)…)` |
| 3. Limb darkening | Edge-of-sphere falloff | `radial-gradient(circle at 42% 48%, transparent 38% → black 100%)` |
| 4. Atmosphere rim | Inner orange glow | `radial-gradient(circle at 42% 48%, transparent 45% → rgba(255,60,10,0.1)…)` |
| 5. Fresnel edge | Bright rim highlight | `border: 1px solid rgba(255,120,60,0.08)` + `box-shadow: inset` |

**Outer atmosphere:** Two additional divs at `-15%` and `-30%` inset with soft `radial-gradient` + `blur(8px)` and `blur(30px)`.

**Scroll parallax:** GSAP timeline with `scrub: 1.5`:
- 0–55%: `scale: 1 → 1.6, rotation: 0 → 10°, yPercent: 0 → -12`
- 55–100%: `opacity: 1 → 0, scale → 1.9`
- Globe is `position: fixed` at viewport center.

**Easter egg:** Double-click → `hue-rotate(95deg) saturate(1.6) brightness(1.15)` on texture → turns Mars green/blue ("Terraformed Mars, Year 2340").

---

## 3. Kinetic Title — Exploding Typography

| | |
|---|---|
| **File** | `src/components/KineticTitle.tsx` |
| **Professional term** | Kinetic Typography / Letter Scatter Animation |
| **Technology** | GSAP `gsap.to()` per element, `elastic.out` easing |

### What it is
The hero H1 "HUMANITY'S NEXT FRONTIER" where **every letter is its own `<span>`**. On hover, they all **explode outward** from the cursor, then **snap back** with a bouncy spring.

### How it looks
Hover the title → letters blast outward like a shockwave → hang for a heartbeat → regroup with satisfying elastic bounce. "FRONTIER" glows in per-letter fire gradient.

### How it works

**Scatter phase** (`onMouseEnter`):
- For each letter, compute direction vector from cursor to letter center
- `dx = (elCx - cursorX) / distance * rand(50,120) + rand(-30,30)`
- `gsap.to(el, { x: dx, y: dy, rotation: rand(-35,35), scale: rand(0.6,0.9), opacity: rand(0.4,0.8), duration: 0.45, ease: 'expo.out' })`

**Regroup phase** (0.12s after scatter):
- `gsap.to(el, { x:0, y:0, rotation:0, scale:1, opacity:1, duration: 0.9, ease: 'elastic.out(1, 0.4)' })` with 0.018s stagger

**Per-letter gradient** for "FRONTIER":
- `lerpColor(t)` interpolates `#FF4500 → #ff6b35 → #FF4500` based on letter index ratio
- Each letter gets `filter: drop-shadow(0 0 18px rgba(255,69,0,0.3))`

---

## 4. Magnetic Buttons — Cursor-Following UI

| | |
|---|---|
| **File** | `src/components/MagneticButton.tsx` |
| **Professional term** | Magnetic UI / Cursor-Tracking Button |
| **Technology** | Framer Motion `useMotionValue` + `useSpring` |

### What it is
Buttons that **physically pull toward** the mouse cursor with spring physics. The text inside moves even more aggressively, creating a layered magnetic effect.

### How it works
**Two spring layers:**
- **Button body:** moves `35%` of cursor-to-center distance. Spring: `{ damping: 15, stiffness: 150, mass: 0.5 }`
- **Text content:** moves `60%` of distance. Spring: `{ damping: 12, stiffness: 120, mass: 0.3 }`

On `mousemove`: `dx = (mouseX - buttonCenterX) * strength`  
On `mouseleave`: both springs snap to `(0, 0)`  
On click: `whileTap={{ scale: 0.95 }}`  
Glow: animated `box-shadow: 0 0 40px rgba(255,69,0,0.25)` on hover.

---

## 5. Star Field — Canvas Parallax Night Sky

| | |
|---|---|
| **File** | `src/components/StarField.tsx` |
| **Professional term** | Parallax Star Field / Canvas Particle System |
| **Technology** | HTML5 Canvas 2D, `requestAnimationFrame`, scroll/mouse parallax |

### What it is
A full-viewport `<canvas>` rendering hundreds of stars in **3 depth layers** with parallax response to scroll + mouse, plus occasional **shooting stars**.

### How it looks
Tiny twinkling dots across the background. Moving mouse shifts them — far stars barely move, near stars shift dramatically. Every 5–12 seconds a shooting star streaks across with an orange-to-white gradient tail and a glowing head.

### How it works

**3-layer parallax:**

| Layer | Stars | Scroll drift | Mouse drift | Size mult | Alpha mult |
|-------|-------|-------------|-------------|-----------|------------|
| 0 (far) | 40% | 0.02 | 8px | ×0.6 | ×0.25 |
| 1 (mid) | 25% | 0.06 | 28px | ×1.0 | ×0.45 |
| 2 (near) | 35% | 0.14 | 60px | ×1.8 | ×0.70 |

**Star rendering per frame:**
1. Clear canvas
2. Smooth-lerp mouse position (`MOUSE_LERP = 0.06`)
3. For each star: compute scroll offset + mouse offset → viewport-relative Y → viewport culling → flicker via `sin(t * pulse + x) * 0.3 + 0.7`
4. Big stars (>1.8px): radial gradient glow halo
5. All stars: solid core dot
6. Layer 2 + >2.2px + desktop: cross-flare (4 thin lines)

**Shooting stars:**
- Spawn check: `currentTime - lastShoot > 5000 + random * 7000`
- Angle: π/5 ± 0.5, speed: 14–22
- Drawn as: linear gradient stroke (white→orange→transparent) + radial head glow
- Life decays at 0.009/frame

**Performance:** DPR capped at 1 mobile / 1.5 desktop. Max 100 stars mobile / 250 desktop. Battery saver: every 3rd frame only.

---

## 6. Nebula Background — CSS Gas Clouds

| | |
|---|---|
| **File** | `src/components/NebulaBackground.tsx` |
| **Professional term** | CSS-Only Nebula / Gradient Animation / Ambient Background |
| **Technology** | CSS `radial-gradient`, `conic-gradient`, `@keyframes`, `filter: blur(40px)` |

### What it is
6 layered CSS gradient clouds that pulse, drift, and breathe at different speeds — pure CSS, no images.

### The 6 cloud layers

| Cloud | Colour | Size | Animation cycle | Special |
|-------|--------|------|----------------|---------|
| Core | Mars red / magenta | 70vw×60vh | 28s pulse | — |
| Teal | Cyan / blue | 55vw×50vh | 34s pulse | 15° rotation |
| Purple | Deep purple | 65vw×55vh | 38s pulse | -8° rotation |
| Ember | Orange glow | 50vw×50vh | 25s pulse | — |
| Swirl | Conic rainbow | 80vw×80vh | 120s full rotation | `mix-blend-mode: screen` |
| Filament | Blue | 50vw×70vh | 42s pulse (reverse) | 5° rotation |

All clouds: `filter: blur(40px)`, `will-change: transform, opacity`, only `transform` + `opacity` animated (GPU-composited).

---

## 7. Scanline Overlay — CRT Monitor Effect

| | |
|---|---|
| **File** | `src/components/ScanlineOverlay.tsx` |
| **Professional term** | CRT Scanline Overlay / Electron Gun Sweep |
| **Technology** | CSS `repeating-linear-gradient`, Framer Motion |

### What it is
Full-viewport overlay simulating a CRT television: repeating 1px horizontal lines + animated "refresh sweep" crawling top→bottom.

### 3 layers
1. **Static scanlines:** `repeating-linear-gradient(to bottom, rgba(0,0,0,0.06) 0px 1px, transparent 1px 3px)` + `mix-blend-mode: multiply`
2. **Phosphor glow:** Same but white at 1.2% opacity + `mix-blend-mode: screen`
3. **Refresh sweep:** 120px tall gradient bar, Framer Motion animates `top: -120px → 100vh` over 6s with `expo-in-out` easing, infinite loop with 1.5s delay

Always `z-index: 9999`, `pointer-events: none`. Battery Saver disables sweep.

---

## 8. Solar Flythrough — Scroll-Pinned Space Journey

| | |
|---|---|
| **File** | `src/components/SolarFlythrough.tsx` |
| **Professional term** | Scroll-Driven Animation / Pinned Scrub / Parallax Cinematic |
| **Technology** | GSAP ScrollTrigger `pin: true` + `scrub: 1`, ~40 timeline tweens, SVG `animateMotion` |

### What it is
A full-screen cinematic scroll experience: fly from deep space → past Earth → ARES-7 launch → transit → Mars arrival. The section **pins** to the viewport and 6 phases unfold across **500% of viewport height**.

### The 6 phases (timeline offsets)

| Phase | Range | What happens |
|-------|-------|--------------|
| 1. Deep Space | 0–15% | Stars parallax, sun appears and recedes |
| 2. Earth | 15–35% | Earth grows from dot to full planet, moon orbits |
| 3. Launch | 32–48% | Ship appears, engine flare intensifies, accelerates away |
| 4. Transit | 48–72% | Ship cruises, trajectory line draws, speed lines appear |
| 5. Mars Arrival | 70–95% | Ship decelerates, Mars grows, ship enters orbit |
| 6. Fade | 95–100% | Everything fades to black for clean section transition |

### Key technical details

**3-layer star parallax:** `xPercent: -8 / -15 / -25`, `yPercent: -5 / -10 / -18`

**Planets:** CSS `radial-gradient` spheres with specular highlight, limb darkening, terminator shadow, atmosphere rim — same technique as the main Mars globe but simpler.

**Trajectory line (triple-layer):**
1. Wide glow: 12px stroke, `feGaussianBlur(4)`, dashed
2. Main line: 1.8px, `linearGradient` blue→purple→orange, dashed
3. Inner core: 0.5px white at 20% opacity

All 3 animated via `strokeDashoffset: 2000 → 0`.

**5 waypoint particles:** SVG `<animateMotion path="..." dur="6s" repeatCount="indefinite">` — dots follow the exact Bézier curve.

**Live HUD:** `tl.eventCallback('onUpdate')` reads `tl.progress()` and computes velocity (sine-wave 0–40,000 km/h) and distance (linear 0–54.6M km).

---

## 9. ARES-7 Ship SVG — Animated Spacecraft

| | |
|---|---|
| **File** | `src/components/AresShipSVG.tsx` |
| **Professional term** | Inline SVG Illustration / SMIL Animation |
| **Technology** | Hand-drawn SVG (~100 elements), SMIL `<animate>` tags |

### What it is
A detailed interplanetary spacecraft SVG with animated subsystems — all animation via browser-native SMIL, zero JavaScript.

### Ship components

| Component | Technique |
|-----------|----------|
| **Hull** | `<path>` with `linearGradient` (titanium: #d8dce6 → #4a5568), panel detail lines |
| **Cockpit** | Cyan glass gradient + SVG `<filter id="glow">` (feGaussianBlur + feMerge) |
| **Engine nacelles** | Dual rectangles with metal gradient, engine bell `<path>`, inner glow |
| **Plasma exhaust** | `<ellipse>` with `radialGradient` (white→orange→transparent), 2 layers/engine |
| **Exhaust turbulence** | SMIL `<animate attributeName="rx" values="28;36;28" dur="0.15s" repeatCount="indefinite">` |
| **Mach diamonds** | 3 pairs of `<circle>` with opacity flicker — shock patterns in exhaust |
| **Reactor cores** | Pulsing circles: `<animate attributeName="opacity" values="0.2;0.5;0.2" dur="0.8s">` |
| **Nav beacons** | Red dots on fin tips: alternating 1.2s blink with 0.6s offset |
| **Radiator panels** | Blue `linearGradient` rectangles with cell divider lines |
| **Antenna** | Yellow pulsing dot at mast top (2s cycle) |
| **RCS pods** | Cyan dots with slow 3s blink |
| **Docking port** | Concentric circles |
| **Hull designation** | `<text>` "ARES-7" at 6% opacity |

`thrust` prop controls exhaust opacity, scale, bell glow, and drop-shadow intensity.

---

## 10. Custom Cursor — Tactical HUD Reticle

| | |
|---|---|
| **File** | `src/components/CustomCursor.tsx` |
| **Professional term** | Custom Cursor / HUD Reticle / Cursor Replacement |
| **Technology** | Framer Motion springs, SVG, `MutationObserver`, `requestAnimationFrame` |

### 3 cursor modes

| Mode | Look | Trigger |
|------|------|---------|
| **Default** | Military crosshair: center dot, cardinal lines with ticks, rotating segmented outer ring, counter-rotating inner ring, live X,Y coordinates | Normal movement |
| **Hover** | Square-bracket `[ ]` target lock corners, pulsing Mars-red corner pips, breathing glow ring, "LOCK" label | Over `a`, `button`, `[role=button]`, `input` |
| **Click** | Impact flash: contracting circle, compressed brackets, white center dot pulse | Mousedown |

### Technical highlights
- System cursor hidden: `document.documentElement.style.cursor = 'none'`
- Spring tracking: `{ damping: 28, stiffness: 450, mass: 0.4 }` — nearly zero lag
- Rotating ring: `requestAnimationFrame` increments angle by 0.15°/frame, `<g transform={rotate}>`
- Hover brackets: Framer Motion `pathLength: 0→1` with staggered delays (0, 30, 60, 90ms)
- Coordinate readout: `String(x).padStart(4, '0')` — always 4 digits
- `MutationObserver` on `<body>` re-scans for interactive elements on DOM changes
- `mix-blend-mode: difference` for visibility on any background
- Touch devices: returns `null`

---

## 11. Glitch Text — Cyberpunk Hover Effect

| | |
|---|---|
| **File** | `src/components/GlitchText.tsx` |
| **Professional term** | RGB Split / Glitch Text / Chromatic Aberration |
| **Technology** | CSS `::before`/`::after` pseudo-elements, `clip-path`, `@keyframes` |

### How it works
- `::before` = cyan copy (#00e5ff), `::after` = red copy (#ff2040)
- Both use `content: attr(data-text)` to duplicate the text
- On `:hover`: both fade to `opacity: 0.75/0.65` and run jitter keyframes at **0.2s** with `steps(2, jump-none)`
- Each keyframe step sets random `transform: translate(±2px, ±1px)` AND `clip-path: inset(random% 0 random% 0)` — the clip creates the "torn scanline" look
- `.glitch-icon:hover svg` adds position jitter to Lucide icons
- Respects `prefers-reduced-motion`

---

## 12. Scroll Progress Bar — Gradient Fire Track

| | |
|---|---|
| **File** | `src/components/ScrollProgress.tsx` |
| **Professional term** | Scroll Progress Indicator |
| **Technology** | Framer Motion `useMotionValue` + `useSpring` |

2px fixed bar at top of viewport. `scaleX` driven by `scrollTop / (docHeight - viewportHeight)` smoothed through `useSpring({ stiffness: 100, damping: 30 })`. Gradient: `primary → accent → primary`. Glow: `box-shadow: 0 0 12px rgba(255,69,0,0.4)`.

---

## 13. Launch Shake — Screen Rumble

| | |
|---|---|
| **File** | `src/components/LaunchShake.tsx` |
| **Professional term** | Screen Shake / Camera Shake / Haptic Feedback |
| **Technology** | GSAP ScrollTrigger (trigger), CSS `@keyframes` (shake) |

Fires **once** when scrolling past the hero section. 14-step `launch-rumble` keyframe over 0.6s: `translate(±5px, ±3px) rotate(±0.5deg)` with decaying amplitude. `cubic-bezier(0.36, 0.07, 0.19, 0.97)` for abrupt start, soft end. Simultaneous orange radial-gradient flash at bottom.

---

## 14. Reveal Text — Word-by-Word Fade

| | |
|---|---|
| **File** | `src/components/RevealText.tsx` |
| **Professional term** | Staggered Reveal / ScrollTrigger Word Animation |
| **Technology** | GSAP ScrollTrigger + stagger |

Text split into `<span>` per word. Initial: `opacity: 0, y: 12px`. On viewport entry (once): `gsap.to(wordEls, { opacity: 1, y: 0, duration: 0.5, stagger: 0.045, ease: 'expo.out' })`. Creates a cascading left-to-right text appearance.

---

## 15. Animated Counters — Rolling Numbers

| | |
|---|---|
| **File** | `src/components/AnimatedCounter.tsx` |
| **Professional term** | Count-Up Animation / Number Ticker |
| **Technology** | `requestAnimationFrame` + custom `easeOutExpo` |

Triggers on `useInView`. Custom easing: `easeOutExpo(t) = 1 - 2^(-10t)` — fast start, graceful deceleration. Formatted with `toFixed(decimals)` + comma insertion. Supports arbitrary suffix and custom format function.

---

## 16. Launch Countdown — Flip-Clock Timer

| | |
|---|---|
| **File** | `src/components/LaunchCountdown.tsx` |
| **Professional term** | Flip Clock / Countdown Timer |
| **Technology** | Framer Motion `AnimatePresence mode="popLayout"` |

Real-time countdown to March 15, 2026. `setInterval(1000ms)`. Each digit uses `FlipDigit`: old value exits `y → 14, opacity → 0`, new value enters `y: -14 → 0, opacity: 0 → 1`. `tabular-nums` for fixed-width digits.

---

## 17. Trajectory Map — SVG Hohmann Transfer

| | |
|---|---|
| **File** | `src/components/TrajectoryMap.tsx` |
| **Professional term** | Hohmann Transfer Orbit / SVG Path Animation / Line Drawing |
| **Technology** | SVG cubic Bézier, Framer Motion `pathLength`, SVG `<animateMotion>` |

### What it is
An animated orbital mechanics visualisation: when a launch window is selected, a curved trajectory draws from Earth → Mars with a spacecraft dot following the path, waypoint diamonds, and arrival pulse.

### How it works
- SVG 560×240 viewBox with 40 deterministic stars (seeded positions)
- Per-launch-window data defines cubic Bézier control points
- **Line drawing:** Framer Motion `pathLength: 0 → 1` over 2s with `EXPO_IN_OUT` easing
- **Spacecraft dot:** SVG `<animateMotion path="M...C..." dur="6s" repeatCount="indefinite">` — browser-native path following
- **Waypoints:** positions calculated via `bez(t, p0, c1, c2, p1)` cubic Bézier interpolation at t = 0.25, 0.50, 0.75
- **Arrival pulse:** radial-gradient glow on Mars with scale animation
- Stats bar: transit days, distance (Mkm), delta-V (km/s)

---

## 18. Dust Storm — Environmental Event System

| | |
|---|---|
| **File** | `src/components/DustStorm.tsx` |
| **Professional term** | Environmental Event / Procedural Weather / SVG feTurbulence |
| **Technology** | SVG `feTurbulence` + `feColorMatrix`, CSS keyframes, Framer Motion |

### What it is
A self-triggering Martian dust storm that randomly activates every ~2 minutes, overlaying the **entire page** with orange haze, animated noise grain, sand streaks, and wind sway on all UI elements.

### The 6 visual layers

| Layer | Technique |
|-------|-----------|
| 1. **Orange wash** | `radial-gradient` with `mix-blend-mode: screen`, opacity tied to phase |
| 2. **SVG noise grain** | `<feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4">` with `<animate attributeName="seed">` cycling 0→50→100→30→80→0 over 4s for shimmering. `<feColorMatrix>` tints noise orange via 5×4 matrix. |
| 3. **Sand streaks** | 14 `<div>`s with `linear-gradient(90deg, transparent→orange→transparent)`, `@keyframes dust-streak` translating -120vw → 120vw at 2.5–5s |
| 4. **Directional wind gradient** | Left-to-right `linear-gradient` at 6–10% opacity |
| 5. **Edge vignette** | `radial-gradient(ellipse, transparent 20%, rgba(80,35,10,0.12) 60%, rgba(40,15,5,0.25) 100%)` |
| 6. **HUD warning banner** | Glassmorphic pill: "DUST STORM DETECTED — VISIBILITY REDUCED" with spinning wind icon + pulsing dot |

### Wind sway (the coolest part)
Adding `.dust-storm-active` to `<html>` applies `@keyframes dust-sway` to **all** `<section>`, `[class*="rounded-2xl"]`, and `[class*="rounded-xl"]` elements — every card and section gently rocks back and forth like wind is pushing them. Text gets subtler `dust-sway-subtle`. Odd/even children have staggered `animation-delay` for organic feel.

### Lifecycle
`idle → fadein (2.5s) → peak (12–18s random) → fadeout (3.5s) → idle → reschedule (100–140s)`

---

## 19. Copy Coordinates — Data Stream Particle Implosion

| | |
|---|---|
| **File** | `src/components/CopyCoordinates.tsx` |
| **Professional term** | Particle Implosion / Data Stream Animation |
| **Technology** | Framer Motion per-particle animation, Clipboard API |

### What it is
A button showing Mars coordinates. On click, 30–42 glowing hex characters fly inward from a scattered ring and **converge into the button center** like data being captured.

### How it works
1. Generate 30–42 particles: random angle, radius (80–220px), char (from `'0-9A-F°.NESW█░▒▓ΔΣΩ'`), speed, delay, font size, orange hue
2. Each particle: Framer Motion `<motion.span>` from `{ x: startX, y: startY, opacity: 0.9 }` to `{ x: 0, y: 0, opacity: 0, scale: 0.3 }` with `EXPO_OUT`
3. Central convergence flash: `width/height: [0, 80, 0], opacity: [0, 0.3, 0]` at 0.6s delay
4. Button state: "4.5024°N 137.4477°E" → "STREAMING…" (pulsing) → "DATA CAPTURED" ✓

---

## 20. Incoming Transmission — Surprise Notification

| | |
|---|---|
| **File** | `src/components/IncomingTransmission.tsx` |
| **Professional term** | Toast Notification / Timed Reveal / Typing Effect |
| **Technology** | `setTimeout`, `setInterval` typing, Framer Motion, `sessionStorage` |

### What it is
~60s after page load, a surprise toast slides in simulating a live Mars crew transmission. Random crew member, typing message effect, auto-dismiss after 15s.

### How it works
- `sessionStorage` flag — shows once per session
- Random pick from 4 crew members (Vasquez, Chen, Patel, Torres) with unique colours
- Message typed at 25ms/character with blinking `█` cursor
- Pulsing "INCOMING" header: `animate={{ opacity: [0.5, 1, 0.5] }}`
- Slide-in: `initial={{ opacity: 0, y: 100, scale: 0.9 }}`

---

## 21. Window to Mars — Interactive Porthole with Canvas Landscape

| | |
|---|---|
| **File** | `src/components/WindowToMars.tsx` |
| **Professional term** | Canvas 2D Procedural Landscape / Parallax Viewport |
| **Technology** | Canvas 2D API, multi-layer parallax, `requestAnimationFrame` |

### What it is
A circular spaceship porthole that on hover reveals a vivid, **parallax-responsive Mars landscape** drawn procedurally on canvas, with floating dust motes and HUD overlay.

### How it works
- 480×480 Canvas 2D context
- Multi-layer terrain drawn with `ctx.fill()`:
  - Sky gradient (dark → orange)
  - Sun glow (radial gradient)
  - Mountains (back layer)
  - Sand dunes (mid + near)
  - Foreground terrain
- Floating dust particles (`Mote[]`) with drift physics
- Mouse position mapped to parallax offsets: 25px max shift per layer
- `intensity` value 0→1 on hover controls saturation/vividness
- Circular clip: `border-radius: 50%` + `overflow: hidden`

---

## 22. Page Transitions — Blur/Scale Morph

| | |
|---|---|
| **File** | `src/components/PageTransition.tsx` |
| **Professional term** | Page Transition / Route Animation / Morph |
| **Technology** | Framer Motion `AnimatePresence mode="wait"` |

### Variants
```
initial: { opacity: 0, scale: 0.97, filter: 'blur(8px)' }
enter:   { opacity: 1, scale: 1,    filter: 'blur(0px)' }
exit:    { opacity: 0, scale: 1.02, filter: 'blur(4px)' }
```
Duration: 0.7s with `EXPO_OUT`. Battery Saver: opacity-only at 0.2s.

**Critical fix:** `onAnimationComplete('enter')` clears inline `transform` and `filter` — these create CSS containing blocks that break `position: fixed` descendants. Then calls `ScrollTrigger.refresh()`.

---

## 23. Asteroid Game — Canvas Mini-Game

| | |
|---|---|
| **File** | `src/components/AsteroidGame.tsx` |
| **Professional term** | Canvas 2D Arcade Game / requestAnimationFrame Game Loop |
| **Technology** | HTML5 Canvas 2D, keyboard/touch input, `ResizeObserver` |

### What it is
A playable arcade game inside the Command Terminal. Arrow keys / touch to dodge asteroids. Score increases with time, speed increases every 5s.

### Technical highlights
- Ship: triangle drawn with `ctx.beginPath()` + engine glow gradient
- Asteroids: circles with rotation physics, spawn every 900ms (decreasing interval)
- Collision: circle-to-rectangle with radius check
- Explosion: 35 particles per hit, colours from `['#FF4500', '#ff6b35', '#fbbf24', '#f87171', '#fff']`
- `ResizeObserver` for responsive canvas
- High score in `localStorage`
- 100+ score unlocks "Speed Demon" achievement

---

## 24. Mars Gallery — Cinematic Carousel Lightbox

| | |
|---|---|
| **File** | `src/components/MarsGallery.tsx` |
| **Professional term** | Lightbox Carousel / Image Gallery / Crossfade Slider |
| **Technology** | Framer Motion `AnimatePresence`, keyboard/touch events |

Full-bleed lightbox with smooth crossfade transitions, metadata overlays (location, date, camera), auto-play (6s), thumbnail strip, keyboard nav (←→, Esc), swipe support. Unlocks "Cartographer" achievement when all images viewed.

---

## 25. Landing Simulator — 6-Phase Scroll Descent

| | |
|---|---|
| **File** | `src/components/simulator/SimulatorExperience.tsx` |
| **Professional term** | Scroll-Driven EDL Simulator / Pinned Parallax Experience |
| **Technology** | GSAP ScrollTrigger pin, procedural SVG terrain, phase-aware HUD |

### The 6 phases

| Phase | Name | Visuals |
|-------|------|---------|
| 1 (0–15%) | ORBIT | Mars below, stars, instruments booting |
| 2 (15–28%) | DEORBIT BURN | Engines fire, altitude drops rapidly |
| 3 (28–55%) | ATMOSPHERIC ENTRY | Plasma glow, heat shield, G-force counter |
| 4 (55–70%) | PARACHUTE | Sky clears, parachute SVG, terrain becomes visible |
| 5 (70–90%) | POWERED DESCENT | Retrorockets, dust clouds, rapid descent |
| 6 (90–100%) | TOUCHDOWN | Contact flash, "TOUCHDOWN" text, celebration |

**Terrain:** 3-layer procedural SVG paths generated from seed-based noise function. Phase-aware HUD shows altitude, velocity, G-force, attitude, fuel — all interpolated per scroll progress.

---

## 26. Oura Ring — SVG Rotating Halo

| | |
|---|---|
| **File** | `src/components/OuraRing.tsx` |
| **Professional term** | SVG Arc Animation / Rotating Halo |
| **Technology** | SVG `strokeDasharray`, Framer Motion `rotate: 360` |

A decorative rotating ring component. SVG `<circle>` with `strokeDasharray` creating a partial arc, `linearGradient` stroke, `animate={{ rotate: 360 }}` with linear infinite repeat. Glow backdrop underneath. Configurable: size, color, strokeWidth, speed.

---

## 27. Mars Clock — Real-Time Sol Calculator with Gears

| | |
|---|---|
| **File** | `src/components/MarsClock.tsx` |
| **Professional term** | Mars Sol Date Calculator / Real-Time Clock Widget |
| **Technology** | Mars time mathematics, SVG animated gears, `setInterval` |

### Mars time math
```
Julian Date = unix_ms / 86400000 + 2440587.5
MSD = (JD − 2451549.5) / 1.02749125170 + 44796.0 − 0.00096
MTC hours = fractional_MSD × 24
```

Floating widget showing live Mars Sol, MTC in HH:MM:SS, sol progress arc (SVG `strokeDashoffset`), and **interlocking mechanical gears** (SVG `<path>` with tooth profiles, `<animateTransform>` for rotation — one CW, one CCW). Updates every second. Hidden on mobile.

---

## 28. Geological Scale — Animated Mountain Comparisons

| | |
|---|---|
| **File** | `src/components/GeologicalScale.tsx` |
| **Professional term** | Data Visualisation / Scroll-Triggered Infographic |
| **Technology** | GSAP ScrollTrigger, SVG silhouette paths, animated counters |

Side-by-side Mars vs Earth comparisons (Olympus Mons vs Everest, Valles Marineris vs Grand Canyon, etc.). Mountain silhouettes (SVG paths) grow upward from zero on scroll. Count-up numbers for heights. "2.5× taller" ratio badge. Fun fact reveals after animation.

---

## 29. Mars Weight Calculator — Tilting Scale Animation

| | |
|---|---|
| **File** | `src/components/MarsWeightCalculator.tsx` |
| **Professional term** | Interactive Calculator / SVG Mechanical Animation |
| **Technology** | GSAP rotation tween, Canvas confetti particles |

Enter Earth weight → SVG balance scale tilts (max 18°, GSAP `gsap.to(beam, { rotation })`) → Mars weight counts up → confetti burst (40 particles with gravity simulation in `requestAnimationFrame`). Mars weight = Earth × 0.3794. Supports kg/lbs.

---

## 30. Telemetry Bar — Live Data Strip

| | |
|---|---|
| **File** | `src/components/TelemetryBar.tsx` |
| **Professional term** | Status Bar / Telemetry HUD / Data Dashboard |
| **Technology** | `setInterval(1000)`, sine-wave data functions |

Thin bar at page top with live fake telemetry: Mission Elapsed Time (counting up), distance (sine oscillation), velocity, hull temp, O₂ (97–99% drift), signal strength, fuel. Each datum has `getValue(t)` function. Collapses to icon-only on mobile. Auto-hides when scrolled past hero.

---

## 31. Space Audio — Procedural Web Audio Soundscape

| | |
|---|---|
| **File** | `src/components/SpaceAudio.tsx` |
| **Professional term** | Procedural Audio / Web Audio API Synthesis / Ambient Soundscape |
| **Technology** | `AudioContext`, `OscillatorNode`, `BiquadFilterNode`, `AnalyserNode` |

### Synthesis layers
| Layer | Technique | Parameters |
|-------|-----------|-----------|
| **Deep drone** | Sine oscillator | 42 Hz, gain 0.14, LFO modulation 0.05 Hz ±3 Hz |
| **Cosmic hiss** | White noise buffer → lowpass filter | Cutoff 220 Hz, Q 0.8, LFO on cutoff 0.03 Hz ±80 Hz |
| **Ethereal pad** | Two detuned sines (beating) | 110 Hz + 112.5 Hz, gain 0.035, LFO 0.02 Hz ±8 Hz |

Master gain fades 0 → 0.3 over 2s. 52-bar equalizer vis using `AnalyserNode` + `getByteFrequencyData()`.

---

## 32. Soundscape Engine — Interactive Sound Design

| | |
|---|---|
| **File** | `src/components/SoundscapeEngine.tsx` |
| **Professional term** | Interactive Audio / Synthesized SFX |
| **Technology** | Web Audio API, `MutationObserver` for DOM tracking |

### Engine hum (persistent)
4 harmonics: 24Hz (sub-bass) + 36Hz (fundamental, sine) + 72Hz (body, triangle) + 108Hz (edge, sawtooth) + bandpass-filtered noise (turbine) → DynamicsCompressor → master gain.

LFO breathing: 0.07 Hz sine modulates all frequencies. Master gain 0 → 0.25 over 3s.

### Interactive SFX
- **Click:** Short sine sweep 800→200 Hz, 80ms exponential decay
- **Hover:** High-frequency pip at 2000 Hz, 40ms
- Auto-attached to all `a, button, [role=button], input, select, textarea`
- `MutationObserver` re-attaches on DOM changes

---

## 33. Boarding Pass — Personal Mission Credential

| | |
|---|---|
| **File** | `src/components/BoardingPass.tsx` |
| **Professional term** | Gamification Card / Player Profile / Credential Overlay |
| **Technology** | `localStorage`, Framer Motion modal, React Context |

### What it is
A cinematic boarding card overlay summarising the user's journey: callsign, clearance level, mission elapsed time, all 12 achievement badges, biometric graphic.

### How it works
- **Callsign:** Random selection from 18 names (PHOENIX, HORIZON, VANGUARD…) + 3-digit number. Persisted in `localStorage` — you keep your callsign forever.
- **Clearance level:** Computed from total unlocked achievements:
  - ≥9 = **ALPHA-1** (gold)
  - ≥7 = ALPHA (orange)
  - ≥5 = BETA (blue)
  - ≥3 = GAMMA (green)
  - <3 = DELTA (grey)
- **MET (Mission Elapsed Time):** `Date.now() - localStorage('ares_first_visit')` → formatted as `DDd HHh MMm`
- **Achievement grid:** Reads `useAchievements()` context, shows all 12 with locked/unlocked state
- Full-screen modal with backdrop blur and Framer Motion scale-in

---

## 34. Command Terminal — In-App CLI with Theme Engine

| | |
|---|---|
| **File** | `src/components/CommandTerminal.tsx` |
| **Professional term** | In-App Terminal / CLI Interface / Developer Console |
| **Technology** | CSS custom properties for theming, command parser, React state machine |

### What it is
A retro terminal toggled with `` ` `` or `~`. Full command set including a **live theme engine** that instantly recolours the entire site.

### Commands

| Command | What it does |
|---------|-------------|
| `help` | Lists all commands |
| `set-theme <name>` | Changes site colours (16 presets: `red`, `blue`, `green`, `purple`, `cyan`, `gold`, `pink`, `amber`…) |
| `set-theme #hex` | Arbitrary hex colour |
| `reset-theme` | Restores Mars Red default |
| `status` | System diagnostics |
| `crew` | Crew manifest |
| `navigate <section>` | Scroll to section |
| `game` | Launches Asteroid Dodge mini-game |
| `cinema` | Activates Cinema Mode |
| `clear` | Clears history |
| `exit` / `close` / `quit` | Dismisses terminal |

### Theme engine
Writes `--color-primary` and `--color-accent` CSS custom properties to `:root`. Because the entire UI uses these variables via Tailwind, **everything** changes instantly — buttons, gradients, glows, the Mars globe atmosphere, the ARES ship exhaust, the scroll progress bar…

---

## 35. Command Palette — Spotlight Search

| | |
|---|---|
| **File** | `src/components/CommandPalette.tsx` |
| **Professional term** | Command Palette / Spotlight Search / Quick Actions |
| **Technology** | Fuzzy search, keyboard navigation, `useNavigate` |

### What it is
macOS-style `Ctrl+K` / `⌘K` spotlight with fuzzy search across navigation, actions, shortcuts, and secrets.

### How it works
- Centered blurred-backdrop modal
- 4 categories: NAVIGATE, ACTIONS, SHORTCUTS, SECRETS
- Fuzzy filter: `label.toLowerCase().includes(query)` + keyword matching
- `ArrowUp/Down` moves highlight, `Enter` executes, `Escape` closes
- Can trigger: page navigation, terminal, boarding pass, cinema mode, game, theme changes

---

## 36. Crew Chat — AI Conversation System

| | |
|---|---|
| **File** | `src/components/CrewChat.tsx` |
| **Professional term** | Chatbot / NPC Dialogue System / LLM Integration |
| **Technology** | Groq LLM (online) / keyword matching (offline), Framer Motion |

### What it is
Interactive chat with 4 Mars crew members. Online mode uses Groq `llama-3.1-8b-instant`; offline mode uses rich keyword-matched responses (10+ per crew member).

### The 4 crew members

| Crew | Role | Colour | Personality |
|------|------|--------|-------------|
| Dr. Elena Vasquez | Chief Science Officer | #FF4500 | Passionate scientist, poetic about Mars |
| Cmdr. James Chen | Mission Commander | #eab308 | Disciplined leader, loves his daughter |
| Aisha Patel | Flight Engineer | #4ab8c4 | Practical, detail-oriented |
| Prof. Marco Torres | Geologist | #a855f7 | Enthusiastic about rocks and discoveries |

### Offline engine
```
Pattern:  'water|ice|life'
Response: 'The subsurface ice deposits are massive — meters thick...'
```
10+ pattern-response pairs per crew member covering: greetings, Mars, science, danger, food, home, weather, sunsets, crew, and specialty topics.

### Signal delay
Typing indicator shows for 1–3s simulating Earth-Mars communication delay.

### Achievements
- "Mars Pen Pal" — first chat with any crew member
- "Roll Call" — chat with all 4

---

## 37. Achievement System — Gamification Layer

| | |
|---|---|
| **File** | `src/hooks/useAchievements.tsx` |
| **Professional term** | Achievement System / Gamification / Trophy System |
| **Technology** | React Context, `localStorage`, toast notifications |

### The 12 achievements

| Achievement | How to unlock | Secret? |
|------------|---------------|---------|
| 🚀 First Contact | Visit the site | No |
| 🌌 Deep Space Explorer | Visit all 6 pages | No |
| 🌍 Planet Engineer | Double-click Mars globe | **Yes** |
| 🔓 Classified Access | Enter Konami Code | **Yes** |
| 💬 Mars Pen Pal | Chat with a crew member | No |
| 🎯 Touchdown | Complete landing simulator | No |
| 🎟️ Ticket to Mars | Open booking panel | No |
| 📡 Signal Lost | Find the 404 page | **Yes** |
| 🌙 Stargazer | View Mars panorama at night | No |
| 👨‍🚀 Roll Call | Chat with all 4 crew | **Yes** |
| ☄️ Speed Demon | Score 100+ in Asteroid Dodge | **Yes** |
| 🗺️ Mars Cartographer | View all gallery images | No |

### How it works
- `Set<string>` of unlocked IDs serialised to `localStorage`
- `unlock(id)` function: checks if already unlocked → adds to set → triggers toast
- `lastUnlocked` state drives toast notification
- `AchievementToast`: slides in from bottom-right with emoji, title, description

---

## 38. Mission Complete — Confetti Ceremony

| | |
|---|---|
| **File** | `src/components/MissionComplete.tsx` |
| **Professional term** | Completion Ceremony / Confetti Particle System |
| **Technology** | Canvas 2D confetti, Framer Motion full-screen overlay |

### What it is
Triggered when user unlocks **all 12 achievements**. Full-screen cinematic overlay with confetti particles, dramatic text reveal, commander callsign, ALPHA-1 clearance badge.

### How it works
- Checks `totalUnlocked === totalAchievements`
- `sessionStorage` — shows once per session
- **Canvas confetti:** 120 particles launched upward from bottom, colours: `['#FF4500', '#fbbf24', '#f97316', '#a855f7', '#3b82f6', '#22c55e', '#ec4899', '#fff']`
- Particles have: velocity (upward + spread), gravity, rotation, rotSpeed, lifetime
- Shapes: rectangles and circles alternating
- Multiple burst waves (3 waves at 0s, 1s, 2s)
- Text: "MISSION COMPLETE" with dramatic scale-in, glow, callsign display
- Auto-logs "Mission Complete — all achievements unlocked" to Mission Log

---

## 39. Mission Log — Auto-Recorded Timeline

| | |
|---|---|
| **File** | `src/components/MissionLog.tsx` + `src/hooks/useMissionLog.tsx` |
| **Professional term** | Event Log / Activity Timeline / Journal System |
| **Technology** | React Context, `localStorage`, automatic event recording |

### What it is
An auto-recording captain's journal. Significant user actions are automatically logged with Sol number, MET timestamp, emoji icon, and description.

### Auto-logged events
- Page visits, achievement unlocks, booking actions, crew chat sessions, gallery views, game scores, theme changes, boarding pass views

### UI
Floating button opens scrollable timeline panel. Each entry has: timeline dot, emoji, text, Sol number, MET timestamp. Unread count badge. Clear all button.

---

## 40. Discovery Hints — Progressive Feature Nudges

| | |
|---|---|
| **File** | `src/components/DiscoveryHints.tsx` |
| **Professional term** | Progressive Disclosure / Onboarding Hints |
| **Technology** | `setTimeout` stagger, `localStorage` per-hint flags |

### What it is
Subtle, non-intrusive nudges for first-time visitors pointing to hidden features. Each hint shows **once ever**, staggered over time.

### The 5 hints

| Hint | Delay | Text |
|------|-------|------|
| Terminal | 15s | "Press ~ to open the Command Terminal" |
| Palette | 40s | "Try Ctrl+K for quick search" |
| Mars globe | 65s | "Double-click the Mars globe for a surprise" |
| Achievements | 100s | "10 hidden achievements to discover" |
| Game | 140s | "Type 'game' in the terminal to play" |

Tiny pill at bottom-center. Appears → stays 8s → fades out. Never stacks — only 1 at a time. Disabled in Battery Saver mode.

---

## 41. Mobile Action Hub — Radial FAB Menu

| | |
|---|---|
| **File** | `src/components/MobileActionHub.tsx` |
| **Professional term** | Floating Action Button / Radial Menu / FAB |
| **Technology** | Framer Motion, `lazy()` imports |

### What it is
Mobile-only (< lg) floating action button that expands into a radial menu providing access to features hidden on small screens: Boarding Pass, Mission Log, Achievements, Terminal, Command Palette, Game hint.

### How it works
- FAB button: pulsing `⚡` icon with achievement count badge
- Tap to expand: 6 action items fan out in a semi-circle
- Each item: coloured icon, label, opens respective panel or triggers action
- Inline panels for Log and Achievements (no separate route needed)
- `lazy(() => import('./BoardingPass'))` for code-splitting

---

## 42. Battery Saver Mode — Performance Throttling

| | |
|---|---|
| **File** | `src/hooks/useBatterySaver.tsx` |
| **Professional term** | Performance Mode / Battery Saver / Adaptive Quality |
| **Technology** | React Context, `navigator.getBattery()`, `prefers-reduced-motion` |

### What it is
An intelligent performance mode that reduces animations based on device capabilities, battery level, and user preference.

### Auto-detection
- Mobile viewport + touch device → auto-enable
- Battery API: level < 20% → suggest enabling
- `prefers-reduced-motion` media query → respect OS setting

### What gets throttled
| Component | Battery Saver behaviour |
|-----------|------------------------|
| StarField | Every 3rd frame, no shooting stars, no cross-flares |
| NebulaBackground | Animations frozen, blur reduced, opacity 0.4 |
| ScanlineOverlay | No refresh sweep |
| RealisticMars | Rotation paused |
| DustStorm | Disabled |
| PageTransition | Opacity-only, 0.2s |

Toggle button: lightning bolt icon in floating controls. Adds `.battery-saver` class to `<html>` for CSS-level optimizations.

---

## 43. Cinema Mode — Distraction-Free View

| | |
|---|---|
| **File** | `src/hooks/useCinemaMode.tsx` |
| **Professional term** | Cinema Mode / Distraction-Free View / Zen Mode |
| **Technology** | React Context, CSS class toggle |

### What it is
Press `P` (when not in input) or type `cinema` in terminal to hide **all floating UI** — only main page content + backgrounds remain. Perfect for screenshots or just enjoying the visuals.

### What hides
Nav, telemetry bar, scroll progress, Mars clock, crew chat, mission log, battery saver toggle, discovery hints, mobile action hub, boarding pass button.

### How it works
`isCinemaMode` boolean in context → each floating component checks and renders `null` or applies `opacity: 0` + `pointer-events: none`. Subtle "CINEMA MODE" label at top-center. Press `P` again or `Escape` to exit.

---

## 44. Dynamic Favicon — Route-Based Tab Icons

| | |
|---|---|
| **File** | `src/hooks/useFavicon.ts` |
| **Professional term** | Dynamic Favicon / Route-Based Tab Icon |
| **Technology** | SVG emoji favicon, `useLocation` |

### Route → emoji mapping

| Route | Emoji |
|-------|-------|
| `/` | 🚀 |
| `/ship` | 🛸 |
| `/crew` | 👨‍🚀 |
| `/mission` | 📋 |
| `/explore` | 🌍 |
| `/simulate` | 🎯 |
| Other | 📡 |

### How it works
```typescript
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <text y=".9em" font-size="80">${emoji}</text>
</svg>`;
const href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
```
Creates/updates `<link rel="icon" type="image/svg+xml">` on every route change.

---

## 45. Tab-Away Detection — "Come Back, Commander!"

| | |
|---|---|
| **File** | `src/hooks/usePageTitle.ts` |
| **Professional term** | Tab-Away Detection / Page Visibility API |
| **Technology** | `document.visibilitychange` event |

### What it is
When the user switches to another tab, the page title changes to a random plea:
- "Come back, Commander!"
- "Mission Control awaits…"
- "Commander? · ARES-X"
- "Don't leave us out here!"
- "Mars is waiting…"

When they return, the title restores and an optional callback fires.

---

## 46. Konami Code — Hidden Easter Egg

| | |
|---|---|
| **File** | `src/hooks/useKonamiCode.ts` |
| **Professional term** | Easter Egg / Cheat Code / Keyboard Sequence Detection |
| **Technology** | `window.keydown` listener, sequence matching |

### The sequence
`↑ ↑ ↓ ↓ ← → ← → B A`

### How it works
- `index` ref tracks current position in the 10-key sequence
- Each keydown: if `key === KONAMI[index]` → increment. If wrong key → reset to 0.
- When `index >= 10` → `activated = true`, unlocks "Classified Access" achievement
- Stops listening once activated

---

## 47. Terraformed Mars — Double-Click Easter Egg

| | |
|---|---|
| **File** | `src/components/RealisticMars.tsx` (built into the globe) |
| **Professional term** | Easter Egg / CSS Filter Transform |
| **Technology** | CSS `hue-rotate()` + `saturate()` + `brightness()` |

### What it is
Double-click the Mars globe → it transforms from red planet to a lush green-and-blue Earth-like world, labelled "TERRAFORMED · YEAR 2340".

### How it works
- `onDoubleClick` toggles `terraformed` state
- Surface texture gets: `filter: hue-rotate(95deg) saturate(1.6) brightness(1.15)`
- All atmospheric colours dynamically shift: orange→blue for rim, glow, shadow, and atmosphere layers
- Ocean shimmer: pulsing `radial-gradient(ellipse, rgba(60,160,255,0.06))` with 4s `animationDuration`
- Badge appears below: green pill with "TERRAFORMED · YEAR 2340"
- Unlocks "Planet Engineer" achievement (secret)
- 1000ms `transition-all` for smooth colour transformation

---

## Summary: Technology Stack

| Technology | Used for |
|-----------|----------|
| **GSAP + ScrollTrigger** | Scroll-driven animations, pinned sections, parallax, timeline sequencing |
| **Framer Motion** | Component mount/unmount animations, spring physics, gesture tracking |
| **CSS Keyframes** | Background animations, glitch effects, dust storm sway, nebula pulse |
| **CSS Gradients** | 3D planet illusion, lighting, atmospheric effects, nebula clouds |
| **Canvas 2D** | Star field, asteroid game, confetti, window-to-mars landscape |
| **SVG + SMIL** | Ship illustration, trajectory paths, animated particles, gear mechanics |
| **Web Audio API** | Procedural audio synthesis, interactive sound effects |
| **SVG Filters** | feTurbulence for dust grain, feGaussianBlur for glows |
| **React Context** | Achievement system, battery saver, cinema mode, mission log |
| **localStorage** | Persistent state: achievements, callsign, high scores, preferences |
| **sessionStorage** | One-per-session features: boot sequence, transmission, mission complete |
| **Page Visibility API** | Tab-away detection |
| **Clipboard API** | Copy coordinates |
| **Battery API** | Auto battery saver detection |
| **MutationObserver** | Dynamic cursor/sound attachment on DOM changes |
| **ResizeObserver** | Responsive canvas games |

---

*Total: **47 distinct visual effects, animations, and interactive features** spanning 80+ component files, making ARES-X one of the most visually rich web experiences built with React.*
