import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";

const { CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET, CLOUDINARY_FOLDER, MAX_UPLOAD_SIZE_KB = 10240 } = process.env; // default 10 MB

const cloudName = CLOUDINARY_NAME;
const apiKey = CLOUDINARY_KEY;
const apiSecret = CLOUDINARY_SECRET;
const defaultFolder = CLOUDINARY_FOLDER || "follow-mate";

if (!cloudName || !apiKey || !apiSecret) {
  console.warn("Cloudinary credentials are missing. Uploads will fail.");
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/**
 * Upload file to Cloudinary with optimization and size check.
 * Supports URL strings or Buffers.
 * @param {string|Buffer} fileSource
 * @param {string} folder
 * @param {number} maxSizeKB Maximum allowed file size in KB
 * @returns {Promise<string>} Secure URL of uploaded file
 */
export const uploadToCloudinary = (fileSource, folder = defaultFolder, maxSizeKB = parseInt(MAX_UPLOAD_SIZE_KB)) => {
  if (!cloudName || !apiKey || !apiSecret) {
    return Promise.reject(new Error("Cloudinary credentials are missing."));
  }

  const options = {
    folder,
    resource_type: "auto",
    quality: "auto",
    fetch_format: "auto",
  };

  // Validate file size
  if (Buffer.isBuffer(fileSource)) {
    const sizeKB = fileSource.length / 1024;
    if (sizeKB > maxSizeKB) {
      return Promise.reject(new Error(`File size exceeds maximum of ${maxSizeKB} KB (current: ${Math.round(sizeKB)} KB)`));
    }
  }

  // Upload from URL (size validation not possible reliably)
  if (typeof fileSource === "string") {
    return cloudinary.uploader.upload(fileSource, options).then(res => res.secure_url);
  }

  if (!Buffer.isBuffer(fileSource)) {
    return Promise.reject(new Error("Invalid file source provided to Cloudinary uploader."));
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
    stream.end(fileSource);
  });
};
