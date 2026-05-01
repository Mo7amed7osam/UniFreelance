import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getClientJobs, getClientProposals } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/table';

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

  const openJobs = (jobs || []).filter((j: any) => j.status === 'open');
  const activeJobs = (jobs || []).filter((j: any) => j.status === 'in_progress');
  const completedJobs = (jobs || []).filter((j: any) => j.status === 'completed');

  return (
    <div
      className="
        space-y-10 rounded-2xl p-6
        bg-gradient-to-br from-ink-50 via-white to-brand-100/30
        dark:bg-gradient-to-br dark:from-ink-900 dark:via-ink-900 dark:to-ink-800
      "
    >
      {/* Header */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-400 dark:text-ink-400">
          Client Dashboard
        </p>
        <h1 className="text-3xl font-semibold text-ink-900 dark:text-white">
          Manage your{' '}
          <span className="text-brand-600 dark:text-brand-400">
            hiring pipeline
          </span>
        </h1>
        <p className="text-sm text-ink-500 dark:text-ink-400">
          Track jobs, proposals, and active contracts.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-4">
        {/* Open Jobs */}
        <Card
          className="
            bg-white/80 backdrop-blur-sm transition-all
            hover:-translate-y-1 hover:shadow-xl
            dark:bg-ink-800 dark:border-ink-700
          "
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-ink-500 dark:text-ink-400">
              Open Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {jobsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-4xl font-semibold text-ink-900 dark:text-white">
                {openJobs.length}
              </p>
            )}
            <p className="text-sm text-ink-500 dark:text-ink-400">
              Active listings in the marketplace.
            </p>
          </CardContent>
        </Card>

        {/* Active Jobs */}
        <Card
          className="
            bg-white/80 backdrop-blur-sm transition-all
            hover:-translate-y-1 hover:shadow-xl
            dark:bg-ink-800 dark:border-ink-700
          "
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-ink-500 dark:text-ink-400">
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {jobsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-4xl font-semibold text-ink-900 dark:text-white">
                {activeJobs.length}
              </p>
            )}
            <p className="text-sm text-ink-500 dark:text-ink-400">
              Contracts currently in progress.
            </p>
          </CardContent>
        </Card>

        {/* Completed Jobs (Brand Card) */}
        <Card
          className="
            bg-gradient-to-br from-brand-500 to-brand-700 text-white
            transition-all hover:-translate-y-1 hover:shadow-xl
          "
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/80">
              Completed Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {jobsLoading ? (
              <Skeleton className="h-8 w-24 bg-white/30" />
            ) : (
              <p className="text-4xl font-semibold text-white">
                {completedJobs.length}
              </p>
            )}
            <p className="text-sm text-white/80">
              Successfully delivered projects.
            </p>
          </CardContent>
        </Card>

        {/* Total Proposals */}
        <Card
          className="
            bg-white/80 backdrop-blur-sm transition-all
            hover:-translate-y-1 hover:shadow-xl
            dark:bg-ink-800 dark:border-ink-700
          "
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-ink-500 dark:text-ink-400">
              Total Proposals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {proposalsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-4xl font-semibold text-ink-900 dark:text-white">
                {(proposals || []).length}
              </p>
            )}
            <p className="text-sm text-ink-500 dark:text-ink-400">
              Applications received from students.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Posted Jobs */}
      <section className="space-y-4">
        <h2 className="relative inline-block text-xl font-semibold text-ink-900 dark:text-white">
          Posted Jobs
          <span className="absolute -bottom-1 left-0 h-1 w-1/3 rounded-full bg-brand-500"></span>
        </h2>

        {jobsLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (jobs || []).length === 0 ? (
          <Card className="border-dashed dark:bg-ink-800 dark:border-ink-700">
            <CardContent className="py-10 text-center">
              <p className="text-sm text-ink-500 dark:text-ink-400">
                No jobs posted yet. Create your first listing.
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate('/client/post-job')}
              >
                Post a job
              </Button>
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
                <TableRow
                  key={job._id}
                  className="transition-colors hover:bg-brand-50/40 dark:hover:bg-ink-800"
                >
                  <TableCell className="font-medium">
                    {job.title}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {(job.requiredSkills || []).map((skill: any) => (
                        <Badge key={skill._id || skill}>
                          {skill.name || skill}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        job.status === 'completed'
                          ? 'success'
                          : job.status === 'in_progress'
                          ? 'brand'
                          : 'warning'
                      }
                    >
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate(`/client/view-proposals?jobId=${job._id}`)
                      }
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

      {/* Recent Proposals */}
      <section className="space-y-4">
        <h2 className="relative inline-block text-xl font-semibold text-ink-900 dark:text-white">
          Recent Proposals
          <span className="absolute -bottom-1 left-0 h-1 w-1/3 rounded-full bg-brand-500"></span>
        </h2>

        {proposalsLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (proposals || []).length === 0 ? (
          <Card className="border-dashed dark:bg-ink-800 dark:border-ink-700">
            <CardContent className="py-10 text-center">
              <p className="text-sm text-ink-500 dark:text-ink-400">
                No proposals yet.
              </p>
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
                <TableRow
                  key={proposal._id}
                  className="transition-colors hover:bg-brand-50/40 dark:hover:bg-ink-800"
                >
                  <TableCell className="font-medium">
                    {proposal.studentId?.name || 'Student'}
                  </TableCell>
                  <TableCell>
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
