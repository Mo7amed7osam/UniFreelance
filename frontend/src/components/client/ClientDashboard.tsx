import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getClientJobs, getClientProposals } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';

const ClientDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { data: jobs, isLoading: jobsLoading } = useQuery({
        queryKey: ['client', 'jobs'],
        queryFn: getClientJobs,
    });

    const { data: proposals, isLoading: proposalsLoading } = useQuery({
        queryKey: ['client', 'proposals'],
        queryFn: getClientProposals,
    });

    const openJobs = (jobs || []).filter((job: any) => job.status === 'open');
    const filledJobs = (jobs || []).filter((job: any) => job.status === 'filled');

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-sm uppercase tracking-wide text-ink-400">Client dashboard</p>
                    <h1 className="text-2xl font-semibold text-ink-900">Manage your hiring pipeline</h1>
                </div>
                <Button type="button" onClick={() => navigate('/client/post-job')}>
                    Post a job
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Open Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {jobsLoading ? <Skeleton className="h-6 w-16" /> : <p className="text-3xl font-semibold">{openJobs.length}</p>}
                        <p className="text-sm text-ink-500">Active listings in the marketplace.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Filled Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {jobsLoading ? <Skeleton className="h-6 w-16" /> : <p className="text-3xl font-semibold">{filledJobs.length}</p>}
                        <p className="text-sm text-ink-500">Hires already finalized.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Proposals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {proposalsLoading ? <Skeleton className="h-6 w-16" /> : <p className="text-3xl font-semibold">{(proposals || []).length}</p>}
                        <p className="text-sm text-ink-500">Student applications across jobs.</p>
                    </CardContent>
                </Card>
            </div>

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Posted jobs</h2>
                </div>
                {jobsLoading ? (
                    <Skeleton className="h-40 w-full" />
                ) : (jobs || []).length === 0 ? (
                    <Card>
                        <CardContent>
                            <p className="text-sm text-ink-500">No jobs posted yet. Create your first listing.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Role</TableHeaderCell>
                                <TableHeaderCell>Skills</TableHeaderCell>
                                <TableHeaderCell>Status</TableHeaderCell>
                                <TableHeaderCell>Actions</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(jobs || []).map((job: any) => (
                                <TableRow key={job._id}>
                                    <TableCell>{job.title}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-2">
                                            {(job.requiredSkills || []).map((skill: any) => (
                                                <Badge key={skill._id || skill} variant="default">
                                                    {skill.name || skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={job.status === 'filled' ? 'success' : 'warning'}>{job.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => navigate(`/client/view-proposals?jobId=${job._id}`)}
                                        >
                                            View proposals
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Recent proposals</h2>
                {proposalsLoading ? (
                    <Skeleton className="h-40 w-full" />
                ) : (proposals || []).length === 0 ? (
                    <Card>
                        <CardContent>
                            <p className="text-sm text-ink-500">No proposals yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Student</TableHeaderCell>
                                <TableHeaderCell>Job</TableHeaderCell>
                                <TableHeaderCell>Status</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(proposals || []).slice(0, 5).map((proposal: any) => (
                                <TableRow key={proposal._id}>
                                    <TableCell>{proposal.studentId?.name || 'Student'}</TableCell>
                                    <TableCell>{proposal.jobId?.title || 'Job'}</TableCell>
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
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </section>
        </div>
    );
};

export default ClientDashboard;
