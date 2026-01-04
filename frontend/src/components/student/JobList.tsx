import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchJobs, getStudentProposals, submitProposal } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthContext } from '@/context/AuthContext';

const JobList: React.FC = () => {
    const [search, setSearch] = useState('');
    const [proposalDetails, setProposalDetails] = useState<Record<string, string>>({});
    const [proposalTimeline, setProposalTimeline] = useState<Record<string, string>>({});
    const [proposalPortfolio, setProposalPortfolio] = useState<Record<string, string>>({});
    const [proposalBudget, setProposalBudget] = useState<Record<string, string>>({});
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const queryClient = useQueryClient();
    const { user } = useAuthContext();
    const userId = user?._id || user?.id;

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 400);
        return () => clearTimeout(timeout);
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

    const submittedJobIds = useMemo(() => {
        const ids = (proposals || []).map((proposal: any) => proposal.jobId?._id || proposal.jobId);
        return new Set(ids);
    }, [proposals]);

    const proposalMutation = useMutation({
        mutationFn: ({
            jobId,
            details,
            proposedBudget,
        }: {
            jobId: string;
            details: string;
            proposedBudget?: number;
        }) => submitProposal(jobId, { details, proposedBudget }),
        onSuccess: () => {
            toast.success('Proposal submitted');
            queryClient.invalidateQueries({ queryKey: ['student', 'proposals', userId] });
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message;
            toast.error(message || 'Failed to submit proposal');
        },
    });

    const filteredJobs = useMemo(() => jobs || [], [jobs]);

    const handleSubmitProposal = async (jobId: string) => {
        if (submittedJobIds.has(jobId)) {
            toast.error('You already submitted a proposal for this job.');
            return;
        }
        const details = proposalDetails[jobId];
        if (!details) {
            toast.error('Please enter a cover letter.');
            return;
        }
        const timeline = proposalTimeline[jobId];
        const portfolio = proposalPortfolio[jobId];
        const budget = proposalBudget[jobId];
        const parsedBudget = budget ? Number(budget) : undefined;
        if (budget && (!Number.isFinite(parsedBudget) || parsedBudget < 0)) {
            toast.error('Proposed budget must be a non-negative number.');
            return;
        }
        const composedDetails = [
            `Cover Letter: ${details}`,
            timeline ? `Timeline: ${timeline}` : null,
            portfolio ? `Portfolio Links: ${portfolio}` : null,
        ]
            .filter(Boolean)
            .join('\n');

        await proposalMutation.mutateAsync({ jobId, details: composedDetails, proposedBudget: parsedBudget });
        setProposalDetails((prev) => ({ ...prev, [jobId]: '' }));
        setProposalTimeline((prev) => ({ ...prev, [jobId]: '' }));
        setProposalPortfolio((prev) => ({ ...prev, [jobId]: '' }));
        setProposalBudget((prev) => ({ ...prev, [jobId]: '' }));
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-semibold">Job Board</h2>
                <Input
                    placeholder="Search jobs by title or description"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="md:max-w-sm"
                />
            </div>

            {isLoading && (
                <div className="grid gap-4 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-48 w-full" />
                    ))}
                </div>
            )}

            {isError && (
                <Card>
                    <CardContent>
                        <p className="text-sm text-rose-500">Failed to fetch jobs. Please try again.</p>
                    </CardContent>
                </Card>
            )}

            {!isLoading && !isError && filteredJobs.length === 0 && (
                <Card>
                    <CardContent>
                        <p className="text-sm text-ink-500">
                            {debouncedSearch ? 'No jobs match your search yet.' : 'No jobs available yet.'}
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {filteredJobs.map((job: any) => {
                    const jobKey = job._id || job.id;
                    const hasSubmitted = submittedJobIds.has(jobKey);
                    return (
                        <Card key={jobKey}>
                            <CardHeader>
                                <CardTitle>{job.title}</CardTitle>
                                <div className="flex flex-wrap gap-2">
                                    {job.requiredSkills.map((skill: any) => (
                                        <Badge key={skill._id || skill} variant="brand">
                                            {skill.name || skill}
                                        </Badge>
                                    ))}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-ink-600">{job.description}</p>
                                {(job.budgetMin || job.budgetMax || job.duration) && (
                                    <div className="text-xs text-ink-500">
                                        {job.budgetMin !== undefined || job.budgetMax !== undefined ? (
                                            <span>
                                                Budget: {job.budgetMin ?? '—'} - {job.budgetMax ?? '—'}
                                            </span>
                                        ) : null}
                                        {job.duration ? <span className="ml-2">Duration: {job.duration}</span> : null}
                                    </div>
                                )}
                                <div className="space-y-3">
                                    <Input
                                        placeholder="Proposed budget (optional)"
                                        type="number"
                                        min={0}
                                        value={proposalBudget[jobKey] || ''}
                                        onChange={(e) =>
                                            setProposalBudget((prev) => ({
                                                ...prev,
                                                [jobKey]: e.target.value,
                                            }))
                                        }
                                        disabled={hasSubmitted}
                                    />
                                    <Textarea
                                        placeholder="Cover letter"
                                        value={proposalDetails[jobKey] || ''}
                                        onChange={(e) =>
                                            setProposalDetails((prev) => ({
                                                ...prev,
                                                [jobKey]: e.target.value,
                                            }))
                                        }
                                        disabled={hasSubmitted}
                                    />
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <Input
                                            placeholder="Timeline (e.g. 2 weeks)"
                                            value={proposalTimeline[jobKey] || ''}
                                            onChange={(e) =>
                                                setProposalTimeline((prev) => ({
                                                    ...prev,
                                                    [jobKey]: e.target.value,
                                                }))
                                            }
                                            disabled={hasSubmitted}
                                        />
                                        <Input
                                            placeholder="Portfolio links"
                                            value={proposalPortfolio[jobKey] || ''}
                                            onChange={(e) =>
                                                setProposalPortfolio((prev) => ({
                                                    ...prev,
                                                    [jobKey]: e.target.value,
                                                }))
                                            }
                                            disabled={hasSubmitted}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={() => handleSubmitProposal(jobKey)}
                                        disabled={proposalMutation.isPending || hasSubmitted}
                                    >
                                        {hasSubmitted
                                            ? 'Proposal submitted'
                                            : proposalMutation.isPending
                                              ? 'Submitting...'
                                              : isFetching
                                                ? 'Refreshing...'
                                                : 'Submit proposal'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default JobList;
