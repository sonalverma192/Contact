const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Contact = require('../models/Contact');
const multer = require('multer');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limit to 5MB
});

/**
 * @route   POST /api/contacts/add
 * @desc    Create a new contact
 * @access  Public
 */
router.post('/add', upload.single('profilePic'), async (req, res) => {
  try {
    const { name, email, phone, address, gender } = req.body;

    // Simple validation to ensure Name is provided
    if (!name) {
      return res.status(400).json({ message: 'Name is a required field' });
    }

    let profilePicUrl = '';
    let profilePicPublicId = '';

    // Upload to Cloudinary if a file was sent
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      profilePicUrl = uploadResult.secure_url;
      profilePicPublicId = uploadResult.public_id;
    }

    // Create a new contact instance
    const newContact = new Contact({
      name,
      email,
      phone,
      address,
      gender,
      profilePicUrl,
      profilePicPublicId,
    });

    // Save the contact to the database
    const savedContact = await newContact.save();
    return res.status(201).json(savedContact);
  } catch (error) {
    // Handle server errors
    return res.status(500).json({ message: 'Server error occurred while adding contact', error: error.message });
  }
});

/**
 * @route   GET /api/contacts
 * @desc    Get all contacts
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Retrieve all contacts from the database
    const contacts = await Contact.find();
    return res.status(200).json(contacts);
  } catch (error) {
    // Handle server errors
    return res.status(500).json({ message: 'Server error occurred while fetching contacts', error: error.message });
  }
});

/**
 * @route   GET /api/contacts/:id
 * @desc    Get a single contact by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Handle invalid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Contact ID format' });
    }

    // Find the contact by its ID
    const contact = await Contact.findById(id);

    // Return 404 if contact does not exist
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    return res.status(200).json(contact);
  } catch (error) {
    // Handle server errors
    return res.status(500).json({ message: 'Server error occurred while retrieving contact', error: error.message });
  }
});

/**
 * @route   PUT /api/contacts/:id
 * @desc    Update a contact's details by ID
 * @access  Public
 */
router.put('/:id', upload.single('profilePic'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, gender } = req.body;

    // Handle invalid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Contact ID format' });
    }

    // Find the contact first to see if it exists and to check the existing profile picture
    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    const updateData = { name, email, phone, address, gender };

    // If a new file is uploaded, set the new one and delete the old one
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      updateData.profilePicUrl = uploadResult.secure_url;
      updateData.profilePicPublicId = uploadResult.public_id;

      // Delete the old profile picture from Cloudinary if it exists
      if (contact.profilePicPublicId) {
        await deleteFromCloudinary(contact.profilePicPublicId);
      }
    }
    // If no new file is uploaded, updateData won't contain profilePicUrl or profilePicPublicId,
    // retaining the existing database values.

    // Update contact. Run schema validators to ensure name isn't set to empty.
    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return res.status(200).json(updatedContact);
  } catch (error) {
    // Handle validation errors (e.g. name removed) or server errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error occurred while updating contact', error: error.message });
  }
});

/**
 * @route   DELETE /api/contacts/:id
 * @desc    Delete a contact by ID
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Handle invalid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Contact ID format' });
    }

    // Find contact to check if there is an image to delete
    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Delete image from Cloudinary if it exists
    if (contact.profilePicPublicId) {
      await deleteFromCloudinary(contact.profilePicPublicId);
    }

    // Delete the contact from database
    await Contact.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    // Handle server errors
    return res.status(500).json({ message: 'Server error occurred while deleting contact', error: error.message });
  }
});

module.exports = router;
