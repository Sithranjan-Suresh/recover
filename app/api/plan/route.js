import { PLAN_SYSTEM_PROMPT, buildPlanUserPrompt } from '@/lib/prompts';

export async function POST(request) {
  const { outputs, context } = await request.json();

  if (!outputs || !context) {
    return Response.json({ error: 'Missing outputs or context' }, { status: 400 });
  }

  if (!process.env.ASI_ONE_API_KEY) {
    return Response.json({ error: 'Plan agent unavailable' }, { status: 502 });
  }

  const userPrompt = buildPlanUserPrompt(context, outputs);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const asiResponse = await fetch('https://api.asi1.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ASI_ONE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'asi1-mini',
        messages: [
          { role: 'system', content: PLAN_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!asiResponse.ok) {
      return Response.json({ error: 'Plan agent unavailable' }, { status: 502 });
    }

    const asiData = await asiResponse.json();
    const rawText = asiData.choices?.[0]?.message?.content;

    if (!rawText) {
      return Response.json({ error: 'Empty plan response' }, { status: 500 });
    }

    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let plan;
    try {
      plan = JSON.parse(cleaned);
    } catch {
      return Response.json({ error: 'Invalid plan output format' }, { status: 500 });
    }

    const completedAgents = new Set(
      Object.entries(outputs)
        .filter(([, out]) => out.status === 'complete')
        .map(([name]) => name)
    );

    for (const section of ['day1', 'week1', 'month1']) {
      if (Array.isArray(plan[section])) {
        plan[section] = plan[section].filter(
          (action) => !action.sourceAgent || completedAgents.has(action.sourceAgent)
        );
      }
    }

    return Response.json({ plan });
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      return Response.json({ error: 'Plan agent timeout' }, { status: 408 });
    }
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
