'use client';

import { useEffect, useReducer, useRef } from 'react';
import { useRouter } from 'next/navigation';
import RecoveryDashboard from '@/components/RecoveryDashboard';
import AgentCardExpanded from '@/components/AgentCardExpanded';
import ActionPlan from '@/components/ActionPlan';
import SynthesizingBanner from '@/components/SynthesizingBanner';
import { dashboardReducer, initialDashboardState } from '@/lib/dashboardReducer';
import { callAgentStreaming, callPlanAgent } from '@/lib/agents';
import { downloadRecoveryPack } from '@/lib/export';
import { buildPreview } from '@/lib/preview';
import { AGENT_NAMES } from '@/lib/constants';

// resumeAgent is a genuine downstream consumer of linkedinAgent's output —
// it does not fire until linkedinAgent completes, and receives the new
// headline as required context, rather than running in blind parallel.
const INDEPENDENT_AGENTS = AGENT_NAMES.filter((a) => a !== 'resumeAgent');

export default function DashboardPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(dashboardReducer, undefined, initialDashboardState);
  const ctxRef = useRef(null);

  const runStreamingAgent = (agentName, ctx, extraOpts = {}) => {
    dispatch({ type: 'AGENT_STARTED', agentName });
    return callAgentStreaming(agentName, ctx, {
      ...extraOpts,
      onToken: (text) => dispatch({ type: 'AGENT_STREAM_CHUNK', agentName, text }),
    })
      .then(({ content, durationMs }) => {
        const preview = buildPreview(agentName, content);
        dispatch({ type: 'AGENT_COMPLETE', agentName, content, preview, durationMs });
        return content;
      })
      .catch((err) => {
        dispatch({ type: 'AGENT_ERROR', agentName, error: err.message });
        return null;
      });
  };

  useEffect(() => {
    const stored = sessionStorage.getItem('recoveryContext');
    if (!stored) {
      router.push('/');
      return;
    }
    const ctx = JSON.parse(stored);
    ctxRef.current = ctx;
    dispatch({ type: 'INIT', recoveryContext: ctx });
    dispatch({ type: 'AGENT_WAITING', agentName: 'resumeAgent', waitingOn: 'linkedinAgent' });

    INDEPENDENT_AGENTS.forEach((agentName, index) => {
      setTimeout(() => {
        const promise = runStreamingAgent(agentName, ctx);
        if (agentName === 'linkedinAgent') {
          promise.then((linkedinContent) => {
            runStreamingAgent('resumeAgent', ctx, {
              dependencyContext: linkedinContent ? { newHeadline: linkedinContent.generatedHeadline } : undefined,
            });
          });
        }
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
    const ctx = state.recoveryContext;
    if (agentName === 'resumeAgent') {
      const linkedinContent = state.outputs.linkedinAgent?.content;
      runStreamingAgent('resumeAgent', ctx, {
        dependencyContext: linkedinContent ? { newHeadline: linkedinContent.generatedHeadline } : undefined,
      });
    } else {
      runStreamingAgent(agentName, ctx);
    }
  };

  const handleRetryAll = () => {
    dispatch({ type: 'RETRY_ALL' });
    dispatch({ type: 'AGENT_WAITING', agentName: 'resumeAgent', waitingOn: 'linkedinAgent' });
    const ctx = state.recoveryContext;
    INDEPENDENT_AGENTS.forEach((agentName, index) => {
      setTimeout(() => {
        const promise = runStreamingAgent(agentName, ctx);
        if (agentName === 'linkedinAgent') {
          promise.then((linkedinContent) => {
            runStreamingAgent('resumeAgent', ctx, {
              dependencyContext: linkedinContent ? { newHeadline: linkedinContent.generatedHeadline } : undefined,
            });
          });
        }
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
        <div>
          <p className="font-mono text-[10px] tracking-widest mb-1" style={{ color: 'var(--ink-faint)' }}>
            RECOVER · DEPARTURES BOARD
          </p>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>
            Recovery Dashboard
          </h1>
        </div>
        <a
          href="https://asi1.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10px] tracking-wide px-3 py-1.5 rounded-full"
          style={{ color: 'var(--amber)', background: 'var(--amber-dim)', border: '1px solid var(--amber-border)' }}
        >
          POWERED BY ASI:ONE
        </a>
      </div>

      {state.allAgentsTerminal && erroredCount > 0 && (
        <div
          className="mb-6 px-4 py-3 rounded-md text-sm flex items-center justify-between"
          style={{ background: 'var(--terracotta-dim)', color: 'var(--terracotta)', border: '1px solid var(--terracotta-border)' }}
        >
          <span style={{ fontFamily: 'var(--font-source-serif)' }}>
            {allErrored
              ? 'Recover is experiencing high demand. Please retry in a moment.'
              : 'One agent did not complete — your plan may be partial. Retry to fill the gap.'}
          </span>
          <button onClick={handleRetryAll} className="font-mono text-xs font-medium underline flex-shrink-0">
            RETRY ALL
          </button>
        </div>
      )}

      <RecoveryDashboard outputs={state.outputs} onExpand={handleExpand} onRetry={handleRetry} />

      {state.planStatus === 'generating' && <SynthesizingBanner />}

      {state.allAgentsTerminal && !allErrored && state.planStatus === 'complete' && (
        <>
          <ActionPlan plan={state.plan} />
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => downloadRecoveryPack(state.recoveryContext, state.outputs, state.plan)}
              disabled={!state.allAgentsTerminal}
              className="font-display text-base font-bold px-5 py-3 rounded-md tracking-wide"
              style={{
                background: 'var(--amber)',
                color: '#1B1A17',
                cursor: 'pointer',
              }}
            >
              DOWNLOAD RECOVERY PACK
            </button>
          </div>
        </>
      )}

      {state.expandedAgent && (
        <AgentCardExpanded
          agentName={state.expandedAgent}
          output={state.outputs[state.expandedAgent]}
          recoveryContext={state.recoveryContext}
          onClose={handleClose}
        />
      )}
    </main>
  );
}
