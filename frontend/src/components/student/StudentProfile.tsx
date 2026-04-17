import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import useAuth from '@/hooks/useAuth';
import {
  getStudentProfile,
  updateStudentProfile,
  uploadStudentCV,
  uploadStudentPhoto,
} from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Review = {
  clientName: string;
  rating: number;
  comment?: string;
  jobTitle?: string;
};

const StudentProfile: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?._id || user?.id;
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    profilePhotoUrl: '',
    university: '',
    portfolioLinks: '',
  });

  const [reviews, setReviews] = useState<Review[]>([]);

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
  }, [profile]);

  const { mutateAsync: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: (payload: any) => updateStudentProfile(userId, payload),
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['student', 'profile', userId] });
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const { mutateAsync: uploadCv, isPending } = useMutation({
    mutationFn: (file: File) => uploadStudentCV(userId, file),
    onSuccess: () => {
      toast.success('CV uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['student', 'profile', userId] });
    },
    onError: () => toast.error('Failed to upload CV'),
  });

  const { mutateAsync: uploadPhoto, isPending: isUploadingPhoto } = useMutation({
    mutationFn: (file: File) => uploadStudentPhoto(userId, file),
    onSuccess: (data) => {
      if (data?.profilePhotoUrl) {
        setFormValues((p) => ({ ...p, profilePhotoUrl: data.profilePhotoUrl }));
      }
      queryClient.invalidateQueries({ queryKey: ['student', 'profile', userId] });
    },
  });

  if (!user || isLoading) return <div className="text-ink-500">Loading...</div>;
  if (isError || !profile) return <div className="text-rose-500">Failed to load profile</div>;

  const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
  const origin = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
  const asset = (v?: string) => (v?.startsWith('http') ? v : v ? `${origin}${v}` : '');
  const photoUrl = asset(formValues.profilePhotoUrl || profile.profilePhotoUrl);
  const cvUrl = asset(profile.cvUrl);

  return (
    <Card className="relative overflow-hidden border-ink-100 bg-white/80 backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700" />

      <CardHeader className="pb-6">
         <CardTitle className="text-2xl font-semibold text-ink-900 dark:text-ink-100">
          {profile.name}
        </CardTitle>
        <p className="text-sm text-ink-500">{profile.email}</p>
      </CardHeader>

      <CardContent className="space-y-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800">
              {photoUrl ? (
                <img src={photoUrl} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-ink-400">
                  No photo
                </div>
              )}
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && uploadPhoto(e.target.files[0])}
              className="hidden"
            />
            <Button
              size="sm"
              variant="outline"
              disabled={isUploadingPhoto}
              onClick={() => photoInputRef.current?.click()}
            >
              Upload photo
            </Button>
          </div>

          <div className="flex-1 space-y-2">
            <Label>Profile photo URL</Label>
            <Input
              value={formValues.profilePhotoUrl}
              onChange={(e) => setFormValues((p) => ({ ...p, profilePhotoUrl: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={formValues.name}
              onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>University</Label>
            <Input
              value={formValues.university}
              onChange={(e) => setFormValues((p) => ({ ...p, university: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            rows={4}
            value={formValues.description}
            onChange={(e) => setFormValues((p) => ({ ...p, description: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Portfolio links</Label>
          <Textarea
            rows={3}
            value={formValues.portfolioLinks}
            onChange={(e) => setFormValues((p) => ({ ...p, portfolioLinks: e.target.value }))}
          />
        </div>

        <Button
          onClick={() =>
            saveProfile({
              ...formValues,
              portfolioLinks: formValues.portfolioLinks,
            })
          }
          disabled={isSaving}
          className="bg-gradient-to-r from-brand-600 to-brand-700"
        >
          {isSaving ? 'Saving...' : 'Save profile'}
        </Button>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Verified Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profile.verifiedSkills?.length ? (
              profile.verifiedSkills.map((s: any) => (
                <Badge key={s._id} variant="brand">
                  {s.skill?.name} ({s.score})
                </Badge>
              ))
            ) : (
              <p className="text-sm text-ink-500">No verified skills yet.</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {cvUrl ? (
            <a href={cvUrl} target="_blank" className="text-sm font-semibold text-brand-600">
              View CV
            </a>
          ) : (
            <span className="text-sm text-ink-500">No CV uploaded</span>
          )}
          <label>
            <input type="file" hidden onChange={(e) => e.target.files && uploadCv(e.target.files[0])} />
            <Button size="sm" variant="outline">
              Upload CV
            </Button>
          </label>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Client reviews</h3>
          {reviews.length ? (
            reviews.map((r, i) => (
              <div key={i} className="rounded-xl border border-ink-100 bg-white p-4">
                <p className="font-medium">{r.clientName}</p>
                <p className="text-xs text-ink-500">
                  {r.jobTitle} • Rating {r.rating}/5
                </p>
                {r.comment && <p className="mt-2 text-sm text-ink-600">{r.comment}</p>}
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-500">No reviews yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentProfile;
