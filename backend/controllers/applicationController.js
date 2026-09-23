const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const mammoth = require('mammoth');
const { scoreApplication } = require('../services/aiScoring');

// Extract text from a file (PDF via pdf-parse CLI, DOCX via mammoth, TXT via fs)
async function extractTextFromFile(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();

    // 1. TXT Parsing
    if (ext === '.txt') {
      const text = fs.readFileSync(filePath, 'utf-8');
      console.log(`TXT extracted ${text.length} chars`);
      return text;
    }

    // 2. DOCX Parsing
    if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      const text = result.value;
      if (text && text.length > 20) {
        console.log(`DOCX extracted ${text.length} chars`);
        return text;
      }
    }
  } catch (e) {
    console.warn(`Extraction error for ${filePath}:`, e.message);
  }

  // 3. PDF Parsing (default / fallback)
  return new Promise((resolve) => {
    // pdf-parse v2 ships a CLI at pdf-parse/bin/cli.mjs
    const cliBin = path.join(
      __dirname, '..', 'node_modules', 'pdf-parse', 'bin', 'cli.mjs'
    );
    const absPath = path.resolve(filePath);

    execFile('node', [cliBin, 'text', absPath], { timeout: 30000 }, (err, stdout, stderr) => {
      if (!err && stdout && stdout.trim().length > 20) {
        console.log(`PDF CLI extracted ${stdout.trim().length} chars`);
        return resolve(stdout.trim());
      }
      if (err) console.warn('PDF CLI error:', err.message);

      // Fallback: raw byte regex extraction
      try {
        const buffer = fs.readFileSync(filePath);
        const raw = buffer.toString('latin1');
        const matches = raw.match(/BT[\s\S]*?ET/g) || [];
        const text = matches
          .join(' ')
          .replace(/\(([^)]+)\)/g, '$1 ')
          .replace(/[^\x20-\x7E\n]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (text && text.length > 20) {
          console.log(`PDF regex fallback extracted ${text.length} chars`);
          return resolve(text);
        }
      } catch (e2) {
        console.warn('PDF fallback also failed:', e2.message);
      }

      resolve('Resume text could not be extracted');
    });
  });
}


// @route   POST /api/applications
// @desc    Apply to a job (student only)
const applyToJob = async (req, res) => {
  try {
    const { jobId, pitch } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a resume' });
    }

    // Extract text from the uploaded file
    const resumeText = await extractTextFromFile(req.file.path);

    // Fetch the job to get the description for AI scoring
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Call the AI service
    const aiResult = await scoreApplication(resumeText, job.description);

    const application = await Application.create({
      job: jobId,
      student: req.user.userId,
      resumeUrl: req.file.path,
      resumeText,
      pitch,
      aiScore: aiResult.score,
      aiExplanation: aiResult.explanation,
      aiSummary: aiResult.summary || null,
      aiStrengths: aiResult.strengths || [],
      aiWeaknesses: aiResult.weaknesses || [],
      aiRecommendation: aiResult.recommendation || null
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/applications/mine
// @desc    Get logged in student's applications (student only)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.userId })
      .populate('job', 'title location type');
    
    // We don't want to send aiScore to students!
    const sanitizedApplications = applications.map(app => {
      const appObj = app.toObject();
      delete appObj.aiScore;
      delete appObj.aiExplanation;
      return appObj;
    });

    res.json(sanitizedApplications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/jobs/:id/applicants
// @desc    Get applicants for a specific job (company only, owner check)
const getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership
    if (job.company.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get applications, sort by aiScore desc
    const applications = await Application.find({ job: req.params.id })
      .populate('student', 'name email')
      .sort({ aiScore: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PATCH /api/applications/:id/status
// @desc    Update application status (company only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check job ownership
    if (application.job.company.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    // Save notification to student's DB record
    const message = `Your application for ${application.job.title} was ${status}`;
    await User.findByIdAndUpdate(application.student, {
      $push: { notifications: { message, read: false } }
    });

    // Step 5: WebSockets - Emit event to student's room
    req.io.to(application.student.toString()).emit('application:statusUpdated', {
      jobTitle: application.job.title,
      newStatus: status,
      message
    });

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/applications/:id/rescore
// @desc    Re-run AI scoring on an existing application (company only)
const rescoreApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check job ownership
    if (application.job.company.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const resumeText = application.resumeText || 'Resume text not available';
    const aiResult = await scoreApplication(resumeText, application.job.description);

    application.aiScore = aiResult.score;
    application.aiSummary = aiResult.summary;
    application.aiStrengths = aiResult.strengths;
    application.aiWeaknesses = aiResult.weaknesses;
    application.aiRecommendation = aiResult.recommendation;
    application.aiExplanation = aiResult.explanation;
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  rescoreApplication
};
