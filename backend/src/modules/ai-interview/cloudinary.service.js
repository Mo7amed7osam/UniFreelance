const cloudinary = require('cloudinary').v2;

const cloudinaryUrl = (process.env.CLOUDINARY_URL || '').trim();

const isCloudinaryConfigured = Boolean(
    cloudinaryUrl || (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    )
);

if (isCloudinaryConfigured) {
    if (cloudinaryUrl) {
        process.env.CLOUDINARY_URL = cloudinaryUrl;
        cloudinary.config();
    } else {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
        });
    }
}

const uploadInterviewVideo = async ({ filePath, publicId, folder }) => {
    if (!isCloudinaryConfigured) {
        return null;
    }

    const targetFolder = (folder || process.env.CLOUDINARY_UPLOAD_FOLDER || 'unifreelance/interviews').replace(/\/$/, '');

    const result = await cloudinary.uploader.upload(filePath, {
        resource_type: 'video',
        folder: targetFolder,
        public_id: publicId,
        overwrite: true,
    });

    return {
        url: result.secure_url,
        publicId: result.public_id,
    };
};

module.exports = {
    isCloudinaryConfigured,
    uploadInterviewVideo,
};