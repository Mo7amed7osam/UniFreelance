import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import useAuth from '@/hooks/useAuth';
import { getStudentProfile, updateStudentProfile, uploadStudentCV, uploadStudentPhoto } from '@/services/api';
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
    createdAt?: string;
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
        onError: (error: any) => {
            const message = error?.response?.data?.message;
            toast.error(message || 'Failed to update profile');
        },
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
            toast.success('Profile photo uploaded successfully');
            if (data?.profilePhotoUrl) {
                setFormValues((prev) => ({ ...prev, profilePhotoUrl: data.profilePhotoUrl }));
            }
            queryClient.invalidateQueries({ queryKey: ['student', 'profile', userId] });
        },
        onError: () => toast.error('Failed to upload profile photo'),
    });

    const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await uploadCv(file);
        }
    };

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await uploadPhoto(file);
        }
    };

    const handleSaveProfile = async () => {
        await saveProfile({
            name: formValues.name.trim(),
            description: formValues.description.trim(),
            profilePhotoUrl: formValues.profilePhotoUrl.trim(),
            university: formValues.university.trim(),
            portfolioLinks: formValues.portfolioLinks,
        });
    };

    if (!user || isLoading) return <div className="text-ink-500">Loading...</div>;
    if (isError) return <div className="text-rose-500">Failed to load profile</div>;
    if (!profile) return <div className="text-ink-500">Profile not available</div>;

    const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
    const origin = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
    const buildAssetUrl = (value?: string) => {
        if (!value) return '';
        return value.startsWith('http') ? value : `${origin}${value}`;
    };
    const cvUrl = buildAssetUrl(profile.cvUrl);
    const photoUrl = buildAssetUrl(formValues.profilePhotoUrl || profile.profilePhotoUrl);
    const jobsCompleted = profile.jobsCompleted ?? reviews.length ?? 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{profile.name}'s Profile</CardTitle>
                <p className="text-sm text-ink-500">{profile.email}</p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 overflow-hidden rounded-full border border-ink-100 bg-ink-50">
                            {photoUrl ? (
                                <img src={photoUrl} alt={`${profile.name} profile`} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-ink-500">
                                    No photo
                                </div>
                            )}
                        </div>
                        <input
                            ref={photoInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isUploadingPhoto}
                            onClick={() => photoInputRef.current?.click()}
                        >
                            {isUploadingPhoto ? 'Uploading...' : 'Upload photo'}
                        </Button>
                    </div>
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="profilePhotoUrl">Profile photo URL</Label>
                        <Input
                            id="profilePhotoUrl"
                            placeholder="https://"
                            value={formValues.profilePhotoUrl}
                            onChange={(e) => setFormValues((prev) => ({ ...prev, profilePhotoUrl: e.target.value }))}
                        />
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={formValues.name}
                            onChange={(e) => setFormValues((prev) => ({ ...prev, name: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="jobsCompleted">Jobs completed</Label>
                        <Input
                            id="jobsCompleted"
                            type="number"
                            min={0}
                            value={String(jobsCompleted)}
                            readOnly
                            disabled
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="university">University</Label>
                    <Input
                        id="university"
                        placeholder="Add your university"
                        value={formValues.university}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, university: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        placeholder="Tell clients about your experience and focus."
                        value={formValues.description}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, description: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="portfolioLinks">Portfolio links</Label>
                    <Textarea
                        id="portfolioLinks"
                        placeholder="Add one link per line"
                        value={formValues.portfolioLinks}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, portfolioLinks: e.target.value }))}
                    />
                </div>
                <Button type="button" onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save profile'}
                </Button>
                <div>
                    <h3 className="text-sm font-semibold text-ink-700">Verified Skills</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {profile.verifiedSkills?.length ? (
                            profile.verifiedSkills?.map((skill: any) => (
                                <Badge key={skill.skill?._id || skill.skill?.name || skill._id} variant="brand">
                                    {skill.skill?.name || skill.name} ({skill.score})
                                </Badge>
                            ))
                        ) : (
                            <p className="text-sm text-ink-500">No verified skills yet.</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {cvUrl ? (
                        <a className="text-sm font-semibold text-brand-600" href={cvUrl} target="_blank" rel="noopener noreferrer">
                            View CV
                        </a>
                    ) : (
                        <span className="text-sm text-ink-500">No CV uploaded yet.</span>
                    )}
                    <label className="cursor-pointer">
                        <input type="file" accept=".pdf,.doc,.docx" onChange={handleCVUpload} className="hidden" />
                        <Button type="button" variant="outline" size="sm" disabled={isPending}>
                            {isPending ? 'Uploading...' : 'Upload CV'}
                        </Button>
                    </label>
                </div>
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-ink-700">Client reviews</h3>
                    {reviews.length ? (
                        <div className="space-y-3">
                            {reviews.map((review, index) => (
                                <div key={`${review.clientName}-${index}`} className="rounded-xl border border-ink-100 p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-semibold text-ink-900">{review.clientName}</p>
                                            <p className="text-xs text-ink-500">
                                                {review.jobTitle ? `${review.jobTitle} • ` : ''}Rating {review.rating}/5
                                            </p>
                                        </div>
                                    </div>
                                    {review.comment && <p className="mt-2 text-sm text-ink-600">{review.comment}</p>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-ink-500">No reviews yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default StudentProfile;
