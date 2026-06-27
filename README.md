# Recover

> **Lose a job. Not your momentum.**

Recover is an AI-powered job loss recovery platform that transforms a single sentence into a complete recovery strategy.

Describe your situation, and six autonomous AI agents immediately get to work—rewriting your LinkedIn profile, generating networking outreach, finding jobs, reviewing your resume, explaining unemployment benefits, and producing a personalized recovery roadmap.

**Live Demo:** https://recover-plum.vercel.app/

---

## Why Recover?

Job loss creates dozens of urgent tasks that normally take days.

Recover completes them in minutes.

Instead of asking users to prompt multiple AI tools individually, Recover orchestrates specialized agents in parallel and combines their outputs into one actionable recovery plan.

---

## How It Works

1. Describe your situation in one sentence.
2. Recover extracts your career context.
3. Five AI agents execute simultaneously.
4. Results stream in independently.
5. A sixth AI agent synthesizes everything into a prioritized action plan.

```
User Input
      │
      ▼
Context Extraction
      │
      ▼
┌──────────────────────────────┐
│ LinkedIn Agent               │
│ Outreach Agent               │
│ Resume Agent                 │
│ Job Alerts Agent             │
│ Unemployment Agent           │
└──────────────────────────────┘
      │
      ▼
Recovery Plan Agent
      │
      ▼
Day 1 • Week 1 • Month 1 Plan
```

---

# Features

### ⚡ Parallel Multi-Agent Execution

Five specialized AI agents launch simultaneously, each focused on one critical part of job recovery.

Independent loading states let users watch work complete in real time.

---

### 💼 LinkedIn Optimization

* Professional headline rewrite
* Before/after comparison
* Regenerate variations
* Edit before copying

---

### 🤝 Networking Outreach

Generates personalized outreach messages for:

* Former managers
* Former coworkers
* Recruiters

Each message uses a different tone and objective.

---

### 📄 Resume Review

Analyzes uploaded resume content and identifies the three highest-impact improvements, referencing specific bullet points instead of generic advice.

---

### 🔍 Job Discovery

Automatically generates:

* Relevant job listings
* Indeed search
* LinkedIn search
* Position recommendations

---

### 🏛️ Unemployment Guidance

Provides:

* State-specific filing instructions
* Required documentation
* Official filing portal
* Estimated benefit range

---

### 🗓 Personalized Recovery Plan

After every specialist agent finishes, Recover generates a unified roadmap covering:

* Day 1 priorities
* Week 1 goals
* Month 1 strategy

---

### 📦 Recovery Pack Export

Download every generated result as a print-ready HTML report.

---

# Tech Stack

* **Framework:** Next.js 16 (App Router)
* **Frontend:** React 19
* **Styling:** Tailwind CSS v4
* **AI Orchestration:** ASI:ONE
* **Deployment:** Vercel

---

# Architecture

```
User Input
      │
      ▼
extractRecoveryContext()
      │
      ▼
Recovery Context
      │
      ├──────────────► LinkedIn Agent
      ├──────────────► Resume Agent
      ├──────────────► Outreach Agent
      ├──────────────► Job Alerts Agent
      └──────────────► Unemployment Agent

(All execute concurrently)

      │
      ▼

Recovery Plan Agent

      │
      ▼

Unified Day 1 / Week 1 / Month 1 Strategy
```

---

# Running Locally

```bash
git clone https://github.com/your-handle/recover
cd recover
npm install
```

Create a `.env.local`

```env
ASI_ONE_API_KEY=your_api_key
```

Start the development server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# Deployment

Recover is deployed on **Vercel**.

Live Application:

https://recover-plum.vercel.app/

To deploy your own version:

1. Fork the repository
2. Import into Vercel
3. Add the `ASI_ONE_API_KEY` environment variable
4. Deploy

---

# Project Structure

```
app/
├── page.js
├── dashboard/
├── api/
│   ├── agent/
│   └── plan/

components/
├── AgentCard
├── ActionPlan
├── InputForm

lib/
├── agents.js
├── prompts.js
├── context.js
└── dashboardReducer.js
```

---

# Vision

Recover isn't another AI resume builder.

It's an AI recovery system designed to eliminate the administrative and emotional overhead that follows unexpected job loss.

Instead of wondering what to do next, users receive a complete, prioritized recovery strategy within minutes.

---

## Future Improvements

* LinkedIn OAuth publishing
* Resume upload with PDF parsing
* Voice input
* Calendar integration
* Email sending
* Employer offboarding dashboard
* Interview preparation agent
* Salary negotiation agent

---

Built for the **Hack-A-Agent** hackathon using **ASI:ONE**.
