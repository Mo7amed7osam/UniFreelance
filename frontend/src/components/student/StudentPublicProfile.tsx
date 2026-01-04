import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStudentProfile } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const StudentPublicProfile: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId') || undefined;

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['student', 'public-profile', id, jobId],
    queryFn: () => getStudentProfile(id as string, { jobId }),
    enabled: !!id,
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (isError || !profile) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-rose-500">Failed to load student profile.</p>
        </CardContent>
      </Card>
    );
  }

  const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
  const origin = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
  const buildAssetUrl = (value?: string) => {
    if (!value) return '';
    return value.startsWith('http') ? value : `${origin}${value}`;
  };
  const photoUrl = buildAssetUrl(profile.profilePhotoUrl);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-full border border-ink-100 bg-ink-50">
              {photoUrl ? (
                <img src={photoUrl} alt={`${profile.name} profile`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-ink-500">
                  No photo
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-2xl">{profile.name}</CardTitle>
              {profile.university ? (
                <p className="text-sm text-ink-500">{profile.university}</p>
              ) : null}
              <p className="mt-2 text-sm text-ink-500">Jobs completed: {profile.jobsCompleted || 0}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.description ? (
            <div>
              <h3 className="text-sm font-semibold text-ink-700">Bio</h3>
              <p className="mt-2 text-sm text-ink-600">{profile.description}</p>
            </div>
          ) : null}
          <div>
            <h3 className="text-sm font-semibold text-ink-700">Portfolio</h3>
            {(profile.portfolioLinks || []).length ? (
              <ul className="mt-2 space-y-1 text-sm text-brand-600">
                {(profile.portfolioLinks || []).map((link: string, index: number) => (
                  <li key={`${link}-${index}`}>
                    <a href={link} target="_blank" rel="noreferrer">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink-500">No portfolio links yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verified skills</CardTitle>
        </CardHeader>
        <CardContent>
          {(profile.verifiedSkills || []).length ? (
            <div className="flex flex-wrap gap-2">
              {(profile.verifiedSkills || []).map((skill: any) => (
                <Badge key={skill.skill?._id || skill.skill?.name || skill._id} variant="brand">
                  {skill.skill?.name || skill.skill} ({skill.score})
                  {skill.verifiedAt ? ` • ${new Date(skill.verifiedAt).toLocaleDateString()}` : ''}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-500">No verified skills yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Client reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {(profile.reviews || []).length ? (
            <div className="space-y-3">
              {(profile.reviews || []).map((review: any, index: number) => (
                <div key={`${review.clientName}-${index}`} className="rounded-xl border border-ink-100 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{review.clientName}</p>
                      <p className="text-xs text-ink-500">
                        {review.jobTitle ? `${review.jobTitle} • ` : ''}Rating {review.rating}/5
                      </p>
                    </div>
                    {review.createdAt ? (
                      <span className="text-xs text-ink-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    ) : null}
                  </div>
                  {review.comment ? <p className="mt-2 text-sm text-ink-600">{review.comment}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-500">No reviews yet.</p>
          )}
        </CardContent>
      </Card>

      {profile.proposalHistory ? (
        <Card>
          <CardHeader>
            <CardTitle>Proposal history for this job</CardTitle>
          </CardHeader>
          <CardContent>
            {(profile.proposalHistory || []).length ? (
              <div className="space-y-3">
                {(profile.proposalHistory || []).map((proposal: any) => (
                  <div key={proposal._id} className="rounded-xl border border-ink-100 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge variant="default">{proposal.status}</Badge>
                      {proposal.createdAt ? (
                        <span className="text-xs text-ink-400">
                          {new Date(proposal.createdAt).toLocaleDateString()}
                        </span>
                      ) : null}
                    </div>
                    {proposal.proposedBudget ? (
                      <p className="mt-2 text-sm text-ink-600">Proposed budget: ${proposal.proposedBudget}</p>
                    ) : null}
                    {proposal.details ? (
                      <p className="mt-2 whitespace-pre-line text-xs text-ink-500">{proposal.details}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-500">No proposals for this job yet.</p>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default StudentPublicProfile;
