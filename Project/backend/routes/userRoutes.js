const express = require('express');
const { register, login, getUser, addModel } = require('../controllers/userController.js');
const auth = require('../middleware/auth.js');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/:email', auth, getUser);
router.post('/:email/models', auth, addModel);

module.exports = router;