const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const ffmpegStatic = require('ffmpeg-static');

const uploadsRoot = path.join(__dirname, '../../uploads');
const resolvedFfmpegPath = process.env.FFMPEG_PATH || ffmpegStatic;

const toPublicUploadUrl = (file) => {
  if (!file?.filename) {
    return null;
  }

  const normalizedDestination = (file.destination || '').replace(/\\/g, '/');
  const folderName = normalizedDestination.split('/').pop() || 'videos';
  return `/uploads/${folderName}/${file.filename}`;
};

const toAbsolutePath = (file) => {
  if (file?.path) {
    return file.path;
  }
  if (!file?.filename) {
    return null;
  }
  return path.join(uploadsRoot, 'videos', file.filename);
};

const readFileAsBase64 = async (filePath) => {
  const buffer = await fs.promises.readFile(filePath);
  return buffer.toString('base64');
};

const cleanupTemporaryArtifacts = async (...artifactPaths) => {
  await Promise.all(
    artifactPaths
      .filter(Boolean)
      .map((artifactPath) => fs.promises.rm(artifactPath, { force: true, recursive: true }).catch(() => undefined))
  );
};

const runFfmpeg = (args) =>
  new Promise((resolve, reject) => {
    if (!resolvedFfmpegPath) {
      reject(new Error('FFmpeg binary not available. Install dependency or set FFMPEG_PATH.'));
      return;
    }

    const ffmpegProcess = spawn(resolvedFfmpegPath, args, {
      stdio: ['ignore', 'ignore', 'pipe'],
    });

    let stderr = '';

    ffmpegProcess.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    ffmpegProcess.on('error', (error) => {
      reject(error);
    });

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr.trim() || `ffmpeg exited with code ${code}`));
    });
  });

const extractAudioFromVideo = async (videoPath) => {
  if (!videoPath) {
    throw new Error('Video path is required for audio extraction.');
  }

  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'unifreelance-ai-audio-'));
  const audioPath = path.join(tempDir, 'answer.wav');

  try {
    await runFfmpeg([
      '-y',
      '-i',
      videoPath,
      '-vn',
      '-acodec',
      'pcm_s16le',
      '-ar',
      '16000',
      '-ac',
      '1',
      audioPath,
    ]);

    return {
      audioPath,
      audioMimeType: 'audio/wav',
      tempDir,
    };
  } catch (error) {
    await cleanupTemporaryArtifacts(tempDir);
    throw new Error(`Audio extraction failed: ${error.message}`);
  }
};

module.exports = {
  cleanupTemporaryArtifacts,
  extractAudioFromVideo,
  readFileAsBase64,
  toAbsolutePath,
  toPublicUploadUrl,
};
