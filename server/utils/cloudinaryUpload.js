const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PassThrough } = require('stream');
const cloudinary = require('../config/cloudinary');

const isCloudinaryConfigured = () => {
  const { CLOUDINARY_API_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_SECRET } = process.env;
  return (
    Boolean(CLOUDINARY_API_KEY) &&
    CLOUDINARY_API_KEY !== 'your_api_key' &&
    Boolean(CLOUDINARY_CLOUD_NAME) &&
    CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
    Boolean(CLOUDINARY_API_SECRET) &&
    CLOUDINARY_API_SECRET !== 'your_api_secret'
  );
};

const saveLocalBuffer = async (buffer) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.png`;
  const filePath = path.join(uploadsDir, filename);
  await fs.promises.writeFile(filePath, buffer);
  return {
    secure_url: `/uploads/${filename}`,
    public_id: filename,
  };
};

const uploadBuffer = async (buffer, folder) => {
  if (!isCloudinaryConfigured()) {
    return saveLocalBuffer(buffer);
  }

  try {
    return await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
      const pass = new PassThrough();
      pass.end(buffer);
      pass.pipe(uploadStream);
    });
  } catch (err) {
    console.warn(`Cloudinary upload failed (${err.message}). Falling back to local storage.`);
    return saveLocalBuffer(buffer);
  }
};

const destroy = async (publicId) => {
  if (!publicId) return;

  // If stored locally
  const localFilePath = path.join(__dirname, '..', 'uploads', publicId);
  if (fs.existsSync(localFilePath)) {
    try {
      await fs.promises.unlink(localFilePath);
      return;
    } catch (_) {}
  }

  // If in Cloudinary
  if (isCloudinaryConfigured()) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (_) {}
  }
};

module.exports = { uploadBuffer, destroy };
