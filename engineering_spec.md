# Recover — Engineering Specification

> Read `full_context.md` first — it defines the agent architecture, naming conventions, design system, demo persona, and success metrics. Read `product_spec.md` second — it defines every feature's acceptance criteria. This document specifies implementation only. Nothing defined in those files is repeated here.

**Build order:** Follow the Implementation Task List at the end of this document. Tasks are sequenced by dependency. No task should be started before its prerequisites are complete.

---

## Architecture

### System Overview

```
[Next.js 14 App Router — Vercel]
  /app/page.jsx                  → Landing (intro animation + input form)
  /app/dashboard/page.jsx        → Recovery Dashboard (fan-out + plan)
  /app/api/agent/[agentName]/    → 5 ASI:ONE agent proxies (serverless)
  /app/api/plan/                 → Plan synthesizer proxy (serverless)

[ASI:ONE API]
  ← called from /api/agent/* and /api/plan only
  ← API key never exposed to client

[Browser sessionStorage]
  ← recoveryContext stored after form submit
  ← read by dashboard on mount
```

No database. No separate backend service. No external state management library. All session state lives in React `useReducer` within the dashboard page component.

---

## Directory Structure

```
recover/
  app/
    page.jsx                         — Landing page (DemoIntro + InputForm)
    dashboard/
      page.jsx                       — Recovery Dashboard
    api/
      agent/
        [agentName]/
          route.js                   — Unified handler for all 5 agent proxies
      plan/
        route.js                     — Plan synthesizer proxy
  components/
    DemoIntro.jsx                    — 3-second animated intro sequence
    InputForm.jsx                    — Four-field input form
    RecoveryDashboard.jsx            — Five-card grid + plan container
    AgentCard.jsx                    — Single agent card (all 4 states)
    AgentCardExpanded.jsx            — Full-panel modal per agent
    LinkedInExpanded.jsx             — LinkedIn card expanded content
    OutreachExpanded.jsx             — Outreach card expanded content
    UnemploymentExpanded.jsx         — Unemployment card expanded content
    JobAlertsExpanded.jsx            — Job alerts card expanded content
    ResumeExpanded.jsx               — Resume card expanded content
    ActionPlan.jsx                   — Day 1 / Week 1 / Month 1 section
    CopyButton.jsx                   — Reusable copy-to-clipboard
    StateSelector.jsx                — 50-state dropdown for unemployment
    Spinner.jsx                      — Loading spinner SVG
    AgentIcon.jsx                    — Renders the correct SVG icon per agentName
  lib/
    context.js                       — extractRecoveryContext()
    agents.js                        — callAgent() and callPlanAgent()
    prompts.js                       — All system prompts + user prompt builders
    export.js                        — generateRecoveryPackHTML()
    constants.js                     — AGENT_NAMES, US_STATES, DEMO_PERSONA
  styles/
    globals.css                      — CSS custom property tokens + global reset
  public/
    logo.svg
    icons/
      linkedin.svg
      outreach.svg
      unemployment.svg
      jobs.svg
      resume.svg
  .env.local                         — ASI_ONE_API_KEY (never committed)
  next.config.js
  vercel.json
  package.json
```

---

## Data Model

### RecoveryContext
Produced by `extractRecoveryContext()` in `lib/context.js`. Stored in `sessionStorage` under key `"recoveryContext"` (JSON serialized). Read by dashboard on mount.

```typescript
type RecoveryContext = {
  rawInput: string;           // Field 1: user's original "what happened" text
  inferredTitle: string | null;   // e.g. "Senior Product Manager"
  inferredCompany: string | null; // e.g. "Google"
  inferredState: string | null;   // two-letter code e.g. "CA", or null
  jobTitle: string;               // Field 2: exact user-provided title (always present)
  topSkills: string;              // Field 3: comma-separated skills string
  currentHeadline: string | null; // Field 4 (parsed): LinkedIn headline portion
  resumeSnippet: string | null;   // Field 4 (parsed): resume bullets portion
  rawOptionalContext: string | null; // Field 4: raw unparsed optional field
}
```

Field 4 parsing logic: if the optional field contains text that looks like bullet points (lines starting with `-`, `•`, or `*`, or lines that are ≥ 40 chars), treat the whole field as `resumeSnippet`. If it's a single short line (< 40 chars, no bullets), treat it as `currentHeadline`. If it contains both, split at the first blank line: first block → `currentHeadline`, rest → `resumeSnippet`. When in doubt, treat the whole thing as `resumeSnippet` and set `currentHeadline: null`.

### AgentOutput
Stored in dashboard reducer state under `outputs[agentName]`.

```typescript
type AgentOutput = {
  agentName: AgentName;
  status: 'queued' | 'running' | 'complete' | 'error';
  preview: string | null;       // one-line summary for collapsed card
  content: AgentContent | null; // agent-specific — see per-agent schemas
  error: string | null;
  durationMs: number | null;
}

type AgentName = 'linkedinAgent' | 'outreachAgent' | 'unemploymentAgent' | 'jobAlertsAgent' | 'resumeAgent';
```

### Per-Agent Content Schemas

```typescript
// linkedinAgent
type LinkedInContent = {
  generatedHeadline: string;
  beforeHeadline: string | null; // null if no headline was provided
}

// outreachAgent
type OutreachContent = {
  emails: Array<{
    type: 'manager' | 'peer' | 'recruiter';
    subject: string;
    body: string; // under 150 words
  }>; // always exactly 3 items
}

// unemploymentAgent
type UnemploymentContent = {
  state: string | null;          // two-letter code
  stateName: string | null;
  filingUrl: string | null;
  checklist: string[];           // 4–6 items
  weeklyBenefitRange: string;
  needsStateSelection: boolean;
}

// jobAlertsAgent
type JobAlertsContent = {
  listings: Array<{
    title: string;
    company: string;
    location: string;
    salaryRange: string | null;
    searchUrl: string;           // always a search URL, never a direct listing
  }>; // always exactly 5 items
  alertCriteria: {
    titles: string[];            // 3–5 items
    skills: string[];            // 3–5 items
    experienceLevel: string;
    remotePreference: string;
  }
}

// resumeAgent
type ResumeContent = {
  priorities: Array<{
    summary: string;             // bold one-liner
    explanation: string;         // 2–3 sentences
    specificReference: string | null; // null if no resume bullets provided
  }>; // always exactly 3 items
}
```

### PlanOutput

```typescript
type PlanOutput = {
  day1: PlanAction[];   // 3–5 items
  week1: PlanAction[];  // 3–5 items
  month1: PlanAction[]; // 2–3 items
}

type PlanAction = {
  text: string;
  sourceAgent: AgentName | null; // which agent this action came from
}
```

### Dashboard Reducer State

```typescript
type DashboardState = {
  recoveryContext: RecoveryContext;
  outputs: Record<AgentName, AgentOutput>;
  expandedAgent: AgentName | null;
  planStatus: 'pending' | 'generating' | 'complete' | 'error';
  plan: PlanOutput | null;
  allAgentsTerminal: boolean; // true when all five reach complete or error
}
```

### Reducer Action Types

```typescript
type DashboardAction =
  | { type: 'AGENT_STARTED';     agentName: AgentName }
  | { type: 'AGENT_COMPLETE';    agentName: AgentName; content: AgentContent; preview: string; durationMs: number }
  | { type: 'AGENT_ERROR';       agentName: AgentName; error: string }
  | { type: 'AGENT_RETRY';       agentName: AgentName }
  | { type: 'EXPAND_CARD';       agentName: AgentName }
  | { type: 'CLOSE_CARD' }
  | { type: 'PLAN_GENERATING' }
  | { type: 'PLAN_COMPLETE';     plan: PlanOutput }
  | { type: 'PLAN_ERROR' }
  | { type: 'RETRY_ALL' }
```

`AGENT_RETRY` resets that agent's status to `'queued'` and sets content/error/preview to null. The dashboard `useEffect` that monitors retry state re-triggers the agent call. `RETRY_ALL` resets all five agents to queued and resets `allAgentsTerminal` to false.

---

## API Route Design

### `POST /api/agent/[agentName]`

Single route file handles all five agents via the dynamic `[agentName]` path segment.

**Request:**
```json
{
  "context": RecoveryContext,
  "refinementInstruction": "string | undefined"
}
```

`refinementInstruction` is only sent by the LinkedIn Edit & Regenerate flow. When present, it is appended to the user prompt.

**Route implementation:**
```javascript
// app/api/agent/[agentName]/route.js
import { AGENT_NAMES } from '@/lib/constants';
import { getSystemPrompt, buildUserPrompt } from '@/lib/prompts';
import { buildPreview } from '@/lib/preview';

export async function POST(request, { params }) {
  const { agentName } = params;

  if (!AGENT_NAMES.includes(agentName)) {
    return Response.json({ error: 'Unknown agent' }, { status: 400 });
  }

  const { context, refinementInstruction } = await request.json();

  if (!context) {
    return Response.json({ error: 'Missing context' }, { status: 400 });
  }

  const systemPrompt = getSystemPrompt(agentName);
  const userPrompt = buildUserPrompt(agentName, context, refinementInstruction);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout

  try {
    const asiResponse = await fetch('https://api.asi1.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ASI_ONE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'asi1-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!asiResponse.ok) {
      return Response.json({ error: 'Agent unavailable' }, { status: 502 });
    }

    const asiData = await asiResponse.json();
    const rawText = asiData.choices?.[0]?.message?.content;

    if (!rawText) {
      return Response.json({ error: 'Empty agent response' }, { status: 500 });
    }

    // Strip markdown fences if present
    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let content;
    try {
      content = JSON.parse(cleaned);
    } catch {
      return Response.json({ error: 'Invalid agent output format' }, { status: 500 });
    }

    const preview = buildPreview(agentName, content);

    return Response.json({ content, preview });

  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      return Response.json({ error: 'Agent timeout' }, { status: 408 });
    }
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

**Never expose:** raw ASI:ONE error bodies, stack traces, or the API key in any response.

---

### `POST /api/plan`

**Request:**
```json
{
  "outputs": {
    "linkedinAgent":     AgentOutput,
    "outreachAgent":     AgentOutput,
    "unemploymentAgent": AgentOutput,
    "jobAlertsAgent":    AgentOutput,
    "resumeAgent":       AgentOutput
  },
  "context": RecoveryContext
}
```

**Route logic:**
1. Filter outputs to only those with `status === 'complete'`
2. Build synthesis prompt using completed outputs — each agent's primary output is explicitly included
3. Call ASI:ONE with plan system prompt + synthesis user prompt
4. Parse response into `PlanOutput`
5. Return `{ plan: PlanOutput }`

**Critical:** the plan prompt must receive each agent's actual content and instruct the planAgent to reference specific outputs in its action items. This is what makes the plan a genuine synthesis, not a generic list.

---

## Prompt Design (`lib/prompts.js`)

All prompts are module-level constants. Never constructed inline in route handlers. All system prompts instruct JSON-only output with no preamble.

### LinkedIn System Prompt

```
You are a professional LinkedIn profile writer specializing in active job seekers.
Your output must be a JSON object with exactly these fields:
- "generatedHeadline": a LinkedIn headline under 200 characters, optimized for recruiter search.
  Format: [Specialty] | [Key signal or achievement] | Open to [Target roles]
  Example: "Fintech PM | 0→1 Builder | Open to Senior PM + Director Roles"
- "beforeHeadline": echo back the user's current headline verbatim if one was provided, else null.

Output JSON only. No preamble. No explanation. No markdown fences.
```

### Outreach System Prompt

```
You are a career coach writing network outreach emails for a job seeker.
Your output must be a JSON object with an "emails" array of exactly 3 items.
Each item: { "type": "manager"|"peer"|"recruiter", "subject": string, "body": string }
Requirements:
- "manager" email: deferential tone, asks for a reference or reconnection call
- "peer" email: casual collegial tone, asks for a coffee chat or warm intro
- "recruiter" email: professional value-forward tone, signals availability and seniority
- Every email must reference the user's specific job title and company name
- Every email body must be under 150 words
- Subject lines must be under 60 characters
- Include a specific, concrete ask in every email (not vague "let's connect")

Output JSON only. No preamble. No markdown fences.
```

### Unemployment System Prompt

```
You are an employment benefits specialist with knowledge of U.S. state unemployment systems.
Your output must be a JSON object with these fields:
- "state": two-letter U.S. state code if identifiable from context, else null
- "stateName": full state name or null
- "filingUrl": the official state unemployment portal URL or null
- "checklist": array of 4–6 strings, each a concrete step in the filing process
- "weeklyBenefitRange": e.g. "$200–$450/week" or "Varies by earnings history"
- "needsStateSelection": true if state could not be confidently determined, else false

If the user is not in the U.S., set all fields to null and set "needsStateSelection": false.
Add a field "nonUS": true in that case.

Output JSON only. No preamble. No markdown fences.
```

### Job Alerts System Prompt

```
You are a senior recruiter helping a job seeker identify their best-fit roles.
Your output must be a JSON object with:
- "listings": array of exactly 5 objects, each with:
  { "title": string, "company": string, "location": string, "salaryRange": string|null, "searchUrl": string }
  searchUrl must be a valid LinkedIn Jobs or Indeed search URL for that role — never a direct listing URL.
  LinkedIn format: https://www.linkedin.com/jobs/search/?keywords=[encoded-title]&f_WT=2
  Match the listings to the user's seniority level and skill domain.
- "alertCriteria": {
    "titles": string[] (3–5 recommended search terms),
    "skills": string[] (3–5 key skills),
    "experienceLevel": string,
    "remotePreference": string
  }

Output JSON only. No preamble. No markdown fences.
```

### Resume System Prompt

```
You are a senior resume coach for technology and business professionals.
Your output must be a JSON object with:
- "priorities": array of exactly 3 objects, each with:
  { "summary": string, "explanation": string, "specificReference": string|null }
  - "summary": one bold sentence naming the improvement (e.g. "Quantify your leadership impact")
  - "explanation": 2–3 sentences on why this matters and how to do it
  - "specificReference": a specific rewrite suggestion referencing the user's actual resume text,
    or null if no resume bullets were provided
  The 3 priorities MUST address 3 different aspects: do not repeat the same advice.
  Appropriate aspects: quantification, keywords/ATS, summary section, formatting, role descriptions, recency.

Output JSON only. No preamble. No markdown fences.
```

### Plan System Prompt

```
You are a career strategist synthesizing a personalized job recovery action plan.
You will receive the outputs from 5 recovery agents. Your plan must explicitly reference
specific outputs from those agents — not generic advice.
Your output must be a JSON object with:
- "day1": array of 3–5 action objects
- "week1": array of 3–5 action objects
- "month1": array of 2–3 action objects
Each action object: { "text": string, "sourceAgent": "linkedinAgent"|"outreachAgent"|"unemploymentAgent"|"jobAlertsAgent"|"resumeAgent"|null }
"text" must be specific — reference actual outputs where possible.
  Good: "Update your LinkedIn headline to: 'Fintech PM | 0→1 Builder | Open to Senior PM Roles'"
  Bad: "Update your LinkedIn headline"
Do not repeat the same action in multiple sections. No duplicates across day1/week1/month1.
If an agent's output is missing (it errored), omit that agent's actions from the plan.

Output JSON only. No preamble. No markdown fences.
```

### User Prompt Builders

Each agent has a `buildUserPrompt(context, refinementInstruction?)` function in `lib/prompts.js`. All inject the full context. Keep each under 600 tokens.

```javascript
// lib/prompts.js

export function buildUserPrompt(agentName, context, refinementInstruction) {
  const base = buildBaseContext(context);
  const builders = {
    linkedinAgent: buildLinkedInPrompt,
    outreachAgent: buildOutreachPrompt,
    unemploymentAgent: buildUnemploymentPrompt,
    jobAlertsAgent: buildJobAlertsPrompt,
    resumeAgent: buildResumePrompt,
  };
  return builders[agentName](base, context, refinementInstruction);
}

function buildBaseContext(ctx) {
  return [
    `Job title: ${ctx.jobTitle}`,
    `Top skills: ${ctx.topSkills}`,
    `Situation: ${ctx.rawInput}`,
    ctx.inferredCompany ? `Company: ${ctx.inferredCompany}` : null,
    ctx.inferredState   ? `State: ${ctx.inferredState}` : null,
  ].filter(Boolean).join('\n');
}

function buildLinkedInPrompt(base, ctx, refinement) {
  return [
    base,
    ctx.currentHeadline ? `Current LinkedIn headline: "${ctx.currentHeadline}"` : 'No current headline provided.',
    refinement ? `Refinement instruction: ${refinement}` : null,
    'Generate a new LinkedIn headline for this job seeker.',
  ].filter(Boolean).join('\n');
}

function buildOutreachPrompt(base, ctx) {
  return [
    base,
    'Draft 3 personalized network outreach emails for this job seeker.',
  ].join('\n');
}

function buildUnemploymentPrompt(base, ctx) {
  return [
    base,
    'Generate unemployment filing guidance for this job seeker.',
  ].join('\n');
}

function buildJobAlertsPrompt(base, ctx) {
  return [
    base,
    'Generate 5 matched job listings and search alert criteria for this job seeker.',
  ].join('\n');
}

function buildResumePrompt(base, ctx) {
  return [
    base,
    ctx.resumeSnippet ? `Resume bullets:\n${ctx.resumeSnippet}` : 'No resume bullets provided.',
    'Generate the top 3 resume improvement priorities for this job seeker.',
  ].filter(Boolean).join('\n');
}
```

**Plan user prompt builder** (separate, used in `/api/plan`):
```javascript
export function buildPlanUserPrompt(context, outputs) {
  const sections = Object.entries(outputs)
    .filter(([_, out]) => out.status === 'complete')
    .map(([name, out]) => `${name} output:\n${JSON.stringify(out.content, null, 2)}`);

  return [
    `Job seeker: ${context.jobTitle}${context.inferredCompany ? ` at ${context.inferredCompany}` : ''}`,
    `Skills: ${context.topSkills}`,
    '',
    'Agent outputs:',
    ...sections,
    '',
    'Generate a specific, reference-rich recovery action plan from these outputs.',
  ].join('\n');
}
```

---

## Context Extraction (`lib/context.js`)

```javascript
export function extractRecoveryContext(rawInput, jobTitle, topSkills, optionalContext) {
  return {
    rawInput: rawInput.trim().slice(0, 500),
    jobTitle: jobTitle.trim().slice(0, 100),
    topSkills: topSkills.trim().slice(0, 200),
    inferredCompany: inferCompany(rawInput),
    inferredState: inferState(rawInput),
    inferredTitle: inferTitle(rawInput, jobTitle),
    ...parseOptionalContext(optionalContext),
    rawOptionalContext: optionalContext?.trim() || null,
  };
}
```

**`inferCompany(text)`:**
Scan for words following `"from"`, `"at"`, `"by"`. Extract the next 1–3 capitalized words. Common false positives to exclude: "a", "the", "my", "our", "this". Return the first match or null.

**`inferState(text)`:**
Match against a full lookup of U.S. state names and two-letter abbreviations. Abbreviations are matched case-insensitively with word boundaries. Full names are matched case-insensitively. Return the two-letter code for the first match, or null. This lookup is defined as a static map in `lib/constants.js`.

**`inferTitle(rawInput, jobTitle)`:**
`jobTitle` field is always present and directly provided — use it as `inferredTitle`. The inference from `rawInput` is a fallback only when `jobTitle` is empty (which the form prevents, but guard anyway).

**`parseOptionalContext(text)`:**
Returns `{ currentHeadline, resumeSnippet }`. Logic:
- If null or empty: both null
- If the text contains lines starting with `-`, `•`, `*`, or lines ≥ 40 chars: treat as `resumeSnippet`, set `currentHeadline: null`
- If single line under 40 chars: treat as `currentHeadline`, set `resumeSnippet: null`
- If first paragraph is short (< 40 chars) and remainder has bullets: first paragraph → `currentHeadline`, rest → `resumeSnippet`
- Truncate `resumeSnippet` at 800 chars

---

## `lib/agents.js`

```javascript
export async function callAgent(agentName, context, refinementInstruction) {
  const startTime = Date.now();
  const response = await fetch(`/api/agent/${agentName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ context, refinementInstruction }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Agent call failed');
  }

  return {
    content: data.content,
    preview: data.preview,
    durationMs: Date.now() - startTime,
  };
}

export async function callPlanAgent(outputs, context) {
  const response = await fetch('/api/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ outputs, context }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Plan agent failed');
  return data.plan;
}
```

---

## `lib/preview.js`

```javascript
export function buildPreview(agentName, content) {
  switch (agentName) {
    case 'linkedinAgent':
      return content.generatedHeadline?.slice(0, 80) + (content.generatedHeadline?.length > 80 ? '...' : '');
    case 'outreachAgent':
      return `3 emails drafted · "${content.emails?.[0]?.subject}"`;
    case 'unemploymentAgent':
      return content.needsStateSelection
        ? 'Select your state to get specific guidance'
        : `${content.stateName} unemployment guide ready`;
    case 'jobAlertsAgent':
      return `5 matched roles · ${content.listings?.[0]?.title} at ${content.listings?.[0]?.company}`;
    case 'resumeAgent':
      return content.priorities?.[0]?.summary || '3 resume priorities identified';
    default:
      return 'Complete';
  }
}
```

---

## `lib/export.js`

```javascript
export function generateRecoveryPackHTML(context, outputs, plan) {
  // Returns a complete HTML string with inline styles only
  // Triggered by the Download Recovery Pack button
  // Uses window.Blob and a synthetic <a> click to trigger download
}

export function downloadRecoveryPack(context, outputs, plan) {
  const html = generateRecoveryPackHTML(context, outputs, plan);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const timestamp = new Date().toISOString().slice(0, 10);
  const name = context.jobTitle?.replace(/\s+/g, '-').toLowerCase() || 'recovery';
  a.download = `recover-${name}-${timestamp}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
```

The HTML template must use inline styles only (no `<link>` or `<style>` tags that reference external resources). White background, black text for print compatibility. Section headers use the `--success` green color from the design system. Footer: *"Generated by Recover · Powered by ASI:ONE"*.

---

## `lib/constants.js`

```javascript
export const AGENT_NAMES = [
  'linkedinAgent',
  'outreachAgent',
  'unemploymentAgent',
  'jobAlertsAgent',
  'resumeAgent',
];

export const AGENT_ORDER = AGENT_NAMES; // controls card render order

export const AGENT_LABELS = {
  linkedinAgent:     'LinkedIn',
  outreachAgent:     'Network Outreach',
  unemploymentAgent: 'Unemployment',
  jobAlertsAgent:    'Job Alerts',
  resumeAgent:       'Resume',
};

export const DEMO_PERSONA = {
  rawInput:        "I just got laid off from Google as a Senior Product Manager after the recent round of cuts.",
  jobTitle:        "Senior Product Manager",
  topSkills:       "0→1 product development, fintech platform strategy, cross-functional team leadership",
  optionalContext: `Senior Product Manager at Google | Building fintech products at scale
Led 8-person cross-functional team to ship Google Pay's merchant onboarding flow, reducing drop-off by 34%.
Owned the 0→1 roadmap for a B2B payments API product that reached $2M ARR in 18 months.
Managed stakeholder alignment across Engineering, Legal, and Finance for a PCI-compliance initiative.`,
};

export const US_STATES = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
  'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
  'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
  'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
  'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
  'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
  'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY',
};
```

---

## Frontend Architecture

### Landing Page (`app/page.jsx`)

- Renders `DemoIntro` on first visit (check `sessionStorage.getItem('introSeen')`)
- `DemoIntro` calls `onComplete` after 3 seconds (or immediately if intro was skipped)
- After intro completes, renders `InputForm`
- `InputForm.onSubmit` receives `(rawInput, jobTitle, topSkills, optionalContext)`, calls `extractRecoveryContext()`, stores result in `sessionStorage` as `"recoveryContext"`, then calls `router.push('/dashboard')`

### Dashboard Page (`app/dashboard/page.jsx`)

```javascript
// On mount:
useEffect(() => {
  const stored = sessionStorage.getItem('recoveryContext');
  if (!stored) { router.push('/'); return; }
  const ctx = JSON.parse(stored);

  // Initialize reducer with context
  dispatch({ type: 'INIT', recoveryContext: ctx });

  // Fire all five agents concurrently — NOT Promise.all
  AGENT_NAMES.forEach((agentName, index) => {
    // Stagger dispatch for visual effect
    setTimeout(() => {
      dispatch({ type: 'AGENT_STARTED', agentName });
      callAgent(agentName, ctx)
        .then(({ content, preview, durationMs }) =>
          dispatch({ type: 'AGENT_COMPLETE', agentName, content, preview, durationMs }))
        .catch(err =>
          dispatch({ type: 'AGENT_ERROR', agentName, error: err.message }));
    }, index * 50); // 50ms stagger between each agent start dispatch
  });
}, []); // empty deps — runs once on mount

// Watch for all agents terminal → trigger plan
useEffect(() => {
  if (!state.allAgentsTerminal || state.planStatus !== 'pending') return;
  dispatch({ type: 'PLAN_GENERATING' });
  callPlanAgent(state.outputs, state.recoveryContext)
    .then(plan => dispatch({ type: 'PLAN_COMPLETE', plan }))
    .catch(() => dispatch({ type: 'PLAN_ERROR' }));
}, [state.allAgentsTerminal]);
```

`allAgentsTerminal` is computed in the reducer: `true` when every agent in `outputs` has `status === 'complete'` or `status === 'error'`.

### AgentCard Component

Props: `agentName`, `output: AgentOutput`, `dispatch`

State-based rendering:
- `queued`: muted border, clock icon, agent label, *"Starting..."*
- `running`: accent-border, `<Spinner />`, agent label, *"Working..."*, elapsed time counter (seconds since AGENT_STARTED — computed via `useState` + `setInterval` within the card, cleared on status change)
- `complete`: green left-border (3px), check icon, agent label, `output.preview`, *"Expand →"* button
- `error`: red left-border, warning icon, `output.error`, *"Retry"* button

"Expand →" dispatches `EXPAND_CARD`. "Retry" dispatches `AGENT_RETRY` and immediately calls `callAgent` again.

Card entry animation: `opacity: 0; transform: translateY(8px)` → `opacity: 1; transform: translateY(0)` over 200ms with `animation-delay` based on card index (0ms, 50ms, 100ms, 150ms, 200ms).

Status transition: when `status` changes from `running` to `complete`, the card animates a green check with `transform: scale(0.8) → scale(1.0)` over 150ms ease-out.

### AgentCardExpanded Component

Renders as a fixed full-screen overlay (`position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.7)`).
Inner content card: `max-width: 680px`, centered, `--bg-surface` background, `border-radius: 16px`.
Click outside the content card dispatches `CLOSE_CARD`.

Renders the agent-specific expanded component based on `agentName`:
```javascript
const EXPANDED_COMPONENTS = {
  linkedinAgent:     LinkedInExpanded,
  outreachAgent:     OutreachExpanded,
  unemploymentAgent: UnemploymentExpanded,
  jobAlertsAgent:    JobAlertsExpanded,
  resumeAgent:       ResumeExpanded,
};
```

### LinkedInExpanded

Additional state: `refinement: string`, `regenerating: boolean`, `regeneratedHeadline: string | null`

On regenerate click:
```javascript
setRegenerating(true);
callAgent('linkedinAgent', recoveryContext, refinement)
  .then(({ content }) => setRegeneratedHeadline(content.generatedHeadline))
  .finally(() => setRegenerating(false));
```

Display: if `regeneratedHeadline` is set, the "After" row shows it (replacing the original `generatedHeadline`). The "Before" row always shows `content.beforeHeadline` (original user headline, never changes).

---

## Component CSS Rules

All components use Tailwind utility classes where possible. For design system tokens, use CSS custom properties via `globals.css`. Key rules:

**Agent card left-border (complete state):**
```css
.card-complete {
  border-left: 3px solid var(--success);
  border-top: 1px solid var(--bg-border);
  border-right: 1px solid var(--bg-border);
  border-bottom: 1px solid var(--bg-border);
}
```

**Card entry animation:**
```css
@keyframes cardEnter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.agent-card {
  animation: cardEnter 200ms ease-out both;
}
```

**Check mark pop:**
```css
@keyframes checkPop {
  from { transform: scale(0.8); }
  to   { transform: scale(1.0); }
}

.check-icon {
  animation: checkPop 150ms ease-out;
}
```

---

## Deployment

### Platform: Vercel

**`vercel.json`:**
```json
{
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  }
}
```

30-second max duration for all API routes. The agent-side timeout is 12 seconds, so all routes return well within this limit.

**Environment variables (set in Vercel dashboard — never committed):**
```
ASI_ONE_API_KEY=your_key_here
```

**`.env.local` (local dev only — in `.gitignore`):**
```
ASI_ONE_API_KEY=your_key_here
```

**Build command:** `next build` (default)
**Output:** `.next` (default)
**Framework preset:** Next.js

### Pre-Deploy Checklist
- [ ] `ASI_ONE_API_KEY` set in Vercel environment variables
- [ ] `next build` completes locally without errors or warnings
- [ ] All five agent routes respond correctly with demo persona context
- [ ] Plan route responds correctly with completed agent outputs
- [ ] `sessionStorage` redirect works: navigating to `/dashboard` without context redirects to `/`

---

## Implementation Task List

Tasks are ordered by dependency. Each is independently executable. Complete every task before starting the next.

```
[ ] Task 0  — Scaffold
              npx create-next-app@latest recover --app --tailwind --no-src-dir --no-turbopack
              Add CSS custom property tokens to styles/globals.css (from full_context.md design system)
              Add Google Fonts preconnect for Space Grotesk (500, 700) and Inter (400, 500) to app/layout.jsx
              Create all directories and empty files matching the directory structure above
              Create lib/constants.js with AGENT_NAMES, AGENT_LABELS, AGENT_ORDER, DEMO_PERSONA, US_STATES
              Verify: npm run dev serves the default Next.js page at localhost:3000 without errors

[ ] Task 1  — Context extraction
              Build lib/context.js with extractRecoveryContext() and all sub-functions
              Manual test: extractRecoveryContext("laid off from Google as a Senior PM", "Senior PM", "fintech, strategy", "Senior Product Manager at Google\n- Led 8-person team...")
              Expected: inferredCompany="Google", inferredState=null, currentHeadline="Senior Product Manager at Google", resumeSnippet has the bullet

[ ] Task 2  — Prompts and preview
              Build lib/prompts.js with all 5 agent system prompts, buildUserPrompt(), buildPlanUserPrompt()
              Build lib/preview.js with buildPreview()
              No API calls yet — these are pure string functions

[ ] Task 3  — Agent API route
              Build app/api/agent/[agentName]/route.js
              Test with curl or Postman: POST localhost:3000/api/agent/linkedinAgent with demo persona context
              Verify JSON response with correct shape for linkedinAgent
              Test all 5 agent names return appropriate shapes
              Test invalid agentName returns 400
              Test without ASI_ONE_API_KEY set — should return 502, not throw

[ ] Task 4  — Plan API route
              Build app/api/plan/route.js
              Build lib/agents.js with callAgent() and callPlanAgent()
              Test after Task 3 is working: POST /api/plan with mock completed outputs
              Verify plan output has day1/week1/month1 arrays with sourceAgent fields

[ ] Task 5  — Base components
              Build Spinner.jsx (CSS animation, accent color, configurable size via prop)
              Build CopyButton.jsx (copies text prop, shows "Copied!" for 2s, resets)
              Build AgentIcon.jsx (renders correct SVG from public/icons/ based on agentName prop)
              Build StateSelector.jsx (select element with all 50 states from US_STATES constant)
              Manual visual test: render each component in isolation

[ ] Task 6  — Landing page — Input form
              Build InputForm.jsx with all four fields and demo persona pre-fill button
              Build app/page.jsx rendering InputForm
              Wire onSubmit: extractRecoveryContext() → sessionStorage.setItem('recoveryContext') → router.push('/dashboard')
              Test: submit with demo persona → sessionStorage contains correct recoveryContext
              Test: submit button disabled when Fields 1, 2, or 3 are empty

[ ] Task 7  — Animated intro
              Build DemoIntro.jsx with 5-icon stagger animation and text overlay
              Integrate into app/page.jsx: show DemoIntro on first visit, skip if introSeen in sessionStorage
              Implement skip button that sets introSeen and shows form immediately
              Test prefers-reduced-motion: animation skips, form appears immediately
              Test returning visit: intro skipped, form appears immediately

[ ] Task 8  — Dashboard reducer
              Implement dashboardReducer with all action types in app/dashboard/page.jsx
              Test all state transitions in isolation with manually dispatched actions:
              AGENT_STARTED sets status to 'running'
              AGENT_COMPLETE sets status to 'complete', populates content/preview/durationMs
              AGENT_ERROR sets status to 'error'
              RETRY_ALL resets all five agents to 'queued'
              allAgentsTerminal becomes true when all five are complete or error

[ ] Task 9  — Agent card component
              Build AgentCard.jsx rendering all four states (queued/running/complete/error)
              Add card entry animation (opacity+translateY, 200ms, staggered delay via prop)
              Add check pop animation on complete transition
              Add elapsed time counter in running state (seconds since started)
              Build RecoveryDashboard.jsx rendering five AgentCards in a grid
              No API calls yet — test with mock state using all four card states

[ ] Task 10 — Dashboard fan-out wiring
              Build app/dashboard/page.jsx: read context from sessionStorage, redirect if missing
              Wire useEffect to dispatch AGENT_STARTED and call callAgent() for all five concurrently
              Verify: all five cards animate to running state within 500ms of page load
              Verify: cards resolve independently (LinkedIn complete while others still running)
              Verify: retry button on an error card re-calls only that agent

[ ] Task 11 — Expanded card views
              Build AgentCardExpanded.jsx (overlay + content card, click-outside closes)
              Build LinkedInExpanded.jsx (before/after comparison, copy button)
              Build OutreachExpanded.jsx (3 email sections, copy per email, copy all)
              Build UnemploymentExpanded.jsx (checklist, portal link, state selector for unknown state)
              Build JobAlertsExpanded.jsx (5 listing cards, alert criteria, copy criteria)
              Build ResumeExpanded.jsx (3 numbered priorities with specific references)
              Wire EXPAND_CARD / CLOSE_CARD dispatch to AgentCard expand button and overlay click

[ ] Task 12 — Edit & Regenerate (LinkedIn)
              Add refinement text field and Regenerate button to LinkedInExpanded
              Wire to callAgent('linkedinAgent', context, refinementInstruction)
              Show spinner on Regenerate button during call
              Update generatedHeadline in-place on success
              Show inline error on failure without replacing existing headline

[ ] Task 13 — Action plan
              Build ActionPlan.jsx with Day1/Week1/Month1 sections
              Wire plan useEffect in dashboard: when allAgentsTerminal, call callPlanAgent()
              Render ActionPlan with fade-in after plan completes
              Add visual checkbox (non-functional) with strikethrough on click
              Verify "Synthesized from all 5 agents" subheader is visible

[ ] Task 14 — ASI:ONE badge and export
              Add "Powered by ASI:ONE Multi-Agent Platform" badge to dashboard header
              Build lib/export.js with generateRecoveryPackHTML() and downloadRecoveryPack()
              Add Download Recovery Pack button below ActionPlan
              Verify: downloaded HTML opens in browser, shows all five sections, renders cleanly when printed to PDF
              Verify: button is disabled until all five agents reach terminal state

[ ] Task 15 — End-to-end QA
              Run all items in the Pre-Submission QA Checklist from product_spec.md
              Deploy to Vercel
              Set ASI_ONE_API_KEY in Vercel environment variables
              Run QA checklist again on deployed URL
              Walk full 90-second demo script without touching keyboard after clicking "Start Recovery"
              Verify no console errors on deployed URL
```
