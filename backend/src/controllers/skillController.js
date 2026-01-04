const Skill = require('../models/Skill');
const Interview = require('../models/Interview');
const { getInterviewQuestions } = require('../services/geminiService');

// Fetch all available skills
const getSkills = async (req, res) => {
    try {
        const skills = await Skill.find();
        res.status(200).json(skills);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching skills', error });
    }
};

// Start skill verification interview
const startInterview = async (req, res) => {
    const { skillId } = req.params;

    try {
        const skill = await Skill.findById(skillId);
        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }

        const questions = await getInterviewQuestions(skill.name);
        const interview = new Interview({
            studentId: req.user?.id,
            skillId: skill._id,
            questions,
            responses: [],
        });
        await interview.save();

        res.status(200).json({ interviewId: interview._id, questions });
    } catch (error) {
        res.status(500).json({ message: 'Error starting interview', error });
    }
};

// Upload video response for the interview
const uploadInterviewVideo = async (req, res) => {
    const { interviewId } = req.body;
    const { questionIndex } = req.body;
    const videoFile = req.file;

    try {
        if (!videoFile) {
            return res.status(400).json({ message: 'No video uploaded' });
        }
        if (interviewId === undefined || questionIndex === undefined) {
            return res.status(400).json({ message: 'Interview ID and question index are required' });
        }

        const interview = await Interview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        if (interview.studentId.toString() !== req.user?.id) {
            return res.status(403).json({ message: 'Not authorized to upload for this interview' });
        }
        if (interview.isSubmitted) {
            return res.status(400).json({ message: 'Interview already submitted' });
        }

        const questionIdx = Number(questionIndex);
        if (Number.isNaN(questionIdx) || questionIdx < 0 || questionIdx >= interview.questions.length) {
            return res.status(400).json({ message: 'Invalid question index' });
        }

        const nextRequiredIndex = interview.responses.length;
        if (questionIdx !== nextRequiredIndex) {
            return res.status(400).json({ message: 'You must answer questions in order without skipping' });
        }

        const videoUrl = `/uploads/videos/${videoFile.filename}`;
        interview.responses.push({ question: interview.questions[questionIdx], videoUrl });

        if (interview.responses.length === interview.questions.length) {
            interview.isCompleted = true;
        }

        await interview.save();
        res.status(201).json({ message: 'Video uploaded successfully', videoUrl, isCompleted: interview.isCompleted });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading video', error });
    }
};

const getInterviewById = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.interviewId)
            .populate('skillId', 'name');
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        if (interview.studentId.toString() !== req.user?.id) {
            return res.status(403).json({ message: 'Not authorized to view this interview' });
        }
        res.status(200).json(interview);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching interview', error });
    }
};

module.exports = {
    getSkills,
    startInterview,
    uploadInterviewVideo,
    getInterviewById,
};
