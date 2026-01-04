export const API = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    me: '/auth/me',
  },
  jobs: {
    list: '/jobs',
    create: '/jobs',
    details: (id: string) => `/jobs/${id}`,
    apply: (jobId: string) => `/jobs/${jobId}/proposals`,
    proposals: (jobId: string) => `/jobs/${jobId}/proposals`,
    clientJobs: '/jobs/mine',
    clientProposals: '/jobs/proposals/client',
    matches: (jobId: string) => `/jobs/${jobId}/matches`,
    select: (jobId: string) => `/jobs/${jobId}/select`,
    reviews: (jobId: string) => `/jobs/${jobId}/reviews`,
  },
  proposals: {
    accept: (proposalId: string) => `/proposals/${proposalId}/accept`,
  },
  contracts: {
    list: '/contracts',
    details: (id: string) => `/contracts/${id}`,
    submit: (id: string) => `/contracts/${id}/submissions`,
    accept: (id: string) => `/contracts/${id}/accept`,
    requestChanges: (id: string) => `/contracts/${id}/request-changes`,
    review: (id: string) => `/contracts/${id}/review`,
  },
  skills: {
    list: '/skills',
    createInterview: (skillId: string) => `/skills/${skillId}/interviews`,
    interviewDetails: (interviewId: string) => `/skills/interviews/${interviewId}`,
  },
  interviews: {
    uploadVideo: (interviewId: string) => `/interviews/${interviewId}/videos`,
    submit: (interviewId: string) => `/interviews/${interviewId}/submit`,
  },
  admin: {
    interviews: '/admin/interviews',
    interviewById: (id: string) => `/admin/interviews/${id}`,
    evaluate: (id: string) => `/admin/interviews/${id}/evaluate`,
    users: '/admin/users',
    jobs: '/admin/jobs',
    deleteUser: (id: string) => `/admin/users/${id}`,
    deleteJob: (id: string) => `/admin/jobs/${id}`,
    skills: '/admin/skills',
  },
};
