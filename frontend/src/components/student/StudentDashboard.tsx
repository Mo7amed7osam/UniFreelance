import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStudentProfile, getStudentProposals } from '@/services/api';
import useAuth from '@/hooks/useAuth';
import JobList from './JobList';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/table';
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
    <div className="
      space-y-10 rounded-2xl p-6
      bg-gradient-to-br from-ink-50 via-white to-brand-100/30
      dark:bg-gradient-to-br dark:from-ink-900 dark:via-ink-900 dark:to-ink-800
    ">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-400 dark:text-ink-400">
          Student Dashboard
        </p>
        <h1 className="text-3xl font-semibold text-ink-900 dark:text-white">
          Welcome back,{' '}
          <span className="text-brand-600 dark:text-brand-400">
            {user?.name}
          </span>
        </h1>
        <p className="text-sm text-ink-500 dark:text-ink-400">
          Here’s what’s happening with your account today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-4">
        {/* Verified Skills */}
        <Card className="
          bg-white/80 backdrop-blur-sm transition-all
          hover:-translate-y-1 hover:shadow-xl
          dark:bg-ink-800 dark:border-ink-700
        ">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-ink-500 dark:text-ink-400">
              Verified Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {profileLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-4xl font-semibold text-ink-900 dark:text-white">
                {profile?.verifiedSkills?.length || 0}
              </p>
            )}
            <p className="text-sm text-ink-500 dark:text-ink-400">
              Boost your profile with video interviews.
            </p>
          </CardContent>
        </Card>

        {/* Active Proposals */}
        <Card className="
          bg-white/80 backdrop-blur-sm transition-all
          hover:-translate-y-1 hover:shadow-xl
          dark:bg-ink-800 dark:border-ink-700
        ">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-ink-500 dark:text-ink-400">
              Active Proposals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {proposalsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-4xl font-semibold text-ink-900 dark:text-white">
                {(proposals || []).filter((proposal: any) =>
                  ['submitted', 'shortlisted'].includes(proposal.status)
                ).length}
              </p>
            )}
            <p className="text-sm text-ink-500 dark:text-ink-400">
              Keep tabs on client responses.
            </p>
          </CardContent>
        </Card>

        {/* Balance */}
        <Card className="
          bg-gradient-to-br from-brand-500 to-brand-700 text-white
          transition-all hover:-translate-y-1 hover:shadow-xl
        ">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/80">
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {profileLoading ? (
              <Skeleton className="h-8 w-24 bg-white/30" />
            ) : (
              <p className="text-4xl font-semibold text-white">
                ${profile?.balance?.toFixed?.(2) || '0.00'}
              </p>
            )}
            <p className="text-sm text-white/80">
              Earnings released after acceptance.
            </p>
          </CardContent>
        </Card>

        {/* Profile Status */}
        <Card className="
          bg-white/80 backdrop-blur-sm transition-all
          hover:-translate-y-1 hover:shadow-xl
          dark:bg-ink-800 dark:border-ink-700
        ">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-ink-500 dark:text-ink-400">
              Profile Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              Active
            </Badge>
            <p className="text-sm text-ink-500 dark:text-ink-400">
              Your profile is visible to clients.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Available Jobs */}
      <section className="space-y-4">
        <h2 className="relative inline-block text-xl font-semibold text-ink-900 dark:text-white">
          Available Jobs
          <span className="absolute -bottom-1 left-0 h-1 w-1/3 rounded-full bg-brand-500"></span>
        </h2>
        <JobList />
      </section>

      {/* Recent Applications */}
      <section className="space-y-4">
        <h2 className="relative inline-block text-xl font-semibold text-ink-900 dark:text-white">
          Recent Applications
          <span className="absolute -bottom-1 left-0 h-1 w-1/3 rounded-full bg-brand-500"></span>
        </h2>

        {proposalsLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (proposals || []).length === 0 ? (
          <Card className="border-dashed dark:bg-ink-800 dark:border-ink-700">
            <CardContent className="py-10 text-center">
              <p className="text-sm text-ink-500 dark:text-ink-400">
                No proposals yet. Apply to a job to get started.
              </p>
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
                <TableRow
                  key={proposal._id}
                  className="transition-colors hover:bg-brand-50/40 dark:hover:bg-ink-800"
                >
                  <TableCell className="font-medium">
                    {proposal.jobId?.title || 'Job'}
                  </TableCell>
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
                  <TableCell className="text-ink-500 dark:text-ink-400">
                    {proposal.createdAt
                      ? new Date(proposal.createdAt).toLocaleDateString()
                      : '—'}
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
