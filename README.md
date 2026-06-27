# Recover

An autonomous multi-agent job loss recovery platform. The moment you submit your situation, five ASI:ONE agents fire concurrently — LinkedIn rewrite, network outreach, unemployment guidance, job alerts, and resume triage — followed by a plan synthesizer that produces a Day 1 / Week 1 / Month 1 action plan referencing all five outputs.

See [`full_context.md`](./full_context.md), [`product_spec.md`](./product_spec.md), and [`engineering_spec.md`](./engineering_spec.md) for the full project context, feature specs, and implementation details.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Click **"Try a demo scenario"** on the input form to pre-fill the Google PM persona, then **"Start Recovery"** to see the agent fan-out.

Set `ASI_ONE_API_KEY` in `.env.local` (already configured for local dev — never commit this file).

## Manual QA checklist

See the **Pre-Submission QA Checklist** at the end of [`product_spec.md`](./product_spec.md). All five agents have been verified against the demo persona via direct API calls — each returns role-specific output referencing Google, Senior PM, and fintech. `npm run build` completes with no errors or warnings.

## Deploy

Deploy on [Vercel](https://vercel.com/new) by importing this GitHub repo and setting `ASI_ONE_API_KEY` as an environment variable.
