# Handoff: NameFaces Quiz

## Overview
NameFaces Quiz is an internal, game-like web app that helps Grid Dynamics México employees learn their colleagues' names, roles, and departments. Users log in, take a short timed multiple-choice quiz that pairs faces with names (and vice-versa), get immediate feedback, see a results summary, and climb a company-wide leaderboard with department filters. This handoff covers the MVP flow: **Login → Dashboard → Quiz → Results → Leaderboard.**

## About the Design Files
The files in this bundle are **design references created in HTML** — interactive prototypes showing the intended look, layout, and behavior. They are **not production code to copy directly.** The task is to **recreate these designs in the target codebase's environment** using its established patterns, component library, and conventions. If no front-end environment exists yet, choose an appropriate stack (the prototype maps cleanly to React + a state hook per screen) and implement there.

> The prototype is built with a small in-house "Design Component" runtime (`support.js`). That runtime is an authoring convenience for the design tool — **do not port it**. Re-implement the UI with your real framework.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, radii, shadows, motion, and copy are all specified below and should be reproduced faithfully using your codebase's libraries. The avatars are intentionally **placeholder illustrations** (CSS-drawn) — in production, swap them for real employee photos.

---

## Design Tokens

The app ships **three interchangeable themes** selected by a `theme` value (`fresh` | `sunset` | `grape`). `fresh` (green, Grid-Dynamics-inspired) is the default. Colors are authored in `oklch()`; approximate hex equivalents are given for convenience — prefer the oklch values if your pipeline supports them.

### Theme: `fresh` (default)
| Token | oklch | ~hex | Usage |
| --- | --- | --- | --- |
| `bg` | `oklch(0.98 0.012 155)` | `#f3faf6` | Page background |
| `bg2` | `oklch(0.96 0.02 155)` | `#e8f4ec` | Inset fields, chips, stat tiles |
| `surface` | — | `#ffffff` | Cards |
| `ink` | `oklch(0.27 0.03 195)` | `#1f2d2b` | Primary text |
| `inkSoft` | `oklch(0.53 0.03 195)` | `#5f6f6c` | Secondary text |
| `line` | `oklch(0.92 0.015 160)` | `#e2eae6` | Borders, dividers, empty progress track |
| `primary` | `oklch(0.72 0.16 158)` | `#2bb673` | Brand / CTAs / progress fill |
| `primaryDk` | `oklch(0.6 0.16 158)` | `#1d9159` | Button "3D" bottom shadow, accent text |
| `onPrimary` | — | `#ffffff` | Text on primary |
| `accent` | `oklch(0.78 0.15 90)` | `#d7b13e` | Decorative / confetti |
| `accent2` | `oklch(0.7 0.14 230)` | `#5aa6d8` | User chip avatar, confetti |

### Theme: `sunset`
`bg oklch(0.98 0.012 60)`, `bg2 oklch(0.96 0.025 50)`, `ink oklch(0.3 0.04 40)`, `inkSoft oklch(0.54 0.04 40)`, `line oklch(0.92 0.02 50)`, `primary oklch(0.7 0.17 35)`, `primaryDk oklch(0.58 0.17 33)`, `accent oklch(0.74 0.16 350)`, `accent2 oklch(0.74 0.15 70)`.

### Theme: `grape`
`bg oklch(0.98 0.012 300)`, `bg2 oklch(0.96 0.02 300)`, `ink oklch(0.3 0.04 300)`, `inkSoft oklch(0.54 0.04 300)`, `line oklch(0.92 0.02 300)`, `primary oklch(0.62 0.19 300)`, `primaryDk oklch(0.5 0.19 300)`, `accent oklch(0.68 0.17 350)`, `accent2 oklch(0.64 0.16 250)`.

### Shared across all themes
| Token | Value | Usage |
| --- | --- | --- |
| `correct` | `oklch(0.7 0.16 150)` ~`#2faf6a` | Correct answer border/fill |
| `correctSoft` | `oklch(0.95 0.05 150)` ~`#e3f6ec` | Correct answer background |
| `wrong` | `oklch(0.6 0.2 25)` ~`#d2442f` | Wrong answer border/fill/text |
| `wrongSoft` | `oklch(0.96 0.05 25)` ~`#fbe7e2` | Wrong answer background |
| `gold` | `#f5b53d` | Rank 1 / podium |
| `silver` | `#b9c1cc` | Rank 2 / podium |
| `bronze` | `#d68a52` | Rank 3 / podium |

### Typography
- **Display / headings / buttons:** `Fredoka` (Google Fonts), weights 400–700. Used for the logo, screen titles, big numbers, and button labels. Rounded and playful.
- **Body / labels:** `Nunito` (Google Fonts), weights 400–800. Used for paragraphs, option text, stat labels.
- Common sizes (px): hero greeting 34/`Fredoka` 600; screen titles 26–32; card titles 18–19; big number stats 26–42; option text 17/`Nunito` 800; secondary text 12–15; uppercase eyebrow labels 12–14 weight 800 with `letter-spacing:.5px`.

### Radius & elevation
- Radii: inputs/buttons `14–15px`; option buttons `18px`; cards `20–22px`; large cards/mod* `26–30px`; pills/avatardots `999px`; avatar tiles `22px`.
- **"3D" button shadow** (signature look): `box-shadow: 0 5px 0 <primaryDk>` (or `0 4px 0 …` on smaller buttons). On `:hover` lift `translateY(-1px to -2px)`; on `:active` press to `translateY(2–3px)` and reduce the shadow to `0 3px 0`.
- Card shadow: `0 14px 40px rgba(20,30,40,.08)` (quiz card), `0 18px 50px rgba(20,30,40,.12)` (results), `0 24px 60px rgba(20,30,40,.14)` (login).
- Option/answer buttons carry a subtle chunky shadow `0 4px 0 rgba(0,0,0,0.05)`.

### Motion (keyframes)
- `nf-pop` (0.4–0.5s): scale `.82 → 1.06 → 1` + fade in. Used on the login card and the quiz face reveal.
- `nf-fade` (0.3–0.4s): translateY(12px)+fade → settle. Used on screen/card enter and the feedback banner.
- `nf-shake` (0.4s): horizontal ±6px wobble. Played on a **wrong** answer.
- `nf-float` (5–7s, infinite, ease-in-out): translateY ±16px. Login background blobs and results confetti.

---

## Screens / Views

### 1. Login
- **Purpose:** Authenticate. Demo creds are pre-filled so the user can play immediately. (Per MVP, accounts are admin-created — no self-signup.)
- **Layout:** Full-viewport flex center on `bg`. Three soft blurred circular "blobs" (`primary`, `accent2`, `accent`, `opacity ~.16`, `filter: blur(20px)`, floating) sit behind a centered card (`max-width 412px`, `surface`, radius 30, padding 38×34, the deep login shadow, `nf-pop` enter).
- **Components:**
  - Logo lockup: 46px rounded-square (`primary`, radius 15, 3D shadow `0 5px 0 primaryDk`) with white "N" in Fredoka 26, next to "NameFaces" (Fredoka 600, 27px).
  - Title "Welcome back 👋" (Fredoka 600, 23px). Subtitle (`inkSoft`, 15px, line-height 1.45): "Learn your colleagues at Grid Dynamics MX — one face at a time."
  - Two fields (email, password). Label: weight 700, 13px, `inkSoft`. Input: full width, padding 13×15, `2.5px solid line`, radius 14, `bg2` fill, Nunito 600 15px; `:focus` border → `primary`.
  - Primary button "Sign in & play": full width, `primary` fill, `onPrimary` text, Fredoka 600 19px, padding 15, radius 15, 3D shadow + hover/active behavior described above.
  - Helper text (centered, `inkSoft`, 13px): accounts created by admin; demo pre-filled.
- **Behavior:** Click → derive a display name from the email's local part (split on `. _ -`, Title-Case each token) → set user → go to Dashboard.

### 2. Dashboard
- **Purpose:** Home base — see stats, start a quiz, glance at the leaderboard and recent games.
- **Layout:** `max-width 1080px` centered. **Top bar** (see Shared Components). Below: greeting block, then a 2-column grid (`1.3fr 1fr`) of CTA + stats, then a 2-column grid (`1fr 1fr`) of leaderboard-peek + recent-games. `nf-fade` enter.
- **Components:**
  - Greeting: "¡Hola, {firstName}!" (Fredoka 600, 34px) + subtitle "Ready to put some names to faces?" (`inkSoft`, 17px).
  - **CTA card:** `primary` fill, radius 26, padding 30, `onPrimary` text, 3D shadow `0 10px 0 primaryDk`, two translucent white circles as decoration. Eyebrow "DAILY QUIZ" (uppercase, Fredoka 600 15px, opacity .9), title "Who's who?" (Fredoka 600 30px), meta "{quizLength} questions · {timerSeconds}s each · mixed rounds". White pill button "Start quiz →" (`surface` bg, `primaryDk` text, Fredoka 600 19px, radius 15, shadow `0 5px 0 rgba(0,0,0,.12)`).
  - **Stats grid** (2×2): four tiles, `surface`, `2px solid line`, radius 20, padding 18×16. Big value (Fredoka 600 30px, `ink`) over label (weight 700 13px, `inkSoft`). Stats: *Quizzes* (count), *Best score*, *Avg accuracy* (%), *Office rank* (`#n`).
  - **Leaderboard peek card:** title "Top of the office" + "View all →" (`primary`, weight 800 14px). 5 rows (top 5). Each row: rank badge (26px, radius 8; gold/silver/bronze fill+white text for ranks 1–3, else `bg2`/`inkSoft`), 38px avatar, name (weight 800 15px, ellipsis) + dept (`inkSoft` 12px weight 700), total points (Fredoka 600 16px, `primaryDk`). **The current user's row** gets `bg2` background + `2px solid primary` border.
  - **Recent games card:** title "Recent games". Up to 4 rows: 42px rounded square (`bg2`, radius 13) showing the accuracy %, then "Scored {score}" (weight 800 15px) + "{correct}/{total} correct · {relativeDate}". Empty state: centered `inkSoft` "No games yet — play your first quiz!".

### 3. Quiz
- **Purpose:** Answer N timed questions. Two alternating formats.
- **Layout:** `max-width 760px` header row, then a centered card `max-width 560px`, `surface`, radius 28, padding 30, shadow `0 14px 40px rgba(20,30,40,.08)`, `nf-fade` per question.
- **Header:** quit "✕" button (38px, `surface`, `2px solid line`, radius 12; hover → `wrong`), then a flex-1 **progress bar** (12px tall, `line` track, `primary` fill, `border-radius 99px`, `width` transitions .35s; fill = `(qIndex + (revealed?1:0)) / total`) with "Question {n} of {total}" beneath (weight 800 12px `inkSoft`), then a **score pill** ("{score}" Fredoka 600 17px `primaryDk` + "PTS" 11px `inkSoft`).
- **Timer:** 62px conic-gradient ring `conic-gradient(<timerColor> <deg>deg, line 0)` where `deg = timeLeft/timerSeconds*360`; inner 50px `surface` circle shows the seconds number (Fredoka 600 22px). `timerColor` = `primary`, switching to `wrong` when `timeLeft ≤ 5`.
- **Name round** (`mode: 'name'`): centered large avatar (148px, `nf-pop`) + title "Who's this?" (Fredoka 600 24px). Then a 1-column list of 4 name buttons (full width, space-between, padding 16×18, `2.5px solid line`, radius 18, Nunito 800 17px, chunky shadow). Hover (idle only): lift + border → `primary`.
- **Face round** (`mode: 'face'`): eyebrow "FIND THIS TEAMMATE" + the person's **name** (Fredoka 600 28px) + role/dept (`inkSoft` 14px). Then a 2-column grid of 4 avatar tiles (column flex, padding 16, `3px solid line`, radius 22, shadow `0 5px 0 rgba(0,0,0,.05)`); each holds a 96px avatar; the person's first name reveals beneath each tile **only after answering**.
- **Answer states:** on reveal, the correct option → `correct` border + `correctSoft` bg (+ a ✓ badge); the chosen wrong option → `wrong` border + `wrongSoft` bg + `nf-shake` (+ ✗ badge); all other options dim to `opacity .45`. Badge = 26px circle, white glyph, `correct`/`wrong` fill.
- **Feedback banner** (appears after answering, `nf-fade`): full-width row, `correctSoft`/`wrongSoft` bg with matching 2px border, radius 18. Title "Correct! 🎉" / "Not quite" / "Time's up!" (Fredoka 600 20px, colored) + subtext "{name} · {role}, {dept}". Right side: "Next →" button (or "See results →" on the last question), `primary` 3D button.

### 4. Results
- **Purpose:** Summarize the just-finished quiz; offer replay / leaderboard.
- **Layout:** centered, `max-width 540px`, over a relative container that renders 14 floating confetti chips (alternating 13px squares/circles in `primary`/`accent`/`accent2`/`gold`, `nf-float` with staggered delays). `nf-fade` enter.
- **Summary card** (`surface`, radius 30, padding 34, centered): title "Quiz complete!"; a 150px **accuracy ring** (`conic-gradient(primary <accuracyDeg>deg, line 0)`) with a 122px inner circle showing "{accuracy}%" (Fredoka 600 42px `primaryDk`) over "ACCURACY"; two stat blocks (`bg2`, radius 16) for "{score} POINTS" and "{correct}/{total} CORRECT"; an optional gold pill "🎉 New personal best!" when this score ties/beats the stored best; then two buttons — "Play again" (`primary` 3D) and "Leaderboard" (`surface`, `2.5px solid line`, hover → `primary`).
- **Review card** (`surface`, `2px solid line`, radius 22): title "Review"; one row per question — 40px avatar, name (weight 800 15px) + "role · dept" (`inkSoft` 12px), and a 30px ✓/✗ status circle (`correct`/`wrong`). Footer link "Back to dashboard".

### 5. Leaderboard
- **Purpose:** Company ranking with department filtering and a top-3 podium.
- **Layout:** `max-width 760px`. Simplified top bar (logo + "← Dashboard"). Title "Leaderboard" (Fredoka 600 32px).
- **Department chips:** horizontal wrap of pills (`All` + each unique department). Active chip = `primary` fill + `onPrimary` text; inactive = `surface`, `2px solid line`, `inkSoft`. Padding 9×16, radius 999, Fredoka 500 14px.
- **Podium** (shown when ≥3 rows after filtering): 3 columns, bottom-aligned, order [2nd, 1st, 3rd]. Each: avatar (1st = 72px with a 👑 above; 2nd/3rd = 58px), first name, and a colored bar (gold/silver/bronze) with rounded top, the rank numeral (Fredoka 600), and the point total. Bar heights: 1st `118px`, 2nd `88px`, 3rd `66px`.
- **Full list** (`surface`, `2px solid line`, radius 22): rows of rank badge + 40px avatar + name (weight 800 15px) + "dept · role" (`inkSoft` 12px) + total (Fredoka 600 17px `primaryDk`), divided by 1.5px `line`. The current user's row is highlighted with `bg2`.

---

## Shared Components

**Top bar** (Dashboard & Leaderboard): flex space-between, padding 18×28, `max-width 1080/760px`. Left: clickable logo lockup (38px rounded-square `primary` + "N", "NameFaces" Fredoka 600 22px) → Dashboard. Right (Dashboard): three **theme dots** (20px circles in each theme's `primary`; the active one scales 1.12 and gets a double ring `0 0 0 3px surface, 0 0 0 5px <themePrimary>`), a "Leaderboard" text link (hover → `primary`), and a **user chip** (`surface`, `2px solid line`, radius 999, padding 5×13×5×5) = 30px initials circle (`accent2`, white, weight 800) + first name (weight 800 14px).

**Avatar** (`Avatar.dc.html`): a CSS-only illustrated face, deterministic from `{ hue, skin, hair, hairColor }` and a `size`. Container is a `size`-square with radius `size*0.3`, `hsl(hue 72% 90%)` background. Layered absolutely-positioned divs draw hair (variants `short`/`bun`/`long`/`bald`), a skin-tone head circle, two eyes, and a smile. **In production, replace this entirely with real employee photos** (same square-with-rounded-corners frame), keeping a graceful initials/illustration fallback when a photo is missing.

---

## Interactions & Behavior
- **Navigation:** single-page screen switch via a `screen` state (`login` → `dashboard` ⇄ `quiz` → `results` ⇄ `leaderboard`). The logo and explicit buttons drive transitions.
- **Quiz construction:** pick `quizLength` distinct people as the answers; for each, alternate `mode` by index (`even → name`, `odd → face`); add 3 random distractors; shuffle the 4 choices.
- **Timer:** per-question countdown from `timerSeconds`, 1s tick. On reaching 0, auto-reveal as a miss ("Time's up!", no points). Stop the timer the moment an answer is chosen.
- **Scoring:** correct answer = `100 + timeLeft * 10` points (faster = more). Wrong/timeout = 0.
- **Reveal:** lock further input, color the options, shake the wrong pick, show the feedback banner; "Next" advances (or finishes on the last question).
- **Finish:** compute correct count + accuracy, append a history entry, persist, go to Results.
- **Leaderboard:** merge the 24 seeded colleagues with a "You" entry whose total = sum of your history scores; sort desc; assign ranks; department filter narrows the list (ranks stay global-relative to the filtered set in the prototype — confirm desired behavior). Highlight the "You" row.
- **Responsive:** designed desktop-first but mobile-friendly; the 2-column dashboard/quiz grids should collapse to single column under ~720px. Hit targets ≥ 44px. Target WCAG 2.1 AA contrast.

## State Management
Per the screens above, the app needs: `screen`, `theme`, `email`/`password`, `user {name, first, dept}`, `questions[]`, `qIdx`, `score`, `timeLeft`, `revealed`, `selected`, `results[]`, `history[]` (persisted), `lastEntry`, and `lbDept` (active filter). Quiz history is the only persisted state (browser `localStorage` key `nf_history` in the prototype — back it with a real API/DB in production). In production, `questions`, `people`, `leaderboard`, and `history` come from the backend, not local seed data.

## Configurable props (Tweaks)
- `theme`: `fresh` | `sunset` | `grape` (default `fresh`).
- `quizLength`: 4–12 (default 8).
- `timerSeconds`: 5–30 (default 15).

## Assets
- **Fonts:** Google Fonts `Fredoka` (400–700) and `Nunito` (400–800).
- **Avatars:** generated/illustrated placeholders only — **replace with real employee photos**.
- **Icons/emoji:** a few inline emoji are used decoratively (👋 🎉 👑 ✓ ✗). Swap for your icon set if you avoid emoji in product.
- No external image assets are required by the prototype.

## Files
- `NameFaces Quiz.dc.html` — the full app (all five screens, scoring, timer, themes, leaderboard). The logic lives in the `class Component` block; the markup is the template above it.
- `Avatar.dc.html` — the reusable placeholder-avatar component.
- `support.js` — the prototype runtime (authoring-tool only; **do not port**).

Open `NameFaces Quiz.dc.html` in a browser to interact with the reference implementation while building.
