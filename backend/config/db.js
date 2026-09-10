const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // If we fail to connect, we don't necessarily want to kill the whole process
    // if we just want to run the server for demo, but typically we would exit.
    // For this project, if the DB fails, we just log it so the server stays up
    // to show errors in the terminal clearly.
    console.warn("Could not connect to MongoDB. Please check your MONGO_URI.");
  }
};

module.exports = connectDB;
