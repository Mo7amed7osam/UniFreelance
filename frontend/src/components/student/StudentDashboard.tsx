import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStudentProfile, getStudentProposals } from '@/services/api';
import useAuth from '@/hooks/useAuth';
import JobList from './JobList';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const userId = user?._id || user?.id;

    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ['student', 'profile', userId],
        queryFn: () => getStudentProfile(userId),
        enabled: !!userId,
    });

    const { data: proposals, isLoading: proposalsLoading } = useQuery({
        queryKey: ['student', 'proposals', userId],
        queryFn: () => getStudentProposals(userId),
        enabled: !!userId,
    });

    return (
        <div className="space-y-8">
            <div>
                <p className="text-sm uppercase tracking-wide text-ink-400">Student dashboard</p>
                <h1 className="text-2xl font-semibold text-ink-900">Welcome, {user?.name}</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Verified Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {profileLoading ? (
                            <Skeleton className="h-6 w-20" />
                        ) : (
                            <p className="text-3xl font-semibold">{profile?.verifiedSkills?.length || 0}</p>
                        )}
                        <p className="text-sm text-ink-500">Boost your profile with video interviews.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Active Proposals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {proposalsLoading ? (
                            <Skeleton className="h-6 w-20" />
                        ) : (
                            <p className="text-3xl font-semibold">
                                {(proposals || []).filter((proposal: any) =>
                                    ['submitted', 'shortlisted'].includes(proposal.status)
                                ).length}
                            </p>
                        )}
                        <p className="text-sm text-ink-500">Keep tabs on client responses.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {profileLoading ? (
                            <Skeleton className="h-6 w-20" />
                        ) : (
                            <p className="text-3xl font-semibold">${profile?.balance?.toFixed?.(2) || '0.00'}</p>
                        )}
                        <p className="text-sm text-ink-500">Earnings released after acceptance.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge variant="brand">Active</Badge>
                        <p className="mt-2 text-sm text-ink-500">Your profile is visible to clients.</p>
                    </CardContent>
                </Card>
            </div>

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Available Jobs</h2>
                </div>
                <JobList />
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Recent Applications</h2>
                {proposalsLoading ? (
                    <Skeleton className="h-32 w-full" />
                ) : (proposals || []).length === 0 ? (
                    <Card>
                        <CardContent>
                            <p className="text-sm text-ink-500">No proposals yet. Apply to a job to get started.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Job</TableHeaderCell>
                                <TableHeaderCell>Status</TableHeaderCell>
                                <TableHeaderCell>Submitted</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(proposals || []).map((proposal: any) => (
                                <TableRow key={proposal._id}>
                                    <TableCell>{proposal.jobId?.title || 'Job'}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                proposal.status === 'accepted'
                                                    ? 'success'
                                                    : proposal.status === 'rejected'
                                                    ? 'danger'
                                                    : proposal.status === 'shortlisted'
                                                    ? 'brand'
                                                    : 'warning'
                                            }
                                        >
                                            {proposal.status || 'submitted'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString() : '—'}
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

export default StudentDashboard;
