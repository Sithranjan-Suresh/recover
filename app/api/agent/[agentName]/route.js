import { AGENT_NAMES } from '@/lib/constants';
import { getSystemPrompt, buildUserPrompt } from '@/lib/prompts';
import { buildPreview } from '@/lib/preview';

export async function POST(request, { params }) {
  const { agentName } = await params;

  if (!AGENT_NAMES.includes(agentName)) {
    return Response.json({ error: 'Unknown agent' }, { status: 400 });
  }

  const { context, refinementInstruction } = await request.json();

  if (!context) {
    return Response.json({ error: 'Missing context' }, { status: 400 });
  }

  if (!process.env.ASI_ONE_API_KEY) {
    return Response.json({ error: 'Agent unavailable' }, { status: 502 });
  }

  const systemPrompt = getSystemPrompt(agentName);
  const userPrompt = buildUserPrompt(agentName, context, refinementInstruction);

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
