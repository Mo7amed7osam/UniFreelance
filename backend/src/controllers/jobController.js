const Job = require('../models/Job');
const Proposal = require('../models/Proposal');
const { matchStudentsToJob, notifyMatchedStudents } = require('../services/matchingService');

// POST /jobs - Create a new job
const createJob = async (req, res) => {
    try {
        const { title, description, requiredSkills } = req.body;
        const newJob = new Job({ title, description, requiredSkills, employer: req.user?.id });
        await newJob.save();

        try {
            const matchedStudents = await matchStudentsToJob(newJob._id.toString());
            await notifyMatchedStudents(matchedStudents, newJob.title);
        } catch (matchError) {
            const message = matchError && matchError.message ? matchError.message : 'Unknown error';
            console.warn('Matching service error:', message);
        }

        const populatedJob = await Job.findById(newJob._id)
            .populate('employer', 'name email')
            .populate('requiredSkills', 'name');
        res.status(201).json(populatedJob);
    } catch (error) {
        res.status(500).json({ message: 'Error creating job', error });
    }
};

// GET /jobs - Retrieve all jobs
const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'open' })
            .populate('employer', 'name')
            .populate('requiredSkills', 'name');
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs', error });
    }
};

// GET /jobs/mine - Retrieve jobs for the current client
const getClientJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ employer: req.user?.id })
            .populate('requiredSkills', 'name')
            .populate('selectedStudent', 'name email');
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching client jobs', error });
    }
};

// POST /jobs/:id/proposals - Submit a proposal for a job
const submitProposal = async (req, res) => {
    try {
        const jobId = req.params.id || req.body.jobId;
        const { details } = req.body;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        if (job.status === 'filled') {
            return res.status(400).json({ message: 'Job is already filled' });
        }

        const existing = await Proposal.findOne({ jobId, studentId: req.user?.id });
        if (existing) {
            return res.status(400).json({ message: 'You already submitted a proposal for this job.' });
        }

        const newProposal = new Proposal({ jobId, studentId: req.user?.id, details });
        await newProposal.save();

        if (req.user?.id) {
            job.applicants.push(req.user.id);
        }
        await job.save();

        res.status(201).json(newProposal);
    } catch (error) {
        res.status(500).json({ message: 'Error submitting proposal', error });
    }
};

// GET /jobs/:id/proposals - Get proposals for a specific job
const getJobProposals = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        if (job.employer.toString() !== req.user?.id) {
            return res.status(403).json({ message: 'Not authorized to view proposals for this job' });
        }
        const proposals = await Proposal.find({ jobId: req.params.id })
            .populate({
                path: 'studentId',
                select: 'name email verifiedSkills',
                populate: { path: 'verifiedSkills.skill', select: 'name' },
            })
            .populate('jobId', 'title status');
        res.status(200).json(proposals);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching proposals', error });
    }
};

// GET /jobs/:id/matches - Get matched students for a job
const getMatchedCandidates = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        if (job.employer.toString() !== req.user?.id) {
            return res.status(403).json({ message: 'Not authorized to view matches for this job' });
        }
        const students = await matchStudentsToJob(req.params.id);
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Error matching students', error });
    }
};

// POST /jobs/:id/select - Select a student for a job
const selectStudentForJob = async (req, res) => {
    try {
        const { studentId } = req.body;
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        if (job.employer.toString() !== req.user?.id) {
            return res.status(403).json({ message: 'Not authorized to update this job' });
        }
        if (job.status === 'filled') {
            return res.status(400).json({ message: 'Job is already filled' });
        }

        job.selectedStudent = studentId;
        job.status = 'filled';
        await job.save();

        await Proposal.updateMany({ jobId: job._id, studentId }, { status: 'accepted' });
        await Proposal.updateMany({ jobId: job._id, studentId: { $ne: studentId } }, { status: 'rejected' });

        res.status(200).json({ message: 'Student selected successfully', job });
    } catch (error) {
        res.status(500).json({ message: 'Error selecting student', error });
    }
};

// GET /jobs/proposals/client - Get proposals across client jobs
const getClientProposals = async (req, res) => {
    try {
        const jobs = await Job.find({ employer: req.user?.id }).select('_id');
        const jobIds = jobs.map(job => job._id);
        const proposals = await Proposal.find({ jobId: { $in: jobIds } })
            .populate({
                path: 'studentId',
                select: 'name email verifiedSkills',
                populate: { path: 'verifiedSkills.skill', select: 'name' },
            })
            .populate('jobId', 'title status');
        res.status(200).json(proposals);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching proposals', error });
    }
};

// GET /jobs/:id - Get a single job
const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('employer', 'name email')
            .populate('requiredSkills', 'name')
            .populate('selectedStudent', 'name email');
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching job', error });
    }
};

module.exports = {
    createJob,
    getJobs,
    getJobById,
    getClientJobs,
    submitProposal,
    getJobProposals,
    getMatchedCandidates,
    selectStudentForJob,
    getClientProposals,
};
