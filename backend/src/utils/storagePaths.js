const path = require('path');
const fs = require('fs');

const repoRoot = path.join(__dirname, '..', '..');

const resolvePath = (value, fallback) => {
    if (value && String(value).trim()) {
        return path.resolve(String(value).trim());
    }

    return fallback;
};

const ensureDirectory = (dirPath) => {
    if (fs.existsSync(dirPath)) {
        const stat = fs.lstatSync(dirPath);
        if (!stat.isDirectory()) {
            const backupPath = `${dirPath}.bak-${Date.now()}`;
            fs.renameSync(dirPath, backupPath);
        }
    }

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const getUploadsRoot = () => resolvePath(process.env.UPLOADS_ROOT, path.join(repoRoot, 'uploads'));

const getInterviewUploadsDir = () => resolvePath(
    process.env.INTERVIEW_UPLOADS_DIR,
    path.join(getUploadsRoot(), 'videos')
);

const getTopupUploadsDir = () => resolvePath(
    process.env.TOPUP_UPLOADS_DIR,
    path.join(repoRoot, 'private', 'topups')
);

module.exports = {
    ensureDirectory,
    getInterviewUploadsDir,
    getTopupUploadsDir,
    getUploadsRoot,
};