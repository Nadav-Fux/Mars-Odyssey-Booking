# ARES-X Mars Mission — Product Requirements Document

> **Last updated:** February 2026 (v20)

---

## 1. Product Overview

ARES-X is an immersive, cinematic landing page for a fictional luxury Mars space-tourism company. The site is designed as a one-of-a-kind interactive experience that combines storytelling, real-time data visuals, and deep technical detail — all wrapped in a dark sci-fi HUD aesthetic.

The site is split across **6 routes** to keep the core landing page fast and focused, with deeper content on dedicated sub-pages.

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS v4 (design tokens via `theme.css`) |
| Routing | React Router v7 |
| Animation | GSAP (scroll-driven) + Framer Motion (UI transitions) |
| Icons | Lucide React |
| Fonts | Orbitron (display), Space Grotesk (body), Exo 2 (alt) — loaded via `<link>` in `index.html` |
| Backend | Supabase (Backend Cloud) — Edge Functions for AI chat |
| AI | Groq API (Llama 3.3 70B) via Edge Function proxy |

---

## 3. Design System

### Color Tokens (defined in `src/theme.css`)

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#FF4500` (Mars Red) | CTAs, active states, accents |
| `accent` | `#ff6b35` | Highlights, secondary accents |
| `secondary` | `#1a1a2e` | Deep space panels |
| `muted` | `#0d0d1a` | Subtle backgrounds |
| `destructive` | `#ff1744` | Alerts, emergency states |
| `border` | `rgba(255,69,0,0.12)` | Borders, dividers |

### Typography

- **Display font:** Orbitron — headings, nav, HUD labels
- **Body font:** Space Grotesk — paragraphs, descriptions
- **Alt font:** Exo 2 — crew bios, quotes

### Visual Language

- Dark space background (`#050508`)
- Glassmorphism panels (`bg-white/[0.04] backdrop-blur-xl border-white/[0.08]`)
- Ambient glow orbs (low-opacity blurred radials)
- CRT scanline overlay for retro-sci-fi feel
- Glitch text effects on interactive elements

---

## 4. Site Architecture

### 4.1 Routes

| Route | Page | Component | Purpose |
|-------|------|-----------|--------|
| `/` | Landing | `Index.tsx` | The cinematic "wow" experience — Hero, flythrough, reviews, booking |
| `/ship` | The Ship | `ShipPage.tsx` | Deep-dive into the ARES-7 spacecraft — fleet specs, blueprint, tech |
| `/crew` | The Crew | `CrewPage.tsx` | Meet the 6 mission specialists — interactive bio cards |
| `/mission` | Mission Info | `MissionPage.tsx` | Logistics data, weight calculator, FAQ terminal |
| `/explore` | Explore Mars | `ExplorePage.tsx` | Interactive globe, landing zones, panorama, geological scale |
| `/simulate` | Landing Simulator | `SimulatorPage.tsx` | Scroll-driven Mars EDL simulation — 6-phase landing experience |
| `*` | 404 Not Found | `NotFoundPage.tsx` | Cinematic "SIGNAL LOST" page with auto-redirect |

**All pages** are **code-split** via `React.lazy()` in `App.tsx` — including the Index page and 404 page.

### 4.2 Landing Page (`/`) — Sections in order

| # | Section | Component | Loading | Description |
|---|---------|-----------|---------|-------------|
| 1 | **Hero** | `HeroSection` | Eager | Full-viewport Mars globe, launch countdown, kinetic title |
| 2 | **Destinations** | `DestinationsSection` | LazySection + Suspense | Destination cards with terrain profiles, difficulty ratings, status badges, radiation levels, expandable details |
| 3 | **Solar Flythrough** | `SolarFlythrough` | Suspense (100vh fallback) | Scroll-pinned cinematic journey from Earth to Mars |
| 4 | **Experience Timeline** | `ExperienceTimeline` | LazySection + Suspense | 6-phase mission timeline with alternating cards |
| 5 | **Mission Stats** | `MissionStats` | LazySection + Suspense | Radial progress circles, sparkline charts, trend indicators, animated count-up |
| 6 | **Mars Gallery** | `MarsGallery` | LazySection + Suspense | Cinematic image carousel — 6 Mars surface photos with auto-play, lightbox, touch/swipe, metadata overlay, thumbnail strip |
| 7 | **Explore Cards** | `ExploreCards` | LazySection + Suspense | 5 CTA cards linking to `/ship`, `/crew`, `/mission`, `/explore`, `/simulate` |
| 8 | **Reviews** | `ReviewSection` | LazySection + Suspense | Passenger testimonials with draggable rating orbs, animated avatars, star ratings, verified badges |
| 9 | **Gagarin Quote** | `ParallaxQuote` | LazySection + Suspense | Parallax-scroll quote |
| 10 | **Final Transmission** | `FinalTransmission` | Suspense | Terminal-style CTA with typing animation |
| 11 | **Booking** | `BookingPanel` | LazySection + Suspense | Seat selection, cabin picker, booking flow |
| 12 | **Footer** | `Footer` | LazySection + Suspense | Mission Control console footer with system status |

### 4.3 Ship Page (`/ship`) — Sections in order

| # | Section | Component | Loading | Description |
|---|---------|-----------|---------|-------------|
| 1 | Page Header | — | Eager | Animated title + description |
| 2 | **Fleet** | `FleetSection` | LazySection + Suspense | Ship SVG showcase with horizontal-scroll spec panels |
| 3 | **Tsiolkovsky Quote** | `ParallaxQuote` | Eager | Parallax quote |
| 4 | **Window to Mars** | `WindowToMars` | LazySection + Suspense | Interactive porthole with canvas Mars surface |
| 5 | **Tech Specs** | `TechSpecsSection` | LazySection + Suspense | Bento grid + interactive spacecraft blueprint with 3D tilt |
| 6 | **Footer** | `Footer` | LazySection + Suspense | (shared via PageShell) |

### 4.4 Crew Page (`/crew`) — Sections in order

| # | Section | Component | Loading | Description |
|---|---------|-----------|---------|-------------|
| 1 | Page Header | — | Eager | Animated title + description |
| 2 | **Crew Roster** | `CrewRoster` | LazySection + Suspense | 6 crew cards → click opens `CrewBioOverlay` portal |
| 3 | **Footer** | `Footer` | LazySection + Suspense | (shared via PageShell) |

### 4.5 Mission Page (`/mission`) — Sections in order

| # | Section | Component | Loading | Description |
|---|---------|-----------|---------|-------------|
| 1 | Page Header | — | Eager | Animated title + description |
| 2 | **Logistics** | `MissionLogistics` | LazySection + Suspense | Animated SVG O₂/fuel charts, KPI dashboard |
| 3 | **Weight Calculator** | `MarsWeightCalculator` | LazySection + Suspense | Interactive Earth→Mars weight converter with SVG scale |
| 4 | **FAQ** | `FAQSection` | LazySection + Suspense | Terminal-style accordion Q&A |
| 5 | **Footer** | `Footer` | LazySection + Suspense | (shared via PageShell) |

### 4.6 Explore Mars Page (`/explore`) — Sections in order

| # | Section | Component | Loading | Description |
|---|---------|-----------|---------|-------------|
| 1 | Page Header | — | Eager | "EXPLORE MARS" animated title + description |
| 2 | **Mars Explorer Hero** | `MarsExplorerHero` | Suspense | Interactive SVG globe with orbiting HUD ring, floating telemetry readouts, scan sweep, ambient particles, signal connection bar |
| 3 | **Landing Zones Grid** | `LandingZonesGrid` | LazySection + Suspense | 6 zone cards with animated terrain profiles, scan line on hover, signal strength bars, distance progress, coordinates, expand/collapse details |
| 4 | **Mars Panorama** | `MarsPanorama` | LazySection + Suspense | Procedural SVG panorama with 4 time presets (dawn/day/dusk/night), shooting stars, foreground rocks, rover silhouette, lens flare, atmospheric haze, live telemetry, vignette |
| 5 | **Geological Scale** | `GeologicalScale` | LazySection + Suspense | 3 Mars-vs-Earth comparisons with mountain silhouettes, animated count-up numbers, ratio badges, fun facts that reveal after animation |
| 6 | **Closing CTA** | — | Eager | "Ready to Launch?" with link back to mission control |

Section dividers appear between each major section with labeled gradient lines.

### 4.7 Landing Simulator Page (`/simulate`) — Sections in order

| # | Section | Component | Loading | Description |
|---|---------|-----------|---------|-------------|
| 1 | Intro Briefing | — | Eager | Cinematic title, 4 briefing stats (Mach 25, 12G, 2100°C), warning notice, scroll CTA |
| 2 | **Simulator** | `SimulatorExperience` | Suspense | Scroll-pinned 6-phase EDL experience (see §4.7.1) |
| 3 | Post-Landing CTA | — | Eager | "You made it" — Book Your Flight + Explore Mars links |

#### 4.7.1 Simulator Phases (scroll-driven, GSAP pin)

| Phase | Scroll % | Name | Visual Effects |
|-------|----------|------|---------------|
| 1 | 0–15% | **ORBIT** | Mars sphere appears, stars visible, HUD boots, "MARS BELOW" text |
| 2 | 15–28% | **DEORBIT BURN** | Mars grows, engine glow at bottom, altitude dropping |
| 3 | 28–55% | **ATMOSPHERIC ENTRY** | Plasma effect (orange-red edge glow + streaks), screen shake, Mars sphere fades |
| 4 | 55–70% | **PARACHUTE** | Sky clears, chute deploys (SVG + elastic animation), terrain appears, gentle swinging |
| 5 | 70–90% | **POWERED DESCENT** | Retrorockets fire, terrain zooms in, dust cloud rises from ground |
| 6 | 90–100% | **TOUCHDOWN** | White flash, impact shake, dust settles, success overlay: "CONTACT LIGHT" + "TOUCHDOWN" + coordinates |

**Simulator visual layers (z-ordered):**
- Stars (background)
- Mars sphere (orbit phase)
- Plasma effect (entry phase)
- Parachute SVG (chute phase)
- Terrain SVG (3-layer procedural, descent phase)
- Retrorocket glow (descent phase)
- Dust cloud (landing phase)
- White flash (touchdown)
- Crosshair overlay (always)
- Scanlines + vignette (always)
- Success overlay (touchdown phase)

**Simulator instruments (`FlightHUD`):**
- Phase indicator with status dot + label
- "LIVE TELEMETRY" badge
- Altitude readout (digital, large)
- Bar gauges: Velocity (m/s), G-Force (G), Heat Shield Temp (°C)
- Danger mode: bars turn red when G > 8 or temp > 1500°C
- Mobile: simplified with speed readout only

---

## 5. Navigation

### 5.1 Main Page — `VerticalNav`

- Fixed left sidebar (desktop) / top bar (mobile)
- **Scroll items:** Home, Destinations, Flythrough, Experience, Reviews, Book
- **Page links** (separated by divider): The Ship →, The Crew →, Mission Info →, Explore Mars →, Simulator →
- Active section tracked via scroll position (IntersectionObserver)
- Animated tooltips on hover (desktop)
- Scroll progress indicator at bottom (desktop)
- **Mobile:** Logo left, 3 page-link icon buttons center, hamburger right
  - Hamburger opens dropdown with scroll sections + page links
  - On screens ≥400px: page buttons show short labels (SHIP, CREW, INFO)

### 5.2 Sub-pages — `SubPageNav`

- Fixed top horizontal bar (desktop + mobile)
- ARES-X logo → links to home
- Tab links: Home, The Ship, The Crew, Mission Info, Explore Mars, Simulator (active state for current page)
- "Back to Home" link on the right (desktop)
- Mobile: hamburger with all links

### 5.3 Explore Cards (main page)

5 cinematic gateway cards in a responsive grid (`lg:grid-cols-3 xl:grid-cols-5`):

| Card | Route | Icon | Accent |
|------|-------|------|--------|
| The Ship | `/ship` | Ship | #FF4500 |
| The Crew | `/crew` | Users | #a855f7 |
| Mission Info | `/mission` | ClipboardList | #4ab8c4 |
| Explore Mars | `/explore` | Globe | #6b8aed |
| Simulator | `/simulate` | Crosshair | #ef4444 |

### 5.4 Cross-cutting Navigation Components

| Component | Purpose |
|-----------|--------|
| `ScrollToTop` | Resets scroll to top on every route change (`behavior: 'instant'`) |
| `PageTransition` | Framer Motion fade/scale/blur between routes + dynamic `ScrollTrigger.refresh()` |
| `BackToTop` | Floating button to scroll back to top (positioned above `SpaceAudio`) |

---

## 6. Shared Layout & Overlays

### 6.1 Always-on layers (main page)

Critical path (eagerly loaded):

| Component | Purpose |
|-----------|--------|
| `BootSequence` | First-visit spacecraft computer boot animation (wraps entire app in `App.tsx`) |
| `StarField` | Animated star particle background |
| `NebulaBackground` | Subtle colored nebula blurs |
| `VerticalNav` | Navigation sidebar / mobile top bar |
| `HeroSection` | Above-the-fold hero with Mars globe |

Deferred HUD controls (lazy-loaded, mounted after 300ms via `DeferredMount`):

| Component | Purpose |
|-----------|--------|
| `CustomCursor` | Custom glowing cursor |
| `ScanlineOverlay` | CRT monitor scanline effect |
| `ScrollProgress` | Top progress bar |
| `BatterySaverToggle` | Disable heavy animations (fixed bottom-left) |
| `LocaleToggle` | Language switcher (fixed top-right, `top-[56px]` on mobile to avoid nav overlap) |
| `DiscoveryToggle` + `DiscoveryMode` | Hidden discovery mode |
| `LaunchShake` | Screen rumble effect leaving Hero |
| `BackToTop` | Floating rocket button to scroll to top |
| `CrewCommsLog` | Toggleable Earth↔Mars communications feed (fixed bottom-left) |
| `TelemetryBar` | Live mission telemetry strip at top of viewport |

### 6.2 Deferred overlays (lazy-loaded, mounted 2-5s after paint)

| Component | Delay | Purpose |
|-----------|-------|--------|
| `CommandTerminal` | 2s | Hidden terminal (keyboard shortcut) |
| `CommandPalette` | 2s | Spotlight command palette (Ctrl+K or ?) |
| `EmergencyButton` | 2s | Emergency alert Easter egg |
| `SpaceAudio` + `SoundscapeEngine` | 2s | Ambient space audio |
| `AlertOverlay` | 2s | Red alert mode |
| `SatelliteOverlay` + `SatelliteToggle` | 2s | Satellite view mode |
| `MarsClock` | 2s | Mars time display (desktop only, `hidden lg:block`) |
| `DustStorm` | 5s | Random dust storm effect (~2min) |
| `IncomingTransmission` | 5s (lazy mount) + ~60s (internal timer) | Surprise crew message notification |
| `ShipAI` | 5s (lazy mount) + ~40s (idle threshold) | ARIA ambient AI messages |
| `DiscoveryHints` | 5s (lazy mount) + 15s-140s (per hint) | First-visit feature discovery nudges |
| `ClassifiedOverlay` | Eager (Suspense) | Konami Code easter egg overlay (triggered by keyboard input) |

### 6.3 Sub-page shell (`PageShell`)

Wraps `/ship`, `/crew`, `/mission`, `/explore`, `/simulate` with:
- StarField, NebulaBackground, CustomCursor
- SubPageNav
- BackToTop, ScrollProgress
- Footer (LazySection)
- ScanlineOverlay
- Ambient glow orbs

---

## 7. Key Components Reference

### Interactive / Heavy

| Component | Features |
|-----------|----------|
| `BootSequence` | First-visit cinematic spacecraft boot animation. Terminal-style typing of system diagnostics (NAV, COMMS, LIFE-SUP, NTP-DRV, RAD-SHLD, DOCKING), progress bar, ARES-X logo reveal, dramatic fade-out. Shows once per session (sessionStorage). Click to skip. Scanline + vignette overlays. |
| `IncomingTransmission` | Surprise notification from Mars crew (~55-70s after page load). Random crew member (4 variants: Vasquez, Chen, Patel, Torres) with callsign + role. Typing message effect, signal delay info, encrypted badge. Slides in from right. Auto-dismiss after 18s. Once per session. |
| `ClassifiedOverlay` | Konami Code (↑↑↓↓←→←→BA) unlocks a "CLASSIFIED" overlay. Features: glitch flash entry, "TOP SECRET" badge, "PROJECT DEEP-HORIZON" title, 9 intel rows with typing reveal (some redacted in red), live animated signal waveform SVG (1.42 GHz Hydrogen Line), CRT scanlines, watermark. |
| `CrewCommsLog` | Toggleable floating chat panel (fixed bottom-left). Shows 12 timestamped Earth↔Mars messages with sender names, color-coded bubbles (blue=Earth, orange=Mars), signal delay indicators, connection header/footer. Auto-scrolls to latest. Notification dot on toggle button. |
| `TelemetryBar` | Fixed top bar with live-updating mission telemetry. 7 data points: Mission Elapsed Time (counting clock), Distance to Mars, Velocity, Hull Temperature, O₂ Level, Fuel Remaining, Signal Strength. Updates 10×/sec. Auto-hides when scrolled past 2× viewport height. Desktop only (hidden lg:block). |
| `CrewChat` | AI crew chat (online + offline) — fixed bottom-left. 4 selectable crew (Vasquez, Chen, Patel, Torres) each with unique personality, role, and color. **Online mode:** Chat via Groq LLM (Llama 3.3 70B) through Edge Function proxy. **Offline mode:** 40+ keyword-matched scripted responses (10 per crew) + generic fallbacks, simulated signal delay (800–2300ms). Auto-detects backend availability. Shows "LOCAL" vs "AI LIVE" indicator. Features: crew picker dropdown, typing indicator, auto-scroll, per-crew welcome messages, signal delay flavor text. Fixed bottom-left toggle button with crew-colored accent. Unlocks "Mars Pen Pal" + "Roll Call" achievements. |
| `NotFoundPage` | Cinematic 404 — "SIGNAL LOST" page. Static noise background, floating SVG astronaut, progressive terminal diagnostics, 15s auto-redirect countdown, "Mission Control" + "Go Back" buttons, vignette + scanlines. |
| `MarsGlobe` / `RealisticMars` | Animated 3D Mars — CSS-rotated texture (WebP) + SVG interactive globe with landing zones. Mobile: enlarged touch targets, tap-to-toggle tooltips, smart tooltip clamping, adaptive hint text |
| `SolarFlythrough` | GSAP ScrollTrigger-pinned 6-phase space journey (pin + scrub, 500vh scroll) |
| `SimulatorExperience` | GSAP ScrollTrigger-pinned 6-phase Mars landing (pin + scrub, 600vh scroll). Phases: orbit → deorbit → entry → chute → powered descent → touchdown. Visual layers: stars, Mars sphere, plasma, parachute SVG, 3-layer procedural terrain, retrorockets, dust cloud, flash, crosshair, success overlay |
| `FlightHUD` | SVG-based flight instruments — circular gauges, bar gauges (with danger mode), altitude readout, phase indicator, crosshair overlay |
| `MarsExplorerHero` | Interactive globe with orbiting HUD ring (8 data nodes, rotating SVG), floating telemetry readouts with typing number animation, periodic scan sweep with expanding wave, 30 ambient particles, signal connection bar with animated bars |
| `LandingZonesGrid` | 6 zone cards with animated terrain drawing (polyline + scan line on hover), signal strength bars (1-5), distance-from-base progress bar, lat/lon coordinates, zone index badges, expandable descriptions |
| `MarsPanorama` | Procedural SVG panorama with 4 time presets. Features: 3 shooting stars (night/dusk), foreground rock silhouettes, rover silhouette with blinking antenna, lens flare (horizontal + vertical + secondary dots), atmospheric haze layer, live telemetry (temp/wind/pressure per time), vignette, scanlines |
| `GeologicalScale` | 3 Mars-vs-Earth comparisons with SVG mountain/canyon silhouettes (not just bars), animated count-up numbers (IntersectionObserver + rAF), "2.5× taller" ratio badges, fun facts that reveal 2.5s after scroll-in, subtle grid lines |
| `SpacecraftBlueprint` | Interactive SVG blueprint with 3D tilt (perspective + rAF), clickable subsystems |
| `BlueprintDetailOverlay` | Portal-based modal for each ship subsystem |
| `CrewBioOverlay` | Portal-based astronaut bio overlay with SVG portrait |
| `BookingPanel` + `BookingOverlay` | Multi-step booking flow with seat map |
| `WindowToMars` | Canvas-based Mars porthole with scan effects |
| `MissionLogistics` | Animated SVG line charts with hover tooltips |
| `MarsWeightCalculator` | Animated SVG balance scale |
| `CommandTerminal` | Hidden interactive terminal with theme engine + Asteroid Dodge mini-game + Boarding Pass |
| `AsteroidGame` | Canvas-based asteroid dodge game inside terminal (see §13) |
| `BoardingPass` | Cinematic commander boarding pass overlay — name, callsign, clearance level, mission time, achievements, stats, barcode. Accessible via floating button (desktop) + terminal `passport` command. |
| `BoardingPassButton` | Floating button (desktop-only, top-right) to open BoardingPass overlay. Lazy-loads BoardingPass on first open. |
| `MobileActionHub` | Mobile-only FAB (⚡) at bottom-right. Expands into a stacked action menu: Boarding Pass, Mission Log, Achievements, Terminal, Command Palette, Asteroid Dodge. Opens inline mobile-optimized panels for log/achievements/boarding pass. Unread badge from Mission Log. |
| `DiscoveryHints` | First-visit nudges pointing to hidden features. 5 timed hints (terminal, Ctrl+K, double-click globe, achievements, game). Each shows once ever (localStorage). Pill-shaped toast at bottom-center, pulsing dot, auto-dismiss 8s, click to dismiss. Respects Battery Saver. |
| `MissionComplete` | Capstone ceremony — triggered when all 12 achievements are unlocked. Full-screen overlay with canvas confetti (4 waves, 120 particles each), dramatic staggered reveal: ALPHA-1 badge, "MISSION COMPLETE" title, commander name + callsign, stats (achievements / 100% / hi-score), all 12 achievement icons with spring animation, certificate text. Once per session. Logs to Mission Log. |
| `ExploreCards` | 5 cinematic CTA cards linking to sub-pages (grid: 3 cols lg, 5 cols xl) |
| `MarsGallery` | Cinematic Mars surface image carousel. 6 high-res photos with: crossfade transitions (Framer Motion), auto-play (6s interval, pauses on hover), full-screen lightbox mode (ESC to close), keyboard navigation (← →), touch/swipe support, per-image metadata overlay (location coordinates, SOL date, camera name), thumbnail strip with active indicator, progress bar. Unlocks "Stargazer" achievement on sunset image view, "Mars Cartographer" when all 6 images viewed. |
| `PerformanceDashboard` | Real-time Web Vitals HUD in ARES-X style. Small pill badge (top-right) shows overall health status (NOMINAL/CAUTION/CRITICAL); expands to full panel with: FCP, LCP, CLS, TTFB, INP metrics with color-coded thresholds and progress bars, real-time FPS counter (rAF-based), DOM node count, JS heap usage (Chrome only). Toggleable via click, Command Palette, or custom event. Scanline overlay. |
| `AsteroidGameModal` | Standalone fullscreen overlay wrapper for `AsteroidGame`. Opens via: Ctrl+G keyboard shortcut, Command Palette "Asteroid Dodge" action, MobileActionHub button, or `open-asteroid-game` custom event. 16:9 container with themed header bar, scanlines, hint footer. ESC or Ctrl+G to close. Logs game start/end to Mission Log. |

### Upgraded Main-Page Sections (v4)

| Component | Upgrades in v4 |
|-----------|----------------|
| `DestinationsSection` | Animated terrain profile SVG per destination, difficulty rating dots (1-5), status badges (OPEN/LIMITED/WAITLIST), radiation level indicator, signal strength bars, distance from base, expandable detail panel with border separator, scan line animation on hover |
| `MissionStats` | Radial SVG progress circles with pulse dot at arc end, mini sparkline charts (12-month history), trend indicators (+N YoY with green arrow), card-based layout with hover glow + bottom accent line |
| `ReviewSection` | Animated avatar with orbiting SVG ring, "Verified MarsTraveler" badge (BadgeCheck icon), star rating display, cabin class tags (Pioneer Suite, Explorer Pod, etc.), summary stats header (avg rating + review count), enhanced card hover effects (glow + border) |

### Animation Utilities

| Component | Purpose |
|-----------|--------|
| `GlitchText` | CSS glitch text effect |
| `RevealText` | GSAP scroll-triggered text reveal |
| `ParallaxQuote` | Scroll-parallax fullscreen quote |
| `AnimatedCounter` | Number counting animation |
| `KineticTitle` | Animated hero title |
| `MagneticButton` | Cursor-attracted button |
| `LazySection` | IntersectionObserver-based lazy mounting (600px rootMargin) |
| `DeferredMount` | Time-delayed mounting |

---

## 8. Hooks

| Hook | Purpose |
|------|--------|
| `useBatterySaver` | Context — disable heavy animations globally |
| `useLocale` | Context — i18n language switching (EN/HE) |
| `useDiscoveryMode` | Context — hidden discovery mode |
| `useSatelliteMode` | Context — satellite view overlay |
| `useAlertMode` | Red alert toggle |
| `useParallax` | Parallax scroll offset |
| `useKonamiCode` | Detects ↑↑↓↓←→←→BA keyboard sequence, returns `activated` + `reset` |
| `useFavicon` | Dynamic emoji favicon per route |
| `useAchievements` | Achievement system context — `unlock(id)`, `isUnlocked(id)`, `totalUnlocked`, `totalAchievements`, toast notifications via `lastUnlocked`. 12 achievements total. Persists in localStorage. Auto-unlocks `first_visit` on mount. |
| `useMissionLog` | Mission log context — `log(icon, text)`, `logNav(page)`, `logAchievement(title, icon)`, `logEvent(text)`, `clearLog()`, `unreadCount`, `markRead()`. Persists in localStorage. Auto-deduplicates within 5s. Max 80 entries. |
| `usePageTitle` | Dynamic browser tab title per route + Tab Away easter egg via Page Visibility API. When user leaves tab: random "Come back, Commander!" message. On return: restores title + fires callback. |
| `useCinemaMode` | Cinema Mode context — `isCinemaMode`, `toggle()`, `enable()`, `disable()`. Hides all floating UI for clean screenshots. Global `P` key listener. Shows minimal indicator at bottom. |

### 8.1 Achievement System (12 achievements)

| ID | Title | Icon | Trigger | Secret? |
|----|-------|------|---------|---------|
| `first_visit` | First Contact | 🚀 | Visit the site (auto) | No |
| `explorer` | Deep Space Explorer | 🌌 | Visit all 6 pages | No |
| `terraformed` | Planet Engineer | 🌍 | Double-click Mars globe | Yes |
| `konami` | Classified Access | 🔓 | Enter Konami Code | Yes |
| `crew_chat` | Mars Pen Pal | 💬 | Chat with any crew member | No |
| `simulator` | Touchdown | 🎯 | Complete landing simulator or score ≥50 in Asteroid Dodge | No |
| `booking` | Ticket to Mars | 🎟️ | Open the booking panel | No |
| `signal_lost` | Signal Lost | 📡 | Visit a 404 page | Yes |
| `night_sky` | Stargazer | 🌙 | View Mars sunset in Gallery | No |
| `all_crew` | Roll Call | 👨‍🚀 | Chat with all 4 crew members | Yes |
| `speed_demon` | Speed Demon | ☄️ | Score ≥100 in Asteroid Dodge | Yes |
| `cartographer` | Mars Cartographer | 🗺️ | View all 6 gallery images | No |

Unlocking all 12 triggers the **Mission Complete Ceremony** (confetti, certificate, commander stats).

---

## 9. Libraries (in `src/lib/`)

| File | Purpose |
|------|--------|
| `gsap.ts` | GSAP + ScrollTrigger registered, performance defaults, lagSmoothing |
| `easing.ts` | Shared easing curves (EXPO_OUT, EXPO_IN_OUT, etc.) |
| `i18n.ts` | Translation strings (EN/HE) |
| `biometric-lottie.ts` | Lottie animation data for crew biometrics |

---

## 10. Performance Strategy

### 10.1 Loading Architecture

The site is designed for maximum first-paint speed. The critical rendering path is kept as small as possible:

```
index.html
├── <link preconnect> to fonts.googleapis.com + fonts.gstatic.com
├── <link stylesheet> for Google Fonts (Orbitron, Space Grotesk, Exo 2)
├── <script type="module"> → main.tsx
│   ├── App.tsx (React, Router, Providers, PageTransition)
│   │   ├── LazyLoadErrorBoundary (wraps all routes — auto-retry on chunk failures)
│   │   └── Index.tsx (lazy) → StarField, VerticalNav, HeroSection, NebulaBackground
│   │       ├── DeferredMount(300ms) → Cursor, Scanlines, Toggles, BackToTop,
│   │       │                          CrewChat, AchievementPanel, MissionLog,
│   │       │                          MobileActionHub, PerformanceDashboard, AsteroidGameModal
│   │       ├── DeferredMount(2s) → Terminal, CommandPalette, Audio, MarsClock, Overlays
│   │       ├── DeferredMount(5s) → DustStorm, IncomingTransmission, ShipAI, DiscoveryHints
│   │       └── LazySection → Destinations, Flythrough, Timeline, Stats, Gallery, ...
│   └── Other pages (lazy) → ShipPage, CrewPage, MissionPage, ExplorePage, SimulatorPage
└── GSAP loaded dynamically (not in main bundle)
```

### 10.2 Optimization Techniques

| Strategy | Implementation |
|----------|---------------|
| **Font loading** | Moved from CSS `@import` (render-blocking waterfall) to HTML `<link>` with `preconnect` hints — eliminates 2-3 network hops |
| **Image optimization** | Mars texture converted from PNG (462 KB) to WebP (63 KB) — 86% savings |
| **Page-level code splitting** | All 6 pages are `React.lazy()` in `App.tsx` — including Index |
| **Error recovery** | `LazyLoadErrorBoundary` wraps all routes — auto-retries failed dynamic imports (up to 2×), then hard-reloads. Prevents stale HMR cache crashes. |
| **GSAP dynamic import** | `PageTransition` uses `import('@/lib/gsap')` instead of static import — GSAP stays out of the main bundle entirely |
| **Section-level code splitting** | Every below-fold section uses `React.lazy()` + `Suspense` |
| **Lazy mounting** | `LazySection` mounts children only when within 600px of viewport (IntersectionObserver) |
| **3-tier deferred loading** | Tier 1: Eager (above-fold only). Tier 2: DeferredMount(300ms) for HUD controls. Tier 3: DeferredMount(2-5s) for overlays |
| **Battery saver** | Global toggle disables GSAP animations, particles, CRT effects |
| **Multi-page split** | Heavy content distributed across 6 routes instead of 1 mega-page |
| **rAF animations** | 3D tilt, cursor effects, and count-up numbers use requestAnimationFrame, not React state |
| **will-change hints** | Applied to transform-heavy elements |
| **ScrollTrigger refresh** | Triple-layer refresh (PageTransition, useGSAP, delayed useEffect) ensures GSAP pin calculations are always correct after page transitions |
| **GSAP scoping** | All `useGSAP` calls use `{ scope: ref }` to prevent selector leaks between pages |

---

## 11. Responsive Design

### 11.1 Fixed Element Layout (bottom-right corner)

Multiple floating widgets are stacked vertically to prevent overlap:

**Mobile (< lg):**

| Element | Position | Notes |
|---------|----------|-------|
| `MobileActionHub` | `bottom-5 right-5` | FAB button opening action menu + inline panels |
| `MarsClock` | **Hidden** | `hidden lg:block` — saves screen real estate |
| `SpaceAudio` | `bottom-5 right-5` | Audio toggle button — behind FAB, accessible when FAB closed |
| `BackToTop` | `bottom-[4.25rem] right-6` | Above SpaceAudio |

**Desktop (lg+):**

| Element | Position | Notes |
|---------|----------|-------|
| `MarsClock` | `bottom-5 right-5` | Collapsible Mars time widget |
| `SpaceAudio` | `bottom-16 right-5` | Above MarsClock |
| `BackToTop` | `bottom-[6.5rem] right-6` | Above SpaceAudio |

Other fixed elements:
- `BatterySaverToggle`: `bottom-6 left-6` (all screens)
- `LocaleToggle`: `top-[56px] right-3` (mobile) / `top-6 right-6` (desktop)

### 11.2 MarsGlobe Mobile Adaptations

| Feature | Desktop | Mobile |
|---------|---------|--------|
| Rotation | Drag to rotate | Swipe to rotate |
| Tooltips | Hover to show | Tap to toggle |
| Touch targets | Visible dot (3.5px) | Invisible hit area (12px radius min) |
| Tooltip position | Fixed offset from marker | Smart clamping — flips left/right/top/bottom to stay in bounds |
| Hint text | "DRAG TO ROTATE" | "SWIPE TO ROTATE · TAP MARKERS" |
| Dismiss tooltip | Pointer leave | Tap globe background |

### 11.3 Simulator Mobile Adaptations

| Feature | Desktop | Mobile |
|---------|---------|--------|
| Flight instruments | Full bar gauges (velocity, G-force, heat) | Simplified speed readout only |
| HUD data | All 4 telemetry readouts on MarsExplorerHero | Hidden (sm:flex) |
| Panorama telemetry | 3 data points (temp, wind, pressure) | Temp only, wind on sm, pressure on md |

### 11.4 Breakpoint Coverage

Components with strong responsive design (10+ breakpoints):
- `HeroSection`, `ExperienceTimeline`, `TechSpecsSection`, `FleetSection`
- `DestinationsSection`, `ReviewSection`, `SolarFlythrough`, `MissionLogistics`
- `SimulatorExperience`, `MarsExplorerHero`, `LandingZonesGrid`, `MarsPanorama`

---

## 12. File Structure

```
src/
├── main.tsx                          # Entry point (BrowserRouter)
├── App.tsx                           # 7 lazy routes + providers + BootSequence + ScrollToTop + PageTransition
├── index.css                         # Tailwind imports (DO NOT EDIT)
├── theme.css                         # Design tokens (colors, fonts, radii) — NO @import
│
├── pages/
│   ├── Index.tsx                     # Landing page (/) — lazy-loaded in App.tsx
│   ├── ShipPage.tsx                  # Ship page (/ship)
│   ├── CrewPage.tsx                  # Crew page (/crew)
│   ├── MissionPage.tsx               # Mission page (/mission)
│   ├── ExplorePage.tsx               # Explore Mars page (/explore)
│   ├── SimulatorPage.tsx             # Landing Simulator page (/simulate)
│   └── NotFoundPage.tsx              # 404 "SIGNAL LOST" page
│
├── layouts/
│   └── PageShell.tsx                 # Shared shell for sub-pages (bg, nav, footer)
│
├── components/                       # ~85+ components
│   ├── BootSequence.tsx              # First-visit boot animation (wraps app)
│   ├── IncomingTransmission.tsx      # Surprise crew message notification
│   ├── VerticalNav.tsx               # Main page nav (scroll items + 5 page links)
│   ├── SubPageNav.tsx                # Sub-page top nav bar (6 links incl. Simulator)
│   ├── ExploreCards.tsx              # 5 CTA cards to sub-pages (xl:5-col grid)
│   ├── ScrollToTop.tsx               # Route-change scroll reset
│   ├── PageTransition.tsx            # Framer Motion route transitions + dynamic GSAP import
│   ├── LazySection.tsx               # IntersectionObserver lazy mount wrapper
│   ├── DeferredMount.tsx             # Time-delayed mount wrapper
│   │
│   ├── # Landing page sections
│   ├── HeroSection.tsx               # Hero with Mars globe + countdown
│   ├── DestinationsSection.tsx       # 4 destination cards (terrain, difficulty, status, radiation)
│   ├── SolarFlythrough.tsx           # Scroll-pinned cinematic journey (GSAP pin)
│   ├── ExperienceTimeline.tsx        # 6-phase mission timeline
│   ├── MissionStats.tsx              # Radial progress, sparklines, trends
│   ├── MarsGallery.tsx               # Mars image carousel + lightbox (v20)
│   ├── ReviewSection.tsx             # Reviews with draggable orbs, animated avatars
│   ├── FinalTransmission.tsx         # Terminal CTA
│   ├── BookingPanel.tsx              # Booking flow
│   │
│   ├── # Explore page components
│   ├── MarsExplorerHero.tsx          # Globe with orbiting HUD ring + telemetry
│   ├── LandingZonesGrid.tsx          # 6 zone cards with terrain + signals + distance
│   ├── MarsPanorama.tsx              # Procedural panorama with time-of-day + rover
│   ├── GeologicalScale.tsx           # Mars-vs-Earth with silhouettes + fun facts
│   ├── MarsGlobe.tsx                 # Interactive SVG globe (mobile-optimized)
│   │
│   ├── # Simulator components
│   ├── simulator/
│   │   ├── SimulatorExperience.tsx    # 6-phase scroll-pinned EDL simulation
│   │   └── FlightHUD.tsx             # SVG flight instruments + crosshair
│   │
│   ├── # Ship page components
│   ├── SpacecraftBlueprint.tsx       # Interactive 3D-tilt SVG blueprint
│   ├── BlueprintDetailOverlay.tsx    # Subsystem detail modals
│   ├── FleetSection.tsx              # Ship showcase
│   ├── TechSpecsSection.tsx          # Bento grid specs
│   ├── WindowToMars.tsx              # Interactive porthole
│   │
│   ├── # Crew page components
│   ├── CrewRoster.tsx                # Crew cards grid
│   ├── CrewBioOverlay.tsx            # Crew bio portal overlay
│   │
│   ├── # Mission page components
│   ├── MissionLogistics.tsx          # SVG charts
│   ├── MarsWeightCalculator.tsx      # Weight converter
│   ├── FAQSection.tsx                # Terminal Q&A
│   │
│   ├── # HUD / Overlay components (v15-v20)
│   ├── CommandTerminal.tsx           # Interactive terminal with theme engine + game
│   ├── CommandPalette.tsx            # Spotlight command search (Ctrl+K)
│   ├── AsteroidGame.tsx              # Canvas mini-game (inside terminal)
│   ├── AsteroidGameModal.tsx         # Standalone fullscreen game modal (Ctrl+G) (v20)
│   ├── BoardingPass.tsx              # Commander boarding pass overlay
│   ├── BoardingPassButton.tsx        # Floating button for boarding pass
│   ├── AchievementPanel.tsx          # Achievement list panel
│   ├── AchievementToast.tsx          # Achievement unlock toast
│   ├── MissionLog.tsx                # Captain's journal panel
│   ├── MissionComplete.tsx           # All-achievements capstone ceremony
│   ├── MobileActionHub.tsx           # Mobile FAB + action menu
│   ├── CrewChat.tsx                  # AI crew chat (online + offline) (v20)
│   ├── PerformanceDashboard.tsx      # Web Vitals HUD (v20)
│   ├── DiscoveryHints.tsx            # First-visit feature nudges
│   ├── LazyLoadErrorBoundary.tsx     # Dynamic import error recovery (v20)
│   ├── ShipAI.tsx                    # ARIA ambient AI messages
│   │
│   └── ...                           # See Section 7 for full list
│
├── hooks/
│   ├── useAlertMode.ts
│   ├── useBatterySaver.tsx
│   ├── useDiscoveryMode.tsx
│   ├── useLocale.tsx
│   ├── useParallax.ts
│   ├── useSatelliteMode.tsx
│   ├── useKonamiCode.ts            # Konami Code sequence detection
│   ├── useAchievements.tsx          # Achievement system (12 achievements, localStorage)
│   ├── useFavicon.ts                # Dynamic emoji favicon per route
│   ├── useMissionLog.tsx            # Captain's Journal context + auto-logging
│   ├── useCinemaMode.tsx            # Cinema Mode context (hide all UI)
│   └── usePageTitle.ts             # Dynamic page titles + tab-away detection
│
├── lib/
│   ├── gsap.ts                       # GSAP + ScrollTrigger config
│   ├── easing.ts                     # Shared easing curves
│   ├── i18n.ts                       # Translation strings
│   └── biometric-lottie.ts           # Lottie data
│
├── assets/
│   └── generated/
│       ├── mars-texture.webp         # 63 KB (optimized from 462 KB PNG)
│       └── mars-texture.png          # Legacy — no longer imported
│
└── integrations/
    └── supabase/                     # (Not enabled — no database)
```

---

## 13. Easter Eggs & Hidden Features

| Feature | Trigger | Effect |
|---------|---------|--------|
| Boot Sequence | First visit (once per session) | Cinematic spacecraft computer startup — terminal diagnostics, progress bar, logo reveal |
| Incoming Transmission | Auto (~60s into main page, once per session) | Surprise notification from Mars crew with typed message |
| Konami Code | ↑↑↓↓←→←→BA on keyboard | "CLASSIFIED ACCESS GRANTED" overlay with secret mission intel, redacted text, live alien signal waveform |
| **Terraformed Mars** | **Double-click the Mars globe in Hero** | **Globe shifts to green/blue Earth-like planet (hue-rotate + blue atmosphere + ocean shimmer). "TERRAFORMED · YEAR 2340" badge appears. Double-click again to revert.** |
| **Animated Favicon** | **Navigate between pages** | **Browser tab icon changes per route: 🚀 Home, 🛸 Ship, 👨‍🚀 Crew, 📋 Mission, 🌍 Explore, 🎯 Simulate** |
| AI Crew Chat | Click crew chat icon (bottom-left) | Live AI conversation with 4 crew members — powered by Groq LLM (Llama 3.3 70B) |
| Secret Transmission | Click footer logo 5 times | Toast message from Olympus Base |
| Command Terminal | Keyboard shortcut | Interactive terminal overlay |
| Red Alert | Emergency Button | Full-screen red alert mode |
| Discovery Mode | Discovery Toggle | Hidden interactive mode |
| Dust Storm | Auto (~2 minutes) | Atmospheric dust particles |
| Mars Clock | Always visible on desktop (deferred) | Real-time Mars sol time |
| Rating Orbs | Drag & fling review orbs | Physics-enabled orb throwing with counter |
| Rover Antenna | Look at panorama rover | Blinking red antenna light on rover silhouette |
| ARES-7 Orbital | Look at panorama sky | Moving orbital dot crossing the sky every 12s |
| 404 Signal Lost | Navigate to invalid URL | Cinematic lost-in-space page with floating astronaut + auto-redirect |
| **Asteroid Dodge** | **Type `game` in terminal, press Ctrl+G, or via Command Palette / Mobile Hub** | **Canvas mini-game in standalone fullscreen modal. Arrow keys/WASD/touch to steer. Score = time survived. Speed ramps up. High score in localStorage. Score ≥50 unlocks "Touchdown", ≥100 unlocks "Speed Demon".** |
| **Commander's Boarding Pass** | **Click 🎫 button (desktop) or type `passport` in terminal** | **Cinematic boarding pass card: editable commander name, random callsign (persisted), clearance level based on achievements, board date, mission elapsed time, pages visited, asteroid high score, earned credential badges, decorative barcode, cabin class, seat number. Data from localStorage.** |
| **ARIA Ship AI** | **Stay idle for ~40 seconds** | **Ambient AI messages from the ship's onboard intelligence ("ARIA"). Subtle cyan-accented toast at bottom-center. 20 ambient messages + 5 long-idle messages. After 2+ min idle, switches to personal "Commander, are you there?" pool. Non-intrusive, auto-dismisses.** |
| **Command Palette** | **Press Ctrl+K or ?** | **Modern spotlight-search palette. Fuzzy search all pages, sections, actions, shortcuts, and easter egg hints. Keyboard navigable. Quick launch terminal, boarding pass, theme reset, game, or jump to any page/section.** |
| **Captain's Mission Log** | **Click 📜 LOG button (desktop, bottom-left) or type `log` in terminal** | **Auto-recording journal of the user's journey. Entries generated by: page navigation, achievement unlocks, crew chat, booking, Konami Code, first visit. Timeline format with Sol day + MET timestamps. Persistent across sessions.** |
| **Tab Away** | **Switch to another browser tab** | **Page title changes to a random message ("Come back, Commander!", "Mars is waiting…", etc.). On return: title restores and "Commander returned to Mission Control." is logged to Mission Log.** |
| **Cinema Mode** | **Press P, type `cinema` in terminal, or via Command Palette** | **Hides all floating UI (nav, buttons, telemetry, overlays) with a smooth fade. Only page content + background remain. Minimal "CINEMA MODE · P to exit" indicator at bottom. Perfect for screenshots.** |
| **Mars Gallery** | **Scroll to gallery section or search "gallery" in Command Palette** | **Cinematic carousel of 6 Mars surface images. Auto-play (6s), crossfade transitions, lightbox mode, keyboard/touch/swipe nav, image metadata (location, SOL, camera), thumbnail strip, progress bar. View sunset → "Stargazer" achievement. View all → "Mars Cartographer" achievement.** |
| **Performance Dashboard** | **Click gauge badge (top-right) or search "performance" in Command Palette** | **Real-time Web Vitals HUD with space-themed aesthetics. FCP, LCP, CLS, TTFB, INP metrics in cyan accent. Live FPS counter, DOM node count, JS heap. Toggleable via click, keyboard, or custom event. Scanline overlay.** |
| **Standalone Asteroid Game** | **Press Ctrl+G, Command Palette "Asteroid Dodge", or Mobile Hub** | **Full-screen modal wrapper for Asteroid Dodge. Opens without terminal. 16:9 container, header bar, scanlines, hint footer. ESC/Ctrl+G to close.** |
| **Offline Crew Chat** | **Click crew chat icon (bottom-left)** | **Crew Chat now works without backend. 10+ keyword-matched scripted responses per crew member + generic fallbacks. Simulated signal delay. Falls back gracefully when Supabase unavailable. Shows "LOCAL" vs "AI LIVE" indicator.** |

---

## 14. Version History

| Version | Date | Changes |
|---------|------|---------|
| v1 | Dec 2025 | Initial launch — cinematic landing page with 6 routes, dark HUD aesthetic, GSAP scroll-driven animations, real-time data visuals, AI-powered crew chat, responsive design |
| v2 | Dec 2025 | Added 404 Not Found page with "SIGNAL LOST" animation, improved MarsGlobe performance, optimized image assets, added Konami Code Easter Egg |
| v3 | Dec 2025 | Added immersive landing simulator route with 6-phase scroll-driven EDL experience, optimized performance across all routes, added MarsClock component |
| v4 | Feb 2026 | Added Mars Gallery (cinematic carousel), Performance Dashboard (Web Vitals HUD), Standalone Asteroid Game, Offline Crew Chat (keyword-matched AI), Achievement system (12 achievements), Mission Complete Ceremony, Cinema Mode |
| v5 | Feb 2026 | Added Mars Audio, Mars Atmosphere, Mars Navigation, Mars Reviews (animated review system), FAQ terminal, Explore page (procedural panorama), Geological Scale, Telemetry strip, ARIA AI messages, Discovery Hints, Lazy Load Error Boundary |
| v6 | Feb 2026 | Added Command Terminal with theme engine, Command Palette (Ctrl+K), Boarding Pass overlay, Mission Log system, MobileActionHub, Tab Away detection, Discovery Hints system |
| v7 | Feb 2026 | Mobile responsive overhaul — CrewChat bottom-sheet, AsteroidGameModal portrait-friendly, PerformanceDashboard mobile layout, MarsGallery touch support, VerticalNav redesigned mobile menu with grid layout. Footer links all functional. AresShipSVG redesigned with plasma exhaust and animated beacons. SolarFlythrough upgraded with triple-layer trajectory path, ambient nebula, and enhanced planet rendering. Created FEATURES.md technical documentation |

---

## 15. Features

See `FEATURES.md` for a detailed list of features and their implementation.