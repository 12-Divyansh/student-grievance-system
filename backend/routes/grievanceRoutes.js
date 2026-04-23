const express = require('express');
const router = express.Router();
const grievanceController = require('../controllers/grievanceController');
const auth = require('../middleware/authMiddleware');

// @route   POST /api/grievances
// @desc    Submit a new grievance
// @access  Private
router.post('/grievances', auth, grievanceController.submitGrievance);

// @route   GET /api/grievances/search
// @desc    Search grievance
// @access  Private
router.get('/grievances/search', auth, grievanceController.searchGrievances);

// @route   GET /api/grievances
// @desc    Get all user grievances
// @access  Private
router.get('/grievances', auth, grievanceController.getGrievances);

// @route   GET /api/grievances/:id
// @desc    Get grievance by ID
// @access  Private
router.get('/grievances/:id', auth, grievanceController.getGrievanceById);

// @route   PUT /api/grievances/:id
// @desc    Update grievance
// @access  Private
router.put('/grievances/:id', auth, grievanceController.updateGrievance);

// @route   DELETE /api/grievances/:id
// @desc    Delete grievance
// @access  Private
router.delete('/grievances/:id', auth, grievanceController.deleteGrievance);

module.exports = router;
