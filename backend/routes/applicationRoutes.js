const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  applyToJob,
  getMyApplications,
  updateApplicationStatus,
  rescoreApplication
} = require('../controllers/applicationController');
const { protect, requireRole } = require('../middleware/auth');

// @route   POST /api/applications
router.post('/', protect, requireRole('student'), upload.single('resume'), applyToJob);

// @route   GET /api/applications/mine
router.get('/mine', protect, requireRole('student'), getMyApplications);

// @route   PATCH /api/applications/:id/status
router.patch('/:id/status', protect, requireRole('company'), updateApplicationStatus);

// @route   POST /api/applications/:id/rescore
router.post('/:id/rescore', protect, requireRole('company'), rescoreApplication);

module.exports = router;

