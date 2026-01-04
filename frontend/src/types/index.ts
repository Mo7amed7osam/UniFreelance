export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: 'Student' | 'Client' | 'Admin';
  verifiedSkills: VerifiedSkill[];
}

export interface VerifiedSkill {
  skillId?: string;
  skill?: { _id: string; name: string } | string;
  score: number;
}

export interface Job {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  requiredSkills: Array<{ _id: string; name: string } | string>;
  applicants: string[];
}

export interface Skill {
  id?: string;
  _id?: string;
  name: string;
  description: string;
}

export interface Interview {
  id?: string;
  _id?: string;
  studentId: string;
  skillId: string;
  questions?: string[];
  responses?: { question: string; videoUrl: string }[];
  reviewStatus?: 'pending' | 'pass' | 'fail';
  score?: number;
  isCompleted?: boolean;
}

export interface Proposal {
  id?: string;
  _id?: string;
  jobId: string;
  studentId: string;
  details: string;
  status?: 'pending' | 'accepted' | 'rejected';
}
