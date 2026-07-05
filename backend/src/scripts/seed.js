/*
  Demo Seeder for Shaghalny
  - Loads MONGO_URI from backend/.env
  - Replaces existing demo marketplace data with recognizable Egyptian-market company records
  - Creates admin, clients, students, skills, jobs, proposals, contracts, escrow, submissions, and reviews
*/
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Skill = require('../models/Skill');
const User = require('../models/User');
const Job = require('../models/Job');
const Proposal = require('../models/Proposal');
const Contract = require('../models/Contract');
const Escrow = require('../models/Escrow');
const Transaction = require('../models/Transaction');
const WorkSubmission = require('../models/WorkSubmission');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/shaghalny-dev';
const DEMO_PASSWORD = 'DemoPass123';

const skillSeed = [
  { name: 'React', description: 'Frontend interfaces for dashboards, landing pages, and internal tools.' },
  { name: 'Node.js', description: 'Backend APIs, authentication flows, and service integrations.' },
  { name: 'UI/UX', description: 'Wireframes, polished interfaces, and design system work.' },
  { name: 'Flutter', description: 'Cross-platform mobile application development.' },
  { name: 'Data Analysis', description: 'Dashboards, spreadsheets, and business reporting.' },
  { name: 'DevOps', description: 'CI/CD, Docker, deployment pipelines, and observability.' },
  { name: 'Content Writing', description: 'Arabic and English product content, copy, and documentation.' },
  { name: 'Motion Design', description: 'Short-form animation, explainers, and visual storytelling.' },
  { name: 'Python', description: 'Automation scripts, AI prototypes, and backend services.' },
  { name: 'MongoDB', description: 'Schema design, aggregation, and application data modeling.' },
];

const clientSeed = [
  {
    key: 'amazon',
    name: 'Amazon Egypt',
    email: 'amazon.egypt@shaghalny.demo',
    description: 'Egypt marketplace and operations team hiring student freelancers for internal tools and seller experience work.',
    website: 'https://www.amazon.eg',
    companyLogoUrl: 'https://logo.clearbit.com/amazon.com',
    isVerified: true,
    balance: 120000,
  },
  {
    key: 'vodafone',
    name: 'Vodafone Egypt',
    email: 'vodafone.egypt@shaghalny.demo',
    description: 'Telecom product and support teams improving digital self-service journeys for Egyptian customers.',
    website: 'https://web.vodafone.com.eg',
    companyLogoUrl: 'https://logo.clearbit.com/vodafone.com',
    isVerified: true,
    balance: 95000,
  },
  {
    key: 'fawry',
    name: 'Fawry',
    email: 'fawry@shaghalny.demo',
    description: 'Egyptian fintech platform working on merchant dashboards, reporting, and payment operations tooling.',
    website: 'https://www.fawry.com',
    companyLogoUrl: 'https://logo.clearbit.com/fawry.com',
    isVerified: true,
    balance: 85000,
  },
  {
    key: 'talabat',
    name: 'talabat Egypt',
    email: 'talabat.egypt@shaghalny.demo',
    description: 'Food delivery operations and growth teams improving restaurant, rider, and customer workflows.',
    website: 'https://www.talabat.com/egypt',
    companyLogoUrl: 'https://logo.clearbit.com/talabat.com',
    isVerified: true,
    balance: 76000,
  },
  {
    key: 'instabug',
    name: 'Instabug',
    email: 'instabug@shaghalny.demo',
    description: 'Cairo-born software company building developer tooling, mobile observability, and product documentation.',
    website: 'https://www.instabug.com',
    companyLogoUrl: 'https://logo.clearbit.com/instabug.com',
    isVerified: true,
    balance: 68000,
  },
  {
    key: 'microsoft',
    name: 'Microsoft Egypt',
    email: 'microsoft.egypt@shaghalny.demo',
    description: 'Technology and community teams supporting developer programs, events, and cloud education in Egypt.',
    website: 'https://www.microsoft.com',
    companyLogoUrl: 'https://logo.clearbit.com/microsoft.com',
    isVerified: true,
    balance: 110000,
  },
  {
    key: 'apple',
    name: 'Apple Egypt',
    email: 'apple.egypt@shaghalny.demo',
    description: 'Retail and education-facing product marketing work for premium customer experiences and training materials.',
    website: 'https://www.apple.com',
    companyLogoUrl: 'https://logo.clearbit.com/apple.com',
    isVerified: true,
    balance: 90000,
  },
];

const studentSeed = [
  {
    key: 'salma',
    name: 'Salma Elshazly',
    email: 'salma.elshazly.demo@student.test',
    university: 'Cairo University',
    description: 'Frontend-focused computer science student building clean React interfaces for early-stage products.',
    portfolioLinks: ['https://demo-portfolio.test/salma-elshazly', 'https://behance.net/salma-ui-demo'],
    verifiedSkills: [
      { skill: 'React', score: 93 },
      { skill: 'UI/UX', score: 88 },
      { skill: 'MongoDB', score: 72 },
    ],
    balance: 6200,
    jobsCompleted: 1,
  },
  {
    key: 'omar',
    name: 'Omar Tarek',
    email: 'omar.tarek.demo@student.test',
    university: 'Ain Shams University',
    description: 'Full-stack student with strong Node.js and DevOps skills, comfortable owning small products end to end.',
    portfolioLinks: ['https://demo-portfolio.test/omar-tarek', 'https://github.com/demo/omartarek'],
    verifiedSkills: [
      { skill: 'Node.js', score: 91 },
      { skill: 'DevOps', score: 86 },
      { skill: 'MongoDB', score: 84 },
    ],
    balance: 0,
    jobsCompleted: 0,
  },
  {
    key: 'mariam',
    name: 'Mariam Hany',
    email: 'mariam.hany.demo@student.test',
    university: 'Alexandria University',
    description: 'Product designer working on student ventures, event apps, and social-first campaign visuals.',
    portfolioLinks: ['https://demo-portfolio.test/mariam-hany'],
    verifiedSkills: [
      { skill: 'UI/UX', score: 95 },
      { skill: 'Motion Design', score: 82 },
      { skill: 'Content Writing', score: 77 },
    ],
    balance: 0,
    jobsCompleted: 0,
  },
  {
    key: 'youssef',
    name: 'Youssef Adel',
    email: 'youssef.adel.demo@student.test',
    university: 'Mansoura University',
    description: 'Backend and automation student building APIs, scripts, and data pipelines for operations teams.',
    portfolioLinks: ['https://demo-portfolio.test/youssef-adel'],
    verifiedSkills: [
      { skill: 'Python', score: 92 },
      { skill: 'Node.js', score: 81 },
      { skill: 'Data Analysis', score: 79 },
    ],
    balance: 5400,
    jobsCompleted: 1,
  },
  {
    key: 'habiba',
    name: 'Habiba Mostafa',
    email: 'habiba.mostafa.demo@student.test',
    university: 'Helwan University',
    description: 'UI designer with solid product thinking and a strong eye for Arabic and English visual systems.',
    portfolioLinks: ['https://demo-portfolio.test/habiba-mostafa'],
    verifiedSkills: [
      { skill: 'UI/UX', score: 90 },
      { skill: 'Content Writing', score: 74 },
      { skill: 'Motion Design', score: 80 },
    ],
    balance: 0,
    jobsCompleted: 0,
  },
  {
    key: 'karim',
    name: 'Karim Nabil',
    email: 'karim.nabil.demo@student.test',
    university: 'German University in Cairo',
    description: 'Mobile engineer building Flutter MVPs, admin panels, and internal ops tools.',
    portfolioLinks: ['https://demo-portfolio.test/karim-nabil', 'https://github.com/demo/karimnabil'],
    verifiedSkills: [
      { skill: 'Flutter', score: 89 },
      { skill: 'React', score: 76 },
      { skill: 'Node.js', score: 73 },
    ],
    balance: 0,
    jobsCompleted: 0,
  },
  {
    key: 'rana',
    name: 'Rana Samir',
    email: 'rana.samir.demo@student.test',
    university: 'The American University in Cairo',
    description: 'Data and reporting student turning raw operations data into clean dashboards and management summaries.',
    portfolioLinks: ['https://demo-portfolio.test/rana-samir'],
    verifiedSkills: [
      { skill: 'Data Analysis', score: 94 },
      { skill: 'Python', score: 83 },
      { skill: 'Content Writing', score: 78 },
    ],
    balance: 0,
    jobsCompleted: 0,
  },
  {
    key: 'ziad',
    name: 'Ziad Fathy',
    email: 'ziad.fathy.demo@student.test',
    university: 'Benha University',
    description: 'Junior full-stack builder focused on CRUD products, dashboards, and internal business tools.',
    portfolioLinks: ['https://demo-portfolio.test/ziad-fathy'],
    verifiedSkills: [
      { skill: 'React', score: 80 },
      { skill: 'Node.js', score: 78 },
      { skill: 'MongoDB', score: 75 },
    ],
    balance: 0,
    jobsCompleted: 0,
  },
];

const jobSeed = [
  {
    key: 'amazon-seller-dashboard',
    clientKey: 'amazon',
    title: 'Seller operations dashboard for Amazon Egypt',
    description: 'Build a React dashboard for marketplace ops to track seller onboarding, delayed listings, and support tickets across Egypt.',
    requiredSkills: ['React', 'Node.js', 'MongoDB'],
    budgetMin: 18000,
    budgetMax: 26000,
    duration: '3 weeks',
  },
  {
    key: 'vodafone-self-service-redesign',
    clientKey: 'vodafone',
    title: 'Self-service flow redesign for Vodafone Egypt',
    description: 'Redesign the prepaid support journey with clearer Arabic-first UX, faster issue selection, and stronger account status visibility.',
    requiredSkills: ['UI/UX', 'Content Writing', 'React'],
    budgetMin: 14000,
    budgetMax: 22000,
    duration: '2 weeks',
  },
  {
    key: 'fawry-merchant-analytics',
    clientKey: 'fawry',
    title: 'Merchant analytics cleanup for Fawry reports',
    description: 'Clean merchant transaction exports, standardize KPIs, and prepare a lightweight reporting view for operations managers.',
    requiredSkills: ['Data Analysis', 'Python'],
    budgetMin: 16000,
    budgetMax: 24000,
    duration: '3 weeks',
  },
  {
    key: 'talabat-restaurant-portal',
    clientKey: 'talabat',
    title: 'Restaurant portal UI polish for talabat Egypt',
    description: 'Improve restaurant onboarding screens, menu edit flows, and issue states for small food businesses using the portal.',
    requiredSkills: ['React', 'UI/UX'],
    budgetMin: 15000,
    budgetMax: 23000,
    duration: '3 weeks',
  },
  {
    key: 'instabug-docs-refresh',
    clientKey: 'instabug',
    title: 'Developer docs refresh for mobile SDK guides',
    description: 'Rewrite and restructure SDK guide pages with clearer examples, better hierarchy, and concise setup instructions.',
    requiredSkills: ['Content Writing', 'React', 'UI/UX'],
    budgetMin: 11000,
    budgetMax: 17000,
    duration: '2 weeks',
  },
  {
    key: 'microsoft-community-landing',
    clientKey: 'microsoft',
    title: 'Developer community event landing page',
    description: 'Create a responsive landing page for an Egypt developer event with agenda blocks, registration CTA, and partner sections.',
    requiredSkills: ['React', 'UI/UX', 'Content Writing'],
    budgetMin: 13000,
    budgetMax: 20000,
    duration: '2 weeks',
  },
  {
    key: 'apple-training-microsite',
    clientKey: 'apple',
    title: 'Retail training microsite for product sessions',
    description: 'Design and build a polished training microsite for product session materials, quizzes, and store team references.',
    requiredSkills: ['React', 'UI/UX', 'Content Writing'],
    budgetMin: 19000,
    budgetMax: 28000,
    duration: '4 weeks',
  },
  {
    key: 'amazon-fulfillment-mobile-tool',
    clientKey: 'amazon',
    title: 'Flutter tool for fulfillment follow-up tasks',
    description: 'Build a small mobile workflow for internal follow-up tasks, daily checklists, and handoff notes in fulfillment operations.',
    requiredSkills: ['Flutter', 'Node.js'],
    budgetMin: 17000,
    budgetMax: 25000,
    duration: '4 weeks',
  },
  {
    key: 'instabug-ci-refresh',
    clientKey: 'instabug',
    title: 'CI refresh for frontend documentation builds',
    description: 'Stabilize documentation preview deploys, add build checks, and document a cleaner rollout workflow for contributors.',
    requiredSkills: ['DevOps', 'Node.js'],
    budgetMin: 15000,
    budgetMax: 23000,
    duration: '2 weeks',
  },
];

const proposalSeed = [
  {
    jobKey: 'amazon-seller-dashboard',
    studentKey: 'omar',
    proposedBudget: 24500,
    status: 'accepted',
    details: 'I can deliver the dashboard with a clean React frontend, Express API endpoints, and Mongo-backed filtering for seller operations.',
  },
  {
    jobKey: 'amazon-seller-dashboard',
    studentKey: 'ziad',
    proposedBudget: 21800,
    status: 'rejected',
    details: 'I have built similar admin dashboards and can keep the scope tight with reusable components and clear seller status views.',
  },
  {
    jobKey: 'amazon-seller-dashboard',
    studentKey: 'salma',
    proposedBudget: 25800,
    status: 'rejected',
    details: 'I can focus on the frontend experience and collaborate with an existing backend if needed.',
  },
  {
    jobKey: 'vodafone-self-service-redesign',
    studentKey: 'habiba',
    proposedBudget: 18500,
    status: 'submitted',
    details: 'I would redesign the mobile support flow with stronger hierarchy, clearer Arabic-first copy, and faster issue selection.',
  },
  {
    jobKey: 'vodafone-self-service-redesign',
    studentKey: 'mariam',
    proposedBudget: 21000,
    status: 'shortlisted',
    details: 'I can provide wireframes, polished screens, and a content direction that reduces support friction.',
  },
  {
    jobKey: 'fawry-merchant-analytics',
    studentKey: 'rana',
    proposedBudget: 22500,
    status: 'submitted',
    details: 'I can clean the merchant exports, rebuild the weekly report structure, and provide a clear operations dashboard handoff.',
  },
  {
    jobKey: 'fawry-merchant-analytics',
    studentKey: 'youssef',
    proposedBudget: 21800,
    status: 'accepted',
    details: 'I can automate cleanup in Python and deliver a documented reporting pipeline for recurring merchant metrics.',
  },
  {
    jobKey: 'talabat-restaurant-portal',
    studentKey: 'salma',
    proposedBudget: 22000,
    status: 'submitted',
    details: 'I can lead the React portal polish with reusable states for onboarding, menu editing, and restaurant issue handling.',
  },
  {
    jobKey: 'talabat-restaurant-portal',
    studentKey: 'mariam',
    proposedBudget: 20500,
    status: 'shortlisted',
    details: 'I can refine the portal UX and deliver polished restaurant-facing screens with clear empty and error states.',
  },
  {
    jobKey: 'instabug-docs-refresh',
    studentKey: 'habiba',
    proposedBudget: 14500,
    status: 'submitted',
    details: 'I can refine the documentation hierarchy, developer-facing copy, and examples for faster SDK onboarding.',
  },
  {
    jobKey: 'microsoft-community-landing',
    studentKey: 'mariam',
    proposedBudget: 18800,
    status: 'accepted',
    details: 'I can deliver a landing page direction, speaker sections, agenda blocks, and responsive event visuals.',
  },
  {
    jobKey: 'microsoft-community-landing',
    studentKey: 'habiba',
    proposedBudget: 17600,
    status: 'submitted',
    details: 'I can refine event content and page structure for better trust, readability, and registration conversion.',
  },
  {
    jobKey: 'apple-training-microsite',
    studentKey: 'salma',
    proposedBudget: 26500,
    status: 'submitted',
    details: 'I can build the microsite in React with polished training modules, quiz states, and reusable content blocks.',
  },
  {
    jobKey: 'amazon-fulfillment-mobile-tool',
    studentKey: 'karim',
    proposedBudget: 23800,
    status: 'submitted',
    details: 'I can build the Flutter workflow with checklists, task history, and a clean operations-facing interface.',
  },
  {
    jobKey: 'amazon-fulfillment-mobile-tool',
    studentKey: 'omar',
    proposedBudget: 24700,
    status: 'submitted',
    details: 'I can support the backend services and mobile workflows for fulfillment follow-up tasks.',
  },
  {
    jobKey: 'instabug-ci-refresh',
    studentKey: 'omar',
    proposedBudget: 21800,
    status: 'submitted',
    details: 'I can stabilize the preview pipeline, add build validation, and document the workflow for contributors.',
  },
  {
    jobKey: 'instabug-ci-refresh',
    studentKey: 'youssef',
    proposedBudget: 20500,
    status: 'submitted',
    details: 'I can improve CI scripts, build validation, and rollback visibility with a simple deployment playbook.',
  },
];

const contractSeed = [
  {
    jobKey: 'amazon-seller-dashboard',
    proposalStudentKey: 'omar',
    status: 'active',
    escrowStatus: 'held_in_escrow',
    agreedBudget: 24500,
  },
  {
    jobKey: 'microsoft-community-landing',
    proposalStudentKey: 'mariam',
    status: 'submitted',
    escrowStatus: 'held_in_escrow',
    agreedBudget: 18800,
    submission: {
      message: 'Uploaded the event landing page layout, agenda sections, and responsive visual package for review.',
      links: ['https://demo-deliverables.test/microsoft-community-landing'],
      attachments: ['event-landing-overview.pdf', 'responsive-screens.zip'],
    },
  },
  {
    jobKey: 'fawry-merchant-analytics',
    proposalStudentKey: 'youssef',
    status: 'completed',
    escrowStatus: 'released',
    agreedBudget: 21800,
    submission: {
      message: 'Delivered cleaned merchant reports, Python automation scripts, and a handoff summary for the operations lead.',
      links: ['https://demo-deliverables.test/fawry-merchant-analytics'],
      attachments: ['weekly-report-template.xlsx', 'cleanup-readme.pdf'],
    },
    review: {
      rating: 5,
      comment: 'Very reliable delivery, strong communication, and the weekly report now takes a fraction of the original time.',
    },
  },
];

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function clearCollections() {
  await Promise.all([
    WorkSubmission.deleteMany({}),
    Transaction.deleteMany({}),
    Escrow.deleteMany({}),
    Contract.deleteMany({}),
    Proposal.deleteMany({}),
    Job.deleteMany({}),
    User.deleteMany({}),
    Skill.deleteMany({}),
  ]);
}

async function seed() {
  console.log('Connecting to', MONGO);
  await mongoose.connect(MONGO);

  console.log('Clearing demo collections...');
  await clearCollections();

  const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);

  const createdSkills = await Skill.insertMany(skillSeed);
  const skillsByName = new Map(createdSkills.map((skill) => [skill.name, skill]));

  const admin = await User.create({
    name: 'Dr. Demo Admin',
    email: 'admin@shaghalny.demo',
    password: passwordHash,
    role: 'Admin',
    description: 'Demo administrator account for reviewing the full marketplace state.',
    balance: 0,
  });

  const clientsByKey = new Map();
  for (const client of clientSeed) {
    const created = await User.create({
      name: client.name,
      email: client.email,
      password: passwordHash,
      role: 'Client',
      description: client.description,
      website: client.website,
      companyLogoUrl: client.companyLogoUrl,
      isVerified: client.isVerified,
      balance: client.balance,
    });
    clientsByKey.set(client.key, created);
  }

  const studentsByKey = new Map();
  for (const student of studentSeed) {
    const created = await User.create({
      name: student.name,
      email: student.email,
      password: passwordHash,
      role: 'Student',
      description: student.description,
      university: student.university,
      portfolioLinks: student.portfolioLinks,
      verifiedSkills: student.verifiedSkills.map((item) => ({
        skill: skillsByName.get(item.skill)._id,
        score: item.score,
        verifiedAt: new Date('2026-04-01T10:00:00Z'),
      })),
      jobsCompleted: student.jobsCompleted,
      balance: student.balance,
    });
    studentsByKey.set(student.key, created);
  }

  const jobsByKey = new Map();
  for (const item of jobSeed) {
    const job = await Job.create({
      title: item.title,
      description: item.description,
      requiredSkills: item.requiredSkills.map((skillName) => skillsByName.get(skillName)._id),
      budgetMin: item.budgetMin,
      budgetMax: item.budgetMax,
      duration: item.duration,
      employer: clientsByKey.get(item.clientKey)._id,
      status: 'open',
    });
    jobsByKey.set(item.key, job);
  }

  const proposalsByKey = new Map();
  for (const item of proposalSeed) {
    const job = jobsByKey.get(item.jobKey);
    const student = studentsByKey.get(item.studentKey);
    const proposal = await Proposal.create({
      jobId: job._id,
      studentId: student._id,
      details: item.details,
      proposedBudget: item.proposedBudget,
      status: item.status,
      createdAt: new Date('2026-05-01T09:00:00Z'),
      updatedAt: new Date('2026-05-01T09:00:00Z'),
    });

    proposalsByKey.set(`${item.jobKey}:${item.studentKey}`, proposal);
  }

  for (const job of jobsByKey.values()) {
    const applicantIds = await Proposal.find({ jobId: job._id }).distinct('studentId');
    job.applicants = applicantIds;
    await job.save();
  }

  for (const item of contractSeed) {
    const job = jobsByKey.get(item.jobKey);
    const client = await User.findById(job.employer);
    const student = studentsByKey.get(item.proposalStudentKey);
    const proposal = proposalsByKey.get(`${item.jobKey}:${item.proposalStudentKey}`);

    const contract = await Contract.create({
      jobId: job._id,
      clientId: client._id,
      studentId: student._id,
      proposalId: proposal._id,
      agreedBudget: item.agreedBudget,
      status: item.status,
      escrowStatus: item.escrowStatus,
      submittedAt: item.status === 'submitted' || item.status === 'completed' ? new Date('2026-05-09T12:00:00Z') : undefined,
      acceptedAt: item.status === 'completed' ? new Date('2026-05-12T15:00:00Z') : undefined,
      completedAt: item.status === 'completed' ? new Date('2026-05-12T15:00:00Z') : undefined,
    });

    await Escrow.create({
      contractId: contract._id,
      clientId: client._id,
      studentId: student._id,
      amount: item.agreedBudget,
      status: item.escrowStatus,
      releasedAt: item.escrowStatus === 'released' ? new Date('2026-05-12T15:00:00Z') : undefined,
      createdAt: new Date('2026-05-04T11:00:00Z'),
      updatedAt: new Date('2026-05-12T15:00:00Z'),
    });

    await Transaction.create({
      fromUserId: client._id,
      toUserId: student._id,
      amount: item.agreedBudget,
      type: 'ESCROW_HOLD',
      contractId: contract._id,
      createdAt: new Date('2026-05-04T11:00:00Z'),
      updatedAt: new Date('2026-05-04T11:00:00Z'),
    });

    client.balance = Number(client.balance || 0) - item.agreedBudget;
    await client.save();

    if (item.status === 'completed') {
      await Transaction.create({
        fromUserId: client._id,
        toUserId: student._id,
        amount: item.agreedBudget,
        type: 'ESCROW_RELEASE',
        contractId: contract._id,
        createdAt: new Date('2026-05-12T15:00:00Z'),
        updatedAt: new Date('2026-05-12T15:00:00Z'),
      });
    }

    if (item.submission) {
      await WorkSubmission.create({
        contractId: contract._id,
        studentId: student._id,
        message: item.submission.message,
        links: item.submission.links,
        attachments: item.submission.attachments,
        createdAt: new Date('2026-05-09T12:00:00Z'),
        updatedAt: new Date('2026-05-09T12:00:00Z'),
      });
    }

    if (item.review) {
      const refreshedStudent = await User.findById(student._id);
      refreshedStudent.reviews.push({
        jobId: job._id,
        contractId: contract._id,
        clientName: client.name,
        rating: item.review.rating,
        comment: item.review.comment,
        jobTitle: job.title,
        createdAt: new Date('2026-05-12T16:00:00Z'),
      });
      refreshedStudent.jobsCompleted = Math.max(refreshedStudent.jobsCompleted || 0, 1);
      refreshedStudent.balance = Number(refreshedStudent.balance || 0) + item.agreedBudget;
      await refreshedStudent.save();
    }

    job.selectedStudent = student._id;
    job.activeContract = contract._id;
    job.status = item.status === 'completed' ? 'completed' : 'in_progress';
    await job.save();
  }

  console.log('Demo seeding complete.');
  console.log('');
  console.log('Login password for all demo accounts:', DEMO_PASSWORD);
  console.log('Admin:', admin.email);
  console.log('Clients:');
  clientSeed.forEach((client) => console.log(`- ${client.name}: ${client.email}`));
  console.log('Students:');
  studentSeed.forEach((student) => console.log(`- ${student.name}: ${student.email}`));

  await pause(500);
  await mongoose.disconnect();
  console.log('Disconnected.');
}

seed().catch(async (error) => {
  console.error('Seeder error:', error);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    console.error('Disconnect error:', disconnectError);
  }
  process.exit(1);
});
