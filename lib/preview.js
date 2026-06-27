export function buildPreview(agentName, content) {
  switch (agentName) {
    case 'linkedinAgent':
      return content.generatedHeadline?.slice(0, 80) + (content.generatedHeadline?.length > 80 ? '...' : '');
    case 'outreachAgent':
      return `3 emails drafted · "${content.emails?.[0]?.subject}"`;
    case 'unemploymentAgent':
      return content.needsStateSelection
        ? 'Select your state to get specific guidance'
        : `${content.stateName} unemployment guide ready`;
    case 'jobAlertsAgent':
      return `5 matched roles · ${content.listings?.[0]?.title} at ${content.listings?.[0]?.company}`;
    case 'resumeAgent':
      return content.priorities?.[0]?.summary || '3 resume priorities identified';
    default:
      return 'Complete';
  }
}
