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
    } catch {
      toast.error('Failed to start interview. Please try again.');
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">
          Mandatory verification
        </p>
        <h1 className="text-3xl font-semibold dark:text-white">
          Skill verification interviews
        </h1>
        <p className="max-w-2xl text-sm text-ink-500">
          Complete short video interviews to verify your skills and increase
          your chances of getting hired.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : (skills || []).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-ink-500">
              No skills are available right now.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {(skills || []).map((skill: any) => (
            <Card
              key={skill._id}
              className="group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-card"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 to-brand-700" />

              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-ink-900">
                    {skill.name}
                  </span>
                  <Badge variant="brand">Video interview</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col justify-between gap-4">
                <p className="text-sm text-ink-500">
                  {skill.description || 'No description provided.'}
                </p>

                <Button
                  type="button"
                  className="w-full bg-gradient-to-r from-brand-600 to-brand-700 transition hover:opacity-90"
                  onClick={() => handleStartInterview(skill._id)}
                  disabled={isPending}
                >
                  {isPending ? 'Starting interview…' : 'Start interview'}
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
