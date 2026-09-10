const mongoose = require('mongoose');
const Application = require('./models/Application');
const dotenv = require('dotenv');

dotenv.config();

const clearApplications = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/interntrack');
    console.log('Connected to MongoDB');

    // Delete all applications
    const result = await Application.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} old applications!`);
    
    // Disconnect
    await mongoose.disconnect();
    console.log('Database disconnected.');
  } catch (error) {
    console.error('Error clearing applications:', error);
    process.exit(1);
  }
};

clearApplications();
