const ICONS = {
  linkedinAgent: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7.5" cy="8" r="1.4" fill="currentColor" />
      <rect x="6.3" y="10.5" width="2.4" height="7" fill="currentColor" />
      <path
        d="M11.5 17.5v-7h2.3v1c.6-.8 1.5-1.3 2.6-1.3 2 0 3.1 1.3 3.1 3.6v3.7h-2.4v-3.3c0-1-.4-1.7-1.4-1.7-.8 0-1.4.6-1.6 1.1-.1.2-.1.5-.1.8v3.1h-2.5Z"
        fill="currentColor"
      />
    </>
  ),
  outreachAgent: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3.5 6.5 12 13l8.5-6.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  unemploymentAgent: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  jobAlertsAgent: (
    <>
      <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 13h18" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  resumeAgent: (
    <>
      <path d="M6 2.5h9l3 3v16H6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 9h6M9 12.5h6M9 16h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
};

export default function AgentIcon({ agentName, size = 20, className = '' }) {
  const icon = ICONS[agentName];
  if (!icon) return null;

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {icon}
    </svg>
  );
}
