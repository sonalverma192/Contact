const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary using a stream.
 * @param {Buffer} fileBuffer - The buffer of the uploaded file.
 * @returns {Promise<Object>} The Cloudinary upload result object.
 */
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'contacts' },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes an image from Cloudinary using its public ID.
 * @param {string} publicId - The public ID of the image to be deleted.
 * @returns {Promise<Object>} The Cloudinary destroy result object.
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error(`[Cloudinary Deletion Error] Failed to delete image: ${error.message}`);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
};
