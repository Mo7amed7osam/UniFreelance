import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createSkill, deleteAdminJob, deleteAdminUser, getAdminJobs, getAdminUsers, getInterviews, getSkills } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';

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
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to delete user.');
        },
    });

    const deleteJobMutation = useMutation({
        mutationFn: (jobId: string) => deleteAdminJob(jobId),
        onSuccess: () => {
            toast.success('Job deleted.');
            queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to delete job.');
        },
    });

    const createSkillMutation = useMutation({
        mutationFn: (payload: { name: string; description: string }) => createSkill(payload),
        onSuccess: () => {
            toast.success('Skill created.');
            setSkillName('');
            setSkillDescription('');
            queryClient.invalidateQueries({ queryKey: ['skills'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to create skill.');
        },
    });

    const sortedSkills = useMemo(() => {
        return (skills || []).slice().sort((a: any, b: any) => a.name.localeCompare(b.name));
    }, [skills]);

    return (
        <div className="space-y-8">
            <div>
                <p className="text-sm uppercase tracking-wide text-ink-400">Admin control</p>
                <h1 className="text-2xl font-semibold text-ink-900">Interview reviews</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Interview filter</CardTitle>
                </CardHeader>
                <CardContent className="max-w-sm">
                    <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="PASSED">Passed</option>
                        <option value="FAILED">Failed</option>
                    </Select>
                </CardContent>
            </Card>

            {interviewsLoading ? (
                <Skeleton className="h-48 w-full" />
            ) : (interviews || []).length === 0 ? (
                <Card>
                    <CardContent>
                        <p className="text-sm text-ink-500">No interviews found for this filter.</p>
                    </CardContent>
                </Card>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell>Student</TableHeaderCell>
                            <TableHeaderCell>Skill</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                            <TableHeaderCell>Action</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(interviews || []).map((interview: any) => (
                            <TableRow key={interview._id}>
                                <TableCell>{interview.studentId?.name || 'Student'}</TableCell>
                                <TableCell>{interview.skillId?.name || 'Skill'}</TableCell>
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
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => navigate(`/admin/review-interview/${interview._id}`)}
                                    >
                                        Review interview
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Skills</h2>
                <Card>
                    <CardHeader>
                        <CardTitle>Add a new skill</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-ink-700">Skill name</label>
                                <Input
                                    value={skillName}
                                    onChange={(e) => setSkillName(e.target.value)}
                                    placeholder="e.g. UI/UX Design"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-ink-700">Description</label>
                                <Input
                                    value={skillDescription}
                                    onChange={(e) => setSkillDescription(e.target.value)}
                                    placeholder="Short description of the skill"
                                />
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={createSkillMutation.isPending}
                            onClick={() => {
                                const name = skillName.trim();
                                const description = skillDescription.trim();
                                if (!name || !description) {
                                    toast.error('Name and description are required.');
                                    return;
                                }
                                createSkillMutation.mutate({ name, description });
                            }}
                        >
                            {createSkillMutation.isPending ? 'Adding...' : 'Add skill'}
                        </Button>
                    </CardContent>
                </Card>

                {skillsLoading ? (
                    <Skeleton className="h-32 w-full" />
                ) : sortedSkills.length === 0 ? (
                    <Card>
                        <CardContent>
                            <p className="text-sm text-ink-500">No skills added yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {sortedSkills.map((skill: any) => (
                            <Badge key={skill._id} variant="default">
                                {skill.name}
                            </Badge>
                        ))}
                    </div>
                )}
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Users</h2>
                {usersLoading ? (
                    <Skeleton className="h-40 w-full" />
                ) : (users || []).length === 0 ? (
                    <Card>
                        <CardContent>
                            <p className="text-sm text-ink-500">No users found.</p>
                        </CardContent>
                    </Card>
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
                                        <Badge variant="default">{user.role}</Badge>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteUserMutation.mutate(user._id)}
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

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Jobs</h2>
                {jobsLoading ? (
                    <Skeleton className="h-40 w-full" />
                ) : (jobs || []).length === 0 ? (
                    <Card>
                        <CardContent>
                            <p className="text-sm text-ink-500">No jobs found.</p>
                        </CardContent>
                    </Card>
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
                                    <TableCell>{job.employer?.name || 'Client'}</TableCell>
                                    <TableCell>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteJobMutation.mutate(job._id)}
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
