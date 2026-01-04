export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: 'Student' | 'Client' | 'Admin';
  verifiedSkills: VerifiedSkill[];
  profilePhotoUrl?: string;
  description?: string;
  university?: string;
  portfolioLinks?: string[];
  jobsCompleted?: number;
  reviews?: Review[];
  balance?: number;
}

export interface VerifiedSkill {
  skillId?: string;
  skill?: { _id: string; name: string } | string;
  score: number;
  verifiedAt?: string;
}

export interface Review {
  jobId?: string;
  clientName: string;
  rating: number;
  comment?: string;
  jobTitle?: string;
  createdAt?: string;
}

export interface Job {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  requiredSkills: Array<{ _id: string; name: string } | string>;
  applicants: string[];
  budgetMin?: number;
  budgetMax?: number;
  duration?: string;
  status?: 'open' | 'in_progress' | 'completed' | 'closed';
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
  proposedBudget?: number;
  status?: 'submitted' | 'shortlisted' | 'accepted' | 'rejected';
}

export interface Contract {
  id?: string;
  _id?: string;
  jobId: any;
  clientId: any;
  studentId: any;
  proposalId?: string;
  agreedBudget: number;
  status: 'active' | 'submitted' | 'accepted' | 'completed';
  escrowStatus: 'held_in_escrow' | 'released';
  submittedAt?: string;
  acceptedAt?: string;
  completedAt?: string;
}
