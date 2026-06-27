# Recover — Full Project Context
*Read this entire file before writing a single line of code. Every architectural and design decision references definitions made here. Do not repeat definitions from this file in other spec files — reference them.*

---

## Project Vision

**Recover** is an autonomous multi-agent job loss recovery platform that activates the moment someone loses their job and immediately executes the five highest-impact recovery actions in parallel — not as advice, not as a to-do list, but as real, usable drafts and outputs.

It answers one question no existing product addresses:

> *"When someone loses their job, who starts doing the work for them — right now?"*

The project is built to win the Hack-A-Agent hackathon judged on two criteria: **Creativity** and **Problem-Solving**. Every decision — architectural, visual, UX — is optimized to maximize perceived impact and demo memorability within those two criteria. The single judge is the ASI:ONE organizer who wants to see their platform showcased powerfully.

---

## The One-Sentence Pitch

**"Recover is an autonomous multi-agent system that activates the moment you lose your job and executes your entire recovery plan — LinkedIn rewrite, network outreach, unemployment guidance, job alerts, and resume triage — simultaneously, in under 60 seconds."**

---

## Problem

Job loss is one of the most universal and paralyzing experiences in adult working life. Research on re-employment is consistent: the first 48 hours are the most critical window. But most people freeze — not because they're lazy, but because they face five high-stakes tasks simultaneously while in emotional shock, with no clear starting point.

**The five tasks no one wants to do alone:**
1. Update their professional presence (LinkedIn) for active job search
2. Reach out to their network without knowing what to say
3. Navigate unemployment filing (state-dependent, opaque, confusing)
4. Set up job alerts that actually match their profile and seniority
5. Triage their resume to know what to change first

Every one of these tasks is parallelizable. No existing product does them simultaneously. LinkedIn tools, job boards, unemployment sites, and resume checkers all exist in isolation. Recover orchestrates all five at the moment of crisis.

**The key insight:** The innovation is not any individual feature — it is the *orchestration at the moment of activation*. Recover didn't invent resume advice. It invented the moment of deployment.

---

## Users

**Primary (hackathon context):** A single judge — the ASI:ONE organizer — scoring on Creativity and Problem-Solving. They want to see their platform look powerful. They score on feeling and vision, not code quality.

**Secondary (product context):**
- Anyone who has just been laid off or is in immediate fear of job loss
- Career coaches who want to give clients an immediate head start
- HR teams offboarding employees who want to provide a genuine resource

---

## User Journey

### Judge / Demo Viewer (90-second path)

1. Land on Recover. See a 3-second animated intro: five agent icons appear one by one. Text: *"Five agents. One sentence. Your recovery starts now."*
2. See the four-field input form. Click **"Try a demo scenario"** — form pre-fills with the Google PM persona.
3. Click "Start Recovery." Navigate immediately to the Recovery Dashboard.
4. Watch five agent cards fan out with spinners. Watch them resolve independently — LinkedIn first, then others. Each spinner flips to a completed card with a green check.
5. Click the LinkedIn card. See a before/after headline comparison. The new one is objectively better.
6. Click the Outreach card. See three differentiated emails — one to a manager, one to a peer, one to a recruiter. Each references the role specifically.
7. The Day 1 Action Plan fades in below. Text reads: *"Synthesized from all 5 agents."* Clear, ordered, actionable.
8. See the "Powered by ASI:ONE" badge. See the "Download Recovery Pack" button.
9. Leave remembering: the fan-out moment, and the email.

### Real User (full product)

1. Land on Recover — see the animated intro.
2. Fill the four-field input (situation, title, top skills, optional headline/resume bullets).
3. Submit → Recovery Dashboard. Five agents fire concurrently.
4. Review each card as it completes. Edit LinkedIn headline inline if desired → click Regenerate → see updated output in 3 seconds.
5. Copy individual outputs or download the full recovery pack.
6. Day 1 Action Plan gives them a clear first day back.

---

## Core Features

### P0 — Demo-blocking. Missing = no submission.

**1. Animated Landing Intro**
3-second animation on landing page showing five agent icons appearing one by one. Text overlay: *"Five agents. One sentence. Your recovery starts now."* Completes and reveals the input form. Skip button for returning users.

**2. Four-Field Input Form**
Collects: (1) What happened — free text, required; (2) Your job title — text, required; (3) Your top 3 skills — comma-separated text, required; (4) Current LinkedIn headline and/or a few resume bullets — textarea, optional but strongly nudged. Nudge copy: *"The more you give us, the less generic your outputs will be."*

A **"Try a demo scenario"** button pre-fills all four fields with the Google PM persona (see Demo Persona section below). This is the most important UX addition. It guarantees every judge sees the best version of the product.

**3. Recovery Dashboard — Agent Fan-Out**
Five agent cards fire concurrently on dashboard mount. Each card resolves independently through states: Queued → Running → Complete (or Error). Cards do not wait for each other. The visual of five spinners resolving at different times is the core wow moment. Once all five reach terminal state, the Day 1 Action Plan fades in.

**4. LinkedIn Agent Card**
Rewrites the user's LinkedIn headline for active job search optimization using all context fields. Shows a before/after comparison if a current headline was provided. Copy-to-clipboard on the generated headline. An **"Edit & Regenerate"** text field lets the user type a refinement instruction (e.g., "make it more senior-focused") and regenerate in place — this is the agent iteration feature that transforms fire-and-forget into a real product.

**5. Outreach Agent Card**
Drafts three personalized network outreach emails differentiated by relationship type: former manager (deferential, direct), peer/colleague (casual, collegial), recruiter (professional, value-forward). Each email is under 150 words, references the user's role and company by name, and includes a specific ask. Copy-to-clipboard per email.

**6. Unemployment Agent Card**
Generates a state-specific unemployment filing checklist. State is inferred from input if mentioned; otherwise a state dropdown appears in the expanded card. Output: official portal URL, 4–6 step checklist, weekly benefit range, weekly certification note. Copy-all button for the checklist.

**7. Job Alerts Agent Card**
Surfaces 5 matched job listings based on inferred role and skills. Generates recommended search criteria (3–5 title variants, key skills, experience level, remote preference). Listings link to pre-constructed Indeed/LinkedIn search URLs. Copy alert criteria as a formatted text block.

**8. Resume Agent Card**
Generates the top 3 highest-impact resume improvement priorities for this role and situation. If resume bullets were provided, makes specific references to actual text (e.g., "Your bullet 'Managed cross-functional team' should become 'Led 8-person team to ship X, increasing retention by 15%'"). Copy-all button.

**9. Day 1 Action Plan**
Synthesized after all five agents complete. Pulls the single most actionable item from each agent and organizes into Day 1 (3–5 actions), Week 1 (3–5 actions), Month 1 (2–3 actions). Header reads: *"Synthesized from all 5 agents."* Fades in with 300ms ease-in. This is the emotional anchor of the product.

### P1 — Required for credibility

**10. Edit & Regenerate (LinkedIn)**
Text field within the LinkedIn expanded card. User types a refinement: "make it more senior-focused" → clicks Regenerate → agent is re-called with the original context + the refinement instruction → updated headline replaces the previous one in-place. This is the single highest-signal feature for judges: it proves this is a real product, not a demo.

**11. Download Recovery Pack**
After all agents complete, a "Download Recovery Pack" button exports all five outputs + the action plan as a formatted HTML file (print-to-PDF friendly, Recover-branded). Not a .txt file. The last thing the judge sees should be polished.

**12. ASI:ONE Attribution**
"Powered by ASI:ONE Multi-Agent Platform" badge on the dashboard header or footer. Explicit callout in the expanded Day 1 Plan: "This plan was synthesized by an ASI:ONE coordination agent reading all five recovery outputs." This is pure judge psychology — the organizer wants to see their platform celebrated.

**13. Context Personalization**
With company + title + skills provided, all five agent outputs reference that context specifically. The difference between context-empty and context-rich outputs must be visible and meaningful. This is verified during testing: run the demo persona through all five agents and confirm every output is role-specific, not generic.

### P2 — Stretch

**14. Mobile-responsive layout**
Dashboard grid collapses to single-column on screens under 768px. Cards are still fully functional. Currently excluded from MVP but flagged as a competitive gap vs. top submissions.

**15. "Generate 3 more emails" button**
Within the Outreach card — triggers a follow-up agent call for three additional differentiated email drafts.

---

## Demo Persona (Pre-fill Scenario)

This persona must be tested end-to-end before submission. Every agent must produce specific, non-generic output when given this exact input.

```
What happened:     "I just got laid off from Google as a Senior Product Manager after the recent round of cuts."
Job title:         "Senior Product Manager"
Top 3 skills:      "0→1 product development, fintech platform strategy, cross-functional team leadership"
LinkedIn headline: "Senior Product Manager at Google | Building fintech products at scale"
Resume bullets:    "Led 8-person cross-functional team to ship Google Pay's merchant onboarding flow, reducing drop-off by 34%.
                   Owned the 0→1 roadmap for a B2B payments API product that reached $2M ARR in 18 months.
                   Managed stakeholder alignment across Engineering, Legal, and Finance for a PCI-compliance initiative."
```

**Expected outputs to verify:**
- LinkedIn: headline references fintech, 0→1, and targets Director/Senior PM roles
- Outreach: emails reference Google, fintech background, and the specific ask
- Unemployment: checklist for California (or prompts state selection if CA not inferred)
- Jobs: PM listings at fintech companies, senior level, remote-friendly
- Resume: specific references to the three bullet points provided

---

## Agent Architecture

```
User Input (4 fields)
  → extractRecoveryContext()     [lib/context.js]
       → recoveryContext object

recoveryContext
  → linkedinAgent    [/api/agent/linkedinAgent]    → LinkedIn card output
  → outreachAgent    [/api/agent/outreachAgent]    → Email drafts output
  → unemploymentAgent [/api/agent/unemploymentAgent] → Filing checklist output
  → jobAlertsAgent   [/api/agent/jobAlertsAgent]   → Job listings output
  → resumeAgent      [/api/agent/resumeAgent]      → Resume priorities output

All five complete (or error)
  → planAgent        [/api/plan]                   → Day 1 / Week 1 / Month 1 plan
                     (receives all five outputs as context — explicitly synthesizes from them)
```

The planAgent is the key multi-agent coordination step. It must receive each agent's primary output and reference them explicitly in the plan. This transforms five parallel API calls into a genuine multi-agent pipeline.

---

## Technical Overview

**Stack:** Next.js 14 (App Router) + Tailwind CSS. API routes as serverless functions. No separate backend. No database.

**ASI:ONE Integration:** Six distinct ASI:ONE agent calls total — five recovery agents (concurrent) + one plan synthesizer (sequential, after all five resolve). Each agent has a dedicated system prompt instructing JSON-only output. All calls proxied through Next.js API routes; the API key is never exposed to the client.

**State:** React `useReducer` in `dashboard/page.jsx`. Session-only via `sessionStorage`. No persistence across reloads.

**Deployment:** Vercel. Single project. Frontend + API routes together.

---

## Design System

### Color Tokens
```css
--bg-base:       #0A0D1A    /* deep navy — main background */
--bg-surface:    #111425    /* card/panel backgrounds */
--bg-elevated:   #1A1F35    /* hover, selected, expanded states */
--bg-border:     #232840    /* card borders, dividers */

--accent:        #00D4FF    /* primary interactive — buttons, links, spinners */
--accent-dim:    rgba(0, 212, 255, 0.10)
--accent-border: rgba(0, 212, 255, 0.30)

--success:       #00E5A0    /* agent complete state */
--success-dim:   rgba(0, 229, 160, 0.10)
--success-border:rgba(0, 229, 160, 0.30)

--warning:       #F5A623    /* partial / retry state */
--warning-dim:   rgba(245, 166, 35, 0.10)

--danger:        #FF3B5C    /* error state */
--danger-dim:    rgba(255, 59, 92, 0.10)

--text-primary:  #EEF2FF
--text-muted:    #5A6480
--text-faint:    #2A3050
```

### Typography
```
Display / Headlines:  Space Grotesk — weights 500, 700   (Google Fonts)
Body / Labels:        Inter — weights 400, 500             (Google Fonts)
Draft text outputs:   Inter 400 — outputs should feel like documents, not UI
```

### Agent Card States
| State   | Border                | Icon           | Text          |
|---------|-----------------------|----------------|---------------|
| Queued  | `--bg-border`         | Clock (muted)  | "Starting..." |
| Running | `--accent-border`     | Spinner        | "Working..."  |
| Complete| `--success` left-only | Check (green)  | Preview text  |
| Error   | `--danger` left-only  | Warning        | "Retry"       |

Left-border-only for complete/error states (3px left border, no other border). This is the signature visual treatment of the card states.

### Signature Animation
The **agent card fan-out** — five cards appearing staggered (50ms delay between each), spinners running, then resolving at different times — is the primary visual identity of the product. This animation must be smooth, each card's completion must feel distinct, and the green check flip must have a subtle scale pop (scale 0.8 → 1.0, 150ms ease-out).

---

## Naming Conventions

- Agent names in code: `linkedinAgent`, `outreachAgent`, `unemploymentAgent`, `jobAlertsAgent`, `resumeAgent`, `planAgent`
- Context object: `recoveryContext` — typed in `lib/context.js`, passed to all agent calls
- All API routes: `/api/agent/[agentName]` for the five recovery agents, `/api/plan` for the synthesizer
- UI components: PascalCase — `AgentCard`, `AgentCardExpanded`, `RecoveryDashboard`, `ActionPlan`, `InputForm`, `DemoIntro`
- Agent outputs in state: `outputs.linkedinAgent`, `outputs.outreachAgent`, etc.
- All reducer action types: SCREAMING_SNAKE_CASE — `AGENT_STARTED`, `AGENT_COMPLETE`, `AGENT_ERROR`, `AGENT_RETRY`, `EXPAND_CARD`, `CLOSE_CARD`, `PLAN_GENERATING`, `PLAN_COMPLETE`

---

## Success Metrics

The project is complete when all of the following are true:

1. The animated landing intro plays on first load and reveals the input form after 3 seconds
2. The "Try a demo scenario" button pre-fills all four fields with the Google PM persona
3. Submitting navigates immediately to the dashboard and triggers all five agent calls within 500ms of mount
4. All five cards visually resolve independently — if LinkedIn finishes in 3s and Unemployment in 9s, LinkedIn shows complete while others still spin
5. The LinkedIn card shows a before/after comparison using the provided headline
6. The three outreach emails are differentiated by tone and reference "Google" and "Senior PM" specifically
7. The Day 1 Action Plan appears after all five agents resolve, with the "Synthesized from all 5 agents" label
8. Edit & Regenerate works on the LinkedIn card: typing a refinement and clicking Regenerate produces a visibly different headline in under 5 seconds
9. The "Powered by ASI:ONE" badge is visible on the dashboard
10. Download Recovery Pack produces a formatted HTML file with all five outputs and the action plan
11. The full 90-second demo path completes without keyboard input after clicking "Start Recovery"

---

## What Not to Build

- ❌ Real LinkedIn OAuth — copy-to-clipboard is sufficient for demo
- ❌ Real job board API scraping — pre-constructed search URL links only
- ❌ File upload for resume — paste text only
- ❌ User accounts or saved sessions — session-only state
- ❌ Multiple languages — English only
- ❌ `create-react-app` — Next.js 14 App Router only
- ❌ External state management library — `useReducer` only
- ❌ `.txt` export — HTML export only
- ❌ Axios — native `fetch` only
- ❌ Additional AI providers — ASI:ONE only for all agent calls

---

## Future Expansion

- Real LinkedIn OAuth for one-click headline publishing
- Indeed / LinkedIn Jobs API for live listings
- Voice input — "I just got laid off" spoken aloud triggers the flow
- Employer-side product: HR teams use Recover to give laid-off employees an immediate head start as part of offboarding
- Agent memory: user can iterate on any output via natural language ("make the email shorter", "target Series B startups instead")
