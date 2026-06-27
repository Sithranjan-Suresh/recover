export async function callAgent(agentName, context, refinementInstruction, dependencyContext) {
  const startTime = Date.now();
  const response = await fetch(`/api/agent/${agentName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ context, refinementInstruction, dependencyContext }),
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

/**
 * Streams an agent call: invokes onToken(accumulatedText) as deltas arrive,
 * then resolves with the same shape as callAgent once the stream completes
 * and the full JSON is parsed.
 */
export async function callAgentStreaming(agentName, context, { refinementInstruction, dependencyContext, onToken } = {}) {
  const startTime = Date.now();
  const response = await fetch(`/api/agent/${agentName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ context, refinementInstruction, dependencyContext, stream: true }),
  });

  if (!response.ok || !response.body) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Agent call failed');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let accumulated = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') continue;

      try {
        const parsed = JSON.parse(payload);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          accumulated += delta;
          onToken?.(accumulated);
        }
      } catch {
        // partial/non-JSON chunk — skip, next chunk will complete it
      }
    }
  }

  const cleaned = accumulated.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  let content;
  try {
    content = JSON.parse(cleaned);
  } catch {
    throw new Error('Invalid agent output format');
  }

  return { content, accumulated, durationMs: Date.now() - startTime };
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
