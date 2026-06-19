const mongoose = require('mongoose');

/**
 * Connects to MongoDB database using the MONGO_URI env variable.
 * Uses async/await and handles connection errors using try-catch.
 */
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[Database Connected] MongoDB Connected to host: ${conn.connection.host}`);
  } catch (error) {
    // Log error message if connection fails
    console.error(`[Database Connection Error] ${error.message}`);
    // Exit process with failure code (1)
    process.exit(1);
  }
};

module.exports = connectDB;
