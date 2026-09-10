const express = require('express');
const router = express.Router();
const {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  getJobById
} = require('../controllers/jobController');
const { getJobApplicants } = require('../controllers/applicationController');
const { protect, requireRole } = require('../middleware/auth');

// Public routes
router.get('/', getJobs);
router.get('/:id', getJobById);

// Protected routes (Company only)
router.get('/:id/applicants', protect, requireRole('company'), getJobApplicants);
router.post('/', protect, requireRole('company'), createJob);
router.put('/:id', protect, requireRole('company'), updateJob);
router.delete('/:id', protect, requireRole('company'), deleteJob);

module.exports = router;
