const mongoose = require('mongoose');

// Define the Contact Schema
const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is a required field'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
      trim: true,
    },
    profilePicUrl: {
      type: String,
      trim: true,
    },
    profilePicPublicId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

// Export the Mongoose model
module.exports = mongoose.model('Contact', contactSchema);
