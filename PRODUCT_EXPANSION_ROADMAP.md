# SBS: Acorn Dash Product Expansion Roadmap

## Purpose

This document is the durable product strategy reference for leveling up SBS: Acorn Dash from a polished reunion browser game into a shareable Haverford alumni experience.

Future sessions should read this file before planning major new features. It records the recommended product direction, expansion ideas across multiple domains, and the recommended first build focus.

## Current Product

SBS: Acorn Dash is currently a standalone static web game where players:

- Control Super Black Squirrel across a simplified Haverford-inspired campus.
- Follow glowing acorn trails between recognizable landmarks.
- Dodge students, bikes, and a golf cart.
- Find hidden landmark stashes.
- Collect golden acorns and temporary powerups.
- Receive a score, rank, best moment, and campus-secret summary.
- Share a text-based score challenge.

The current core loop is intentionally simple:

> Follow the trail, collect acorns, dodge traffic, find campus secrets, and earn a memorable result.

## Product North Star

Create a Haverford experience that makes alumni think:

> "This is weirdly specific to us. I want my classmates to play it, and I want to beat their score."

The strongest future version should combine:

- Easy-to-start casual gameplay.
- Alumni-recognizable nostalgia.
- Friendly class-year competition.
- Shareable personal results.
- Reasons to replay during reunions, events, and campaigns.

## Product Principles

### Preserve

- Immediate play without required account creation.
- A lightweight, warm, funny tone.
- Strong Haverford specificity.
- Standalone static gameplay when backend features are unavailable.
- Keyboard and touch controls.
- Short sessions that work well when shared through a link.

### Avoid

- Heavy lore before gameplay starts.
- Too many simultaneous objectives.
- Required login before a first run.
- Feature density that makes the casual game confusing.
- Generic college imagery that could belong to any school.
- Overbuilding interiors before proving players want deeper sessions.

## Expansion Domains

## 1. Sharing, Competition, and Community

This is the recommended first major investment because the game is already receiving attention. Sharing and competition amplify existing interest faster than deeper content alone.

### Shareable Result Cards

After each run, generate a branded postcard-style image containing:

- Display name and optional class year.
- Score.
- Rank title.
- Campus secrets found.
- Best combo or best moment.
- SBS and a recognizable campus visual.
- A challenge link and "Can you beat me?" message.

Example:

> Doug '96  
> DC Pancake Bandit  
> 28 points | 4 / 5 secrets  
> Best moment: 12x scurry streak  
> Can you beat me?

Recommended sharing options:

- Native mobile share menu.
- WhatsApp.
- SMS.
- Email.
- Download image.
- Copy challenge link.

Technical direction:

- Generate the card using a separate hidden canvas.
- Target a common social image size such as `1200 x 630`.
- Reuse the existing illustrated campus and postcard visual style.
- Share an image file through the Web Share API where supported.
- Fall back to image download and copied text/link.

### Challenge Links

Shared links should create a concrete challenge rather than opening a generic homepage.

Example:

```text
/?challenge=abc123
```

When opened:

- Show: "Doug '96 scored 28. Can you beat it?"
- Optionally show target score during the run.
- Clearly celebrate whether the challenger won.
- Offer a rematch/share-back action.

### Public Leaderboards

Recommended leaderboard views:

- Today.
- All Time.
- My Class.
- Reunion Challenge.
- Future option: Class Year Cup.

Recommended leaderboard row:

| Rank | Player | Class | Score | Secrets |
|---|---|---|---|---|
| 1 | BlackSquirrel96 | '96 | 34 | 5 / 5 |

Selecting an entry could eventually show:

- Rank title.
- Best moment.
- Date played.
- Challenge button.

### Lightweight Player Identity

Do not require login for the MVP.

After a completed run, optionally ask for:

- Display name.
- Class year.

Store identity locally so it only needs to be entered once.

Class-year alternatives:

- Current student.
- Faculty/staff.
- Parent/family.
- Friend of Haverford.

Important assumption:

- Class-year selection initially operates on an Honor Code basis rather than verified identity.

### Leaderboard Backend

The current game can remain a static frontend, but a public leaderboard requires a managed backend such as Supabase or another serverless database/function platform.

Recommended data model:

```text
leaderboard_entries
- id
- display_name
- class_year
- score
- secrets_found
- best_combo
- rank_title
- best_moment
- challenge_id
- created_at
- moderation_status
```

Recommended backend operations:

```text
POST /run/start
POST /run/finish
GET  /leaderboard
GET  /challenge/:id
```

Do not allow unrestricted direct writes from the browser to public leaderboard tables. Score submissions should pass through a server-side validation function.

### Basic Anti-Cheating and Moderation

This does not need competitive-esports security, but obvious abuse should be limited.

MVP protections:

- Issue a run token when a game starts.
- Confirm approximate run duration.
- Reject impossible scores, secret counts, or combos.
- Rate-limit repeated submissions.
- Flag suspicious entries rather than publishing immediately.
- Apply a display-name profanity filter.
- Allow administrators to hide/remove entries.

## 2. Campus Building Interiors

Interiors are the strongest future gameplay-depth feature. Each landmark can become a short memory capsule rather than a second full game.

Recommended format:

- SBS reaches or enters a landmark.
- A short optional interior mini-game begins.
- Interior lasts roughly 20-30 seconds.
- Player earns an artifact, badge, score bonus, or share-card decoration.
- Return to the campus run.

### Dining Center / DC

Recommended first interior because pancake energy already exists in the current game.

Ideas:

- Pancake scramble.
- Dodge trays and rolling cups.
- Collect syrup drops and pancake stacks.
- Earn "Late-Night Pancake Legend."

### Founders Hall

Ideas:

- Cupola climb.
- Collect class banners, old programs, and archive memories.
- Create a more emotional alumni-pride moment.

### Lloyd / Barclay

Ideas:

- Dorm hallway dash.
- Dodge laundry baskets, pizza boxes, and backpacks.
- Find roommate-memory artifacts or dorm keys.

### Campus Center

Ideas:

- Mailroom/package pickup challenge.
- Find reunion nametags or class notes.
- Unlock postcard/share-card elements.

## 3. Alumni Nostalgia Collectibles

Add replay value through unlockable "memory cards" or campus artifacts.

Possible artifacts:

- Class of '96 button.
- Honor Code scroll.
- DC pancake plate.
- Duck Pond postcard.
- Founders cupola sketch.
- Dorm key.
- Reunion nametag.
- Arboretum leaf.
- Old campus map.
- "I Survived the Golf Cart" badge.

Each collectible should have a short, warm caption.

Example:

> Dorm Key: Somehow still opens nothing, but feels important.

Recommended uses:

- Display in a personal memory album.
- Unlock share-card decorations.
- Tie some collectibles to landmarks/interiors.
- Use rare artifacts as weekly challenge rewards.

## 4. Stories and Characters

Keep characters light, funny, and immediately understandable. They should add personality without creating heavy lore.

Potential characters:

- The Reunion Fox: friendly rival who issues challenges.
- The Archivist Owl: gives hints about campus memory artifacts.
- The Golf Cart Driver: recurring comic nemesis.
- The Duck Pond Crew: sarcastic judges and score commentators.
- Classmate Memory Echoes: non-spooky routes or traces from other alumni runs.

Potential story framing:

- SBS is restoring scattered campus memories before Reunion Weekend.
- Each landmark holds one forgotten memory artifact.
- Class years compete to help SBS rebuild the reunion archive.

## 5. Events and Replay Loops

Events give alumni a reason to return and share again.

Possible events:

- DC Pancake Week.
- Founders Dash Challenge.
- Duck Pond Derby.
- No-Bump Run.
- Find All Five Secrets.
- Class Year Cup.
- Reunion Weekend Leaderboard.
- Giving Day Acorn Drive.

Event principles:

- One simple rule change or objective.
- Clear start/end date.
- Distinct badge or share card.
- Class or community progress where appropriate.

## 6. School and Alumni Engagement Opportunities

Potential official uses:

- Reunion engagement game.
- Giving Day activation.
- Alumni social campaign.
- Admitted-student or family weekend experience.
- Campus history discovery game.
- Class-year competition.
- QR-code activity at reunion landmarks.

Possible framing:

> Help SBS collect campus memories before Reunion Weekend.

Important opportunity:

- The game could become a lightweight alumni engagement product, not only a standalone game.

## Recommended Roadmap

## Phase 1: Sharing and Competition

Goal:

- Turn current attention into repeat play and alumni-to-alumni distribution.

Build:

- Optional display name and class year.
- Branded share-card image.
- Challenge links with target score.
- Public leaderboard.
- Today, All Time, and My Class views.
- Basic score validation and moderation.

Explicitly exclude:

- Required accounts.
- Verified alumni login.
- Friends lists.
- Comments.
- Live multiplayer.
- Complex achievements.

Recommended launch framing:

- "Class of '96 vs. Everyone" or "Class Year Acorn Cup."

## Phase 2: First Building Interior

Goal:

- Prove players want deeper gameplay and nostalgia content.

Recommended first interior:

- Dining Center pancake mini-game.

Keep it:

- Optional.
- 20-30 seconds.
- Easy to understand.
- Connected to an artifact/badge/share-card reward.

## Phase 3: Memory Collection

Goal:

- Add replay motivation beyond leaderboard score.

Build:

- Memory album.
- 10-20 campus artifacts.
- Landmark/interior unlock conditions.
- Share-card decoration rewards.

## Phase 4: Events and Class Competition

Goal:

- Create recurring engagement.

Build:

- Weekly/event challenges.
- Class-year competitions.
- Reunion weekend leaderboard.
- School/admin event controls.

## Recommended First Focus: Leaderboard + Share Card

This is the strongest next major bet.

Why it wins:

- The game is already receiving attention.
- It creates distribution before investing in expensive new gameplay content.
- It gives users a reason to replay immediately.
- It tests whether class-year identity and competition are compelling.
- It creates measurable engagement data.

### Smallest Credible MVP

Include:

- Optional display name and class year after a completed run.
- Submit a completed score.
- Today, All Time, and My Class leaderboards.
- Branded share-card image.
- Challenge link containing a target score.
- Basic score validation, rate limits, profanity filter, and moderation status.

Exclude:

- Accounts/login.
- Verified alumni identity.
- Comments/social feed.
- Live multiplayer.
- Building interiors.
- Large achievement system.

### Recommended User Flow

1. User plays immediately without login.
2. End screen shows score, rank, secrets, and best moment.
3. End screen previews a share card.
4. User may enter display name and class year.
5. User submits to leaderboard.
6. User shares a result image/challenge link.
7. Recipient opens a personalized target-score challenge.
8. Recipient plays and can share a rematch.

### Recommended Build Sequence

1. Define eligible-score and validation rules.
2. Choose and configure backend/database.
3. Create secure run-start and run-finish submission flow.
4. Add post-run name/class-year form.
5. Add leaderboard screen and filtering.
6. Build share-card canvas generator.
7. Add challenge-link landing and target-score state.
8. Add moderation controls.
9. QA mobile sharing, privacy, and failure states.
10. Launch with a named competition.

### Success Metrics

Primary:

- Percentage of completed runs that submit to leaderboard.
- Percentage of completed runs that trigger sharing.
- Challenge-link conversion into a started run.
- Repeat plays per user/device.

Secondary:

- Class-year participation.
- Daily active players during an event.
- Percentage of challengers who beat the target.
- Share-card download/native share success.

### Main Risks

- Cheating or impossible scores reduce trust.
- Display names create moderation needs.
- Required identity entry could reduce completion; keep it optional.
- Leaderboard without a named event may feel empty.
- Building too much backend before validating sharing behavior.
- Public Haverford branding or official involvement may require school approval.

### Validation Approach

Fastest credible validation:

1. Launch a simple share-card generator first.
2. Add a temporary local/mock leaderboard UI.
3. Test whether alumni actually share and care about class year.
4. Then add the managed backend and public leaderboard.

Alternative:

- Build the backend MVP immediately if there is already a committed reunion/event launch date and clear audience.

## Technical Architecture Evolution

The current app is a single static canvas game. Future expansion should preserve a playable offline/static core while separating new concerns.

Recommended future modules:

```text
script.js or game/
- game state and simulation
- input
- rendering
- content definitions

share-card.js
- social image generation
- share/download fallbacks

leaderboard.js
- leaderboard UI
- submission and challenge flows

api.js
- backend requests
- error handling

content/
- artifacts
- characters
- interiors
- event definitions
```

Architecture principle:

- If the backend is unavailable, the core campus game should still run.

## Decisions Needed Before Phase 1 Build

These questions materially affect implementation:

1. Should the leaderboard be unofficial/community-run or developed with Haverford involvement?
2. Is class year optional, strongly encouraged, or required for leaderboard submission?
3. Should users be able to submit every run or only their personal best?
4. Should the first launch center on a named event such as "Class of '96 vs. Everyone"?
5. Is Supabase or another managed backend acceptable for public score storage?
6. Who will moderate display names and suspicious scores?

## Future Session Resume Instructions

When resuming this work:

1. Read `AGENTS.md`.
2. Read `PROJECT_MEMORY.md`.
3. Read this `PRODUCT_EXPANSION_ROADMAP.md`.
4. Confirm whether the next task is:
   - Phase 1 feature definition,
   - backend/leaderboard architecture,
   - share-card design,
   - challenge-link flow,
   - or a building interior prototype.
5. Preserve the existing simple core game while expanding it.

