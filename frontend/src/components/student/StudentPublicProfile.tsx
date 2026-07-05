import { formatCurrency } from '@/lib/currency';
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { getStudentProfile } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

function getInitials(name?: string) {
  if (!name) return '?';
  return name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2);
}

const StudentPublicProfile: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId') || undefined;

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['student', 'public-profile', id, jobId],
    queryFn: () => getStudentProfile(id as string, { jobId }),
    enabled: !!id,
  });

  if (isLoading) return <Skeleton className="h-80 w-full rounded-xl" />;
  if (isError || !profile) return <EmptyState title="Unable to load student profile" description="This profile could not be loaded right now." />;

  const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
  const origin = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
  const buildAssetUrl = (value?: string) => (value ? (value.startsWith('http') ? value : `${origin}${value}`) : '');
  const photoUrl = buildAssetUrl(profile.profilePhotoUrl);
  const coverUrl = buildAssetUrl(profile.coverPhotoUrl);
  const coverStyle = coverUrl
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(37,99,235,0.18), rgba(15,23,42,0.26)), url("${coverUrl.replace(/"/g, '\\"')}")`,
      }
    : undefined;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/95 shadow-card backdrop-blur-xl dark:border-white/10 dark:bg-ink-dark-surface/90">
        <div
          className="h-36 bg-[linear-gradient(135deg,#2563eb_0%,#1e40af_46%,#0f172a_100%)] bg-cover bg-center sm:h-40"
          style={coverStyle}
        />
        <div className="grid gap-5 px-5 pb-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-7">
          <div className="-mt-12 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white bg-brand-50 shadow-elevated ring-1 ring-ink-200 dark:border-ink-dark-surface dark:bg-white/10 dark:ring-white/10">
              {photoUrl ? (
                <img src={photoUrl} alt={`${profile.name} profile`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-brand-600 dark:text-brand-300">{getInitials(profile.name)}</div>
              )}
            </div>
            <div className="min-w-0 flex-1 pt-1 sm:pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight text-ink-950 dark:text-white">{profile.name}</h1>
                {(profile.verifiedSkills || []).length ? <Badge variant="brand">Verified</Badge> : null}
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-600 dark:text-ink-300">
                {profile.description || 'Student profile overview and verified skill history.'}
              </p>
              {profile.university ? <p className="mt-2 text-sm font-medium text-ink-500 dark:text-ink-dark-muted">{profile.university}</p> : null}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 self-end">
            {[
              { label: 'Skills', value: (profile.verifiedSkills || []).length },
              { label: 'Projects', value: (profile.portfolioLinks || []).length },
              { label: 'Reviews', value: (profile.reviews || []).length },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-ink-200/80 bg-white/75 px-3 py-3 text-center shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
                <p className="text-xl font-semibold tracking-tight text-ink-950 dark:text-white">{item.value}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500 dark:text-ink-dark-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="text-sm text-ink-500 dark:text-ink-300">Jobs completed: {profile.jobsCompleted || 0}</p>

            <div className="muted-panel rounded-lg p-4">
              <p className="text-sm font-semibold text-ink-900 dark:text-white">Portfolio</p>
              {(profile.portfolioLinks || []).length ? (
                <ul className="mt-3 space-y-2 text-sm">
                  {(profile.portfolioLinks || []).map((link: string, index: number) => (
                    <li key={`${link}-${index}`}>
                      <a href={link} target="_blank" rel="noreferrer">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">No portfolio links yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-4">
            <div>
              <h2 className="text-2xl font-semibold">Verified skills</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {(profile.verifiedSkills || []).length ? (
                  (profile.verifiedSkills || []).map((skill: any) => (
                    <Badge key={skill.skill?._id || skill.skill?.name || skill._id} variant="brand">
                      {skill.skill?.name || skill.skill} ({skill.score})
                    </Badge>
                  ))
                ) : (
                  <Badge variant="subtle">No verified skills yet</Badge>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold">Client reviews</h2>
              {(profile.reviews || []).length ? (
                <div className="mt-4 space-y-4">
                  {(profile.reviews || []).map((review: any, index: number) => (
                    <div key={`${review.clientName}-${index}`} className="muted-panel rounded-lg p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-ink-900 dark:text-white">{review.clientName}</p>
                          <p className="text-xs text-ink-500 dark:text-ink-300">
                            {review.jobTitle ? `${review.jobTitle} • ` : ''}Rating {review.rating}/5
                          </p>
                        </div>
                        {review.createdAt ? <span className="text-xs text-ink-400 dark:text-ink-300">{new Date(review.createdAt).toLocaleDateString()}</span> : null}
                      </div>
                      {review.comment ? <p className="mt-3 text-sm text-ink-600 dark:text-ink-300">{review.comment}</p> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-ink-500 dark:text-ink-300">No reviews yet.</p>
              )}
            </div>

            {profile.proposalHistory ? (
              <div>
                <h2 className="text-2xl font-semibold">Proposal history for this job</h2>
                {(profile.proposalHistory || []).length ? (
                  <div className="mt-4 space-y-4">
                    {(profile.proposalHistory || []).map((proposal: any) => (
                      <div key={proposal._id} className="muted-panel rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="subtle">{proposal.status}</Badge>
                          {proposal.createdAt ? <span className="text-xs text-ink-400 dark:text-ink-300">{new Date(proposal.createdAt).toLocaleDateString()}</span> : null}
                        </div>
                        {proposal.proposedBudget ? <p className="mt-3 text-sm text-ink-600 dark:text-ink-300">Proposed budget: {formatCurrency(proposal.proposedBudget)}</p> : null}
                        {proposal.details ? <p className="mt-3 whitespace-pre-line text-sm text-ink-500 dark:text-ink-300">{proposal.details}</p> : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-ink-500 dark:text-ink-300">No proposals for this job yet.</p>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentPublicProfile;
