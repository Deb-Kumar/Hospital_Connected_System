const fs = require('fs');
const path = require('path');

// Cloudinary is used when credentials are present (works on Render, since it
// doesn't rely on the local disk, which is ephemeral there). If credentials
// are absent, we fall back to local disk under /uploads — fine for local dev,
// NOT durable in production. This mirrors the pattern from the AI Study
// Assistant project's Cloudinary integration.
let cloudinary = null;
function isCloudinaryConfigured() {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

function getCloudinary() {
  if (!cloudinary) {
    cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
  return cloudinary;
}

const LOCAL_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'medical-records');

const DOCTOR_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'doctors');

function ensureLocalDir() {
  if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
    fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
  }
}

function ensureDoctorDir() {
  if (!fs.existsSync(DOCTOR_UPLOAD_DIR)) {
    fs.mkdirSync(DOCTOR_UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Saves a doctor profile photo (base64 string or URL) to the uploads/doctors folder.
 * @param {string} photoInput
 * @returns {Promise<string>} public URL path of saved image file
 */
async function saveDoctorPhoto(photoInput) {
  if (!photoInput || typeof photoInput !== 'string') return '';
  
  if (photoInput.startsWith('http://') || photoInput.startsWith('https://') || photoInput.startsWith('/uploads/')) {
    return photoInput;
  }

  let mimeType = 'image/jpeg';
  let ext = 'jpg';
  let base64Data = photoInput;

  const matches = photoInput.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (matches) {
    mimeType = matches[1];
    ext = mimeType.split('/')[1] || 'jpg';
    if (ext === 'jpeg') ext = 'jpg';
    base64Data = matches[2];
  }

  try {
    const buffer = Buffer.from(base64Data, 'base64');

    if (isCloudinaryConfigured()) {
      const cld = getCloudinary();
      const url = await new Promise((resolve, reject) => {
        const stream = cld.uploader.upload_stream(
          { folder: 'hospital-doctor-photos', resource_type: 'image' },
          (err, result) => (err ? reject(err) : resolve(result.secure_url))
        );
        stream.end(buffer);
      });
      return url;
    }

    ensureDoctorDir();
    const filename = `doctor-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
    const filePath = path.join(DOCTOR_UPLOAD_DIR, filename);
    fs.writeFileSync(filePath, buffer);

    return `/uploads/doctors/${filename}`;
  } catch (err) {
    console.error('Failed to save doctor photo file:', err);
    return '';
  }
}

/**
 * Uploads a file buffer and returns a publicly-accessible URL.
 * @param {Buffer} buffer
 * @param {string} originalName
 * @param {string} mimeType
 * @returns {Promise<{ url: string, storage: 'cloudinary' | 'local' }>}
 */
async function uploadMedicalRecordFile(buffer, originalName, mimeType) {
  if (isCloudinaryConfigured()) {
    const cld = getCloudinary();
    const resourceType = mimeType && mimeType.startsWith('image/') ? 'image' : 'raw';
    const url = await new Promise((resolve, reject) => {
      const stream = cld.uploader.upload_stream(
        { folder: 'hospital-medical-records', resource_type: resourceType },
        (err, result) => (err ? reject(err) : resolve(result.secure_url))
      );
      stream.end(buffer);
    });
    return { url, storage: 'cloudinary' };
  }

  // Local-disk fallback — dev only. Render's filesystem is ephemeral, so this
  // will NOT survive a redeploy/restart in production. Set the CLOUDINARY_*
  // env vars to use durable storage.
  ensureLocalDir();
  const safeName = `${Date.now()}-${originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
  const filePath = path.join(LOCAL_UPLOAD_DIR, safeName);
  fs.writeFileSync(filePath, buffer);
  return { url: `/uploads/medical-records/${safeName}`, storage: 'local' };
}

module.exports = { uploadMedicalRecordFile, saveDoctorPhoto, isCloudinaryConfigured };
