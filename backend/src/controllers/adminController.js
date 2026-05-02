const User = require('../models/User');
const Job = require('../models/Job');
const Skill = require('../models/Skill');
const {
    getInterviewSession,
    listCompletedInterviewsForAdmin,
    reviewInterviewSession,
} = require('../modules/ai-interview/interview.service');

// Function to review an interview
const reviewInterview = async (req, res) => {
    const { interviewId } = req.params;
    const { score, status } = req.body;

    try {
        const result = await reviewInterviewSession({
            sessionId: interviewId,
            reviewerId: req.user?.id,
            score,
            status,
        });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.status || 500).json({ success: false, message: error.message || 'Server error' });
    }
};

// Function to get all submitted interviews
const getSubmittedInterviews = async (req, res) => {
    try {
        const status = (req.query.status || '').toString().toUpperCase();
        const interviews = await listCompletedInterviewsForAdmin(status);
        return res.status(200).json(interviews);
    } catch (error) {
        return res.status(error.status || 500).json({ success: false, message: error.message || 'Server error' });
    }
};

// Function to get a specific interview by ID
const getInterviewById = async (req, res) => {
    const { interviewId } = req.params;

    try {
        const result = await getInterviewSession(interviewId, { id: req.user?.id, role: 'Admin' });
        return res.status(200).json(result.session);
    } catch (error) {
        return res.status(error.status || 500).json({ success: false, message: error.message || 'Server error' });
    }
};

// Admin: list users
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

// Admin: list jobs
const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate('employer', 'name email')
            .populate('requiredSkills', 'name')
            .populate('selectedStudent', 'name email');
        return res.status(200).json(jobs);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

// Admin: delete user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

// Admin: delete job
const deleteJob = async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        return res.status(200).json({ message: 'Job deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

// Admin: create a new skill
const createSkill = async (req, res) => {
    try {
        const name = (req.body?.name || '').trim();
        const description = (req.body?.description || '').trim();

        if (!name || !description) {
            return res.status(400).json({ message: 'Name and description are required' });
        }

        const existing = await Skill.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existing) {
            return res.status(400).json({ message: 'Skill already exists' });
        }

        const skill = new Skill({ name, description });
        await skill.save();
        return res.status(201).json(skill);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    reviewInterview,
    getSubmittedInterviews,
    getInterviewById,
    getUsers,
    getJobs,
    deleteUser,
    deleteJob,
    createSkill,
};
