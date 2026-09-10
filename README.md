# InternTrack - AI Integrated Application Progress Tracker

A simple job/internship portal for college students and companies, featuring AI resume scoring and real-time status updates.

## Setup Instructions (Beginner Friendly)

Welcome! If you are new to setting up web projects, follow these steps carefully to get InternTrack running on your computer.

### 1. Prerequisites
Before you start, you must have these installed on your computer:
1. **Node.js** (v18 or higher): Download from [nodejs.org](https://nodejs.org/). This runs the server.
2. **MongoDB Community Server**: Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community). This is our database. 
   - *Important*: When installing, make sure to leave the default port as `27017` and keep it running in the background. You can also install MongoDB Compass (a visual tool) to easily see your data.
3. **Groq API Key**: Go to [console.groq.com](https://console.groq.com/keys) and create a free API key. This is needed for the AI resume scoring feature.

---

### 2. Database Setup (Crucial Step!)
Since we are running MongoDB locally:
1. Make sure MongoDB is running. If you installed it correctly, it usually starts automatically in the background.
2. The default connection URL for a local MongoDB is:
   `mongodb://127.0.0.1:27017/interntrack`
   You don't need to create the database manually — the app will create it automatically when you start the server!

---

### 3. Backend Setup
The backend is the server that talks to the database and the AI.

1. Open your terminal (or command prompt) and go into the `backend` folder:
   ```bash
   cd backend
   ```
2. Install all the necessary packages:
   ```bash
   npm install
   ```
3. Create your environment file:
   - Make a copy of the `.env.example` file and name the copy `.env`.
   - Open `.env` in your text editor.
   - It should look like this:
     ```env
     PORT=5000
     MONGO_URI=mongodb://127.0.0.1:27017/interntrack
     JWT_SECRET=your_jwt_secret_key_here
     GROQ_API_KEY=your_actual_groq_api_key_here
     ```
   - Replace `your_actual_groq_api_key_here` with the API key you got from Groq.
4. Start the server:
   ```bash
   npm run dev
   ```
   *If you see "MongoDB Connected", your database is working perfectly! Keep this terminal window open.*

---

### 4. Frontend Setup
The frontend is the website interface you interact with.

1. Open a **new** terminal window (keep the backend running in the old one) and go into the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install all the necessary packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to the link shown in the terminal (usually `http://localhost:5173`).

---

### Features Demo
- **Company Account**: Sign up as a company. Post a job. 
- **Student Account**: Open an Incognito window and sign up as a student. Browse jobs, apply with a PDF resume.
- **AI Scoring**: Go back to the company dashboard and click "View Applicants". The AI will automatically read the PDF and score the student's resume against the job description!
- **Real-Time Updates**: While the student is logged in and looking at the "My Applications" page, the company can change their status to "Shortlisted". The student will instantly see a notification without refreshing the page!
