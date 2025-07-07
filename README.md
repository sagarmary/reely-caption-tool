#Reely

Reely is a full-stack web application that allows users to upload videos and automatically generate English captions using AI, with optional Google login for saving history.

Reely Automatic Video Captioning Tool Reely is a full-stack web application that allows users to upload videos and automatically generate time-aligned English captions using OpenAI Whisper. Users can optionally log in using Google to track their captioned video history and delete old videos.

Architecture Diagram

+----------------+ Upload/Caption +----------------+ | React Frontend | <--------------------> | FastAPI Backend | | (w/ Firebase Auth)| | (w/ Whisper + FFmpeg)| +--------+---------+ +----------------+ | | Fetch History / Delete | +--------------------> Local Storage (videos/, user_history.json)

Project Structure reely/ backend/ main.py utils/video.py videos/ frontend/ App.jsx components/ UploadWithLanguage.jsx firebase.js

README.md requirements.txt package.json

Installation Instructions Backend (FastAPI) cd backend python -m venv venv source venv/bin/activate # Windows: venv\Scripts\activate pip install -r requirements.txt uvicorn main:app --reload

Frontend (React)

cd frontend npm install Add .env file (optional): VITE_API_BASE_URL=http://localhost:8000 npm run dev

API Documentation

POST /upload?uid={uid}
GET /caption?uid={uid}
GET /history?uid={uid}
DELETE /delete?uid={uid}&filename=... Firebase Setup for Google Auth
Create Firebase project
Enable Google Sign-In
Use config in firebase.js FFmpeg & ImageMagick Setup
Install FFmpeg: https://ffmpeg.org
Install ImageMagick and set path in video.py
Dependencies Backend fastapi, uvicorn, moviepy, whisper, python-multipart Frontend React, Axios, Firebase, Vite Usage Guide

Run backend and frontend.
Upload video.
Login with Google (optional).
View or delete captioned videos.
Assumptions / Limitations

English-only captions
Hardcoded subtitles
Local storage only
No GPU acceleration
