const axios = require('axios');

const GEMINI_API_URL = process.env.GEMINI_API_URL || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const fallbackQuestions = (skill) => ([
    `Explain a recent project where you used ${skill}.`,
    `What are common challenges when working with ${skill} and how do you handle them?`,
    `Describe a best practice you follow when using ${skill}.`,
    `How do you stay current with ${skill} updates and community trends?`,
]);

// Function to fetch interview questions from the Google Gemini API
const getInterviewQuestions = async (skill) => {
    if (!GEMINI_API_URL || !GEMINI_API_KEY) {
        return fallbackQuestions(skill);
    }

    try {
        const response = await axios.post(
            GEMINI_API_URL,
            { skill },
            { headers: { Authorization: `Bearer ${GEMINI_API_KEY}` } }
        );

        if (Array.isArray(response.data?.questions)) {
            return response.data.questions;
        }

        return fallbackQuestions(skill);
    } catch (error) {
        console.error('Error fetching interview questions:', error);
        return fallbackQuestions(skill);
    }
};

module.exports = {
    getInterviewQuestions,
};
