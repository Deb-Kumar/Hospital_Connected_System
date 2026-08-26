const fs = require('fs');
const path = require('path');

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
 * Deletes a doctor photo file from uploads/doctors if it exists locally.
 * @param {string} relativePath e.g. "/uploads/doctors/dr_12345.jpg"
 */
function deleteDoctorPhotoFile(relativePath) {
  if (!relativePath || typeof relativePath !== 'string') return;
  if (!relativePath.startsWith('/uploads/doctors/')) return;

  const fileName = path.basename(relativePath);
  const filePath = path.join(DOCTOR_UPLOAD_DIR, fileName);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted doctor photo file: ${filePath}`);
    }
  } catch (err) {
    console.error('Failed to delete doctor photo file:', err);
  }
}

/**
 * Saves a pending sign-up doctor photo with timestamp filename format dr_<timestamp>.<ext>
 * @param {string} photoInput base64
 * @returns {Promise<string>} public URL path
 */
async function savePendingDoctorPhoto(photoInput) {
  if (!photoInput || typeof photoInput !== 'string') return '';
  if (photoInput.startsWith('http://') || photoInput.startsWith('https://') || photoInput.startsWith('/uploads/')) {
    return photoInput;
  }

  let ext = 'jpg';
  let base64Data = photoInput;
  if (photoInput.includes(';base64,')) {
    const parts = photoInput.split(';base64,');
    const mime = parts[0].replace('data:', '').toLowerCase();
    if (mime.includes('png')) ext = 'png';
    base64Data = parts[1];
  }

  try {
    const buffer = Buffer.from(base64Data, 'base64');
    if (!buffer || buffer.length === 0) return '';

    ensureDoctorDir();
    const filename = `dr_${Date.now()}.${ext}`;
    const filePath = path.join(DOCTOR_UPLOAD_DIR, filename);
    fs.writeFileSync(filePath, buffer);

    console.log(`✅ Saved pending doctor photo to disk: ${filePath}`);
    return `/uploads/doctors/${filename}`;
  } catch (err) {
    console.error('❌ Failed to save pending doctor photo:', err);
    return '';
  }
}

/**
 * Renames / promotes a timestamped pending doctor photo (dr_<timestamp>.jpg) to dr_<doctor_name>.jpg
 * @param {string} currentPath e.g. "/uploads/doctors/dr_1787780218766.jpg"
 * @param {string} doctorName e.g. "Keya Ghosh"
 * @returns {string} new relative URL path e.g. "/uploads/doctors/dr_keya_ghosh.jpg"
 */
function promoteApprovedDoctorPhoto(currentPath, doctorName) {
  if (!currentPath || typeof currentPath !== 'string' || !doctorName) return currentPath || '';
  if (!currentPath.startsWith('/uploads/doctors/')) return currentPath;

  const currentFilename = path.basename(currentPath);
  const currentFilePath = path.join(DOCTOR_UPLOAD_DIR, currentFilename);

  if (!fs.existsSync(currentFilePath)) return currentPath;

  let ext = path.extname(currentFilename) || '.jpg';
  let cleanName = doctorName.toLowerCase().replace(/^dr\.\s+/i, '').replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
  const newFilename = `dr_${cleanName}${ext}`;
  const newFilePath = path.join(DOCTOR_UPLOAD_DIR, newFilename);

  try {
    if (currentFilePath !== newFilePath) {
      if (fs.existsSync(newFilePath)) {
        fs.unlinkSync(newFilePath);
      }
      fs.renameSync(currentFilePath, newFilePath);
      console.log(`🔄 Promoted pending photo ${currentFilename} -> ${newFilename}`);
    }
    return `/uploads/doctors/${newFilename}`;
  } catch (err) {
    console.error('Failed to promote approved doctor photo:', err);
    return currentPath;
  }
}

/**
 * Saves a doctor profile photo (base64 string or URL) with filename dr_<doctor_name>.<ext>.
 * Deletes old photo file if oldPhotoPath is provided and differs.
 * @param {string} photoInput
 * @param {string} doctorName
 * @param {string} oldPhotoPath
 * @returns {Promise<string>} public URL path of saved image file
 */
async function saveDoctorPhoto(photoInput, doctorName = '', oldPhotoPath = '') {
  if (!photoInput || typeof photoInput !== 'string') return '';
  
  if (photoInput.startsWith('http://') || photoInput.startsWith('https://') || photoInput.startsWith('/uploads/')) {
    return photoInput;
  }

  let ext = 'jpg';
  let base64Data = photoInput;

  if (photoInput.includes(';base64,')) {
    const parts = photoInput.split(';base64,');
    const mime = parts[0].replace('data:', '').toLowerCase();
    if (mime.includes('png')) {
      ext = 'png';
    } else {
      ext = 'jpg';
    }
    base64Data = parts[1];
  }

  try {
    const buffer = Buffer.from(base64Data, 'base64');
    if (!buffer || buffer.length === 0) return '';

    ensureDoctorDir();

    // Delete old photo if provided and located in /uploads/doctors/
    if (oldPhotoPath && oldPhotoPath.startsWith('/uploads/doctors/')) {
      deleteDoctorPhotoFile(oldPhotoPath);
    }

    let sanitizedName = 'doctor';
    if (doctorName) {
      sanitizedName = doctorName.toLowerCase().replace(/^dr\.\s+/i, '').replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
      if (!sanitizedName.startsWith('dr_')) {
        sanitizedName = `dr_${sanitizedName}`;
      }
    } else {
      sanitizedName = `dr_${Date.now()}`;
    }

    const filename = `${sanitizedName}.${ext}`;
    const filePath = path.join(DOCTOR_UPLOAD_DIR, filename);

    // If file with same filename exists, delete it before overwriting
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }

    fs.writeFileSync(filePath, buffer);

    console.log(`✅ Saved doctor photo to disk: ${filePath} (${buffer.length} bytes)`);
    return `/uploads/doctors/${filename}`;
  } catch (err) {
    console.error('❌ Failed to save doctor photo file:', err);
    return '';
  }
}

/**
 * Uploads a file buffer and returns a publicly-accessible URL.
 */
async function uploadMedicalRecordFile(buffer, originalName, mimeType) {
  if (isCloudinaryConfigured()) {
    return new Promise((resolve, reject) => {
      const uploadStream = getCloudinary().uploader.upload_stream(
        {
          folder: 'hospital-connected-system/medical-records',
          resource_type: 'auto',
          filename_override: originalName,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          resolve(result.secure_url);
        }
      );
      uploadStream.end(buffer);
    });
  }

  ensureLocalDir();
  const ext = path.extname(originalName) || '';
  const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${Date.now()}_${baseName}${ext}`;
  const filePath = path.join(LOCAL_UPLOAD_DIR, fileName);

  fs.writeFileSync(filePath, buffer);
  return `/uploads/medical-records/${fileName}`;
}

module.exports = {
  uploadMedicalRecordFile,
  saveDoctorPhoto,
  savePendingDoctorPhoto,
  promoteApprovedDoctorPhoto,
  deleteDoctorPhotoFile,
  isCloudinaryConfigured,
};
