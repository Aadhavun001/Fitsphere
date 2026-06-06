# FitSphere - Project Documentation & Guide

FitSphere is a state-of-the-art web application designed for selling high-end, science-backed fitness training courses. The platform features an ultra-premium visual aesthetic modeled after elite fitness brands like WHOOP, Apple Fitness+, and Gymshark. It combines sleek dark themes, vibrant neon accents, glassmorphic UI panels, and smooth micro-animations.

This project is organized into structured workspaces:
- `frontend/`: The React 19 + TypeScript + Vite + Tailwind CSS v4 frontend client.
- `backend/`: A Node/Express backend template with Firebase Admin SDK support.
- `readme/`: Project guides, routes, and design details.

---

## ⚡ Setup & Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (version 18 or above) installed on your system.

### 1. Frontend Setup
Navigate to the `frontend/` directory and install the dependencies:
```bash
cd frontend
npm install
```

To run the client in development mode locally:
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

To build the client for production:
```bash
npm run build
```
This compiles the TypeScript files and outputs optimized static bundles to the `frontend/dist/` directory.

### 2. Backend Setup
Navigate to the `backend/` directory and install the packages:
```bash
cd backend
npm install
```

To start the backend template server:
```bash
npm start
```
The server will run on `http://localhost:5000/`.

---

## 🔥 Connecting Firebase Firestore Database

The application connects to a Cloud Firestore database to securely store and load user profile biometrics, purchased courses, completed lesson checkmarks, and custom training notes in real-time.

### Setup Instructions
1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **Add Project** to register a new project.
2. In the left navigation, click on **Build** -> **Firestore Database** and choose **Create Database**. Set your desired region and start in **Test Mode** (or configure secure rules).
3. Register a new **Web App (`</>`)** in the project home view and copy the `firebaseConfig` keys from the setup screen.
4. Create a `.env` file inside the `frontend/` directory:
   ```env
   VITE_FIREBASE_API_KEY=YOUR_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
   VITE_FIREBASE_APP_ID=YOUR_APP_ID
   ```
5. Restart your frontend server (`npm run dev`). The application is programmed to immediately detect these credentials. If keys are missing or invalid, the app uses a **fail-safe Local Fallback Engine** to cache progress locally in React state so the platform remains fully functional.

---

## 🗺️ Application Route Registry

All routing is handled client-side using `react-router-dom` in `frontend/src/App.tsx`:

| Route Path | Associated Page | Purpose / Features |
| :--- | :--- | :--- |
| `/` | `LandingPage` | Premium 9-section onboarding dashboard, featuring horizontal snapping swiping containers for course highlights and instructors on mobile viewports. |
| `/courses` | `CoursesPage` | Searchable training catalog. Filters by discipline (Strength, Conditioning, Calisthenics, Yoga, Hybrid) and difficulty. Scrolls horizontally on mobile. |
| `/course/:id` | `CourseDetailPage` | Extensive course syllabus breakdown, outcomes checklist, instructor credentials, and a sticky purchase action card. |
| `/cart` | `CartPage` | Enrolled courses checkout review, promo code input (e.g. `FIT15` for 15% off), tax calculation, and Rupee subtotal. |
| `/checkout` | `CheckoutPage` | billing details and payment processing supporting Credit Cards, VPA UPI validation (e.g. `user@upi`), and Netbanking. Includes Confetti completion screen. |
| `/login` | `LoginPage` | Register and Sign-in forms. Interacts with the AppContext to instantiate a user session. |
| `/profile` | `ProfilePage` | Physical biometrics manager (height, weight, target weight), personal bio editor, and an avatar templates chooser (supporting custom uploads, Tamil actors, and emojis). |
| `/dashboard` | `DashboardPage` | Post-purchase learning portal: watch lesson video guides, check off completed workouts, write notes, and post questions to the community Q&A forum. |

---

## 🎨 Core Design Decisions

### 1. Viewport & Device Compatibility (Safari/iPhone Focus)
- **dvh (Dynamic Viewport Height)**: Standard `vh` units suffer from bugs on mobile iOS Safari, causing headers and bottom content to clip or jump as the browser address bar collapses. We adopted `min-h-dvh` and `h-dvh` across sections to solve this.
- **Horizontal Snapping**: Instead of stack-scrolling large course and instructor blocks vertically (which requires excessive scrolling on mobile), we implemented a touch-friendly CSS scroll snap wrapper (`flex overflow-x-auto snap-x snap-mandatory scrollbar-none`). Sizing elements to fit within the viewport margins (`w-[290px]` or `w-[250px]`) forces a portion of the adjacent card to peep in from the right edge, creating an intuitive scroll indicator.

### 2. Localization
- Adopted Tamil instructor names, Tamil actor profile templates (Vikram, Surya, Arya), and Tamil success story testimonials (Priya Mani, Vikram Surya, Dr. Shalini Muthu) with local currency pricing in Indian Rupees (₹) to tailor the user experience to the local target demographic.

### 3. Graceful Database Fallbacks
- Designed the context hooks to write data asynchronously to Firestore in the background. If a query fails or if Firebase is not yet configured, the system logs a console warning and falls back to local memory without crashing the client, preserving a reliable user experience.
