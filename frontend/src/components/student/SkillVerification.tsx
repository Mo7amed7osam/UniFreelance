import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Sparkles, Video } from 'lucide-react';
import { toast } from 'sonner';

import { getSkills, getStudentProfile, getMyInterviewSessions } from '@/services/api';
import useAuth from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { startInterviewSession } from '@/features/ai-interview/services/interviewApi';

const SkillVerification: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [startingSkillId, setStartingSkillId] = useState<string | null>(null);
  const userId = user?._id || user?.id;

  const { data: profile } = useQuery({
    queryKey: ['student', 'profile', userId],
    queryFn: () => getStudentProfile(userId),
    enabled: !!userId,
  });
  const { data: mySessions } = useQuery({
    queryKey: ['my-interview-sessions'],
    queryFn: getMyInterviewSessions,
    enabled: !!userId,
  });

  const getLatestSessionId = (skillId: string, skillName: string) => {
    const sessions = (mySessions || []).filter(
      (s: any) =>
        s.status === 'completed' &&
        (
          String(s.skillRef?._id || s.skillRef) === String(skillId) ||
          String(s.skill || '').trim().toLowerCase() === String(skillName || '').trim().toLowerCase()
        )
    );
    return sessions[0]?._id || null;
  };

  const verifiedSkillIds = new Set(
    (profile?.verifiedSkills || []).map((s: any) => String(s.skill?._id || s.skill))
  );

  const getVerifiedScore = (skillId: string) => {
    const found = (profile?.verifiedSkills || []).find(
      (s: any) => String(s.skill?._id || s.skill) === skillId
    );
    return found?.score ?? null;
  };

  const { data: skills, isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: getSkills,
  });

  const { mutateAsync: beginInterview, isPending } = useMutation({
    mutationFn: (payload: { skill: string; skillId: string }) => startInterviewSession(payload),
  });

  const handleStartInterview = async (skill: { _id: string; name: string }) => {
    if (isPending) return;
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
      toast.error('AI interviews currently require a desktop or laptop for camera, microphone, and full-screen sharing.');
      return;
    }
    try {
      setStartingSkillId(skill._id);
      const response = await beginInterview({ skill: skill.name, skillId: skill._id });
      navigate(`/student/ai-interview/${response.sessionId}`);
    } catch {
      toast.error('Failed to start interview. Please try again.');
      setStartingSkillId(null);
    }
  };

  const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] } } };
  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

  return (
    <motion.div className="space-y-[30px]" initial="hidden" animate="visible" variants={stagger}>
      <motion.div variants={fadeUp}><PageHeader
        eyebrow="Mandatory verification"
        title="Skill verification interviews"
        description="Complete short AI-guided interviews to validate your strongest skills and improve hiring confidence for clients."
      /></motion.div>

      <motion.div variants={fadeUp}>
        <div className="rounded-[18px] border border-amber-200 bg-[#fff8ec] px-6 py-4 text-[15px] font-semibold text-[#a16207] shadow-soft dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          Start the live interview from a desktop or laptop. The verification flow needs camera, microphone, and entire-screen sharing.
        </div>
      </motion.div>

      <motion.div variants={fadeUp}><section className="relative overflow-hidden rounded-[20px] border border-brand-400/20 bg-[#2554d8] p-5 text-white shadow-glass dark:border-brand-400/20 dark:bg-brand-600">
        <CardContent className="relative grid gap-4 p-0 md:grid-cols-3">
          {[
            {
              title: 'AI-guided interview',
              body: 'Shaghalny AI leads the session and keeps the process structured.',
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
            <div key={title} className="rounded-2xl border border-white/15 bg-white/[0.08] p-5 shadow-[0_1px_0_rgba(255,255,255,0.12)_inset] backdrop-blur">
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-white/15 text-white">
                <Icon size={18} />
              </div>
              <p className="mt-6 text-lg font-bold text-white">{title}</p>
              <p className="mt-2 text-[15px] leading-7 text-white/80">{body}</p>
            </div>
          ))}
        </CardContent>
      </section></motion.div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      ) : (skills || []).length === 0 ? (
        <EmptyState title="No skills available" description="Verification tracks will appear here once the skill library is ready." />
      ) : (
        <motion.div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4" variants={stagger} initial="hidden" animate="visible">
          {(skills || []).map((skill: any) => (
            <motion.div key={skill._id} variants={fadeUp}>
            <Card className="interactive-card flex min-h-[410px] flex-col overflow-hidden rounded-[20px] p-0 hover:border-brand-200/80 dark:hover:border-brand-500/25">
              <CardHeader className="space-y-7 p-6 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="min-w-0 text-xl leading-7">{skill.name}</CardTitle>
                  <Badge variant="brand" className="shrink-0">AI</Badge>
                </div>
                <p className="line-clamp-4 min-h-[5.5rem] text-[15px] leading-7 text-ink-600 dark:text-ink-300">
                  {skill.description || 'No description provided.'}
                </p>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col space-y-5 p-6 pt-0">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="muted-panel p-4 dark:bg-white/[0.055]">
                    <p className="label-muted">Interview mode</p>
                    <p className="mt-3 text-sm font-bold text-ink-900 dark:text-white">Live with Shaghalny AI</p>
                  </div>
                  <div className="muted-panel p-4 dark:bg-white/[0.055]">
                    <p className="label-muted">Outcome</p>
                    <p className="mt-3 text-sm font-bold text-ink-900 dark:text-white">Verified skill badge</p>
                  </div>
                </div>

                {verifiedSkillIds.has(String(skill._id)) ? (
                  <div className="mt-auto space-y-3">
                    <div className="rounded-xl border border-accent-200/80 bg-accent-50/80 p-3 text-center dark:border-accent-400/20 dark:bg-accent-400/10">
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        Verified — Score: {getVerifiedScore(String(skill._id)) ?? '—'}
                      </p>
                    </div>
                   <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      size="lg"
                      onClick={() => {
                        const sessionId = getLatestSessionId(String(skill._id), String(skill.name || ''));
                        if (sessionId) {
                          navigate(`/student/ai-interview/${sessionId}/result`);
                        } else {
                          navigate('/student/profile');
                        }
                      }}
                    >
                      View result
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    className="mt-auto w-full"
                    size="lg"
                    onClick={() => handleStartInterview(skill)}
                    disabled={isPending && startingSkillId === String(skill._id)}
                  >
                    {isPending && startingSkillId === String(skill._id) ? 'Starting interview…' : 'Start interview'}
                    {!(isPending && startingSkillId === String(skill._id)) ? <ArrowRight size={18} /> : null}
                  </Button>
                )}
              </CardContent>
            </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default SkillVerification;
