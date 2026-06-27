export const AGENT_NAMES = [
  'linkedinAgent',
  'outreachAgent',
  'unemploymentAgent',
  'jobAlertsAgent',
  'resumeAgent',
];

export const AGENT_ORDER = AGENT_NAMES;

export const AGENT_LABELS = {
  linkedinAgent:     'LinkedIn',
  outreachAgent:     'Network Outreach',
  unemploymentAgent: 'Unemployment',
  jobAlertsAgent:    'Job Alerts',
  resumeAgent:       'Resume',
};

export const DEMO_PERSONA = {
  rawInput:        "I just got laid off from Google as a Senior Product Manager after the recent round of cuts.",
  jobTitle:        "Senior Product Manager",
  topSkills:       "0→1 product development, fintech platform strategy, cross-functional team leadership",
  optionalContext: `Senior Product Manager at Google | Building fintech products at scale
Led 8-person cross-functional team to ship Google Pay's merchant onboarding flow, reducing drop-off by 34%.
Owned the 0→1 roadmap for a B2B payments API product that reached $2M ARR in 18 months.
Managed stakeholder alignment across Engineering, Legal, and Finance for a PCI-compliance initiative.`,
};

export const US_STATES = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
  'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
  'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
  'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
  'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
  'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
  'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY',
};
