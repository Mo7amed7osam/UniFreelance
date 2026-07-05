import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bookmark,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  RotateCcw,
  Search,
  SendHorizonal,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { toast } from 'sonner';

import { fetchJobs, getStudentProfile, getStudentProposals, improveCoverLetter, submitProposal } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import {
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useAuthContext } from '@/context/AuthContext';

interface JobListProps {
  embedded?: boolean;
}

interface ProposalDraft {
  details: string;
  timeline: string;
  portfolio: string;
  budget: string;
  lastManualDetails?: string;
  aiEnhanced?: boolean;
}

const emptyDraft = (): ProposalDraft => ({ details: '', timeline: '', portfolio: '', budget: '' });

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const logoColors = ['#111014', '#0ea5e9', '#6366f1', '#16a34a', '#f59e0b', '#e11d48'];

function companyName(job: any) {
  return job?.clientId?.name || job?.company || 'Client';
}

function initials(value?: string) {
  if (!value) return 'C';
  return value.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function budgetLabel(job: any) {
  if (job?.budgetMin !== undefined || job?.budgetMax !== undefined) {
    return `${job.budgetMin !== undefined ? formatCurrency(job.budgetMin) : '-'}-${job.budgetMax !== undefined ? formatCurrency(job.budgetMax) : '-'}`;
  }
  return job?.budget ? formatCurrency(job.budget) : 'Budget TBA';
}

function postedLabel(job: any) {
  const source = job?.createdAt || job?.updatedAt;
  if (!source) return 'Recently';
  const days = Math.max(0, Math.round((Date.now() - new Date(source).getTime()) / 86400000));
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  return `${days}d ago`;
}

function matchScore(job: any, index: number) {
  if (typeof job?.matchScore === 'number') return Math.round(job.matchScore);
  return Math.max(72, 96 - index * 4);
}

const JobList: React.FC<JobListProps> = ({ embedded = false }) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, ProposalDraft>>({});
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const userId = user?._id || user?.id;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: jobs, isLoading, isError, isFetching } = useQuery({
    queryKey: ['jobs', debouncedSearch],
    queryFn: () => fetchJobs(debouncedSearch ? { search: debouncedSearch } : undefined),
  });

  const { data: proposals } = useQuery({
    queryKey: ['student', 'proposals', userId],
    queryFn: () => getStudentProposals(userId),
    enabled: !!userId,
  });

  const { data: profile } = useQuery({
    queryKey: ['student', 'profile', userId],
    queryFn: () => getStudentProfile(userId),
    enabled: !!userId,
  });

  const submittedJobIds = useMemo(() => {
    const ids = (proposals || []).map((p: any) => p.jobId?._id || p.jobId);
    return new Set(ids);
  }, [proposals]);

  const verifiedSkillIds = useMemo(
    () => new Set((profile?.verifiedSkills || []).map((item: any) => String(item.skill?._id || item.skill))),
    [profile]
  );

  const proposalMutation = useMutation({
    mutationFn: ({ jobId, details, proposedBudget }: { jobId: string; details: string; proposedBudget?: number }) =>
      submitProposal(jobId, { details, proposedBudget }),
    onSuccess: (_data, variables) => {
      toast.success('Proposal submitted');
      setActiveJobId(null);
      setDrafts((p) => { const n = { ...p }; delete n[variables.jobId]; return n; });
      queryClient.invalidateQueries({ queryKey: ['student', 'proposals', userId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to submit proposal');
    },
  });

  const improveLetterMutation = useMutation({
    mutationFn: ({ text, jobTitle }: { text: string; jobTitle?: string }) =>
      improveCoverLetter({ text, jobTitle }),
    onSuccess: (data) => {
      if (!activeJobId) return;
      const improved = data?.improved?.trim();
      if (!improved) {
        toast.error('Could not improve the cover letter.');
        return;
      }
      setDrafts((prev) => ({
        ...prev,
        [activeJobId]: {
          ...getDraft(activeJobId),
          lastManualDetails: getDraft(activeJobId).details,
          details: improved,
          aiEnhanced: true,
        },
      }));
      toast.success('Cover letter improved.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to improve cover letter');
    },
  });

  const filteredJobs = useMemo(() => jobs || [], [jobs]);

  const getDraft = (jobId: string) => drafts[jobId] ?? emptyDraft();

  const setDraftField = (jobId: string, field: keyof ProposalDraft, value: string) => {
    setDrafts((p) => ({ ...p, [jobId]: { ...getDraft(jobId), [field]: value } }));
  };

  const getMissingVerifiedSkills = (job: any) =>
    (job?.requiredSkills || []).filter((skill: any) => !verifiedSkillIds.has(String(skill?._id || skill)));

  const openJobCount = filteredJobs.filter((job: any) => !submittedJobIds.has(job._id || job.id)).length;
  const readyJobCount = filteredJobs.filter((job: any) => {
    const jobKey = job._id || job.id;
    return !submittedJobIds.has(jobKey) && getMissingVerifiedSkills(job).length === 0;
  }).length;

  const activeJob = filteredJobs.find((j: any) => (j._id || j.id) === activeJobId);
  const activeDraft = activeJobId ? getDraft(activeJobId) : emptyDraft();
  const coverLetterLength = activeDraft.details.trim().length;

  const handleSubmit = async () => {
    if (!activeJobId) return;
    if (submittedJobIds.has(activeJobId)) {
      toast.error('Already applied to this job.');
      return;
    }
    if (activeJob) {
      const missingSkills = getMissingVerifiedSkills(activeJob);
      if (missingSkills.length > 0) {
        toast.error(`Verify required skills first: ${missingSkills.map((skill: any) => skill.name || skill).join(', ')}`);
        return;
      }
    }
    const draft = getDraft(activeJobId);
    if (!draft.details.trim()) {
      toast.error('Cover letter is required.');
      return;
    }
    const parsedBudget = draft.budget ? Number(draft.budget) : undefined;
    if (draft.budget && (!Number.isFinite(parsedBudget) || (parsedBudget as number) < 0)) {
      toast.error('Budget must be a valid non-negative number.');
      return;
    }
    const composedDetails = [
      `Cover Letter: ${draft.details.trim()}`,
      draft.timeline.trim() ? `Timeline: ${draft.timeline.trim()}` : null,
      draft.portfolio.trim() ? `Portfolio Links: ${draft.portfolio.trim()}` : null,
    ].filter(Boolean).join('\n');

    await proposalMutation.mutateAsync({ jobId: activeJobId, details: composedDetails, proposedBudget: parsedBudget });
  };

  return (
    <div className="min-w-0 space-y-[22px]">
      {!embedded && (
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <PageHeader
            title="Find work"
            description="Roles matched to your verified skills and availability."
          />
          <div className="flex items-center gap-2">
            <span className="sh-chip font-mono">{filteredJobs.length || 0} open jobs</span>
            <Button variant="outline" size="sm"><SlidersHorizontal size={14} /> Sort: Best match</Button>
          </div>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="sh-panel hidden p-[18px] lg:sticky lg:top-[88px] lg:block">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-ink-900 dark:text-white">Filters</span>
            <button type="button" className="text-xs font-semibold text-brand-600">Reset</button>
          </div>
          <div className="space-y-4">
            <div>
              <div className="label-muted mb-2">Category</div>
              <div className="flex flex-wrap gap-2">
                {['Development', 'Design', 'Marketing', 'Writing', 'Data'].map((item, index) => (
                  <span key={item} className={index === 0 ? 'sh-chip rounded-lg' : 'sh-muted-chip rounded-lg'}>{item}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="label-muted mb-2">Job type</div>
              <div className="space-y-2.5">
                {['Fixed price', 'Hourly', 'Part-time', 'Internship'].map((item, index) => (
                  <label key={item} className="flex items-center gap-2.5 text-[13.5px] text-ink-600 dark:text-ink-300">
                    <span className={`flex h-[17px] w-[17px] items-center justify-center rounded-[5px] ${index === 0 ? 'bg-brand-500 text-white' : 'border border-ink-400'}`}>
                      {index === 0 ? <CheckCircle2 size={11} /> : null}
                    </span>
                    {item}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div className="label-muted mb-3">Budget range</div>
              <div className="relative mx-1 h-[5px] rounded-full bg-ink-200 dark:bg-white/10">
                <div className="absolute left-[12%] right-[34%] top-0 h-full rounded-full bg-brand-500" />
                <div className="absolute left-[12%] top-1/2 h-[15px] w-[15px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand-500 bg-white" />
                <div className="absolute left-[66%] top-1/2 h-[15px] w-[15px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand-500 bg-white" />
              </div>
              <div className="mt-2 flex justify-between font-mono text-xs text-ink-500"><span>$150</span><span>$2,400</span></div>
            </div>
            <div className="flex items-center justify-between rounded-[11px] border border-emerald-100 bg-emerald-50 px-3 py-2.5 dark:border-emerald-500/25 dark:bg-emerald-500/15">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-emerald-700 dark:text-emerald-300"><CheckCircle2 size={15} /> Verified clients only</span>
              <span className="relative h-[19px] w-[34px] rounded-full bg-emerald-600"><span className="absolute right-0.5 top-0.5 h-[15px] w-[15px] rounded-full bg-white" /></span>
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-3">
          <div className="sh-panel flex min-w-0 items-center gap-3 px-4 py-3">
            <Search size={16} className="shrink-0 text-ink-400" />
            <Input
              placeholder="Search by title, skill, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-h-0 border-0 bg-transparent p-0 text-sm shadow-none focus:ring-0 dark:bg-transparent"
            />
            {search ? (
              <button onClick={() => setSearch('')} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600">
                <X size={14} />
              </button>
            ) : null}
          </div>

          {!isLoading && !isError ? (
            <div className="flex items-center gap-3 rounded-[14px] border border-brand-100 bg-brand-50 px-4 py-3 dark:border-brand-500/25 dark:bg-brand-500/15">
              <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-brand-400 to-brand-500 text-white">
                <Sparkles size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-ink-900 dark:text-white">{readyJobCount} jobs perfectly match your verified skills</div>
                <div className="mt-0.5 text-[12.5px] text-ink-600 dark:text-ink-300">Based on your verified skill profile and current applications.</div>
              </div>
              <Button variant="outline" size="sm" className="hidden border-brand-100 text-brand-600 md:inline-flex">View matches</Button>
            </div>
          ) : null}

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[180px] w-full rounded-2xl" />)}
            </div>
          ) : null}

          {isError ? (
            <EmptyState title="Unable to load jobs" description="The job board could not be loaded. Please try again." />
          ) : null}

          {!isLoading && !isError && filteredJobs.length === 0 ? (
            <EmptyState
              title={debouncedSearch ? 'No jobs match this search' : 'No jobs available yet'}
              description={debouncedSearch ? 'Try a broader keyword.' : 'New jobs will appear here as clients publish them.'}
            />
          ) : null}

          {!isLoading && !isError && filteredJobs.length > 0 ? (
            <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="visible" key={debouncedSearch}>
              <AnimatePresence>
                {filteredJobs.map((job: any, index: number) => {
                  const jobKey = job._id || job.id;
                  const hasSubmitted = submittedJobIds.has(jobKey);
                  const skills = job.requiredSkills || [];
                  const missingSkills = getMissingVerifiedSkills(job);
                  const canApply = missingSkills.length === 0;
                  const score = matchScore(job, index);

                  return (
                    <motion.article
                      key={jobKey}
                      variants={fadeUp}
                      layout
                      className="sh-panel flex flex-col gap-4 p-[18px] transition hover:-translate-y-0.5 hover:border-brand-200 xl:flex-row"
                    >
                      <div
                        className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl text-base font-bold text-white"
                        style={{ background: logoColors[index % logoColors.length] }}
                      >
                        {initials(companyName(job))}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="m-0 text-[16px] font-semibold tracking-[-0.01em] text-ink-900 dark:text-white">{job.title}</h3>
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11.5px] font-semibold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300">
                            <CheckCircle2 size={11} /> Verified client
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-ink-500 dark:text-ink-dark-muted">
                          <span className="font-semibold text-ink-600 dark:text-ink-300">{companyName(job)}</span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1"><MapPin size={12} /> {job.location || 'Remote'}</span>
                          <span>·</span>
                          <span>{postedLabel(job)}</span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-[13.5px] leading-6 text-ink-600 dark:text-ink-300">{job.description}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {skills.slice(0, 4).map((skill: any) => (
                            <span key={skill._id || skill} className="rounded-[7px] border border-ink-200 bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-600 dark:border-ink-dark-border dark:bg-white/[0.055] dark:text-ink-300">
                              {skill.name || skill}
                            </span>
                          ))}
                          <span className="px-1 py-1 text-xs font-semibold text-ink-500">{job.duration || 'Fixed price'}</span>
                        </div>
                        {!canApply ? (
                          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-500/25 dark:bg-amber-500/10">
                            <ShieldAlert size={15} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-300" />
                            <p className="min-w-0 break-words text-sm text-amber-700 dark:text-amber-200">
                              Verify these skills first: {missingSkills.map((skill: any) => skill.name || skill).join(', ')}
                            </p>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 flex-col justify-between gap-3 border-t border-ink-100 pt-3 xl:w-[158px] xl:border-l xl:border-t-0 xl:pl-4 xl:pt-0 dark:border-ink-dark-border">
                        <div className="flex items-start justify-between gap-3 xl:flex-col xl:items-end">
                          <button type="button" className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-ink-200 bg-white text-ink-400 dark:border-ink-dark-border dark:bg-white/[0.055]">
                            <Bookmark size={15} />
                          </button>
                          <div className="text-right">
                            <div className="sh-number text-[17px] text-ink-900 dark:text-white">{budgetLabel(job)}</div>
                            <div className="text-[11.5px] text-ink-500">{job.duration || 'Fixed price'}</div>
                            <div className="mt-2 flex items-center justify-end gap-2">
                              <div
                                className="flex h-[26px] w-[26px] items-center justify-center rounded-full"
                                style={{ background: `conic-gradient(#6366f1 ${score}%, #edeef3 0)` }}
                              >
                                <span className="h-[18px] w-[18px] rounded-full bg-white dark:bg-ink-dark-surface" />
                              </div>
                              <span className="text-xs text-ink-600 dark:text-ink-300"><b className="text-ink-900 dark:text-white">{score}%</b> match</span>
                            </div>
                          </div>
                        </div>
                        {hasSubmitted ? (
                          <div className="rounded-[10px] border border-emerald-100 bg-emerald-50 px-3 py-2 text-center text-sm font-semibold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300">
                            Applied
                          </div>
                        ) : (
                          <Button className="w-full" onClick={() => setActiveJobId(jobKey)} disabled={isFetching || !canApply}>
                            Apply now
                          </Button>
                        )}
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          ) : null}
        </main>
      </div>

      <Sheet open={!!activeJobId} onOpenChange={(open) => { if (!open) setActiveJobId(null); }}>
        <SheetContent side="right" className="flex flex-col overflow-y-auto border-ink-200 bg-white/95 shadow-elevated backdrop-blur-xl dark:border-ink-dark-border dark:bg-ink-dark-surface/95 sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="pr-6">{activeJob?.title || 'Apply for this role'}</SheetTitle>
            <SheetDescription>
              Complete the form below. A strong cover letter significantly improves your chance.
            </SheetDescription>
          </SheetHeader>

          {activeJob ? (
            <div className="flex flex-wrap gap-3 rounded-lg border border-ink-200 bg-ink-50 p-3 text-sm dark:border-ink-dark-border dark:bg-white/5">
              {(activeJob.budgetMin !== undefined || activeJob.budgetMax !== undefined) ? (
                <span className="flex items-center gap-1.5 text-ink-600 dark:text-ink-300">
                  <Wallet size={13} /> {budgetLabel(activeJob)}
                </span>
              ) : null}
              {activeJob.duration ? (
                <span className="flex items-center gap-1.5 text-ink-600 dark:text-ink-300">
                  <Clock size={13} /> {activeJob.duration}
                </span>
              ) : null}
              {companyName(activeJob) ? (
                <span className="flex items-center gap-1.5 text-ink-600 dark:text-ink-300">
                  <Building2 size={13} /> {companyName(activeJob)}
                </span>
              ) : null}
            </div>
          ) : null}

          {activeJob && getMissingVerifiedSkills(activeJob).length > 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-700/30 dark:bg-amber-900/10 dark:text-amber-200">
              You cannot apply until these required skills are verified:{' '}
              {getMissingVerifiedSkills(activeJob).map((skill: any) => skill.name || skill).join(', ')}
            </div>
          ) : null}

          <Separator />

          <div className="flex flex-1 flex-col gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500 dark:text-ink-400">
                    Cover letter <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-xs leading-5 text-ink-500 dark:text-ink-dark-muted">
                    Explain why you fit this role, what you will deliver, and why this job matters to you.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {activeDraft.aiEnhanced && activeDraft.lastManualDetails ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={proposalMutation.isPending || improveLetterMutation.isPending}
                      onClick={() => {
                        if (!activeJobId || !activeDraft.lastManualDetails) return;
                        setDrafts((prev) => ({
                          ...prev,
                          [activeJobId]: {
                            ...getDraft(activeJobId),
                            details: activeDraft.lastManualDetails || '',
                            aiEnhanced: false,
                          },
                        }));
                        toast.success('Restored your original draft.');
                      }}
                    >
                      <RotateCcw size={14} />
                      Undo
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="soft"
                    size="sm"
                    disabled={
                      proposalMutation.isPending ||
                      improveLetterMutation.isPending ||
                      !activeDraft.details.trim()
                    }
                    onClick={() => {
                      if (!activeJobId) return;
                      improveLetterMutation.mutate({
                        text: activeDraft.details,
                        jobTitle: activeJob?.title,
                      });
                    }}
                    className="shrink-0"
                  >
                    <Sparkles size={14} className={improveLetterMutation.isPending ? 'animate-pulse' : ''} />
                    {improveLetterMutation.isPending ? 'Improving...' : 'Polish with AI'}
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-ink-200 bg-ink-50/80 px-3 py-2.5 dark:border-ink-dark-border dark:bg-white/5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-medium text-ink-600 dark:text-ink-300">
                    {coverLetterLength === 0
                      ? 'Start with 2-4 lines, then use AI to refine tone and clarity.'
                      : coverLetterLength < 120
                        ? 'Add a bit more detail before submitting. Mention skills, delivery, and fit.'
                        : 'Good length. You can submit as is or let AI make it sharper.'}
                  </span>
                  {activeDraft.aiEnhanced ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5 text-accent-700 dark:bg-accent-900/20 dark:text-accent-300">
                      <CheckCircle2 size={12} />
                      AI-enhanced
                    </span>
                  ) : null}
                </div>
              </div>

              <Textarea
                placeholder="Explain why you are a strong fit. Mention relevant experience, what you will deliver, and why this role interests you."
                rows={6}
                value={activeDraft.details}
                onChange={(e) => activeJobId && setDraftField(activeJobId, 'details', e.target.value)}
                disabled={proposalMutation.isPending || improveLetterMutation.isPending}
                className="min-h-[180px] rounded-xl"
              />
              <div className="flex items-center justify-between gap-3 text-xs text-ink-500 dark:text-ink-dark-muted">
                <span>Keep it specific to this job. Avoid generic statements.</span>
                <span>{coverLetterLength} chars</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500 dark:text-ink-400">Proposed budget</label>
                <Input
                  type="number"
                  min={0}
                  placeholder="500"
                  value={activeJobId ? getDraft(activeJobId).budget : ''}
                  onChange={(e) => activeJobId && setDraftField(activeJobId, 'budget', e.target.value)}
                  disabled={proposalMutation.isPending}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500 dark:text-ink-400">Your timeline</label>
                <Input
                  placeholder="e.g. 2 weeks"
                  value={activeJobId ? getDraft(activeJobId).timeline : ''}
                  onChange={(e) => activeJobId && setDraftField(activeJobId, 'timeline', e.target.value)}
                  disabled={proposalMutation.isPending}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500 dark:text-ink-400">Portfolio links</label>
              <Input
                placeholder="https://github.com/you or https://portfolio.com"
                value={activeJobId ? getDraft(activeJobId).portfolio : ''}
                onChange={(e) => activeJobId && setDraftField(activeJobId, 'portfolio', e.target.value)}
                disabled={proposalMutation.isPending}
              />
            </div>
          </div>

          <SheetFooter className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setActiveJobId(null)} disabled={proposalMutation.isPending} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={proposalMutation.isPending || isFetching} className="flex-1">
              <SendHorizonal size={15} />
              {proposalMutation.isPending ? 'Submitting...' : 'Submit proposal'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default JobList;
