const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const axios = require('axios');
const ffmpegStatic = require('ffmpeg-static');
const { ensureDirectory, getInterviewUploadsDir, getUploadsRoot } = require('../../utils/storagePaths');
const { uploadInterviewVideo, isCloudinaryConfigured } = require('./cloudinary.service');

const resolvedFfmpegPath = process.env.FFMPEG_PATH || ffmpegStatic;
const publicUploadsBaseUrl = (process.env.UPLOADS_PUBLIC_BASE_URL || '').trim().replace(/\/$/, '');

ensureDirectory(getUploadsRoot());
ensureDirectory(getInterviewUploadsDir());

const toPublicUploadUrl = (file) => {
  if (!file?.filename) {
    return null;
  }

  const normalizedDestination = (file.destination || '').replace(/\\/g, '/');
  const folderName = normalizedDestination.split('/').pop() || 'videos';
  const relativePath = `/uploads/${folderName}/${file.filename}`;

  if (publicUploadsBaseUrl) {
    return `${publicUploadsBaseUrl}${relativePath}`;
  }

  return relativePath;
};

const toAbsolutePath = (file) => {
  if (file?.path) {
    return file.path;
  }
  if (!file?.filename) {
    return null;
  }
  return path.join(getInterviewUploadsDir(), file.filename);
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

const cleanupUploadedFile = async (filePath) => {
  if (!filePath) {
    return;
  }

  await fs.promises.unlink(filePath).catch(() => undefined);
};

const runFfmpeg = (args) =>
  new Promise((resolve, reject) => {
    if (!resolvedFfmpegPath) {
      reject(new Error('FFmpeg binary not available. Install dependency or set FFMPEG_PATH.'));
      return;
    }

    const cmd = `${resolvedFfmpegPath} ${args.join(' ')}`;
    const ffmpegProcess = spawn(resolvedFfmpegPath, args, {
      stdio: ['ignore', 'ignore', 'pipe'],
    });

    let stderr = '';

    ffmpegProcess.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    ffmpegProcess.on('error', (error) => {
      console.error('[ffmpeg] process error:', cmd, error && error.message);
      reject(error);
    });

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      const message = stderr.trim() || `ffmpeg exited with code ${code}`;
      // Log command and stderr for easier debugging in production
      console.error('[ffmpeg] command:', cmd);
      console.error('[ffmpeg] stderr:', message);
      reject(new Error(message));
    });
  });

// Probe video for audio stream by running ffmpeg -i and inspecting stderr for 'Audio:'
const probeForAudio = (videoPath) =>
  new Promise((resolve) => {
    if (!resolvedFfmpegPath) {
      resolve({ hasAudio: false, stderr: 'FFmpeg binary not available' });
      return;
    }

    const ff = spawn(resolvedFfmpegPath, ['-i', videoPath], { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    ff.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    ff.on('close', () => {
      const hasAudio = /Audio:|Stream #\d+:\d+.*Audio:/i.test(stderr);
      resolve({ hasAudio, stderr: stderr.trim() });
    });
    ff.on('error', (err) => {
      resolve({ hasAudio: false, stderr: String(err && err.message) });
    });
  });

const extractAudioFromVideo = async (videoPath) => {
  if (!videoPath) {
    throw new Error('Video path is required for audio extraction.');
  }

  // If the path looks like a remote URL, download it first
  let localVideoPath = videoPath;
  let downloadedTempDir = null;

  if (/^https?:\/\//i.test(videoPath)) {
    downloadedTempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'unifreelance-ai-video-'));
    localVideoPath = path.join(downloadedTempDir, 'remote_video');
    const writer = fs.createWriteStream(localVideoPath);
    const resp = await axios({ method: 'get', url: videoPath, responseType: 'stream', timeout: 20000 });
    await new Promise((resolve, reject) => {
      resp.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  // Ensure the file exists and is readable
  try {
    await fs.promises.access(localVideoPath, fs.constants.R_OK);
  } catch (err) {
    if (downloadedTempDir) await cleanupTemporaryArtifacts(downloadedTempDir);
    throw new Error('Video file is not accessible for audio extraction.');
  }

  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'unifreelance-ai-audio-'));
  const audioPath = path.join(tempDir, 'answer.wav');

  // Ensure tempDir is writable
  try {
    await fs.promises.access(tempDir, fs.constants.W_OK);
  } catch (err) {
    if (downloadedTempDir) await cleanupTemporaryArtifacts(downloadedTempDir);
    await cleanupTemporaryArtifacts(tempDir);
    throw new Error('Temporary directory not writable for audio extraction.');
  }

  try {
    // Probe for audio before attempting extraction
    const probe = await probeForAudio(localVideoPath);
    if (!probe.hasAudio) {
      await cleanupTemporaryArtifacts(downloadedTempDir);
      return {
        noAudio: true,
        reason: 'Uploaded camera video does not contain an audio track.',
        stderr: probe.stderr,
      };
    }

    const args = [
      '-y',
      '-i',
      localVideoPath,
      '-vn',
      '-acodec',
      'pcm_s16le',
      '-ar',
      '16000',
      '-ac',
      '1',
      audioPath,
    ];
    console.log('[ffmpeg] running:', `${resolvedFfmpegPath} ${args.join(' ')}`);
    await runFfmpeg(args);

    return {
      audioPath,
      audioMimeType: 'audio/wav',
      tempDir,
      downloadedTempDir,
    };
  } catch (error) {
    await cleanupTemporaryArtifacts(tempDir, downloadedTempDir);
    throw new Error(`Audio extraction failed: ${error.message}`);
  }
};

const persistInterviewVideo = async ({ filePath, sessionId, questionId, kind }) => {
  const publicId = `${sessionId}/${questionId}/${kind}`;
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || `unifreelance/interviews/${sessionId}/${questionId}`;
  const cloudinaryResult = await uploadInterviewVideo({
    filePath,
    publicId,
    folder,
  });

  if (cloudinaryResult) {
    await cleanupUploadedFile(filePath);
    return {
      url: cloudinaryResult.url,
      publicId: cloudinaryResult.publicId,
      storage: 'cloudinary',
    };
  }

  return {
    url: null,
    publicId: null,
    storage: isCloudinaryConfigured ? 'cloudinary' : 'local',
  };
};

module.exports = {
  cleanupTemporaryArtifacts,
  cleanupUploadedFile,
  extractAudioFromVideo,
  persistInterviewVideo,
  readFileAsBase64,
  toAbsolutePath,
  toPublicUploadUrl,
};
