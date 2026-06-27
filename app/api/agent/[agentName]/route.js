import { AGENT_NAMES } from '@/lib/constants';
import { getSystemPrompt, buildUserPrompt } from '@/lib/prompts';
import { buildPreview } from '@/lib/preview';

export async function POST(request, { params }) {
  const { agentName } = await params;

  if (!AGENT_NAMES.includes(agentName)) {
    return Response.json({ error: 'Unknown agent' }, { status: 400 });
  }

  const { context, refinementInstruction, dependencyContext, stream } = await request.json();

  if (!context) {
    return Response.json({ error: 'Missing context' }, { status: 400 });
  }

  if (!process.env.ASI_ONE_API_KEY) {
    return Response.json({ error: 'Agent unavailable' }, { status: 502 });
  }

  const systemPrompt = getSystemPrompt(agentName);
  const userPrompt = buildUserPrompt(agentName, context, refinementInstruction, dependencyContext);

  const asiBody = {
    model: 'asi1-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 800,
  };

  if (stream) {
    return handleStreaming(asiBody);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const asiResponse = await fetch('https://api.asi1.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ASI_ONE_API_KEY}`,
      },
      body: JSON.stringify(asiBody),
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

async function handleStreaming(asiBody) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  let asiResponse;
  try {
    asiResponse = await fetch('https://api.asi1.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ASI_ONE_API_KEY}`,
      },
      body: JSON.stringify({ ...asiBody, stream: true }),
      signal: controller.signal,
    });
  } catch {
    clearTimeout(timeout);
    return Response.json({ error: 'Agent unavailable' }, { status: 502 });
  }

  if (!asiResponse.ok || !asiResponse.body) {
    clearTimeout(timeout);
    return Response.json({ error: 'Agent unavailable' }, { status: 502 });
  }

  // Passthrough the upstream SSE stream as-is; the client accumulates deltas itself.
  const upstreamReader = asiResponse.body.getReader();
  const stream = new ReadableStream({
    async start(streamController) {
      try {
        while (true) {
          const { done, value } = await upstreamReader.read();
          if (done) break;
          streamController.enqueue(value);
        }
      } catch {
        // upstream closed early — let the client's [DONE]/EOF handling cope
      } finally {
        clearTimeout(timeout);
        streamController.close();
      }
    },
    cancel() {
      upstreamReader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
