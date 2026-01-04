const User = require('../models/User');
const Job = require('../models/Job');
const Proposal = require('../models/Proposal');

// Fetch student profile by ID
const getStudentProfile = async (req, res) => {
    try {
        const studentId = req.params.id;
        if (req.user?.id !== studentId && req.user?.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized to view this profile' });
        }
        const student = await User.findById(studentId)
            .select('-password')
            .populate('verifiedSkills.skill', 'name');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update student profile
const updateStudentProfile = async (req, res) => {
    try {
        const studentId = req.params.id;
        if (req.user?.id !== studentId && req.user?.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized to update this profile' });
        }
        const updatedData = req.body;

        const updatedStudent = await User.findByIdAndUpdate(studentId, updatedData, { new: true }).select('-password');
        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json(updatedStudent);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Upload CV
const uploadStudentCV = async (req, res) => {
    try {
        const studentId = req.params.id;
        if (req.user?.id !== studentId && req.user?.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized to upload for this profile' });
        }
        const cvFile = req.file;

        if (!cvFile) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const cvUrl = `/uploads/cvs/${cvFile.filename}`;
        await User.findByIdAndUpdate(studentId, { cvUrl });

        res.status(200).json({ message: 'CV uploaded successfully', cvUrl });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Browse available jobs
const browseJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'open' })
            .populate('employer', 'name')
            .populate('requiredSkills', 'name');
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Submit a proposal for a job
const submitProposal = async (req, res) => {
    try {
        const jobId = req.params.jobId || req.body.jobId;
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

        const proposal = new Proposal({ jobId, studentId: req.user?.id, details });
        await proposal.save();

        if (req.user?.id) {
            job.applicants.push(req.user.id);
        }
        await job.save();

        res.status(201).json(proposal);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// View proposals for the student
const getStudentProposals = async (req, res) => {
    try {
        const studentId = req.params.id;
        if (req.user?.id !== studentId && req.user?.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized to view these proposals' });
        }
        const proposals = await Proposal.find({ studentId })
            .populate('jobId', 'title status')
            .sort({ createdAt: -1 });
        res.status(200).json(proposals);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    getStudentProfile,
    updateStudentProfile,
    uploadStudentCV,
    browseJobs,
    submitProposal,
    getStudentProposals,
};
