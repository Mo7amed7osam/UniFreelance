/*
  DB Seeder for Shaghalny
  - Loads MONGO_URI from backend/.env
  - Creates skills, clients, students, jobs, proposals, and contracts
  - Uses @faker-js/faker for realistic data
*/
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Lightweight helpers to avoid relying on specific faker API versions
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const sample = (arr, n = 1) => {
    const copy = [...arr];
    const out = [];
    for (let i = 0; i < n && copy.length; i++) {
        const idx = Math.floor(Math.random() * copy.length);
        out.push(copy.splice(idx, 1)[0]);
    }
    return n === 1 ? out[0] : out;
};

const sampleSentences = [
    'Experienced and detail-oriented.',
    'Delivered similar projects in the past with strong results.',
    'Comfortable with deadlines and iterative feedback.',
    'Can provide additional references upon request.',
];

const jobTitleSamples = [
    'Frontend developer for marketing site',
    'Build REST API with Node.js',
    'Data analysis and visualization',
    'Implement CI/CD pipeline and Dockerize app',
    'Design responsive UI for dashboard',
];

const Skill = require('../models/Skill');
const User = require('../models/User');
const Job = require('../models/Job');
const Proposal = require('../models/Proposal');
const Contract = require('../models/Contract');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/shaghalny-dev';

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

async function seed() {
    console.log('Connecting to', MONGO);
    await mongoose.connect(MONGO);

    console.log('Clearing target collections...');
    await Promise.all([
        Skill.deleteMany({}),
        User.deleteMany({}),
        Job.deleteMany({}),
        Proposal.deleteMany({}),
        Contract.deleteMany({}),
    ]);

    // Skills
    const skillNames = [
        'JavaScript',
        'React',
        'Node.js',
        'Python',
        'Django',
        'Machine Learning',
        'Data Science',
        'DevOps',
        'Docker',
        'UI/UX',
    ];

    const skills = await Promise.all(
        skillNames.map((name) => Skill.create({ name, description: sampleSentences[Math.floor(Math.random() * sampleSentences.length)] }))
    );

    console.log('Created skills:', skills.map((s) => s.name).join(', '));

    // Create clients (employers)
    const clients = [];
    for (let i = 0; i < 3; i++) {
        const email = `client${i + 1}@example.com`;
        const user = await User.create({
            name: `Client ${i + 1}`,
            email,
            password: bcrypt.hashSync('TestPass123', 8),
            role: 'Client',
            description: sampleSentences[Math.floor(Math.random() * sampleSentences.length)],
            profilePhotoUrl: null,
        });
        clients.push(user);
    }

    // Create students
    const students = [];
    for (let i = 0; i < 12; i++) {
        const email = `student${i + 1}@example.com`;
        const user = await User.create({
            name: `Student ${i + 1}`,
            email,
            password: bcrypt.hashSync('TestPass123', 8),
            role: 'Student',
            description: sampleSentences[Math.floor(Math.random() * sampleSentences.length)],
            university: `University ${i + 1}`,
            profilePhotoUrl: null,
            portfolioLinks: [`https://portfolio.example.com/${i + 1}`],
        });
        students.push(user);
    }

    console.log(`Created ${clients.length} clients and ${students.length} students.`);

    const jobs = [];
    // Create jobs for each client
    for (const client of clients) {
        for (let j = 0; j < 4; j++) {
            const countSkills = randomInt(1, Math.min(4, skills.length));
            const picked = sample(skills, countSkills);
            const pickedArray = Array.isArray(picked) ? picked : [picked];
            const requiredSkills = pickedArray.map((s) => s._id);
            const job = await Job.create({
                title: jobTitleSamples[Math.floor(Math.random() * jobTitleSamples.length)],
                description: sampleSentences.join(' '),
                requiredSkills,
                budgetMin: randomInt(50, 300),
                budgetMax: randomInt(301, 2000),
                duration: `${randomInt(1, 12)} weeks`,
                employer: client._id,
            });
            jobs.push(job);
        }
    }

    console.log('Created jobs:', jobs.length);

    const proposals = [];
    for (const job of jobs) {
        const candidateCount = Math.min(4, students.length);
        const candidates = sample(students, candidateCount);
        const candidateArray = Array.isArray(candidates) ? candidates : [candidates];
        for (const student of candidateArray) {
            const p = await Proposal.create({
                jobId: job._id,
                studentId: student._id,
                details: sampleSentences.slice(0, 2).join(' '),
                proposedBudget: randomInt(job.budgetMin || 50, job.budgetMax || 500),
            });
            proposals.push(p);
        }
    }

    console.log('Created proposals:', proposals.length);

    // Create some contracts by accepting the first proposal for a subset of jobs
    const contracts = [];
    for (let i = 0; i < Math.min(6, jobs.length); i++) {
        const job = jobs[i];
        const jobProposals = proposals.filter((p) => p.jobId.toString() === job._id.toString());
        if (jobProposals.length === 0) continue;
        const accepted = jobProposals[0];
        const contract = await Contract.create({
            jobId: job._id,
            clientId: job.employer,
            studentId: accepted.studentId,
            proposalId: accepted._id,
            agreedBudget: accepted.proposedBudget || job.budgetMin || 100,
            status: 'active',
        });
        // update job selectedStudent and status
        await Job.findByIdAndUpdate(job._id, { selectedStudent: accepted.studentId, status: 'in_progress', activeContract: contract._id });
        contracts.push(contract);
    }

    console.log('Created contracts:', contracts.length);

    console.log('Seeding complete. Closing connection in 1s...');
    await pause(1000);
    await mongoose.disconnect();
    console.log('Done.');
}

seed().catch((err) => {
    console.error('Seeder error:', err);
    process.exit(1);
});
