import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getClientJobs,
  getClientProposals,
  getJobProposals,
  getSkills,
  acceptProposal,
} from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';

const ViewProposals: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedJob, setSelectedJob] = useState<string>(searchParams.get('jobId') || '');
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [budgetDrafts, setBudgetDrafts] = useState<Record<string, string>>({});

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
    queryFn: () =>
      selectedJob ? getJobProposals(selectedJob) : getClientProposals(),
  });

  const filteredProposals = useMemo(() => {
    const base = proposals || [];
    return base.filter((proposal: any) => {
      if (selectedSkill) {
        return proposal.studentId?.verifiedSkills?.some(
          (verified: any) =>
            (verified.skill?._id || verified.skill) === selectedSkill
        );
      }
      return true;
    });
  }, [proposals, selectedSkill]);

  const acceptMutation = useMutation({
    mutationFn: ({ proposalId, agreedBudget }: { proposalId: string; agreedBudget?: number }) =>
      acceptProposal(proposalId, { agreedBudget }),
    onSuccess: (data: any) => {
      toast.success('Proposal accepted. Escrow funded.');
      queryClient.invalidateQueries({ queryKey: ['client', 'proposals'] });
      queryClient.invalidateQueries({ queryKey: ['client', 'jobs'] });
      if (data?.contract?._id) {
        navigate(`/contracts/${data.contract._id}`);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to accept proposal.');
    },
  });

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
          Client Workspace
        </p>
        <h1 className="text-3xl font-semibold text-ink-900 dark:text-white">
          Review{' '}
          <span className="text-brand-600 dark:text-brand-400">
            proposals
          </span>
        </h1>
        <p className="text-sm text-ink-500 dark:text-ink-400">
          Compare applicants and move forward with confidence.
        </p>
      </div>

      {/* Filters */}
      <Card
        className="
          bg-white/80 backdrop-blur-sm transition-all
          hover:shadow-xl
          dark:bg-ink-800 dark:border-ink-700
        "
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-ink-900 dark:text-white">
            Filters
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-700 dark:text-ink-300">
              Job
            </label>
            {jobsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
              >
                <option value="">All jobs</option>
                {(jobs || []).map((job: any) => (
                  <option key={job._id} value={job._id}>
                    {job.title}
                  </option>
                ))}
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink-700 dark:text-ink-300">
              Verified skill
            </label>
            {skillsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
              >
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

      {/* Proposals Table */}
      {proposalsLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : filteredProposals.length === 0 ? (
        <Card className="border-dashed dark:bg-ink-800 dark:border-ink-700">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-ink-500 dark:text-ink-400">
              No proposals match the current filters.
            </p>
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
            {filteredProposals.map((proposal: any) => {
              const statusValue = proposal.status || 'submitted';
              const displayStatus =
                statusValue === 'pending' ? 'submitted' : statusValue;

              return (
                <TableRow
                  key={proposal._id}
                  className="transition-colors hover:bg-brand-50/40 dark:hover:bg-ink-800"
                >
                  <TableCell>
                    <div className="font-semibold text-ink-900 dark:text-white">
                      {proposal.studentId?.name || 'Student'}
                    </div>
                    <p className="text-xs text-ink-500 dark:text-ink-400">
                      {proposal.studentId?.email || '—'}
                    </p>

                    {proposal.proposedBudget && (
                      <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">
                        Proposed budget: ${proposal.proposedBudget}
                      </p>
                    )}

                    {proposal.details && (
                      <p className="mt-2 whitespace-pre-line text-xs text-ink-500 dark:text-ink-400">
                        {proposal.details}
                      </p>
                    )}
                  </TableCell>

                  <TableCell>
                    {proposal.jobId?.title || 'Job'}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {(proposal.studentId?.verifiedSkills || []).length ? (
                        proposal.studentId.verifiedSkills.map((verified: any) => (
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
                        statusValue === 'accepted'
                          ? 'success'
                          : statusValue === 'rejected'
                          ? 'danger'
                          : statusValue === 'shortlisted'
                          ? 'brand'
                          : 'warning'
                      }
                    >
                      {displayStatus}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          proposal.studentId?._id
                            ? navigate(
                                `/students/${proposal.studentId._id}?jobId=${proposal.jobId?._id}`
                              )
                            : null
                        }
                      >
                        View profile
                      </Button>

                      {statusValue !== 'accepted' && (
                        <>
                          <Input
                            type="number"
                            min={0}
                            placeholder="Agreed budget"
                            value={budgetDrafts[proposal._id] ?? proposal.proposedBudget ?? ''}
                            onChange={(e) =>
                              setBudgetDrafts((prev) => ({
                                ...prev,
                                [proposal._id]: e.target.value,
                              }))
                            }
                            disabled={acceptMutation.isPending}
                          />

                          <Button
                            size="sm"
                            variant="outline"
                            disabled={acceptMutation.isPending}
                            onClick={() => {
                              const draft = budgetDrafts[proposal._id];
                              const value = draft ? Number(draft) : proposal.proposedBudget;
                              if (!Number.isFinite(value) || value <= 0) {
                                toast.error('Enter a valid agreed budget.');
                                return;
                              }
                              acceptMutation.mutate({
                                proposalId: proposal._id,
                                agreedBudget: value,
                              });
                            }}
                          >
                            {acceptMutation.isPending
                              ? 'Funding escrow…'
                              : 'Accept & fund escrow'}
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ViewProposals;
