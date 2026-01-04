import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getClientJobs, getClientProposals, getJobProposals, getSkills, selectStudentForJob } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';

const ViewProposals: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const [selectedJob, setSelectedJob] = useState<string>(searchParams.get('jobId') || '');
    const [selectedSkill, setSelectedSkill] = useState<string>('');

    const { data: jobs, isLoading: jobsLoading } = useQuery({
        queryKey: ['client', 'jobs'],
        queryFn: getClientJobs,
    });

    useEffect(() => {
        const jobId = searchParams.get('jobId') || '';
        setSelectedJob(jobId);
    }, [searchParams]);

    const { data: skills, isLoading: skillsLoading } = useQuery({
        queryKey: ['skills'],
        queryFn: getSkills,
    });

    const { data: proposals, isLoading: proposalsLoading } = useQuery({
        queryKey: ['client', 'proposals', selectedJob],
        queryFn: () => (selectedJob ? getJobProposals(selectedJob) : getClientProposals()),
    });

    const filteredProposals = useMemo(() => {
        const base = proposals || [];
        return base.filter((proposal: any) => {
            if (selectedSkill) {
                return proposal.studentId?.verifiedSkills?.some(
                    (verified: any) => (verified.skill?._id || verified.skill) === selectedSkill
                );
            }
            return true;
        });
    }, [proposals, selectedSkill]);

    const selectMutation = useMutation({
        mutationFn: ({ jobId, studentId }: { jobId: string; studentId: string }) =>
            selectStudentForJob(jobId, studentId),
        onSuccess: () => {
            toast.success('Student selected successfully.');
            queryClient.invalidateQueries({ queryKey: ['client', 'proposals'] });
            queryClient.invalidateQueries({ queryKey: ['client', 'jobs'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to select student.');
        },
    });

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm uppercase tracking-wide text-ink-400">Client workspace</p>
                <h1 className="text-2xl font-semibold text-ink-900">Review proposals</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-ink-700">Job</label>
                        {jobsLoading ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <Select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
                                <option value="">All Jobs</option>
                                {(jobs || []).map((job: any) => (
                                    <option key={job._id} value={job._id}>
                                        {job.title}
                                    </option>
                                ))}
                            </Select>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-ink-700">Verified skill</label>
                        {skillsLoading ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <Select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)}>
                                <option value="">All skills</option>
                                {(skills || []).map((skill: any) => (
                                    <option key={skill._id} value={skill._id}>
                                        {skill.name}
                                    </option>
                                ))}
                            </Select>
                        )}
                    </div>
                </CardContent>
            </Card>

            {proposalsLoading ? (
                <Skeleton className="h-64 w-full" />
            ) : filteredProposals.length === 0 ? (
                <Card>
                    <CardContent>
                        <p className="text-sm text-ink-500">No proposals match the current filters.</p>
                    </CardContent>
                </Card>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell>Student</TableHeaderCell>
                            <TableHeaderCell>Job</TableHeaderCell>
                            <TableHeaderCell>Verified Skills</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                            <TableHeaderCell>Action</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredProposals.map((proposal: any) => (
                            <TableRow key={proposal._id}>
                                <TableCell>
                                    <div className="font-semibold text-ink-900">{proposal.studentId?.name || 'Student'}</div>
                                    <p className="text-xs text-ink-500">{proposal.studentId?.email || '—'}</p>
                                    {proposal.details ? (
                                        <p className="mt-2 whitespace-pre-line text-xs text-ink-500">{proposal.details}</p>
                                    ) : null}
                                </TableCell>
                                <TableCell>{proposal.jobId?.title || 'Job'}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-2">
                                        {(proposal.studentId?.verifiedSkills || []).length ? (
                                            proposal.studentId?.verifiedSkills?.map((verified: any) => (
                                                <Badge key={verified.skill?._id || verified.skill} variant="brand">
                                                    {verified.skill?.name || verified.skill}
                                                </Badge>
                                            ))
                                        ) : (
                                            <Badge variant="default">None</Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            proposal.status === 'accepted'
                                                ? 'success'
                                                : proposal.status === 'rejected'
                                                ? 'danger'
                                                : 'warning'
                                        }
                                    >
                                        {proposal.status || 'pending'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        disabled={
                                            proposal.status !== 'pending' ||
                                            proposal.jobId?.status === 'filled' ||
                                            selectMutation.isPending
                                        }
                                        onClick={() =>
                                            proposal.jobId?._id && proposal.studentId?._id
                                                ? selectMutation.mutate({
                                                      jobId: proposal.jobId?._id,
                                                      studentId: proposal.studentId?._id,
                                                  })
                                                : null
                                        }
                                    >
                                        Select student
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};

export default ViewProposals;
