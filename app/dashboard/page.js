'use client';

import { useEffect, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import RecoveryDashboard from '@/components/RecoveryDashboard';
import { dashboardReducer, initialDashboardState } from '@/lib/dashboardReducer';
import { callAgent, callPlanAgent } from '@/lib/agents';
import { AGENT_NAMES } from '@/lib/constants';

export default function DashboardPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(dashboardReducer, undefined, initialDashboardState);

  useEffect(() => {
    const stored = sessionStorage.getItem('recoveryContext');
    if (!stored) {
      router.push('/');
      return;
    }
    const ctx = JSON.parse(stored);
    dispatch({ type: 'INIT', recoveryContext: ctx });

    AGENT_NAMES.forEach((agentName, index) => {
      setTimeout(() => {
        dispatch({ type: 'AGENT_STARTED', agentName });
        callAgent(agentName, ctx)
          .then(({ content, preview, durationMs }) =>
            dispatch({ type: 'AGENT_COMPLETE', agentName, content, preview, durationMs })
          )
          .catch((err) => dispatch({ type: 'AGENT_ERROR', agentName, error: err.message }));
      }, index * 50);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!state.allAgentsTerminal || state.planStatus !== 'pending') return;
    dispatch({ type: 'PLAN_GENERATING' });
    callPlanAgent(state.outputs, state.recoveryContext)
      .then((plan) => dispatch({ type: 'PLAN_COMPLETE', plan }))
      .catch(() => dispatch({ type: 'PLAN_ERROR' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.allAgentsTerminal]);

  const handleRetry = (agentName) => {
    dispatch({ type: 'AGENT_RETRY', agentName });
    dispatch({ type: 'AGENT_STARTED', agentName });
    callAgent(agentName, state.recoveryContext)
      .then(({ content, preview, durationMs }) =>
        dispatch({ type: 'AGENT_COMPLETE', agentName, content, preview, durationMs })
      )
      .catch((err) => dispatch({ type: 'AGENT_ERROR', agentName, error: err.message }));
  };

  const handleRetryAll = () => {
    dispatch({ type: 'RETRY_ALL' });
    AGENT_NAMES.forEach((agentName, index) => {
      setTimeout(() => {
        dispatch({ type: 'AGENT_STARTED', agentName });
        callAgent(agentName, state.recoveryContext)
          .then(({ content, preview, durationMs }) =>
            dispatch({ type: 'AGENT_COMPLETE', agentName, content, preview, durationMs })
          )
          .catch((err) => dispatch({ type: 'AGENT_ERROR', agentName, error: err.message }));
      }, index * 50);
    });
  };

  const handleExpand = (agentName) => dispatch({ type: 'EXPAND_CARD', agentName });
  const handleClose = () => dispatch({ type: 'CLOSE_CARD' });

  if (!state.recoveryContext) return null;

  const erroredCount = AGENT_NAMES.filter((a) => state.outputs[a].status === 'error').length;
  const allErrored = erroredCount === AGENT_NAMES.length;

  return (
    <main className="flex-1 px-6 py-10 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Recovery Dashboard
        </h1>
        <a
          href="https://asi1.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 rounded-full"
          style={{ color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}
        >
          Powered by ASI:ONE Multi-Agent Platform
        </a>
      </div>

      {state.allAgentsTerminal && erroredCount > 0 && (
        <div
          className="mb-6 px-4 py-3 rounded-md text-sm flex items-center justify-between"
          style={{ background: 'var(--warning-dim)', color: 'var(--warning)', border: '1px solid var(--warning)' }}
        >
          <span>
            {allErrored
              ? 'Recover is experiencing high demand. Please retry in a moment.'
              : 'One agent did not complete — your plan may be partial. Retry to fill the gap.'}
          </span>
          <button onClick={handleRetryAll} className="font-medium underline">
            Retry All
          </button>
        </div>
      )}

      <RecoveryDashboard outputs={state.outputs} onExpand={handleExpand} onRetry={handleRetry} />

      {state.allAgentsTerminal && !allErrored && state.planStatus === 'complete' && (
        <div className="fade-in mt-10 p-6 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-border)' }}>
          <h2 className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Your Recovery Plan
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Synthesized from all 5 agents
          </p>
          <pre className="text-xs whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
            {JSON.stringify(state.plan, null, 2)}
          </pre>
        </div>
      )}

      {state.expandedAgent && (
        <div
          onClick={handleClose}
          className="fixed inset-0 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.7)', zIndex: 100 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-[680px] w-full rounded-2xl p-6"
            style={{ background: 'var(--bg-surface)' }}
          >
            <p style={{ color: 'var(--text-primary)' }}>Expanded: {state.expandedAgent}</p>
            <button onClick={handleClose} className="text-sm mt-4" style={{ color: 'var(--accent)' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
