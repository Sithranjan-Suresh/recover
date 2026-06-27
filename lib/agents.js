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
