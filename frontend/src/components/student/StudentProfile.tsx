import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  ExternalLink,
  FileText,
  GraduationCap,
  ImageOff,
  Link2,
  Loader2,
  Mail,
  Star,
  Upload,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';

import useAuth from '@/hooks/useAuth';
import {
  getStudentProfile,
  updateStudentProfile,
  uploadStudentCV,
  uploadStudentPhoto,
} from '@/services/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

type Review = { clientName: string; rating: number; comment?: string; jobTitle?: string };

function getInitials(name?: string) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function getCompletionPct(profile: any): number {
  const checks = [
    !!profile?.description,
    !!profile?.university,
    !!profile?.profilePhotoUrl,
    !!(profile?.verifiedSkills?.length),
    !!(profile?.portfolioLinks?.length),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] } },
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const ProfileSection = ({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <Card className="p-0">
    <CardHeader className="mb-0 border-b border-ink-100/80 p-5 dark:border-white/10">
      <div className="flex items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-900/30 dark:text-brand-300 dark:ring-brand-700/30">
            {icon}
          </span>
          {title}
        </CardTitle>
        {action}
      </div>
    </CardHeader>
    <CardContent className="p-5">{children}</CardContent>
  </Card>
);

const StudentProfile: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?._id || user?.id;
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const cvInputRef = useRef<HTMLInputElement | null>(null);

  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    profilePhotoUrl: '',
    university: '',
    portfolioLinks: '',
  });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [localPhotoPreview, setLocalPhotoPreview] = useState('');
  const [photoLoadError, setPhotoLoadError] = useState(false);

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['student', 'profile', userId],
    queryFn: () => getStudentProfile(userId),
    enabled: !!userId,
  });

  useEffect(() => {
    if (!profile) return;
    setFormValues({
      name: profile.name || '',
      description: profile.description || '',
      profilePhotoUrl: profile.profilePhotoUrl || '',
      university: profile.university || '',
      portfolioLinks: (profile.portfolioLinks || []).join('\n'),
    });
    setReviews(profile.reviews || []);
    setPhotoLoadError(false);
  }, [profile]);

  useEffect(() => {
    return () => {
      if (localPhotoPreview) URL.revokeObjectURL(localPhotoPreview);
    };
  }, [localPhotoPreview]);

  const { mutateAsync: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: (payload: any) => updateStudentProfile(userId, payload),
    onSuccess: () => {
      toast.success('Profile updated');
      queryClient.invalidateQueries({ queryKey: ['student', 'profile', userId] });
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const { mutateAsync: uploadCv, isPending: isUploadingCv } = useMutation({
    mutationFn: (file: File) => uploadStudentCV(userId, file),
    onSuccess: () => {
      toast.success('CV uploaded');
      queryClient.invalidateQueries({ queryKey: ['student', 'profile', userId] });
      if (cvInputRef.current) cvInputRef.current.value = '';
    },
    onError: () => toast.error('Failed to upload CV'),
  });

  const { mutateAsync: uploadPhoto, isPending: isUploadingPhoto } = useMutation({
    mutationFn: (file: File) => uploadStudentPhoto(userId, file),
    onSuccess: (data) => {
      if (data?.profilePhotoUrl) {
        setFormValues((p) => ({ ...p, profilePhotoUrl: data.profilePhotoUrl }));
      }
      setPhotoLoadError(false);
      toast.success('Profile photo updated');
      queryClient.invalidateQueries({ queryKey: ['student', 'profile', userId] });
      if (photoInputRef.current) photoInputRef.current.value = '';
    },
    onError: () => {
      setLocalPhotoPreview('');
      toast.error('Failed to upload profile photo');
    },
  });

  const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
  const origin = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
  const asset = (v?: string) => (v?.startsWith('http') ? v : v ? `${origin}${v}` : '');

  const photoUrl = localPhotoPreview || asset(formValues.profilePhotoUrl || profile?.profilePhotoUrl);
  const cvUrl = asset(profile?.cvUrl);
  const completionPct = profile ? getCompletionPct(profile) : 0;
  const portfolioLinks = useMemo(
    () => formValues.portfolioLinks.split('\n').map((link) => link.trim()).filter(Boolean),
    [formValues.portfolioLinks]
  );

  const handlePhotoSelect = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Upload an image file.');
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setLocalPhotoPreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return previewUrl;
    });
    setPhotoLoadError(false);
    await uploadPhoto(file);
  };

  const handleCvSelect = async (file?: File) => {
    if (!file) return;
    await uploadCv(file);
  };

  if (!user || isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <Skeleton className="h-16 w-64" />
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return <EmptyState title="Unable to load profile" description="Refresh the page and try again." />;
  }

  const verifiedSkills = profile.verifiedSkills || [];

  return (
    <motion.div className="mx-auto w-full max-w-6xl space-y-6" initial="hidden" animate="visible" variants={stagger}>
      <motion.div variants={fadeUp} className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="page-eyebrow">Student profile</p>
          <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">Professional profile</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500 dark:text-ink-400">
            Manage the public profile clients use to evaluate your verified skills, education, portfolio, and CV.
          </p>
        </div>
        <Button
          onClick={() => saveProfile({ ...formValues, portfolioLinks: formValues.portfolioLinks })}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {isSaving ? 'Saving...' : 'Save changes'}
        </Button>
      </motion.div>

      <motion.div variants={fadeUp} className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4 lg:sticky lg:top-24">
          <Card className="overflow-hidden p-0">
            <div className="h-20 bg-gradient-to-br from-brand-600 via-brand-700 to-ink-900" />
            <CardContent className="-mt-12 flex flex-col items-center px-5 pb-5 text-center">
              <div className="relative">
                <Avatar className="h-28 w-28 border-4 border-white bg-white shadow-elevated ring-1 ring-ink-200 dark:border-ink-dark-surface dark:bg-ink-dark-surface dark:ring-white/10">
                  {photoUrl && !photoLoadError ? (
                    <AvatarImage src={photoUrl} alt={profile.name} onError={() => setPhotoLoadError(true)} />
                  ) : null}
                  <AvatarFallback className="text-2xl">
                    {photoLoadError ? <ImageOff size={24} /> : getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-white shadow-card transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-60 dark:border-ink-dark-surface"
                  aria-label="Upload profile photo"
                >
                  {isUploadingPhoto ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void handlePhotoSelect(e.target.files?.[0])}
                />
              </div>

              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-xl font-semibold tracking-tight text-ink-900 dark:text-white">{profile.name}</h2>
                  {verifiedSkills.length ? <BadgeCheck size={17} className="text-brand-500" /> : null}
                </div>
                <p className="flex items-center justify-center gap-1.5 text-sm text-ink-500 dark:text-ink-400">
                  <Mail size={13} />
                  {profile.email}
                </p>
                {profile.university ? (
                  <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400">
                    <GraduationCap size={13} />
                    {profile.university}
                  </p>
                ) : null}
              </div>

              <div className="mt-5 w-full rounded-2xl border border-ink-100 bg-ink-50/70 p-4 text-left dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-[0.12em] text-ink-500 dark:text-ink-400">Completion</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400">{completionPct}%</span>
                </div>
                <Progress value={completionPct} className="mt-3" />
                <p className="mt-3 text-xs leading-5 text-ink-500 dark:text-ink-dark-muted">
                  Complete your photo, university, skills, bio, and portfolio links to improve client confidence.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="mb-0">
              <CardTitle className="text-sm">Profile summary</CardTitle>
            </CardHeader>
            <CardContent className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="muted-panel p-3">
                  <p className="label-muted">Skills</p>
                  <p className="mt-1 text-lg font-semibold text-ink-900 dark:text-white">{verifiedSkills.length}</p>
                </div>
                <div className="muted-panel p-3">
                  <p className="label-muted">Links</p>
                  <p className="mt-1 text-lg font-semibold text-ink-900 dark:text-white">{portfolioLinks.length}</p>
                </div>
              </div>
              <div className="muted-panel p-3">
                <p className="label-muted">CV</p>
                <p className="mt-1 text-sm font-semibold text-ink-900 dark:text-white">{cvUrl ? 'Uploaded' : 'Not uploaded'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="mb-0">
              <CardTitle className="text-sm">Verified skills</CardTitle>
            </CardHeader>
            <CardContent className="mt-3">
              {verifiedSkills.length ? (
                <div className="flex flex-wrap gap-2">
                  {verifiedSkills.map((s: any) => (
                    <Badge key={s._id || s.skill?._id || s.skill?.name} variant="brand" className="normal-case tracking-normal">
                      {s.skill?.name || 'Skill'} {s.score != null ? `· ${s.score}` : ''}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-ink-500 dark:text-ink-400">
                  No verified skills yet. Pass an AI interview to add them.
                </p>
              )}
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-5">
          <ProfileSection title="Personal Information" icon={<UserRound size={16} />}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full name</Label>
                <Input
                  id="profile-name"
                  value={formValues.name}
                  onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile.email || ''} disabled />
              </div>
            </div>
          </ProfileSection>

          <ProfileSection title="About" icon={<BadgeCheck size={16} />}>
            <div className="space-y-2">
              <Label htmlFor="profile-bio">Professional bio</Label>
              <Textarea
                id="profile-bio"
                rows={5}
                placeholder="Describe your skills, experience, and what you deliver for clients."
                value={formValues.description}
                onChange={(e) => setFormValues((p) => ({ ...p, description: e.target.value }))}
              />
              <p className="text-xs text-ink-500 dark:text-ink-dark-muted">
                Lead with your strongest skills, evidence, and the kinds of projects you want.
              </p>
            </div>
          </ProfileSection>

          <ProfileSection title="Education" icon={<GraduationCap size={16} />}>
            <div className="space-y-2">
              <Label htmlFor="profile-university">University</Label>
              <Input
                id="profile-university"
                value={formValues.university}
                onChange={(e) => setFormValues((p) => ({ ...p, university: e.target.value }))}
                placeholder="e.g. Cairo University"
              />
            </div>
          </ProfileSection>

          <ProfileSection title="Portfolio and Social Links" icon={<Link2 size={16} />}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-links">Links</Label>
                <Textarea
                  id="profile-links"
                  rows={4}
                  placeholder="https://github.com/you&#10;https://portfolio.com&#10;https://linkedin.com/in/you"
                  value={formValues.portfolioLinks}
                  onChange={(e) => setFormValues((p) => ({ ...p, portfolioLinks: e.target.value }))}
                />
                <p className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
                  <Link2 size={12} />
                  One link per line. Include portfolio, GitHub, LinkedIn, Behance, or case studies.
                </p>
              </div>

              {portfolioLinks.length ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {portfolioLinks.map((link) => (
                    <a
                      key={link}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex min-w-0 items-center gap-2 rounded-xl border border-ink-200/80 bg-ink-50/70 px-3 py-2 text-sm font-medium text-ink-700 no-underline transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-ink-300 dark:hover:border-brand-500/30 dark:hover:bg-brand-900/20 dark:hover:text-brand-300"
                    >
                      <ExternalLink size={14} className="shrink-0" />
                      <span className="truncate">{link}</span>
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </ProfileSection>

          <ProfileSection title="Skills" icon={<CheckCircle2 size={16} />}>
            {verifiedSkills.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {verifiedSkills.map((s: any) => (
                  <div key={s._id || s.skill?._id || s.skill?.name} className="rounded-2xl border border-ink-200/80 bg-ink-50/70 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="font-semibold text-ink-900 dark:text-white">{s.skill?.name || 'Verified skill'}</p>
                    <p className="mt-1 text-xs text-ink-500 dark:text-ink-dark-muted">
                      {s.score != null ? `AI interview score ${s.score}` : 'Verified by AI interview'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-500 dark:text-ink-400">
                Verified skill badges will appear here after successful AI interviews.
              </p>
            )}
          </ProfileSection>

          <ProfileSection
            title="CV"
            icon={<FileText size={16} />}
            action={
              <Button type="button" size="sm" variant="outline" disabled={isUploadingCv} onClick={() => cvInputRef.current?.click()}>
                {isUploadingCv ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {isUploadingCv ? 'Uploading...' : cvUrl ? 'Replace CV' : 'Upload CV'}
              </Button>
            }
          >
            <input
              ref={cvInputRef}
              type="file"
              hidden
              onChange={(e) => void handleCvSelect(e.target.files?.[0])}
            />
            <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-ink-200/80 bg-ink-50/70 p-4 dark:border-white/10 dark:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-ink-900 dark:text-white">{cvUrl ? 'CV uploaded' : 'No CV uploaded'}</p>
                <p className="mt-1 text-sm text-ink-500 dark:text-ink-dark-muted">
                  Keep a current CV attached for clients who want a formal document.
                </p>
              </div>
              {cvUrl ? (
                <Button type="button" variant="ghost" size="sm" asChild>
                  <a href={cvUrl} target="_blank" rel="noreferrer">
                    View CV <ExternalLink size={13} />
                  </a>
                </Button>
              ) : null}
            </div>
          </ProfileSection>
        </section>
      </motion.div>

      <motion.section variants={fadeUp} className="mx-auto max-w-6xl space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-ink-900 dark:text-white">Client reviews</h2>
          <p className="text-sm text-ink-500 dark:text-ink-400">Completed engagements and client feedback.</p>
        </div>
        {reviews.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {reviews.map((r, i) => (
              <Card key={`${r.clientName}-${i}`} className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink-900 dark:text-white">{r.clientName}</p>
                    {r.jobTitle ? <p className="text-xs text-ink-500 dark:text-ink-400">{r.jobTitle}</p> : null}
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star key={si} size={12} className={si < r.rating ? 'fill-amber-400 text-amber-400' : 'text-ink-300 dark:text-ink-600'} />
                    ))}
                  </div>
                </div>
                {r.comment ? <p className="text-sm text-ink-600 dark:text-ink-300">{r.comment}</p> : null}
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="No reviews yet" description="Completed engagements and submitted reviews will appear here." />
        )}
      </motion.section>
    </motion.div>
  );
};

export default StudentProfile;
