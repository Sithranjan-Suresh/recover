import { US_STATES } from './constants.js';

const STATE_LOOKUP = (() => {
  const map = new Map();
  for (const [name, code] of Object.entries(US_STATES)) {
    map.set(name.toLowerCase(), code);
    map.set(code.toLowerCase(), code);
  }
  return map;
})();

const COMPANY_STOPWORDS = new Set(['a', 'the', 'my', 'our', 'this', 'that', 'an']);

export function inferCompany(text) {
  if (!text) return null;
  const regex = /\b(?:from|at|by)\s+((?:[A-Z][\w&.'-]*\s*){1,3})/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const words = match[1].trim().split(/\s+/).filter(Boolean);
    const filtered = [];
    for (const w of words) {
      const lower = w.toLowerCase();
      if (COMPANY_STOPWORDS.has(lower)) {
        if (filtered.length > 0) break;
        continue;
      }
      if (!/^[A-Z]/.test(w)) break;
      filtered.push(w);
    }
    if (filtered.length > 0) {
      return filtered.join(' ').replace(/[.,;:]+$/, '');
    }
  }
  return null;
}

export function inferState(text) {
  if (!text) return null;
  for (const [name, code] of Object.entries(US_STATES)) {
    const nameRegex = new RegExp(`\\b${name}\\b`, 'i');
    if (nameRegex.test(text)) return code;
  }
  for (const code of Object.values(US_STATES)) {
    const codeRegex = new RegExp(`\\b${code}\\b`);
    if (codeRegex.test(text)) return code;
  }
  return null;
}

export function inferTitle(rawInput, jobTitle) {
  if (jobTitle && jobTitle.trim()) return jobTitle.trim();
  if (!rawInput) return null;
  const match = rawInput.match(/as an?\s+([A-Za-z][\w\s,/-]{2,60}?)(?:\s+(?:after|at|from|because|due to)\b|[.,]|$)/i);
  return match ? match[1].trim() : null;
}

export function parseOptionalContext(text) {
  if (!text || !text.trim()) {
    return { currentHeadline: null, resumeSnippet: null };
  }

  const trimmed = text.trim();
  const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);

  const looksLikeBullet = (line) =>
    /^[-•*]/.test(line) || line.length >= 40;

  if (lines.length === 1) {
    if (looksLikeBullet(lines[0])) {
      return { currentHeadline: null, resumeSnippet: trimmed.slice(0, 800) };
    }
    return { currentHeadline: lines[0], resumeSnippet: null };
  }

  const firstLine = lines[0];
  const restLines = lines.slice(1);
  const restHasBullets = restLines.some(looksLikeBullet);

  if (firstLine.length < 40 && restHasBullets) {
    return {
      currentHeadline: firstLine,
      resumeSnippet: restLines.join('\n').slice(0, 800),
    };
  }

  if (lines.some(looksLikeBullet)) {
    return { currentHeadline: null, resumeSnippet: trimmed.slice(0, 800) };
  }

  return { currentHeadline: null, resumeSnippet: trimmed.slice(0, 800) };
}

export function extractRecoveryContext(rawInput, jobTitle, topSkills, optionalContext) {
  return {
    rawInput: (rawInput || '').trim().slice(0, 500),
    jobTitle: (jobTitle || '').trim().slice(0, 100),
    topSkills: (topSkills || '').trim().slice(0, 200),
    inferredCompany: inferCompany(rawInput),
    inferredState: inferState(rawInput),
    inferredTitle: inferTitle(rawInput, jobTitle),
    ...parseOptionalContext(optionalContext),
    rawOptionalContext: optionalContext?.trim() || null,
  };
}
