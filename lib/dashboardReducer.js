import { AGENT_NAMES } from './constants.js';

export function makeInitialOutputs() {
  return AGENT_NAMES.reduce((acc, agentName) => {
    acc[agentName] = {
      agentName,
      status: 'queued',
      preview: null,
      content: null,
      error: null,
      durationMs: null,
      streamPreview: null,
      waitingOn: null,
    };
    return acc;
  }, {});
}

export function initialDashboardState() {
  return {
    recoveryContext: null,
    outputs: makeInitialOutputs(),
    expandedAgent: null,
    planStatus: 'pending',
    plan: null,
    allAgentsTerminal: false,
  };
}

function computeAllAgentsTerminal(outputs) {
  return AGENT_NAMES.every(
    (name) => outputs[name].status === 'complete' || outputs[name].status === 'error'
  );
}

export function dashboardReducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return { ...state, recoveryContext: action.recoveryContext };

    case 'AGENT_WAITING': {
      const outputs = {
        ...state.outputs,
        [action.agentName]: { ...state.outputs[action.agentName], status: 'queued', waitingOn: action.waitingOn },
      };
      return { ...state, outputs, allAgentsTerminal: computeAllAgentsTerminal(outputs) };
    }

    case 'AGENT_STARTED': {
      const outputs = {
        ...state.outputs,
        [action.agentName]: { ...state.outputs[action.agentName], status: 'running', error: null, waitingOn: null, streamPreview: null },
      };
      return { ...state, outputs, allAgentsTerminal: computeAllAgentsTerminal(outputs) };
    }

    case 'AGENT_STREAM_CHUNK': {
      const outputs = {
        ...state.outputs,
        [action.agentName]: { ...state.outputs[action.agentName], streamPreview: action.text },
      };
      return { ...state, outputs };
    }

    case 'AGENT_COMPLETE': {
      const outputs = {
        ...state.outputs,
        [action.agentName]: {
          ...state.outputs[action.agentName],
          status: 'complete',
          content: action.content,
          preview: action.preview,
          durationMs: action.durationMs,
          error: null,
          streamPreview: null,
        },
      };
      return { ...state, outputs, allAgentsTerminal: computeAllAgentsTerminal(outputs) };
    }

    case 'AGENT_ERROR': {
      const outputs = {
        ...state.outputs,
        [action.agentName]: {
          ...state.outputs[action.agentName],
          status: 'error',
          error: action.error,
        },
      };
      return { ...state, outputs, allAgentsTerminal: computeAllAgentsTerminal(outputs) };
    }

    case 'AGENT_RETRY': {
      const outputs = {
        ...state.outputs,
        [action.agentName]: {
          agentName: action.agentName,
          status: 'queued',
          preview: null,
          content: null,
          error: null,
          durationMs: null,
          streamPreview: null,
          waitingOn: null,
        },
      };
      return { ...state, outputs, allAgentsTerminal: computeAllAgentsTerminal(outputs) };
    }

    case 'RETRY_ALL':
      return {
        ...state,
        outputs: makeInitialOutputs(),
        allAgentsTerminal: false,
        planStatus: 'pending',
        plan: null,
      };

    case 'EXPAND_CARD':
      return { ...state, expandedAgent: action.agentName };

    case 'CLOSE_CARD':
      return { ...state, expandedAgent: null };

    case 'PLAN_GENERATING':
      return { ...state, planStatus: 'generating' };

    case 'PLAN_COMPLETE':
      return { ...state, planStatus: 'complete', plan: action.plan };

    case 'PLAN_ERROR':
      return { ...state, planStatus: 'error' };

    default:
      return state;
  }
}
