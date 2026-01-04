const Interview = require('../models/Interview');
const User = require('../models/User');
const Job = require('../models/Job');
const Skill = require('../models/Skill');

// Function to review an interview
const reviewInterview = async (req, res) => {
    const { interviewId } = req.params;
    const { score, status } = req.body;

    try {
        // Find the interview by ID
        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        if (!interview.isCompleted || !interview.isSubmitted) {
            return res.status(400).json({ message: 'Interview is not submitted yet' });
        }

        if (!['pass', 'fail'].includes(status)) {
            return res.status(400).json({ message: 'Status must be pass or fail' });
        }

        // Update the interview with the score and status
        interview.score = Number(score);
        interview.reviewStatus = status;
        await interview.save();

        // If the interview is passed, update the student's verified skills
        if (status === 'pass') {
            const student = await User.findById(interview.studentId);
            if (student) {
                const alreadyVerified = student.verifiedSkills.some(
                    verified => verified.skill.toString() === interview.skillId.toString()
                );
                if (!alreadyVerified) {
                    student.verifiedSkills.push({ skill: interview.skillId, score });
                }
                await student.save();
            }
        }

        return res.status(200).json({ message: 'Interview reviewed successfully', interview });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

// Function to get all submitted interviews
const getSubmittedInterviews = async (req, res) => {
    try {
        const status = (req.query.status || '').toString().toUpperCase();
        let query = { isCompleted: true, isSubmitted: true, reviewStatus: 'pending' };
        if (status === 'SUBMITTED') {
            query = { isCompleted: true, isSubmitted: true, reviewStatus: 'pending' };
        } else if (status === 'PASSED') {
            query = { isCompleted: true, isSubmitted: true, reviewStatus: 'pass' };
        } else if (status === 'FAILED') {
            query = { isCompleted: true, isSubmitted: true, reviewStatus: 'fail' };
        }

        const interviews = await Interview.find(query)
            .populate('studentId', 'name email')
            .populate('skillId', 'name');
        return res.status(200).json(interviews);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

// Function to get a specific interview by ID
const getInterviewById = async (req, res) => {
    const { interviewId } = req.params;

    try {
        const interview = await Interview.findById(interviewId).populate('studentId skillId');
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        return res.status(200).json(interview);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
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
