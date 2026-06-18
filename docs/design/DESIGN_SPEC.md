# Design Spec — NameFaces Quiz (extracted from Claude Design handoff)

| Field | Value |
|---|---|
| Source | `docs/design/handoff/` (HTML prototype by Claude Design) |
| Fidelity | High-fidelity (hifi) |
| Org | Grid Dynamics México |
| MVP flow | Login → Dashboard → Quiz → Results → Leaderboard |
| Status | Reference for FE build. Prototype runtime (`support.js`) **not to be ported.** |

> Handoff files are **design references**, not production code. Recreate in React + Vite using real component patterns. Placeholder CSS avatars → replace with real employee photos (rounded-square frame, initials fallback).

---

## 1. Screens

| # | Screen | Purpose | Key layout |
|---|---|---|---|
| 1 | Login | Auth, demo creds pre-filled (admin-created accounts, no self-signup) | Centered card 412px, floating blurred blobs bg |
| 2 | Dashboard | Stats, start quiz, leaderboard peek, recent games | max-w 1080px, top bar + greeting + 2-col grids |
| 3 | Quiz | N timed questions, two alternating formats | Centered card 560px, header progress + timer ring |
| 4 | Results | Summary, replay/leaderboard | Centered 540px, confetti, accuracy ring + review |
| 5 | Leaderboard | Company ranking, dept filter, podium | max-w 760px, chips + top-3 podium + full list |

### Quiz formats (alternate by question index)
- **Name round** (even idx): show avatar → "Who's this?" → 4 name buttons (1-col list).
- **Face round** (odd idx): show name + role/dept → 4 avatar tiles (2-col grid); first name reveals under each tile after answering.

### Answer reveal states
- Correct → `correct` border + `correctSoft` bg + ✓ badge.
- Chosen wrong → `wrong` border + `wrongSoft` bg + `nf-shake` + ✗ badge.
- Others → dim to opacity .45. Input locks. Feedback banner appears.

---

## 2. Design tokens

Three interchangeable themes: **`fresh`** (default, green/Grid-Dynamics), `sunset`, `grape`. Colors authored in `oklch()` — prefer oklch if pipeline supports.

### `fresh` (default)
| Token | ~hex | Usage |
|---|---|---|
| bg | `#f3faf6` | page bg |
| bg2 | `#e8f4ec` | inset fields, chips, tiles |
| surface | `#ffffff` | cards |
| ink | `#1f2d2b` | primary text |
| inkSoft | `#5f6f6c` | secondary text |
| line | `#e2eae6` | borders, dividers |
| primary | `#2bb673` | brand / CTA / progress fill |
| primaryDk | `#1d9159` | 3D button shadow, accent text |
| onPrimary | `#ffffff` | text on primary |
| accent | `#d7b13e` | decorative / confetti |
| accent2 | `#5aa6d8` | user chip avatar, confetti |

`sunset` / `grape` token sets → see [HANDOFF.md](handoff/HANDOFF.md) §Design Tokens.

### Shared (all themes)
`correct #2faf6a` / `correctSoft #e3f6ec`; `wrong #d2442f` / `wrongSoft #fbe7e2`; podium `gold #f5b53d`, `silver #b9c1cc`, `bronze #d68a52`.

### Typography
- **Display/headings/buttons:** Fredoka (400–700) — rounded, playful.
- **Body/labels:** Nunito (400–800).
- Both from Google Fonts.

### Signature styling
- **"3D" button:** `box-shadow: 0 5px 0 <primaryDk>`; hover `translateY(-1..-2px)`; active `translateY(2..3px)` + shadow `0 3px 0`.
- Radii: inputs/buttons 14–15px; option buttons 18px; cards 20–22px; large cards 26–30px; pills 999px.
- Card shadows: quiz `0 14px 40px rgba(20,30,40,.08)`, results `.12`, login `.14`.

### Motion (keyframes)
`nf-pop` (scale+fade, card/face reveal) · `nf-fade` (translateY+fade, screen enter) · `nf-shake` (±6px, wrong answer) · `nf-float` (±16px loop, blobs/confetti).

---

## 3. Behavior

- **Navigation:** SPA screen state `login → dashboard ⇄ quiz → results ⇄ leaderboard`.
- **Quiz construction:** pick `quizLength` distinct people; alternate mode by index; add 3 random distractors; shuffle 4 choices.
- **Timer:** per-question countdown from `timerSeconds`, 1s tick; 0 → auto-reveal miss ("Time's up!"); stop on answer.
- **Scoring:** correct = `100 + timeLeft * 10` (faster = more); wrong/timeout = 0.
- **Finish:** compute correct count + accuracy, append history entry, persist, → Results.
- **Leaderboard:** merge seeded colleagues + "You" (sum of history); sort desc; rank; dept filter; highlight "You" row.
- **Responsive:** desktop-first, collapses to 1-col under ~720px; hit targets ≥44px; WCAG 2.1 AA contrast.

## 4. State (prototype)

`screen, theme, email/password, user{name,first,dept}, questions[], qIdx, score, timeLeft, revealed, selected, results[], history[] (persisted), lastEntry, lbDept`.

Prototype persists only `history` to `localStorage` key `nf_history`. **Production:** `questions`, `people`, `leaderboard`, `history` come from backend API/DB.

## 5. Configurable props

| Prop | Range | Default |
|---|---|---|
| theme | fresh / sunset / grape | fresh |
| quizLength | 4–12 | 8 |
| timerSeconds | 5–30 | 15 |
