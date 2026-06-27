'use client';

import CopyButton from './CopyButton';

export default function JobAlertsExpanded({ content }) {
  if (!content) return null;

  const { listings, alertCriteria } = content;

  const criteriaText = [
    `Job titles to search: ${alertCriteria.titles.join(', ')}`,
    `Key skills to include: ${alertCriteria.skills.join(', ')}`,
    `Experience level: ${alertCriteria.experienceLevel}`,
    `Remote preference: ${alertCriteria.remotePreference}`,
  ].join('\n');

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        {listings.map((listing, i) => (
          <div key={i} className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--bg-border)' }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {listing.title}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {listing.company} · {listing.location}
                {listing.salaryRange ? ` · ${listing.salaryRange}` : ''}
              </p>
            </div>
            <a
              href={listing.searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium whitespace-nowrap"
              style={{ color: 'var(--accent)' }}
            >
              View listings →
            </a>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
          Recommended search criteria
        </p>
        <div className="text-sm flex flex-col gap-1 mb-3" style={{ color: 'var(--text-primary)' }}>
          <p>Job titles to search: {alertCriteria.titles.join(', ')}</p>
          <p>Key skills to include: {alertCriteria.skills.join(', ')}</p>
          <p>Experience level: {alertCriteria.experienceLevel}</p>
          <p>Remote preference: {alertCriteria.remotePreference}</p>
        </div>
        <CopyButton text={criteriaText} label="Copy search criteria" />
      </div>
    </div>
  );
}
