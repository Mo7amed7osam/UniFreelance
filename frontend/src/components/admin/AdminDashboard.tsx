import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createSkill,
  deleteAdminJob,
  deleteAdminUser,
  getAdminJobs,
  getAdminUsers,
  getInterviews,
  getSkills,
} from '@/services/api';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState('SUBMITTED');
  const [skillName, setSkillName] = useState('');
  const [skillDescription, setSkillDescription] = useState('');

  const { data: interviews, isLoading: interviewsLoading } = useQuery({
    queryKey: ['admin', 'interviews', status],
    queryFn: () => getInterviews(status),
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: getAdminUsers,
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['admin', 'jobs'],
    queryFn: getAdminJobs,
  });

  const { data: skills, isLoading: skillsLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: getSkills,
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteAdminUser(userId),
    onSuccess: () => {
      toast.success('User deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: (jobId: string) => deleteAdminJob(jobId),
    onSuccess: () => {
      toast.success('Job deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
    },
  });

  const createSkillMutation = useMutation({
    mutationFn: (payload: { name: string; description: string }) =>
      createSkill(payload),
    onSuccess: () => {
      toast.success('Skill created.');
      setSkillName('');
      setSkillDescription('');
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });

  const sortedSkills = useMemo(() => {
    return (skills || [])
      .slice()
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [skills]);

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
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">
          Admin Dashboard
        </p>
        <h1 className="text-3xl font-semibold text-ink-900 dark:text-white">
          Platform{' '}
          <span className="text-brand-600 dark:text-brand-400">
            control center
          </span>
        </h1>
        <p className="text-sm text-ink-500 dark:text-ink-400">
          Manage interviews, users, jobs, and skills.
        </p>
      </div>

      {/* Interview Filter */}
      <Card className="bg-white/80 backdrop-blur-sm dark:bg-ink-800 dark:border-ink-700">
        <CardHeader>
          <CardTitle className="text-lg text-ink-900 dark:text-white">
            Interview filter
          </CardTitle>
        </CardHeader>
        <CardContent className="max-w-sm">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="SUBMITTED">Submitted</option>
            <option value="PASSED">Passed</option>
            <option value="FAILED">Failed</option>
          </Select>
        </CardContent>
      </Card>

      {/* Interviews */}
      {interviewsLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (interviews || []).length === 0 ? (
        <Card className="border-dashed dark:bg-ink-800 dark:border-ink-700">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-ink-500 dark:text-ink-400">
              No interviews found.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Student</TableHeaderCell>
              <TableHeaderCell>Skill</TableHeaderCell>
              <TableHeaderCell>AI result</TableHeaderCell>
              <TableHeaderCell>Review</TableHeaderCell>
              <TableHeaderCell>Action</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(interviews || []).map((interview: any) => (
              <TableRow
                key={interview.sessionId}
                className="hover:bg-brand-50/40 dark:hover:bg-ink-700"
              >
                <TableCell>{interview.user?.name || '-'}</TableCell>
                <TableCell>{interview.skillRef?.name || interview.skill}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      interview.finalRecommendation === 'pass'
                        ? 'success'
                        : interview.finalRecommendation === 'fail'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {interview.finalRecommendation || 'needs_review'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      interview.reviewStatus === 'pass'
                        ? 'success'
                        : interview.reviewStatus === 'fail'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {interview.reviewStatus || 'pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() =>
                      navigate(`/admin/review-interview/${interview.sessionId}`)
                    }
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Skills */}
      <section className="space-y-4">
        <h2 className="relative inline-block text-xl font-semibold text-ink-900 dark:text-white">
          Skills
          <span className="absolute -bottom-1 left-0 h-1 w-1/3 bg-brand-500 rounded-full"></span>
        </h2>

        <Card className="bg-white/80 backdrop-blur-sm dark:bg-ink-800 dark:border-ink-700">
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="Skill name"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
              />
              <Input
                placeholder="Description"
                value={skillDescription}
                onChange={(e) => setSkillDescription(e.target.value)}
              />
            </div>

            <Button
              onClick={() =>
                createSkillMutation.mutate({
                  name: skillName,
                  description: skillDescription,
                })
              }
            >
              Add skill
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          {sortedSkills.map((skill: any) => (
            <Badge key={skill._id}>{skill.name}</Badge>
          ))}
        </div>
      </section>

      {/* Users */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-ink-900 dark:text-white">
          Users
        </h2>

        {usersLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Action</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {(users || []).map((user: any) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>
                    <Badge>{user.role}</Badge>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        deleteUserMutation.mutate(user._id)
                      }
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      {/* Jobs */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-ink-900 dark:text-white">
          Jobs
        </h2>

        {jobsLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Title</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Employer</TableHeaderCell>
                <TableHeaderCell>Action</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {(jobs || []).map((job: any) => (
                <TableRow key={job._id}>
                  <TableCell>{job.title}</TableCell>
                  <TableCell>
                    <Badge>{job.status}</Badge>
                  </TableCell>
                  <TableCell>{job.employer?.name}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        deleteJobMutation.mutate(job._id)
                      }
                    >
                      Delete
                    </Button>
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

export default AdminDashboard;
