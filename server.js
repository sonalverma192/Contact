const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const contactRoutes = require('./routes/contactRoutes');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB Database
connectDB();

// Initialize the Express application
const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Middleware to automatically parse incoming JSON request bodies
app.use(express.json());

// Mount the contact API routes
app.use('/api/contacts', contactRoutes);

// Root route for simple API check
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Contact Management API',
    version: '1.0.0',
    endpoints: {
      getAllContacts: 'GET /api/contacts',
      getSingleContact: 'GET /api/contacts/:id',
      createContact: 'POST /api/contacts/add',
      updateContact: 'PUT /api/contacts/:id',
      deleteContact: 'DELETE /api/contacts/:id'
    }
  });
});

// Define the port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;

// Start the Express server
app.listen(PORT, () => {
  console.log(`[Server Running] Listening on port ${PORT}`);
});
