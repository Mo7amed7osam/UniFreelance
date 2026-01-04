import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchJobs, submitProposal } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

const JobList: React.FC = () => {
    const [search, setSearch] = useState('');
    const [proposalDetails, setProposalDetails] = useState<Record<string, string>>({});
    const [proposalTimeline, setProposalTimeline] = useState<Record<string, string>>({});
    const [proposalPortfolio, setProposalPortfolio] = useState<Record<string, string>>({});

    const { data: jobs, isLoading, isError } = useQuery({
        queryKey: ['jobs'],
        queryFn: fetchJobs,
    });

    const proposalMutation = useMutation({
        mutationFn: ({ jobId, details }: { jobId: string; details: string }) =>
            submitProposal(jobId, { details }),
        onSuccess: () => toast.success('Proposal submitted'),
        onError: () => toast.error('Failed to submit proposal'),
    });

    const filteredJobs = useMemo(() => {
        if (!jobs) return [];
        if (!search) return jobs;
        return jobs.filter((job: any) =>
            `${job.title} ${job.description}`.toLowerCase().includes(search.toLowerCase())
        );
    }, [jobs, search]);

    const handleSubmitProposal = async (jobId: string) => {
        const details = proposalDetails[jobId];
        if (!details) {
            toast.error('Please enter a cover letter.');
            return;
        }
        const timeline = proposalTimeline[jobId];
        const portfolio = proposalPortfolio[jobId];
        const composedDetails = [
            `Cover Letter: ${details}`,
            timeline ? `Timeline: ${timeline}` : null,
            portfolio ? `Portfolio Links: ${portfolio}` : null,
        ]
            .filter(Boolean)
            .join('\n');

        await proposalMutation.mutateAsync({ jobId, details: composedDetails });
        setProposalDetails((prev) => ({ ...prev, [jobId]: '' }));
        setProposalTimeline((prev) => ({ ...prev, [jobId]: '' }));
        setProposalPortfolio((prev) => ({ ...prev, [jobId]: '' }));
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
                        <p className="text-sm text-ink-500">No jobs match your search yet.</p>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {filteredJobs.map((job: any) => (
                    <Card key={job._id || job.id}>
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
                            <div className="space-y-3">
                                <Textarea
                                    placeholder="Cover letter"
                                    value={proposalDetails[job._id || job.id] || ''}
                                    onChange={(e) =>
                                        setProposalDetails((prev) => ({
                                            ...prev,
                                            [job._id || job.id]: e.target.value,
                                        }))
                                    }
                                />
                                <div className="grid gap-3 md:grid-cols-2">
                                    <Input
                                        placeholder="Timeline (e.g. 2 weeks)"
                                        value={proposalTimeline[job._id || job.id] || ''}
                                        onChange={(e) =>
                                            setProposalTimeline((prev) => ({
                                                ...prev,
                                                [job._id || job.id]: e.target.value,
                                            }))
                                        }
                                    />
                                    <Input
                                        placeholder="Portfolio links"
                                        value={proposalPortfolio[job._id || job.id] || ''}
                                        onChange={(e) =>
                                            setProposalPortfolio((prev) => ({
                                                ...prev,
                                                [job._id || job.id]: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <Button
                                    type="button"
                                    onClick={() => handleSubmitProposal(job._id || job.id)}
                                    disabled={proposalMutation.isPending}
                                >
                                    {proposalMutation.isPending ? 'Submitting...' : 'Submit proposal'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default JobList;
