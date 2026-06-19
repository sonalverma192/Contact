const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Contact = require('../models/Contact');

/**
 * @route   POST /api/contacts/add
 * @desc    Create a new contact
 * @access  Public
 */
router.post('/add', async (req, res) => {
  try {
    const { name, email, phone, address, gender } = req.body;

    // Simple validation to ensure Name is provided
    if (!name) {
      return res.status(400).json({ message: 'Name is a required field' });
    }

    // Create a new contact instance
    const newContact = new Contact({
      name,
      email,
      phone,
      address,
      gender,
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
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, gender } = req.body;

    // Handle invalid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Contact ID format' });
    }

    // Find contact by ID and update it. Run schema validators to ensure name isn't set to empty.
    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { name, email, phone, address, gender },
      { new: true, runValidators: true }
    );

    // Return 404 if contact does not exist
    if (!updatedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

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

    // Find and delete the contact by its ID
    const deletedContact = await Contact.findByIdAndDelete(id);

    // Return 404 if contact does not exist
    if (!deletedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    return res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    // Handle server errors
    return res.status(500).json({ message: 'Server error occurred while deleting contact', error: error.message });
  }
});

module.exports = router;
