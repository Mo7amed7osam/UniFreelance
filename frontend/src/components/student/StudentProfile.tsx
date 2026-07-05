import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BadgeCheck,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  ExternalLink,
  FileText,
  GraduationCap,
  Globe2,
  ImageOff,
  Link2,
  Loader2,
  Mail,
  PencilLine,
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

function getDomain(link: string) {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return link.replace(/^https?:\/\//, '').split('/')[0] || 'portfolio link';
  }
}

function getProfileTitle(profile: any, verifiedSkills: any[]) {
  const primarySkill = verifiedSkills[0]?.skill?.name;
  if (primarySkill) return `${primarySkill} freelancer`;
  if (profile?.university) return `${profile.university} student freelancer`;
  return 'Student freelancer';
}

const EditSection = ({
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
  <Card className="overflow-hidden p-0">
    <CardHeader className="mb-0 border-b border-ink-100/80 bg-ink-50/45 p-4 dark:border-white/10 dark:bg-white/[0.025]">
      <div className="flex items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-brand-600 ring-1 ring-ink-200/80 dark:bg-white/10 dark:text-brand-300 dark:ring-white/10">
            {icon}
          </span>
          {title}
        </CardTitle>
        {action}
      </div>
    </CardHeader>
    <CardContent className="p-4">{children}</CardContent>
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
  const profileTitle = getProfileTitle(profile, verifiedSkills);
  const featuredLinks = portfolioLinks.slice(0, 4);

  return (
    <motion.div className="mx-auto w-full max-w-6xl space-y-4" initial="hidden" animate="visible" variants={stagger}>
      <motion.section variants={fadeUp} className="overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-card backdrop-blur-xl dark:border-white/10 dark:bg-ink-dark-surface/90">
        <div className="h-16 bg-[linear-gradient(135deg,#2563eb_0%,#1e40af_45%,#0f172a_100%)]" />
        <div className="grid gap-4 px-4 pb-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-5">
          <div className="-mt-9 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative shrink-0">
              <Avatar className="h-24 w-24 border-4 border-white bg-white shadow-elevated ring-1 ring-ink-200 dark:border-ink-dark-surface dark:bg-ink-dark-surface dark:ring-white/10">
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
                className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-white shadow-card transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-60 dark:border-ink-dark-surface"
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

            <div className="min-w-0 flex-1 pt-2 sm:pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-ink-950 dark:text-white">{profile.name}</h1>
                {verifiedSkills.length ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:border-brand-700/40 dark:bg-brand-900/30 dark:text-brand-300">
                    <BadgeCheck size={13} />
                    Verified
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-base font-medium text-ink-700 dark:text-ink-200">{profileTitle}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500 dark:text-ink-400">
                <span className="inline-flex items-center gap-1.5"><Mail size={13} />{profile.email}</span>
                {profile.university ? <span className="inline-flex items-center gap-1.5"><GraduationCap size={13} />{profile.university}</span> : null}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 self-end">
            {[
              { label: 'Skills', value: verifiedSkills.length },
              { label: 'Projects', value: portfolioLinks.length },
              { label: 'Reviews', value: reviews.length },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-ink-200/70 bg-ink-50/70 px-2 py-2 text-center dark:border-white/10 dark:bg-white/[0.04]">
                <p className="text-lg font-semibold tracking-tight text-ink-950 dark:text-white">{item.value}</p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500 dark:text-ink-dark-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.div variants={fadeUp} className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="space-y-4">
          <Card className="p-0">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="page-eyebrow">Overview</p>
                  <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-ink-950 dark:text-white">What clients should know</h2>
                </div>
                <BriefcaseBusiness size={20} className="mt-1 text-brand-500" />
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-600 dark:text-ink-300">
                {formValues.description || 'Add a focused overview that explains what you help clients achieve, your strongest skills, and the kind of work you want to do.'}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {verifiedSkills.length ? verifiedSkills.map((s: any) => (
                  <Badge key={s._id || s.skill?._id || s.skill?.name} variant="brand" className="normal-case tracking-normal">
                    {s.skill?.name || 'Skill'} {s.score != null ? `· ${s.score}` : ''}
                  </Badge>
                )) : (
                  <Badge variant="subtle" className="normal-case tracking-normal">No verified skills yet</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardHeader className="mb-0 border-b border-ink-100/80 p-4 dark:border-white/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Portfolio showcase</CardTitle>
                  <p className="mt-1 text-sm text-ink-500 dark:text-ink-dark-muted">Client-facing links presented as work samples.</p>
                </div>
                <Globe2 size={19} className="text-brand-500" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {featuredLinks.length ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {featuredLinks.map((link, index) => (
                    <a
                      key={link}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="group min-w-0 rounded-2xl border border-ink-200/80 bg-white/70 p-4 text-ink-800 no-underline shadow-soft transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50/60 hover:text-brand-700 hover:shadow-card dark:border-white/10 dark:bg-white/[0.04] dark:text-ink-200 dark:hover:border-brand-500/30 dark:hover:bg-brand-900/20 dark:hover:text-brand-300"
                    >
                      <div className="mb-3 flex h-16 items-end rounded-xl border border-ink-200/70 bg-[linear-gradient(135deg,rgba(37,99,235,0.12),rgba(15,23,42,0.04))] p-2 dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(59,130,246,0.18),rgba(255,255,255,0.04))]">
                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-600 shadow-soft dark:bg-ink-dark-surface/90 dark:text-ink-300">
                          Project {index + 1}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <ExternalLink size={15} className="mt-0.5 shrink-0 text-ink-400 transition-colors group-hover:text-brand-500" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{getDomain(link)}</p>
                          <p className="mt-1 truncate text-xs text-ink-500 dark:text-ink-dark-muted">{link}</p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-ink-200/80 bg-ink-50/70 p-6 text-center dark:border-white/10 dark:bg-white/[0.04]">
                  <Globe2 size={22} className="mx-auto text-brand-500" />
                  <p className="mt-3 font-semibold text-ink-900 dark:text-white">No portfolio links yet</p>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-ink-500 dark:text-ink-dark-muted">
                    Add GitHub, case studies, LinkedIn, Behance, or live project links in the editor.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardHeader className="mb-0 border-b border-ink-100/80 p-4 dark:border-white/10">
              <CardTitle className="text-lg">Proof and credentials</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-ink-200/80 bg-ink-50/70 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink-900 dark:text-white"><GraduationCap size={15} className="text-brand-500" />Education</p>
                <p className="mt-2 text-sm text-ink-500 dark:text-ink-dark-muted">{formValues.university || 'Add your university to strengthen trust.'}</p>
              </div>
              <div className="rounded-2xl border border-ink-200/80 bg-ink-50/70 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink-900 dark:text-white"><FileText size={15} className="text-brand-500" />CV</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-sm text-ink-500 dark:text-ink-dark-muted">{cvUrl ? 'Current CV uploaded.' : 'No CV uploaded yet.'}</p>
                  {cvUrl ? (
                    <a href={cvUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold">
                      View
                    </a>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <section className="space-y-3">
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
          </section>
        </main>

        <aside className="space-y-3 lg:sticky lg:top-20">
          <Card className="p-0">
            <CardHeader className="mb-0 border-b border-ink-100/80 p-5 dark:border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg"><PencilLine size={17} className="text-brand-500" />Profile editor</CardTitle>
                  <p className="mt-1 text-sm text-ink-500 dark:text-ink-dark-muted">Update the client-facing content.</p>
                </div>
                <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{completionPct}%</span>
              </div>
              <Progress value={completionPct} className="mt-4" />
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <Button
                className="w-full"
                onClick={() => saveProfile({ ...formValues, portfolioLinks: formValues.portfolioLinks })}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {isSaving ? 'Saving...' : 'Save changes'}
              </Button>
            </CardContent>
          </Card>

          <EditSection title="Personal Information" icon={<UserRound size={15} />}>
            <div className="grid gap-4">
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
          </EditSection>

          <EditSection title="About" icon={<BadgeCheck size={15} />}>
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
          </EditSection>

          <EditSection title="Education" icon={<GraduationCap size={15} />}>
            <div className="space-y-2">
              <Label htmlFor="profile-university">University</Label>
              <Input
                id="profile-university"
                value={formValues.university}
                onChange={(e) => setFormValues((p) => ({ ...p, university: e.target.value }))}
                placeholder="e.g. Cairo University"
              />
            </div>
          </EditSection>

          <EditSection title="Portfolio Links" icon={<Link2 size={15} />}>
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
                One link per line.
              </p>
            </div>
          </EditSection>

          <EditSection
            title="CV"
            icon={<FileText size={15} />}
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
          </EditSection>
        </aside>
      </motion.div>
    </motion.div>
  );
};

export default StudentProfile;
