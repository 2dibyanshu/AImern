const express = require('express');
const { register, login, getUser, addModel, getModels, getModelMetrics } = require('../controllers/userController.js');
const auth = require('../middleware/auth.js');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/:email', auth, getUser);
router.post('/:email/newModel', auth, addModel);
router.get('/:email/models', auth, getModels);
router.get('/:email/:modelName/metrics', auth, getModelMetrics);


module.exports = router;