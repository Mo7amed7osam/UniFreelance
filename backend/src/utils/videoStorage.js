const fs = require('fs');
const path = require('path');

// Define the directory for video uploads
const videoUploadDir = path.join(__dirname, '../../uploads/videos');

/**
 * Ensure the video upload directory exists
 */
const ensureVideoUploadDirExists = () => {
    if (!fs.existsSync(videoUploadDir)) {
        fs.mkdirSync(videoUploadDir, { recursive: true });
    }
};

/**
 * Save video file to the server
 * @param {string} filename - The name of the video file
 * @param {Buffer} data - The video data as a Buffer
 * @returns {Promise<string>} - The path to the saved video file
 */
const saveVideoFile = async (filename, data) => {
    const filePath = path.join(videoUploadDir, filename);
    await fs.promises.writeFile(filePath, data);
    return filePath;
};

/**
 * Get the list of uploaded videos
 * @returns {Promise<string[]>} - An array of video file names
 */
const getUploadedVideos = async () => {
    return await fs.promises.readdir(videoUploadDir);
};

// Ensure the video upload directory exists on module load
ensureVideoUploadDirExists();

module.exports = {
    saveVideoFile,
    getUploadedVideos,
};
