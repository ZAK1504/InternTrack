const Job = require('../models/Job');

// @route   GET /api/jobs
// @desc    Get all jobs (public, with filters)
const getJobs = async (req, res) => {
  try {
    const { location, type, search } = req.query;
    let query = {};

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (type) {
      query.type = type;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } }
      ];
    }

    const jobs = await Job.find(query).populate('company', 'name companyName');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/jobs
// @desc    Create a job (company only)
const createJob = async (req, res) => {
  try {
    const { title, description, location, type, skills } = req.body;

    // Convert comma-separated string to array if necessary, or assume it's already an array
    let skillsArray = skills;
    if (typeof skills === 'string') {
      skillsArray = skills.split(',').map(s => s.trim());
    }

    const job = await Job.create({
      company: req.user.userId, // From auth middleware
      title,
      description,
      location,
      type,
      skills: skillsArray
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/jobs/:id
// @desc    Update a job (company only, owner check)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if the logged in user is the owner of the job
    if (job.company.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/jobs/:id
// @desc    Delete a job (company only, owner check)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if the logged in user is the owner of the job
    if (job.company.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();

    res.json({ message: 'Job removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/jobs/:id
// @desc    Get job by ID (public)
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('company', 'name companyName email');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  getJobById
};
