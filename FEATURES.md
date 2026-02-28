# ARES-X — Features, Animations & Technical Deep-Dive

> A comprehensive reference documenting every visual effect, interaction pattern,
> hidden feature, and technical technique used across the ARES-X Mars Mission website.

---

## Table of Contents

1. [Hero Section & Mars Globe](#1-hero-section--mars-globe)
2. [Solar System Flythrough](#2-solar-system-flythrough)
3. [Ship & Spacecraft Graphics](#3-ship--spacecraft-graphics)
4. [Navigation Systems](#4-navigation-systems)
5. [Scroll & Parallax Effects](#5-scroll--parallax-effects)
6. [Text Animations](#6-text-animations)
7. [Interactive Overlays & Modals](#7-interactive-overlays--modals)
8. [Mini-Games](#8-mini-games)
9. [Audio & Atmosphere](#9-audio--atmosphere)
10. [Achievement System](#10-achievement-system)
11. [HUD & Telemetry](#11-hud--telemetry)
12. [Crew & Chat System](#12-crew--chat-system)
13. [Booking & Mission Planning](#13-booking--mission-planning)
14. [Sub-Pages](#14-sub-pages)
15. [Performance & Loading](#15-performance--loading)
16. [Easter Eggs & Hidden Features](#16-easter-eggs--hidden-features)
17. [Responsive Design Patterns](#17-responsive-design-patterns)

---

## 1. Hero Section & Mars Globe

### Realistic Mars Globe (`RealisticMars.tsx`)

**What it is:** A photorealistic rotating 3D Mars rendered entirely with CSS — no WebGL, no Three.js, no canvas.

**How it works:**
- A generated Mars texture (`mars-texture.webp`) is applied as a `background-image` on a circular `<div>`
- `background-size: 300% 100%` creates a seamless tile, and `@keyframes mars-rotate` scrolls the `background-position-x` from `0` to `-300%` in an 80-second infinite loop
- A clipped `border-radius: 50%` creates the sphere illusion
- Multiple overlay `<div>` layers simulate 3D lighting:
  - **Terminator shadow**: `linear-gradient(100deg, ...)` — simulates day/night boundary
  - **Specular highlight**: `radial-gradient(ellipse 50% 45% at 32% 28%, ...)` — sun reflection upper-left
  - **Limb darkening**: `radial-gradient(circle at 42% 48%, transparent 38%, ...)` — edges fade to black
  - **Atmospheric rim**: `radial-gradient(circle, transparent 45%, rgba(255,80,20,0.04) 58%, ...)` — orange glow at edges
  - **Fresnel edge highlight**: a `box-shadow: inset` on an outer ring
- An outer `radial-gradient` haze creates the atmospheric glow effect

**Technologies:** Pure CSS animations, CSS `radial-gradient` stacking, `border-radius: 50%`, `background-size` tiling

**Easter Egg — Terraformed Mars:** Double-click the globe to activate. Applies `filter: hue-rotate(95deg) saturate(1.6) brightness(1.15)` turning red Mars into a blue-green habitable world. Unlocks the "Terraformed" achievement.

### GSAP Scroll Zoom (`HeroSection.tsx`)

**What it is:** As the user scrolls, Mars grows larger (scale 1 → 1.9), rotates slightly, and fades out — creating a cinematic "approaching the planet" effect.

**How it works:**
- GSAP `ScrollTrigger` with `scrub: 1.5` ties the animation to scroll position
- A single GSAP timeline with two segments:
  - 0%–55%: `scale: 1 → 1.6`, `rotation: 0 → 10`, `yPercent: 0 → -12`
  - 55%–100%: `scale: 1.6 → 1.9`, `opacity: 1 → 0`
- A separate timeline controls a `mars-glow-ring` element (radial gradient with blur) that pulses at 50% scroll
- Hero text parallaxes out faster than Mars (`yPercent: 0 → -30`, `opacity: 1 → 0`)

**Technologies:** GSAP 3 + ScrollTrigger, `scrub` mode, `@gsap/react` hook

### Kinetic Title (`KineticTitle.tsx`)

**What it is:** The main "YOUR JOURNEY TO MARS" headline with each word animating in with staggered vertical slide + opacity.

**How it works:** GSAP `from()` with `stagger: 0.18` on `.hero-line` elements, each sliding from `y: 60` to `y: 0`.

### Launch Countdown (`LaunchCountdown.tsx`)

**What it is:** A live countdown timer in the hero overline pill, counting down to a future launch date.

**How it works:** `setInterval` at 1s calculates `days:hours:minutes:seconds` from `Date.now()` to a target timestamp. Uses `tabular-nums` for flicker-free display.

### Animated Counters (`AnimatedCounter.tsx`)

**What it is:** Numbers that count up from 0 to their target value (54.6M km, 7 months, 2,847 booked).

**How it works:** `requestAnimationFrame` loop with eased interpolation. Starts when `IntersectionObserver` detects the element is in viewport.

---

## 2. Solar System Flythrough

### The Flythrough (`SolarFlythrough.tsx`)

**What it is:** A scroll-pinned, 6-phase cinematic journey from deep space, past Earth, launching the ARES-7 ship, cruising through the void, and arriving at Mars.

**How it works:**
- Section is `height: 100vh` with `ScrollTrigger: { pin: true, end: '+=500%' }` — 5x the viewport height of scroll controls the entire sequence
- A single master GSAP timeline with `scrub: 1` maps scroll position to animation progress
- **6 phases** each control different elements:
  1. **Deep Space (0–15%)**: Stars visible, "SOLAR SYSTEM" label fades out, sun glow appears
  2. **Earth (15–35%)**: Earth scales from 0.04 → 1, moon orbit rotates
  3. **Launch (32–48%)**: Ship appears, engine flare intensifies, ship accelerates right+up
  4. **Transit (48–72%)**: Ship settles center, gentle bobbing (`sine.inOut`), speed lines, trajectory draws
  5. **Mars Arrival (70–95%)**: Ship brakes (nose-up tilt), Mars scales in, ship enters orbit
  6. **Fade (95–100%)**: Everything scales/fades, blackout overlay for section transition

**Live HUD:** `tl.eventCallback('onUpdate')` reads `tl.progress()` to calculate distance, speed, and phase name in real-time.

**Parallax Stars:** 3 star layers (120/60/30 stars) with different `xPercent`/`yPercent` movement speeds create depth.

**Trajectory Path:** Triple-layer SVG `<path>` — wide glow blur, main gradient line, thin bright core. 5 animated particle dots travel along the path using SVG `<animateMotion>`.

**Ambient Nebula:** Three `radial-gradient` layers prevent the section from appearing as pure black before scrolling begins.

**Technologies:** GSAP ScrollTrigger (pin + scrub), SVG `<animateMotion>`, CSS gradients for nebula, staggered phase architecture

### Planets (`SolarFlythrough.tsx > Planet()`)

**What it is:** CSS-only 3D-looking planets (Earth, Mars).

**How it works:** Stacked `<div>` layers:
- Base: `radial-gradient(circle at 35% 30%, light, base, shadow)` — 3D sphere illusion
- Atmosphere: outer `inset-[-6%]` div with radial gradient for atmospheric rim glow
- Specular highlight: blurred elliptical white spot at upper-left
- Limb darkening: dark edges radial gradient
- Terminator: `linear-gradient(105deg, ...)` for day/night boundary
- Children: continent patches, cloud bands, polar ice (additional gradient divs)

---

## 3. Ship & Spacecraft Graphics

### ARES-7 Ship SVG (`AresShipSVG.tsx`)

**What it is:** A detailed side-profile spacecraft rendered as inline SVG with animated elements.

**Key features:**
- **Metallic hull**: `linearGradient` from light gray to dark — titanium look
- **Plasma exhaust**: Multi-layer engine plumes using `radialGradient` with `<animate>` on `rx`/`ry` for flickering. Mach diamond shock patterns (small animated circles)
- **Cockpit glass**: Cyan `linearGradient` with `feGaussianBlur` glow filter, HUD reflection lines
- **Reactor cores**: Pulsating circles with `<animate>` on `fillOpacity`
- **Nav beacons**: Red circles on fin tips with blink animation
- **Habitat windows**: 5 small rectangles with varying cyan opacity
- **Radiator panels**: Blue `linearGradient` rectangles with cell divider lines
- **Sensor probe**: Animated nose-tip light
- **RCS thrusters**: Cyan border rectangles with pulsing indicator dots
- **Thrust parameter**: Controls exhaust intensity (opacity, scale of plumes)

**Technologies:** Inline SVG, `<animate>` (SMIL), `<linearGradient>`, `<radialGradient>`, `<filter>` (feGaussianBlur)

### Spacecraft Blueprint (`SpacecraftBlueprint.tsx`)

**What it is:** An interactive technical schematic of the ARES-7 with clickable system hotspots.

**How it works:** SVG blueprint with labeled system points. Clicking a hotspot opens `BlueprintDetailOverlay` with specs. GSAP draws blueprint lines on scroll.

---

## 4. Navigation Systems

### Vertical Nav (`VerticalNav.tsx`)

**Desktop:** Fixed left sidebar (`w-20`, `hidden lg:flex`). Section icons with active indicator (orange bar, `layoutId` spring animation). Hover tooltips with arrow pointer and `GlitchText`. Sub-page links below separator. Scroll progress bar at bottom.

**Mobile:** Redesigned top bar with:
- Logo (ARES-X) + BOOK CTA pill
- Animated hamburger (rotate transition between Menu/X icons)
- Full dropdown menu: 3×2 grid of scroll sections + card-style page links with descriptions
- Backdrop overlay with blur

### Command Palette (`CommandPalette.tsx`)

**What it is:** A Spotlight/Alfred-style command launcher. `Ctrl+K` or `Cmd+K` to open.

**How it works:** Fuzzy-match filter on an array of command objects. Each command has a `label`, `icon`, `action` (callback). Keyboard navigation with `ArrowUp`/`ArrowDown` + `Enter`. Actions dispatch custom events (e.g., `window.dispatchEvent(new Event('open-asteroid-game'))`).

### Mobile Action Hub (`MobileActionHub.tsx`)

**What it is:** A floating action button (FAB) at bottom-right on mobile (`lg:hidden`). Expands into a radial menu of quick actions.

**How it works:** Toggles between collapsed (single circle) and expanded (column of action buttons). Full-screen sub-panels for Mission Log and Achievements. Uses Framer Motion for spring animations.

---

## 5. Scroll & Parallax Effects

### Scroll Progress (`ScrollProgress.tsx`)
**What it is:** A thin progress bar at the top of the viewport showing how far you've scrolled.
**How it works:** `scroll` event listener calculates `scrollY / (scrollHeight - innerHeight)`. `scaleX` transform on a fixed bar.

### Parallax Quote (`ParallaxQuote.tsx`)
**What it is:** A full-width quote section where text moves at a different speed than the background.
**How it works:** GSAP ScrollTrigger with `scrub` on the quote text `y` position.

### Lazy Section (`LazySection.tsx`)
**What it is:** Wrapper that delays rendering children until the section is near the viewport.
**How it works:** `IntersectionObserver` with `rootMargin: '200px'`. Renders a minimum-height placeholder until triggered.

### Reveal Text (`RevealText.tsx`)
**What it is:** Text that fades/slides in word-by-word as you scroll to it.
**How it works:** GSAP ScrollTrigger on each word span, staggered `y` + `opacity` animation.

---

## 6. Text Animations

### Glitch Text (`GlitchText.tsx`)
**What it is:** Text with a randomized digital glitch effect on hover — characters briefly scramble.
**How it works:** On `mouseenter`, a `setInterval` replaces characters with random symbols (`█░▒▓§°•`), gradually resolving back to the original text character-by-character.

### Kinetic Title (`KineticTitle.tsx`)
**What it is:** The hero heading with per-word staggered entrance animation.
**How it works:** Each word wrapped in a span, GSAP `from()` with `stagger`, `y: 60`, and `opacity: 0`.

### Data Readout (`Footer.tsx > DataReadout`)
**What it is:** Typewriter-style text that types out character by character.
**How it works:** `setInterval` at 35ms incrementally reveals characters via `text.slice(0, i)`.

---

## 7. Interactive Overlays & Modals

### Boot Sequence (`BootSequence.tsx`)
**What it is:** A cinematic startup screen shown on first load — system diagnostics, progress bars, dramatic reveal.
**How it works:** Multi-phase state machine: logo reveal → system checks → progress bar → fade to main content. Uses `setTimeout` chains and CSS transitions.

### Classified Overlay (`ClassifiedOverlay.tsx`)
**What it is:** A secret "CLASSIFIED" document overlay triggered by the Konami Code.
**How it works:** Red-tinted CRT-style overlay with scanlines and redacted text blocks. Framer Motion entrance.

### Incoming Transmission (`IncomingTransmission.tsx`)
**What it is:** A surprise "incoming message" notification that appears after ~2 minutes.
**How it works:** `setTimeout` triggers appearance. Pulsing radio indicator, typed message reveal, dismissible.

### Alert Overlay (`AlertOverlay.tsx`)
**What it is:** A full-screen red alert mode — klaxon-style flashing borders and warning text.
**How it works:** Toggled via `useAlertMode` hook. Red gradient overlay with CSS animation `pulse`.

### Dust Storm (`DustStorm.tsx`)
**What it is:** A simulated Martian dust storm that occasionally sweeps across the screen.
**How it works:** Particle system using absolutely-positioned `<div>` elements with randomized positions, sizes, and CSS `@keyframes` for drift. Triggered by timer.

### Satellite Overlay (`SatelliteOverlay.tsx`)
**What it is:** An orbital view mode showing satellite imagery style of the page.
**How it works:** Applies post-processing filters (grayscale, grid overlay) to the entire viewport.

### Ship AI (`ShipAI.tsx`)
**What it is:** An AI assistant personality that occasionally provides tips or commentary.
**How it works:** State machine with timed messages, ambient "thinking" indicator.

### Mars Gallery (`MarsGallery.tsx`)
**What it is:** A cinematic image carousel of Mars surface photos with auto-play, crossfade, lightbox, and thumbnail strip.
**How it works:**
- `useState` tracks `currentIndex`, `direction`, `isPaused`, `lightboxOpen`
- Framer Motion `AnimatePresence` with custom `variants` for slide direction
- `auto-play`: `setInterval(next, 6000)` paused on hover
- Touch/swipe: `touchStartX` ref compared to `touchEnd` — 50px threshold
- Lightbox: Portal-style fixed overlay with keyboard nav (Escape, arrows)
- Achievement triggers: "Stargazer" on sunset image, "Cartographer" on viewing all

---

## 8. Mini-Games

### Asteroid Dodge (`AsteroidGame.tsx` + `AsteroidGameModal.tsx`)

**What it is:** A playable arcade game where you pilot a ship through an asteroid field.

**How it works:**
- HTML5 `<canvas>` with `requestAnimationFrame` game loop
- Ship controlled by arrow keys (desktop) or touch Y-position (mobile)
- `ResizeObserver` keeps canvas responsive
- Asteroids spawn at increasing frequency, drift left at increasing speed
- Collision detection: circle-circle distance check
- Score: time survived × difficulty multiplier
- Phase system: `READY → ALIVE → DEAD` with restart on click/touch

**Modal wrapper (`AsteroidGameModal.tsx`):**
- Opens via: `Ctrl+G`, Command Palette, MobileActionHub, or custom event `open-asteroid-game`
- Responsive aspect ratio: `clamp(56.25%, 75% - 10vw, 75%)` — taller on portrait, wider on landscape
- Touch-friendly: larger close button, "Touch to steer" hint on mobile

**Technologies:** Canvas 2D API, `requestAnimationFrame`, `ResizeObserver`, touch events

### Landing Simulator (`SimulatorPage.tsx` + `simulator/`)

**What it is:** A Mars landing simulation experience.

**How it works:** Full-page simulator with flight HUD, altitude/velocity readouts, terrain visualization.

---

## 9. Audio & Atmosphere

### Space Audio (`SpaceAudio.tsx`)
**What it is:** Ambient background audio toggle — space ambience, radio chatter, engine hum.
**How it works:** Web Audio API with multiple `<audio>` elements crossfaded.

### Soundscape Engine (`SoundscapeEngine.tsx`)
**What it is:** Context-aware audio that changes based on scroll position and current section.
**How it works:** Maps scroll position to audio parameters (volume, filter cutoff).

### Scanline Overlay (`ScanlineOverlay.tsx`)
**What it is:** A subtle CRT-monitor scanline effect across the entire viewport.
**How it works:** `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.006) 2px, ...)` on a `fixed inset-0 pointer-events-none` div.

### Custom Cursor (`CustomCursor.tsx`)
**What it is:** A custom crosshair/reticle cursor replacing the default arrow.
**How it works:** `mousemove` listener updates a `fixed` div position via `transform: translate()`. Uses `pointer-events: none` and tracks hover states for size changes.

### Nebula Background (`NebulaBackground.tsx`)
**What it is:** Subtle color nebula clouds behind all content.
**How it works:** Multiple large `radial-gradient` divs with low opacity and heavy blur, creating depth.

### Star Field (`StarField.tsx`)
**What it is:** A twinkling star background across the page.
**How it works:** Deterministic random positions (seeded), small `<div>` circles with CSS `@keyframes twinkle` animation at varied delays.

---

## 10. Achievement System

### Architecture (`useAchievements.tsx` + `AchievementPanel.tsx` + `AchievementToast.tsx`)

**What it is:** A gamification layer with 12+ unlockable achievements.

**How it works:**
- `AchievementProvider` context wraps the app
- `unlock(id)` checks if already unlocked, if not: saves to `localStorage`, dispatches toast
- `AchievementToast`: Framer Motion slide-in notification with icon, title, sound
- `AchievementPanel`: Grid overlay showing all achievements (locked/unlocked)

| Achievement | Trigger | Secret? |
|------------|---------|--------|
| First Contact | Visit the site | No |
| Explorer | Visit all 6 pages | No |
| Crew Chat | Send a chat message | No |
| All Crew | Chat with all 4 crew members | No |
| Konami | Enter Konami Code | Yes |
| Terraformed | Double-click Mars globe | Yes |
| Night Sky (Stargazer) | View sunset in gallery | No |
| Cartographer | View all gallery images | No |
| Simulator | Visit the simulator page | No |
| Signal Lost | Visit a 404 page | Yes |
| Speed Demon | Score ≥100 in Asteroid Dodge | Yes |
| Mission Complete | Scroll to the very bottom | No |

---

## 11. HUD & Telemetry

### Telemetry Bar (`TelemetryBar.tsx`)
**What it is:** A thin fixed bar at the top (desktop only) showing live fake mission data.
**How it works:** `setInterval` at 100ms updates `tick` state. Each datum has a `getValue(tick)` function using `Math.sin()` for oscillation. Data: MET clock, distance, velocity, hull temp, O₂, fuel, signal.

### Performance Dashboard (`PerformanceDashboard.tsx`)
**What it is:** A space-themed Web Vitals monitor.
**How it works:**
- `PerformanceObserver` API captures FCP, LCP, CLS, INP, TTFB
- `requestAnimationFrame` loop for FPS counter
- `performance.memory` for JS heap (Chrome only)
- `document.querySelectorAll('*').length` for DOM node count
- Color-coded thresholds (green/yellow/red)

### Mars Clock (`MarsClock.tsx`)
**What it is:** Shows current Mars time (MTC — Mars Coordinated Time).
**How it works:** Calculates Mars Sol Date from Earth UTC using the standard conversion formula.

### Mars Weather (`MarsWeather.tsx`)
**What it is:** Simulated current weather conditions on Mars.
**How it works:** Generates plausible temperature, pressure, wind speed, UV index values with slight randomization.

---

## 12. Crew & Chat System

### Crew Chat (`CrewChat.tsx`)

**What it is:** An interactive chat interface with 4 ARES-X crew members, each with distinct personality.

**How it works:**
- **4 crew members**: Dr. Vasquez (science), Cmdr. Chen (command), Patel (engineer), Torres (geologist)
- **Online mode**: Calls Supabase Edge Function (`crew-chat`) → Groq LLM with crew personality system prompts
- **Offline mode**: 40+ keyword-matched responses per crew member. Regex patterns match user input against keyword arrays. Falls back to 3 generic responses per crew member.
- **Signal delay simulation**: 800–2300ms random delay to simulate Mars-Earth communication lag
- **Crew picker**: Expandable grid to switch between crew members. Each has unique color and initials.
- **Welcome message**: Each crew member has a unique greeting on selection

### Crew Roster (`CrewRoster.tsx`)
**What it is:** Visual crew member cards with photos, bios, and role descriptions.
**How it works:** Grid layout with hover effects, click to open `CrewBioOverlay` with full biography.

---

## 13. Booking & Mission Planning

### Booking Panel (`BookingPanel.tsx`)
**What it is:** A multi-step booking wizard with launch window selection and trajectory map.
**How it works:** Step state machine: date selection → cabin class → passenger info → confirmation.

### Trajectory Map (`TrajectoryMap.tsx`)
**What it is:** An animated SVG showing the Hohmann transfer orbit from Earth to Mars.
**How it works:**
- SVG viewBox with Sun, Earth, Mars positioned
- Cubic Bézier path drawn with Framer Motion `pathLength` animation
- Spacecraft dot follows path via `<animateMotion>`
- Waypoint diamonds appear sequentially along the path
- Arrival pulse rings expand at Mars
- Per-launch-window data: different trajectories, travel times, delta-V

### Boarding Pass (`BoardingPass.tsx`)
**What it is:** A printable/savable boarding pass design.
**How it works:** Styled card mimicking a real boarding pass with QR code, flight details, seat assignment.

### Seat Map (`SeatMap.tsx`)
**What it is:** Interactive spacecraft seating layout.
**How it works:** SVG seat grid with click-to-select, availability states, cabin class coloring.

### Cabin Card Deck (`CabinCardDeck.tsx`)
**What it is:** Swipeable cards showing different cabin class options.
**How it works:** Framer Motion drag gesture on cards with spring physics.

---

## 14. Sub-Pages

### Ship Page (`ShipPage.tsx`)
- Fleet section with ship specifications
- Interactive spacecraft blueprint with system hotspots
- Tech specs with animated counters
- Cabin class cards

### Crew Page (`CrewPage.tsx`)
- Crew roster grid
- Bio overlay with detailed backgrounds
- Oura Ring health data visualization

### Mission Page (`MissionPage.tsx`)
- Mission logistics timeline
- FAQ accordion section
- Mission stats dashboard

### Explore Page (`ExplorePage.tsx`)
- Mars panorama viewer
- Landing zones interactive grid
- Geological scale comparison
- Mars weight calculator
- Window to Mars (viewport effect)

### Simulator Page (`SimulatorPage.tsx`)
- Full Mars landing simulator experience
- Flight HUD overlay

### 404 Page (`NotFoundPage.tsx`)
- Space-themed "Signal Lost" page
- Triggers "Signal Lost" achievement

---

## 15. Performance & Loading

### Boot Sequence (`BootSequence.tsx`)
Initial loading screen with system diagnostic aesthetics. Runs for ~3–5 seconds on first visit.

### Lazy Loading Architecture
- **All pages**: `React.lazy()` + code splitting
- **Below-fold sections**: `LazySection` wrapper with `IntersectionObserver`
- **HUD controls**: `DeferredMount` (300ms delay after first paint)
- **Overlays**: `DeferredMount` (2000ms delay)
- **Heavy effects**: `DeferredMount` (5000ms delay)

### Error Boundary (`LazyLoadErrorBoundary.tsx`)
**What it is:** Catches dynamic import failures (common in Vite HMR).
**How it works:** React Error Boundary that detects chunk load errors, retries import, then offers page reload.

### Battery Saver (`useBatterySaver.tsx` + `BatterySaverToggle.tsx`)
**What it is:** Toggle to disable heavy animations for low-power devices.
**How it works:** Context provider sets `isSaving` flag. Components check this to skip animations, pause CSS animations, reduce particle counts.

---

## 16. Easter Eggs & Hidden Features

| Feature | Trigger | Description |
|---------|---------|-------------|
| **Konami Code** | ↑↑↓↓←→←→BA | Opens classified document overlay |
| **Terraformed Mars** | Double-click globe | Turns Mars green/blue via CSS hue-rotate |
| **Footer Secret** | Click logo 5x | "We've been waiting for you" message |
| **Command Terminal** | Opens via palette | Full terminal emulator with commands |
| **Discovery Mode** | Toggle via icon | Highlights all interactive elements |
| **Cinema Mode** | Via context | Hides all HUD for immersive viewing |
| **Copy Coordinates** | Click in hero | Copies Mars coordinates to clipboard |
| **Asteroid Game** | Ctrl+G | Full arcade mini-game |
| **Emergency Button** | Red button | Triggers alert mode |

### Konami Code (`useKonamiCode.ts`)
**How it works:** `keydown` listener maintains a buffer of last N key presses. Compares against the sequence `[38,38,40,40,37,39,37,39,66,65]`. Activates on match.

### Discovery Mode (`useDiscoveryMode.tsx`)
**What it is:** Highlights all clickable/interactive elements with glowing outlines.
**How it works:** Adds CSS class to `<body>` that targets elements with `cursor: pointer` or `[role="button"]`.

---

## 17. Responsive Design Patterns

### Breakpoint Strategy
- **Mobile-first**: Base styles are mobile, `sm:` / `lg:` for larger
- **Key breakpoint**: `lg:` (1024px) — sidebar nav vs. mobile top bar
- **Component-level adaptation**:
  - `CrewChat`: Bottom-sheet on mobile, sidebar-adjacent on desktop
  - `AsteroidGameModal`: Portrait-friendly aspect ratio on mobile
  - `PerformanceDashboard`: Full-width on mobile, fixed panel on desktop
  - `MarsGallery`: Always-visible nav arrows on touch, hover-reveal on desktop
  - `VerticalNav`: Grid menu on mobile, icon sidebar on desktop

### Touch Support
- Gallery swipe via `touchstart`/`touchend` with 50px threshold
- Asteroid game touch steering via `touchmove` Y-position
- Mobile Action Hub with radial expand
- All buttons have `active:scale-95` for tactile feedback

---

## Technology Stack Summary

| Technology | Used For |
|-----------|----------|
| **React 18** | UI framework, Suspense, lazy loading |
| **TypeScript** | Type safety across all components |
| **Vite 6** | Build tool, HMR, code splitting |
| **Tailwind CSS v4** | All styling, utility-first |
| **GSAP 3 + ScrollTrigger** | Scroll animations, pinning, parallax |
| **Framer Motion** | Component enter/exit animations, gestures, layout |
| **Lucide React** | Icon library (consistent line icons) |
| **Canvas 2D** | Asteroid dodge game |
| **SVG + SMIL** | Ship graphics, trajectory maps, inline animations |
| **CSS Gradients** | Planet rendering, atmospheric effects, nebulae |
| **IntersectionObserver** | Lazy loading, viewport-triggered animations |
| **PerformanceObserver** | Web Vitals monitoring |
| **Web Audio API** | Spatial audio, ambient soundscapes |
| **localStorage** | Achievement persistence, user preferences |
| **Supabase** | Edge Functions for AI crew chat (optional) |
