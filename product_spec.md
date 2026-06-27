# Recover — Product Specification

> This document assumes the reader has already read `full_context.md`. It does not repeat the project vision, design system, agent architecture, or naming conventions defined there. It specifies every product feature at a level suitable for a professional engineering team to build and QA against.

Priority levels:
- **P0** — demo-blocking. Missing = no submission.
- **P1** — required for credibility. Demo survives without it but scores lower.
- **P2** — stretch. Build only if P0 and P1 are stable with time remaining.

---

## Feature 1: Animated Landing Intro

### Description
A 3-second animation plays on first landing before the input form is revealed. Five agent icons appear sequentially (50ms stagger). Text overlay fades in: *"Five agents. One sentence. Your recovery starts now."* After 3 seconds, the animation completes and the input form fades in. A skip button is available for returning users.

### User Story
As a judge arriving at Recover for the first time, I want to immediately understand what is about to happen so that I arrive at the input form primed for the fan-out experience rather than confused by a blank text field.

### Acceptance Criteria
- Animation plays automatically on first page load — no click required
- Five agent icons appear sequentially with 50ms stagger between each: LinkedIn, Outreach, Unemployment, Jobs, Resume
- Text *"Five agents. One sentence. Your recovery starts now."* fades in after all five icons appear
- After 3 seconds total, the intro fades out and the InputForm fades in (300ms crossfade)
- A "Skip →" text button in the top-right corner skips the animation and shows the form immediately
- Animation does not replay if the user navigates back to the landing page within the same session (check `sessionStorage` for an `introSeen` flag)
- Animation respects `prefers-reduced-motion`: if set, skip directly to the form with no animation

### Edge Cases
- **User has `prefers-reduced-motion` enabled**: show form immediately, no animation, no delay
- **Very slow connection**: animation is pure CSS/JS — no network dependency. Must render even with no API connectivity
- **User navigates back from dashboard**: `introSeen` is set, skip directly to form

### Priority
**P0**

---

## Feature 2: Four-Field Input Form

### Description
Replaces the original single text-field design. Collects four pieces of information before triggering the agent fan-out. The "Try a demo scenario" button is the most important element on this page — it guarantees every judge sees the best version of the product.

### User Story
As someone who just lost their job, I want to give Recover enough context about my situation and background so that the five agents produce outputs that feel specific to me, not generic advice that applies to everyone.

### Acceptance Criteria
- **Field 1 — What happened** (required): `<textarea>` with placeholder *"e.g. I just got laid off from [Company] as a [Title]"*. Minimum 10 characters before submit is enabled. Maximum 500 characters.
- **Field 2 — Your job title** (required): `<input type="text">` with placeholder *"e.g. Senior Product Manager"*. Maximum 100 characters.
- **Field 3 — Your top 3 skills** (required): `<input type="text">` with placeholder *"e.g. product strategy, fintech, stakeholder management"*. Maximum 200 characters.
- **Field 4 — LinkedIn headline and/or resume bullets** (optional): `<textarea>` with placeholder *"Paste your current LinkedIn headline and/or a few recent resume bullets (optional)"*. Helper text below: *"The more you give us, the less generic your outputs will be."* Maximum 1,000 characters.
- **"Try a demo scenario" button**: fills all four fields with the Google PM demo persona defined in `full_context.md`. Visually distinct from the submit CTA — secondary style, placed above the submit button. Label: *"Try a demo scenario →"*
- **"Start Recovery" CTA**: disabled until Fields 1, 2, and 3 are non-empty. On click, stores `recoveryContext` in `sessionStorage` and navigates to `/dashboard`
- Pressing Enter in any single-line field moves focus to the next field (Field 1 → 2 → 3 → 4 → submits if Fields 1–3 filled)
- Form does not submit on Enter in a `<textarea>` field

### Edge Cases
- **User clicks demo scenario then edits a field**: allowed. The edited values are used. Do not re-apply demo values on submit.
- **Field 1 contains only spaces**: trim before validation. Treat as empty.
- **Field 3 contains more than 3 skills**: accept it. Context extractor will use all of them.
- **User submits with minimum required fields only (no optional context)**: agents proceed with role-generic outputs. This is acceptable. The nudge copy sets expectations.
- **Very long resume paste** (user pastes their entire resume): truncate at 1,000 characters with no error shown. The truncation is silent.

### Priority
**P0**

---

## Feature 3: Recovery Dashboard — Agent Fan-Out

### Description
The primary view. All five agent cards are visible simultaneously from the moment the dashboard loads. All five agent API calls are triggered concurrently within 500ms of mount. Cards transition through Queued → Running → Complete (or Error) independently. The visual of five spinners resolving at different times is the core product experience.

### User Story
As a user who just submitted my situation, I want to see all five recovery actions executing simultaneously so that I understand Recover is working autonomously across every dimension of my recovery at the same time.

### Acceptance Criteria
- Dashboard renders immediately on navigation with all five cards visible in "Queued" state — no loading screen before this view
- All five agent API calls are triggered within 500ms of dashboard mount via concurrent `callAgent()` promises (not `Promise.all` — they must resolve and update UI independently)
- Each card transitions Queued → Running → Complete independently as its API call resolves
- Cards never wait for each other — if LinkedIn resolves at 3s and Unemployment at 9s, LinkedIn shows Complete while others still show Running
- Each completed card shows: agent icon, agent name, a one-line preview of the primary output, green check icon, and "Expand" button
- Each running card shows: agent icon, agent name, spinner animation, "Working..." text
- Each error card shows: agent icon, agent name, warning icon, brief error message, "Retry" button
- Retry re-calls only that specific agent — does not re-call others
- Card stagger on initial render: 50ms delay between each card appearing (LinkedIn → Outreach → Unemployment → Jobs → Resume), using CSS animation with `animation-delay`
- No card flashes, jumps, or re-renders during state transitions
- Once all five cards reach terminal state (Complete or Error), the Day 1 Action Plan appears below with a 300ms fade-in
- Dashboard is not accessible without a valid `recoveryContext` in `sessionStorage`. If missing, redirect to `/`

### Edge Cases
- **One agent times out while others complete**: four successful cards show Complete; timed-out card shows Error with Retry. Day 1 Plan generates from the four available outputs. A banner reads: *"One agent did not complete — your plan may be partial. Retry to fill the gap."*
- **All agents timeout**: all five show Error. Banner: *"Recover is experiencing high demand. Please retry in a moment."* Single "Retry All" button re-triggers all five.
- **User navigates away and back**: outputs are read from React state (component unmounts → state is lost). Redirect to `/` if `outputs` state is empty. Do not re-trigger agents from the dashboard page on empty state — always start from the input form.
- **ASI:ONE returns a non-JSON response**: treat as an error. Do not attempt to parse. Surface error state on that card.

### Priority
**P0**

---

## Feature 4: LinkedIn Agent Card

### Description
Rewrites the user's LinkedIn headline using their title, skills, company, and optionally their current headline. Shows a before/after comparison. Includes the Edit & Regenerate interaction — the most important P1 feature.

### User Story
As a job seeker, I want my LinkedIn headline rewritten for recruiter search optimization, and I want to be able to refine it with a quick instruction, so that I can get a headline I'd actually use without spending an hour on it.

### Acceptance Criteria

**Collapsed (card) state:**
- Preview shows the generated headline, truncated to 80 chars with ellipsis if longer
- Green check icon and "Expand" button

**Expanded (modal) state:**
- If `currentHeadline` was provided: a "Before" row labeled *"Your current headline"* and an "After" row labeled *"Suggested headline"* with visual differentiation (before: muted text, after: `--text-primary` with `--success` left accent)
- If no `currentHeadline` provided: only the "Suggested headline" row, labeled *"Your new headline"*
- Generated headline follows pattern: `[Specialty] | [Key signal] | Open to [target roles]` — example: *"Fintech PM | 0→1 Builder | Open to Senior PM + Director Roles"*
- Copy-to-clipboard button on the generated headline. Text changes to *"Copied!"* for 2 seconds then resets
- **Edit & Regenerate section** (P1 but spec'd here for completeness):
  - A text field with placeholder *"Refine this headline — e.g. 'make it more senior-focused'"*
  - A "Regenerate" button. Disabled when the text field is empty.
  - On click: calls `/api/agent/linkedinAgent` with original `recoveryContext` plus `refinementInstruction` field. The generated headline in the card updates in-place. The "Before" row stays unchanged (always shows the user's original). The "After" row updates to the regenerated result.
  - Loading state: "Regenerate" button shows a spinner and is disabled during the call
  - The regenerated headline replaces the previous one — no history of previous regenerations shown (MVP)

### Edge Cases
- **Generated headline exceeds 200 characters**: agent is prompted to stay under 200. If response exceeds this, truncate at word boundary and add a note: *"Trimmed to LinkedIn's 220-character limit."*
- **User's role is ambiguous** (e.g., "I worked in ops"): agent produces generic but valid output. Uses: *"Operations Professional | Open to new opportunities."* Does not hallucinate a specific title.
- **Regeneration produces the same headline**: acceptable for MVP — no deduplication logic. The user can refine their instruction.
- **Regeneration call fails**: show inline error *"Regeneration failed — try again."* Do not replace the existing headline with an error state.

### Priority
**P0** (base card). **P1** (Edit & Regenerate).

---

## Feature 5: Outreach Agent Card

### Description
Drafts three personalized network outreach emails, differentiated by relationship type: former manager, peer/colleague, recruiter. Each email references the user's actual role and company.

### User Story
As a job seeker, I want three ready-to-send outreach emails written for me — one for my former manager, one for a colleague, one for a recruiter — so that I can reach out immediately without agonizing over what to say.

### Acceptance Criteria

**Collapsed state:**
- Preview: *"3 emails drafted"* with the subject line of the manager email visible

**Expanded state:**
- Three email sections, each clearly labeled: *"To a former manager"*, *"To a peer or colleague"*, *"To a recruiter"*
- Each section shows: subject line (bold), email body (Inter 400, readable line-height)
- Each email is under 150 words
- Tone differentiation:
  - Manager: deferential, direct, asks for a reference or reconnection
  - Peer: casual, collegial, asks for a coffee chat or intro
  - Recruiter: professional, value-forward, signals availability and seniority
- All three emails reference the user's title and company by name. If company is "Google" and title is "Senior PM", all three say so — not "my previous employer."
- Copy-to-clipboard button per email. Button text: *"Copy email"* → *"Copied!"* for 2 seconds
- A single *"Copy all 3 emails"* button at the top of the expanded view that copies all three as a formatted block

### Edge Cases
- **No company or title mentioned in input**: emails use generic language — *"given my recent transition"* rather than naming a company. The three are still differentiated in tone.
- **User's role is very niche**: agent keeps the role description accurate, keeps email structure general. Does not hallucinate industry-specific claims.
- **Subject line exceeds 60 characters**: trim at word boundary. Subject lines must be scannable.

### Priority
**P0**

---

## Feature 6: Unemployment Agent Card

### Description
Generates a state-specific unemployment filing checklist. Uses inferred state from input if available; otherwise prompts for state selection within the expanded card.

### User Story
As someone who just lost their job, I want a clear, state-specific checklist for filing unemployment so that I know exactly what to do without navigating confusing government websites.

### Acceptance Criteria

**Collapsed state:**
- If state detected: preview reads *"[State] unemployment guide ready"*
- If state not detected: preview reads *"Select your state to get specific guidance"*

**Expanded state (state known):**
- State name displayed prominently
- Link to official state unemployment portal (labeled *"File online →"*), `target="_blank"`
- 4–6 step checklist. Each step is one sentence. Steps cover: what to have ready, how to file, what to expect, timeline for first payment, weekly certification requirement
- Weekly benefit range: *"Typically $[low]–$[high]/week in [State]"* — labeled as typical, not calculated
- Copy-all checklist button

**Expanded state (state not known):**
- A `<select>` dropdown for all 50 U.S. states appears prominently
- Selecting a state triggers a follow-up agent call for that state
- Loading state shows spinner while the follow-up call runs
- On completion, the expanded content updates with state-specific information

### Edge Cases
- **State not confidently identifiable from ASI:ONE response**: set `needsStateSelection: true`, show the dropdown. Never guess a state.
- **Non-U.S. location detected** (e.g., "London", "Canada"): card shows *"Unemployment guidance varies by country. Please check your local government employment services."* with a link to a relevant government site if identifiable. Does not show U.S. content.
- **User mentions contractor or gig work**: add a note below the checklist: *"Note: Standard unemployment may not apply to contractors. Check your state's guidance on gig worker eligibility."*

### Priority
**P0**

---

## Feature 7: Job Alerts Agent Card

### Description
Surfaces 5 matched job listings and generates recommended search alert criteria based on the user's role, title, and skills. Links to pre-constructed search URLs.

### User Story
As a job seeker, I want to see relevant job listings immediately and know exactly what search criteria to set up so that I can start applying and monitoring opportunities right now.

### Acceptance Criteria

**Collapsed state:**
- Preview: *"5 matched roles found"* with the top listing's title and company visible

**Expanded state:**
- Five listing cards. Each shows: job title, company name, location (default remote-first), estimated salary range (if available, else omitted), a *"View listings →"* link to a pre-constructed Indeed or LinkedIn search URL for that title
- Links open in new tab
- *"Recommended search criteria"* section below listings:
  - *"Job titles to search"*: 3–5 title variants as a comma-separated list
  - *"Key skills to include"*: 3–5 skills
  - *"Experience level"*: string (e.g., "Senior / Lead")
  - *"Remote preference"*: string (e.g., "Remote-first or hybrid")
- *"Copy search criteria"* button copies the full criteria block as formatted text

### Edge Cases
- **Very niche or rare role with few direct matches**: agent surfaces adjacent roles labeled *"Related roles matching your background"*. Does not surface irrelevant listings to fill the five slots.
- **Location is highly specific** (e.g., "I was a surgeon at Mass General"): surfaces local listings. If location is not inferable, defaults to remote-first.
- **Search URL construction**: use format `https://www.linkedin.com/jobs/search/?keywords=[title]&f_WT=2` for remote LinkedIn searches. Always a search URL, never a direct listing URL (which would go stale).

### Priority
**P0**

---

## Feature 8: Resume Agent Card

### Description
Identifies the top 3 highest-impact resume improvement priorities for the user's role and situation. Makes specific references to provided resume bullets when available.

### User Story
As a job seeker, I want to know the top 3 things to change on my resume right now so that I don't waste time on low-impact edits while I should be applying.

### Acceptance Criteria

**Collapsed state:**
- Preview: *"3 resume priorities identified"* with the first priority's summary visible as a one-liner

**Expanded state:**
- Three numbered priority items (1, 2, 3)
- Each item contains:
  - **Summary** (bold, one sentence): e.g., *"Quantify the impact of your leadership bullets"*
  - **Explanation** (2–3 sentences): why this matters and how to do it
  - **Specific reference** (italic, if resume bullets were provided): e.g., *"Your bullet 'Led cross-functional team' should become 'Led 8-person team to ship Google Pay's merchant onboarding, reducing drop-off by 34%'"*
- If no resume bullets were provided: `specificReference` is null, explanation is generic but role-appropriate. A note reads: *"Paste your resume bullets above for specific suggestions."* — this note has a link that scrolls back to the input field (for a real user; for demo purposes this link can be a no-op)
- *"Copy all 3 priorities"* button

### Edge Cases
- **Resume snippet is under 50 words**: treat as insufficient context. Produce role-generic priorities. Do not attempt specific references from a snippet too short to analyze.
- **All three priorities would be the same** (e.g., "add metrics" repeated three times): agent is prompted to produce three distinct improvement areas. System prompt explicitly states: *"Each of the 3 priorities must address a different aspect of the resume (e.g., formatting, quantification, keywords, summary section, role description). Do not repeat the same advice."*

### Priority
**P0**

---

## Feature 9: Day 1 Action Plan

### Description
A synthesized timeline generated after all five agents reach terminal state. The planAgent explicitly reads all five agent outputs and synthesizes a coordinated action plan. The header must say *"Synthesized from all 5 agents"* — this is the multi-agent coordination signal.

### User Story
As a job seeker who has just seen all five recovery outputs, I want a single consolidated action plan so that I know exactly what to do today, this week, and this month without having to synthesize five separate outputs myself.

### Acceptance Criteria
- Appears below the five agent cards once all reach Complete or Error state
- 300ms ease-in fade-in animation on appearance
- Header reads: *"Your Recovery Plan"* with subheader: *"Synthesized from all 5 agents"* in `--text-muted`
- Three sections:
  - **Day 1** (3–5 actions): highest-priority, completable today. Each action is one sentence with an icon indicating which agent it came from.
  - **Week 1** (3–5 actions): completable this week
  - **Month 1** (2–3 actions): medium-term goals
- Each action item has a checkbox (non-functional for MVP — visual only). Checking one applies a strikethrough style.
- No duplicate actions across the three sections
- The plan must explicitly reference agent-specific outputs — e.g., *"Update your LinkedIn headline to: 'Fintech PM | 0→1 Builder | Open to Senior PM Roles'"* rather than *"Update your LinkedIn headline"*

### Edge Cases
- **One or more agents in Error state**: plan generates from available outputs. The section sourced from the missing agent uses a generic fallback action: *"Retry the [agent name] when available."*
- **All agents errored**: do not show the action plan at all. Show only the "Retry All" banner.
- **Duplicate actions surfaced by planAgent**: the plan system prompt instructs deduplication. If duplicates still appear, the frontend deduplicates by string matching before rendering.

### Priority
**P0** (section must appear). **P1** (checkbox interaction and agent-source icons).

---

## Feature 10: Download Recovery Pack

### Description
After all agents complete, a "Download Recovery Pack" button exports all five agent outputs plus the action plan as a formatted, branded HTML file. The HTML is print-to-PDF friendly. Not a .txt file.

### User Story
As a job seeker, I want to download everything Recover produced in a single polished document so that I have an offline reference and can share it with a career coach.

### Acceptance Criteria
- Button labeled *"Download Recovery Pack"* appears below the Day 1 Action Plan after all five agents complete
- Clicking generates an HTML string client-side and triggers a download via a Blob URL
- The downloaded file is named `recover-[inferred-name-or-timestamp].html`
- The HTML file includes: Recover logo/header, each agent's full output formatted with section headers, the Day 1 / Week 1 / Month 1 action plan, a footer reading *"Generated by Recover · Powered by ASI:ONE"*
- The HTML uses inline styles only (no external CSS) so it renders correctly when opened in any browser or printed to PDF
- The HTML uses the design system colors for section headers but defaults to black text on white background for print compatibility

### Edge Cases
- **One agent in Error state**: that agent's section in the HTML reads *"[Agent name] output unavailable — retry on the Recover dashboard."*
- **User clicks download before all agents complete**: button is disabled (grayed out, `cursor: not-allowed`) until all five agents reach terminal state

### Priority
**P1**

---

## Feature 11: ASI:ONE Attribution

### Description
Explicit, visible attribution to ASI:ONE on the dashboard and in the exported pack. This is pure judge psychology and costs 15 minutes to implement.

### Acceptance Criteria
- *"Powered by ASI:ONE Multi-Agent Platform"* badge visible on the dashboard header or footer
- In the Day 1 Action Plan card subheader: *"Synthesized from all 5 agents"* — this implicitly signals multi-agent coordination
- In the downloaded HTML footer: *"Powered by ASI:ONE"*
- The badge links to `https://asi1.ai` in a new tab

### Priority
**P1**

---

## Pre-Submission QA Checklist

Before submitting, the following must all be true:

- [ ] Demo persona pre-fill button populates all four fields correctly
- [ ] Submitting the demo persona produces non-generic outputs in all five agents (each references "Google", "Senior PM", or fintech specifically)
- [ ] All five cards animate through Queued → Running → Complete with visible stagger and spin
- [ ] LinkedIn before/after comparison is visible and the "After" headline is obviously better
- [ ] Three outreach emails are meaningfully differentiated in tone
- [ ] Unemployment card shows a state checklist (California for the demo persona)
- [ ] Job listings are senior PM / fintech relevant
- [ ] Resume card references at least one of the three provided bullet points
- [ ] Day 1 action plan appears with "Synthesized from all 5 agents" label
- [ ] Copy-to-clipboard works on at least LinkedIn headline and email #1
- [ ] "Powered by ASI:ONE" badge is visible
- [ ] No console errors on the deployed URL
- [ ] Full demo path (land → demo pre-fill → submit → fan-out → expand LinkedIn → expand email → action plan) completes in under 90 seconds
