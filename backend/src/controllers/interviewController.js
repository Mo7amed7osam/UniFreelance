const Interview = require('../models/Interview');

const uploadInterviewVideo = async (req, res) => {
    const { questionIndex } = req.body;
    const { id } = req.params;
    const videoFile = req.file;

    try {
        if (!videoFile) {
            return res.status(400).json({ message: 'No video uploaded' });
        }
        if (questionIndex === undefined) {
            return res.status(400).json({ message: 'Question index is required' });
        }

        const interview = await Interview.findById(id);
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

const submitInterview = async (req, res) => {
    const { id } = req.params;

    try {
        const interview = await Interview.findById(id);
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        if (interview.studentId.toString() !== req.user?.id) {
            return res.status(403).json({ message: 'Not authorized to submit this interview' });
        }
        if (interview.isSubmitted) {
            return res.status(400).json({ message: 'Interview already submitted' });
        }
        if (interview.responses.length !== interview.questions.length) {
            return res.status(400).json({ message: 'All questions must have videos before submission' });
        }

        interview.isCompleted = true;
        interview.isSubmitted = true;
        interview.reviewStatus = 'pending';
        await interview.save();

        res.status(200).json({ message: 'Interview submitted for review', interviewId: interview._id });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting interview', error });
    }
};

module.exports = {
    uploadInterviewVideo,
    submitInterview,
};
