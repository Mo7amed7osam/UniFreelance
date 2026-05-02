import React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sparkles, Video } from 'lucide-react';
import { toast } from 'sonner';

import { getSkills } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { startInterviewSession } from '@/features/ai-interview/services/interviewApi';

const SkillVerification: React.FC = () => {
  const navigate = useNavigate();

  const { data: skills, isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: getSkills,
  });

  const { mutateAsync: beginInterview, isPending } = useMutation({
    mutationFn: (payload: { skill: string; skillId: string }) => startInterviewSession(payload),
  });

  const handleStartInterview = async (skill: { _id: string; name: string }) => {
    try {
      const response = await beginInterview({ skill: skill.name, skillId: skill._id });
      navigate(`/student/ai-interview/${response.sessionId}`);
    } catch {
      toast.error('Failed to start interview. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Mandatory verification"
        title="Skill verification interviews"
        description="Complete short AI-guided interviews to validate your strongest skills and improve hiring confidence for clients."
      />

      <Card className="overflow-hidden bg-gradient-to-r from-ink-950 via-brand-900 to-accent-900 p-0 text-white dark:bg-gradient-to-r dark:from-[#07101d] dark:via-brand-900 dark:to-accent-900">
        <CardContent className="grid gap-4 p-8 md:grid-cols-3">
          {[
            {
              title: 'AI-guided interview',
              body: 'Gravis leads the session and keeps the process structured.',
              Icon: Video,
            },
            {
              title: 'Manual review support',
              body: 'Admins can verify results before the skill status is finalized.',
              Icon: ShieldCheck,
            },
            {
              title: 'Better marketplace trust',
              body: 'Verified skills improve your profile quality and proposal credibility.',
              Icon: Sparkles,
            },
          ].map(({ title, body, Icon }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/8 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <Icon size={20} />
              </div>
              <p className="mt-4 text-lg font-semibold text-white">{title}</p>
              <p className="mt-2 text-sm leading-6 text-white/72">{body}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-3xl" />
          ))}
        </div>
      ) : (skills || []).length === 0 ? (
        <EmptyState title="No skills available" description="Verification tracks will appear here once the skill library is ready." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {(skills || []).map((skill: any) => (
            <Card key={skill._id} className="overflow-hidden p-0">
              <CardHeader className="space-y-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-2xl">{skill.name}</CardTitle>
                  <Badge variant="brand">AI interview</Badge>
                </div>
                <p className="text-sm text-ink-500 dark:text-ink-300">
                  {skill.description || 'No description provided.'}
                </p>
              </CardHeader>

              <CardContent className="space-y-5 p-6 pt-0">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="muted-panel rounded-2xl p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-ink-400 dark:text-ink-300">Interview mode</p>
                    <p className="mt-2 text-sm font-semibold text-ink-900 dark:text-white">Live with Gravis</p>
                  </div>
                  <div className="muted-panel rounded-2xl p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-ink-400 dark:text-ink-300">Outcome</p>
                    <p className="mt-2 text-sm font-semibold text-ink-900 dark:text-white">Verified skill badge</p>
                  </div>
                </div>

                <Button type="button" className="w-full" size="lg" onClick={() => handleStartInterview(skill)} disabled={isPending}>
                  {isPending ? 'Starting interview…' : 'Start interview'}
                  {!isPending ? <ArrowRight size={18} /> : null}
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
