import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import useAuth from '@/hooks/useAuth';
import { getStudentProfile, uploadStudentCV } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const StudentProfile: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const userId = user?._id || user?.id;

    const { data: profile, isLoading, isError } = useQuery({
        queryKey: ['student', 'profile', userId],
        queryFn: () => getStudentProfile(userId),
        enabled: !!userId,
    });

    const { mutateAsync: uploadCv, isPending } = useMutation({
        mutationFn: (file: File) => uploadStudentCV(userId, file),
        onSuccess: () => {
            toast.success('CV uploaded successfully');
            queryClient.invalidateQueries({ queryKey: ['student', 'profile', userId] });
        },
        onError: () => toast.error('Failed to upload CV'),
    });

    const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await uploadCv(file);
        }
    };

    if (!user || isLoading) return <div className="text-ink-500">Loading...</div>;
    if (isError) return <div className="text-rose-500">Failed to load profile</div>;

    const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
    const origin = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
    const cvUrl = profile.cvUrl ? (profile.cvUrl.startsWith('http') ? profile.cvUrl : `${origin}${profile.cvUrl}`) : '';

    return (
        <Card>
            <CardHeader>
                <CardTitle>{profile.name}'s Profile</CardTitle>
                <p className="text-sm text-ink-500">{profile.email}</p>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
        </Card>
    );
};

export default StudentProfile;
