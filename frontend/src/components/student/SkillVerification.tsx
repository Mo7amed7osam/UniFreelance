import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getSkills, startInterview } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const SkillVerification: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: skills, isLoading } = useQuery({
        queryKey: ['skills'],
        queryFn: getSkills,
    });

    const { mutateAsync: beginInterview, isPending } = useMutation({
        mutationFn: startInterview,
        onSuccess: (data, skillId) => {
            const skill = (skills || []).find((item: any) => item._id === skillId);
            queryClient.setQueryData(['interview', data.interviewId], {
                _id: data.interviewId,
                skillId,
                skill,
                questions: data.questions || [],
                responses: [],
            });
        },
    });

    const handleStartInterview = async (skillId: string) => {
        try {
            const response = await beginInterview(skillId);
            navigate(`/student/video-interview/${response.interviewId}`);
        } catch (error) {
            toast.error('Failed to start interview. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm uppercase tracking-wide text-ink-400">Mandatory verification</p>
                <h1 className="text-2xl font-semibold text-ink-900">Skill verification interviews</h1>
                <p className="text-sm text-ink-500">
                    Each interview includes video responses and must be completed in order.
                </p>
            </div>

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
            ) : (skills || []).length === 0 ? (
                <Card>
                    <CardContent>
                        <p className="text-sm text-ink-500">No skills are available right now.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {(skills || []).map((skill: any) => (
                        <Card key={skill._id}>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>{skill.name}</span>
                                    <Badge variant="default">Video interview</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-ink-500">{skill.description || 'No description provided.'}</p>
                                <Button
                                    type="button"
                                    className="w-full"
                                    onClick={() => handleStartInterview(skill._id)}
                                    disabled={isPending}
                                >
                                    {isPending ? 'Starting interview...' : 'Start interview'}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SkillVerification;
