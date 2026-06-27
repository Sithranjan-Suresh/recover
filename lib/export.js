import { AGENT_LABELS } from './constants.js';

function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const SECTION_COLORS = {
  linkedinAgent: '#F2A93B',
  outreachAgent: '#8FB89A',
  unemploymentAgent: '#D9694F',
  jobAlertsAgent: '#3E7C74',
  resumeAgent: '#9A5B8C',
};

function sectionHeader(title, color = '#00A876') {
  return `
    <div style="display: flex; align-items: center; gap: 10px; margin-top: 36px; margin-bottom: 4px;">
      <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color};"></span>
      <h2 style="font-family: Georgia, serif; font-size: 20px; color: #111; margin: 0;">${esc(title)}</h2>
    </div>
    <div style="border-bottom: 2px solid ${color}; opacity: 0.35; margin-bottom: 12px;"></div>
  `;
}

function renderLinkedIn(content) {
  if (!content) return '<p>LinkedIn output unavailable — retry on the Recover dashboard.</p>';
  return `
    ${content.beforeHeadline ? `<p><strong>Before:</strong> ${esc(content.beforeHeadline)}</p>` : ''}
    <p><strong>Suggested headline:</strong> ${esc(content.generatedHeadline)}</p>
  `;
}

function renderOutreach(content) {
  if (!content) return '<p>Outreach output unavailable — retry on the Recover dashboard.</p>';
  return content.emails
    .map(
      (e) => `
      <div style="margin-bottom: 16px;">
        <p style="font-weight: bold; margin-bottom: 4px;">${esc(e.type.charAt(0).toUpperCase() + e.type.slice(1))} — ${esc(e.subject)}</p>
        <p style="white-space: pre-wrap;">${esc(e.body)}</p>
      </div>`
    )
    .join('');
}

function renderUnemployment(content) {
  if (!content) return '<p>Unemployment output unavailable — retry on the Recover dashboard.</p>';
  if (content.nonUS) return '<p>Unemployment guidance varies by country. Please check your local government employment services.</p>';
  if (content.needsStateSelection) return '<p>State not yet selected. Visit the dashboard to choose your state.</p>';
  return `
    <p><strong>${esc(content.stateName)}</strong></p>
    ${content.filingUrl ? `<p><a href="${esc(content.filingUrl)}">${esc(content.filingUrl)}</a></p>` : ''}
    <ol>${(content.checklist || []).map((c) => `<li>${esc(c)}</li>`).join('')}</ol>
    <p>${esc(content.weeklyBenefitRange)}</p>
  `;
}

function renderJobAlerts(content) {
  if (!content) return '<p>Job alerts output unavailable — retry on the Recover dashboard.</p>';
  const listings = (content.listings || [])
    .map(
      (l) => `<li>${esc(l.title)} at ${esc(l.company)} — ${esc(l.location)}${l.salaryRange ? ` (${esc(l.salaryRange)})` : ''}</li>`
    )
    .join('');
  const c = content.alertCriteria || {};
  return `
    <ul>${listings}</ul>
    <p><strong>Recommended search criteria</strong></p>
    <p>Titles: ${esc((c.titles || []).join(', '))}</p>
    <p>Skills: ${esc((c.skills || []).join(', '))}</p>
    <p>Experience level: ${esc(c.experienceLevel)}</p>
    <p>Remote preference: ${esc(c.remotePreference)}</p>
  `;
}

function renderResume(content) {
  if (!content) return '<p>Resume output unavailable — retry on the Recover dashboard.</p>';
  return (content.priorities || [])
    .map(
      (p, i) => `
      <div style="margin-bottom: 16px;">
        <p style="font-weight: bold;">${i + 1}. ${esc(p.summary)}</p>
        <p>${esc(p.explanation)}</p>
        ${p.specificReference ? `<p style="font-style: italic; color: #555;">${esc(p.specificReference)}</p>` : ''}
      </div>`
    )
    .join('');
}

function renderPlanSection(title, actions) {
  if (!actions || actions.length === 0) return '';
  return `
    <h3 style="font-family: Georgia, serif; margin-top: 20px;">${esc(title)}</h3>
    <ul>${actions.map((a) => `<li>${esc(a.text)}</li>`).join('')}</ul>
  `;
}

export function generateRecoveryPackHTML(context, outputs, plan) {
  const RENDERERS = {
    linkedinAgent: renderLinkedIn,
    outreachAgent: renderOutreach,
    unemploymentAgent: renderUnemployment,
    jobAlertsAgent: renderJobAlerts,
    resumeAgent: renderResume,
  };

  const sections = Object.keys(RENDERERS)
    .map((agentName) => {
      const output = outputs[agentName];
      const body =
        output && output.status === 'complete'
          ? RENDERERS[agentName](output.content)
          : `<p>${esc(AGENT_LABELS[agentName])} output unavailable — retry on the Recover dashboard.</p>`;
      return `${sectionHeader(AGENT_LABELS[agentName], SECTION_COLORS[agentName])}${body}`;
    })
    .join('');

  const planHtml = plan
    ? `
      ${sectionHeader('Your Recovery Plan', '#1B1A17')}
      <p style="color: #888; margin-top: -4px; font-family: Georgia, serif;">Itinerary · synthesized from all 5 agents</p>
      ${renderPlanSection('Day 1', plan.day1)}
      ${renderPlanSection('Week 1', plan.week1)}
      ${renderPlanSection('Month 1', plan.month1)}
    `
    : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Recover — Recovery Pack</title>
</head>
<body style="font-family: Georgia, 'Times New Roman', serif; color: #1B1A17; background: #fff; max-width: 720px; margin: 0 auto; padding: 0 0 40px; line-height: 1.6;">
  <div style="background: #1B1A17; padding: 36px 32px; margin-bottom: 8px;">
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="display: inline-block; width: 14px; height: 14px; border-radius: 3px; background: #F2A93B;"></span>
      <span style="font-family: Georgia, serif; font-size: 26px; font-weight: bold; color: #ECE6D6; letter-spacing: -0.5px;">Recover</span>
    </div>
    <p style="color: #9b9586; margin: 10px 0 0; font-size: 13px; font-family: 'Courier New', monospace; letter-spacing: 0.05em; text-transform: uppercase;">Recovery Pack · ${esc(context.jobTitle)}${context.inferredCompany ? ` — formerly at ${esc(context.inferredCompany)}` : ''}</p>
  </div>
  <div style="padding: 0 24px;">
    ${sections}
    ${planHtml}
    <hr style="margin-top: 40px; border: none; border-top: 1px solid #ddd;">
    <p style="color: #888; font-size: 13px; text-align: center;">Generated by Recover · Powered by ASI:ONE</p>
  </div>
</body>
</html>`;
}

export function downloadRecoveryPack(context, outputs, plan) {
  const html = generateRecoveryPackHTML(context, outputs, plan);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const timestamp = new Date().toISOString().slice(0, 10);
  const name = context.jobTitle?.replace(/\s+/g, '-').toLowerCase() || 'recovery';
  a.download = `recover-${name}-${timestamp}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
