const axios = require('axios');

const GEMINI_API_URL = process.env.GEMINI_API_URL || 'https://api.gemini.com/v1';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

/**
 * Function to fetch interview questions from the Google Gemini API.
 * @param skill - The skill for which to fetch interview questions.
 * @returns A promise that resolves to the interview questions.
 */
const fetchInterviewQuestions = async (skill) => {
    try {
        const response = await axios.get(`${GEMINI_API_URL}/interview-questions`, {
            headers: {
                'Authorization': `Bearer ${GEMINI_API_KEY}`,
            },
            params: {
                skill,
            },
        });
        return response.data.questions;
    } catch (error) {
        console.error('Error fetching interview questions:', error);
        throw new Error('Could not fetch interview questions');
    }
};

module.exports = {
    fetchInterviewQuestions,
};
