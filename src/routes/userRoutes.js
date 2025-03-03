const express = require('express');
const { createUser, getAllUsers, getUsersNearLocation } = require('../controllers/userController');
const router = express.Router();

// Add a user
router.post('/add', createUser);

// Get all users
router.get('/list', getAllUsers);

// find users near location
router.get('/near', getUsersNearLocation);

module.exports = router;
