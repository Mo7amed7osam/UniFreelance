const Job = require('../models/Job');
const User = require('../models/User');
const EmailService = require('./emailService');

/**
 * Matches students with job postings based on verified skills.
 * @param jobId - The ID of the job posting.
 * @returns An array of students who match the required skills for the job.
 */
const matchStudentsToJob = async (jobId) => {
    try {
        // Find the job by ID
        const job = await Job.findById(jobId);
        if (!job) {
            throw new Error('Job not found');
        }

        // Extract required skills from the job
        const requiredSkills = job.requiredSkills;

        // Find students who have verified skills matching the job's required skills
        const students = await User.find({
            role: 'Student',
            'verifiedSkills.skill': { $all: requiredSkills }
        }).populate('verifiedSkills.skill', 'name');

        return students;
    } catch (error) {
        const message = error && error.message ? error.message : 'Unknown error';
        throw new Error(`Error matching students to job: ${message}`);
    }
};

/**
 * Sends notifications to matched students about the job posting.
 * @param students - The array of matched students.
 * @param jobTitle - The title of the job posting.
 */
const notifyMatchedStudents = async (students, jobTitle) => {
    for (const student of students) {
        if (!student.email) {
            continue;
        }
        const subject = `New job match: ${jobTitle}`;
        const text = `Hi ${student.name}, a new job that matches your verified skills was posted: ${jobTitle}.`;
        await EmailService.sendEmail(student.email, subject, text);
    }
};

module.exports = {
    matchStudentsToJob,
    notifyMatchedStudents,
};
