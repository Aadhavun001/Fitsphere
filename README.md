# 🏋️‍♂️ FitSphere: Rewrite your physical limits

[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite v8](https://img.shields.io/badge/Vite_v8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Firebase Firestore](https://img.shields.io/badge/Firebase_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vercel Deployment](https://img.shields.io/badge/Vercel_Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://fitsphere1.vercel.app)

FitSphere is a state-of-the-art web application designed to sell and deliver high-end, science-backed fitness training courses. Modeled after elite performance trackers (like *WHOOP*, *Apple Fitness+*, and *Gymshark*), the platform boasts a premium, high-performance dark theme UI, subtle glow aesthetics, responsive flex snapping, and dynamic Firestore-driven content management.

> 🌐 **Live Vercel Deployment Link**: **[https://fitsphere1.vercel.app](https://fitsphere1.vercel.app)**

---

## 📂 Project Organization

The repository is modularly structured into the following folders:

```text
FitSphere/
├── frontend/                # React 19 + Vite Client Application
│   ├── public/              # Static media assets (e.g. public video & images)
│   ├── src/
│   │   ├── components/      # Reusable UI components (NavBar, Footer, Confetti)
│   │   ├── context/         # AppContext.tsx (Global state, caching & database syncs)
│   │   ├── pages/           # Pages (Dashboard, Checkout, Details, Profile, etc.)
│   │   └── firebase.ts      # Firebase configuration & client SDK instantiations
│   └── package.json         # Client dependencies & script commands
│
├── backend/                 # Node / Express Server Template
│   ├── server.js            # Express router mapping & mock backend routes
│   └── package.json         # Server dependencies (Express, Cors, Firebase-Admin)
│
├── readme/                  # Detailed local manuals and developer guides
│   └── README.md            # Route registries & database seeding documentation
│
└── firestore.rules          # Production-hardened database validation rules
```

---

## ⚡ Setup & Installation

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **NPM** (packaged with Node.js)

### 1. Frontend Setup
1. Navigate to the client folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Copy local environment configurations:
   Create a `.env` file inside `frontend/` containing your Firebase credentials and local backend reference:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyB5vIU9...
   VITE_FIREBASE_AUTH_DOMAIN=fitsphere-app-60e5f.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=fitsphere-app-60e5f
   VITE_FIREBASE_STORAGE_BUCKET=fitsphere-app-60e5f.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=56740617357
   VITE_FIREBASE_APP_ID=1:56740617357:web:b7de1a8e60cc347c0d56c4
   VITE_API_URL=http://localhost:5000
   ```
4. Run the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

### 2. Backend Setup
1. Navigate to the server folder:
   ```bash
   cd ../backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development template:
   ```bash
   npm start
   ```
   The mock server will listen on `http://localhost:5000`.

---

## 🔥 Cloud Firestore Database Configuration

FitSphere relies on a Cloud Firestore database for live content management (CMS), user profile syncs, progress trackers, and billing transactions.

### Database Setup
1. Set up a database in your [Firebase Console](https://console.firebase.google.com/) under the project corresponding to your keys.
2. Initialize **Cloud Firestore** in your project.
3. Apply the security validation rules from the root file `firestore.rules`.
4. **Self-Healing Seeding Engine**: The frontend has an automated seeder. When launching the app, if your database is empty, it automatically populates collections (`courses`, `landingPage`, `settings`) with all initial localized course syllabi, testimonials, and contact phone numbers.

---

## 🗺️ Application Route Registry

All routes are client-side managed using `react-router-dom` in `frontend/src/App.tsx`:

| Route Path | Associated Page | Features & UI Elements |
| :--- | :--- | :--- |
| `/` | `LandingPage` | Premium 9-section grid highlighting registered athletes count, adaptive stats, meets specialists, and scrolling reviews. |
| `/courses` | `CoursesPage` | Searchable course catalogs with categories (Strength, Conditioning, Calisthenics, Yoga, Hybrid) and dynamic filters. |
| `/course/:id` | `CourseDetailPage` | Extensive course detail summaries, outcomes, interactive syllabus items, and a sticky purchase panel. |
| `/cart` | `CartPage` | Review selected courses, apply promo codes (e.g. `FIT15` for 15% discount), and view calculations. |
| `/checkout` | `CheckoutPage` | Billing fields and payments selection (Credit/Debit Card, UPI validation, Netbanking) with a Confetti celebration window. |
| `/login` | `LoginPage` | Register and Sign-in portals connected to the database. Uses clean, safe, generic placeholders. |
| `/profile` | `ProfilePage` | Physical metrics editor (weight, height, goals), personal bio panel, and Tamil actors/emojis avatar selection list. |
| `/dashboard` | `DashboardPage` | Post-purchase learning portal containing the dynamic lesson video player, checklists, notes, and a live Q&A forum. |

---

## 🎨 Core Design Decisions

### 1. Viewport & Device Compatibility (iOS & Safari Optimization)
- **Dynamic Viewport Height (`dvh`)**: Mobile browsers (especially Safari on iPhone) suffer from address bar collision bugs where typical `vh` values lead to cut-off headers or buttons. We locked layouts to `min-h-dvh` to ensure perfect fits on all mobile viewports.
- **Horizontal Snapping swipers**: To prevent long, fatigue-inducing vertical scrolling on phone viewports, lists like "Our Specialists" and "Course Catalog Cards" transform into swipeable horizontal tracks (`flex overflow-x-auto snap-x snap-mandatory scrollbar-none`).

### 2. Localized Aesthetics
- Integrated Tamil fitness instructor metadata (Dr. Muthu, Selvam Ramasamy, Kavitha), Tamil success story testimonials (Priya Mani, Vikram Surya, Dr. Shalini), and Tamil actor profile avatars (Vikram, Surya, Arya) coupled with local currency representations (₹ Indian Rupees) to craft a high-affinity brand feel.

### 3. Graceful Database Fallbacks
- Embedded fallback handling across database bindings. If Firestore takes time to load or keys are not defined, context services cleanly catch errors and operate using local React state, maintaining a fully functional interface.

### 4. Immutable Checkout & Payments Logging
- Implemented a secure `/payments` top-level collection. Upon checkout, a unique payment transaction is written containing customer details, totals, and purchased course lists. 
- The Firestore security rules enforce `allow create` permissions but explicitly block updates and deletions (`allow update, delete: if false;`), making transaction history mathematically tamper-proof.

---

## 🚀 Vercel Deployment Instructions

1. Go to the [Vercel Console](https://vercel.com) and click **Add New Project**.
2. Link your GitHub repository.
3. Set the **Root Directory** settings to **`frontend`**.
4. Add all environment variables listed in the *Frontend Setup* step under **Environment Variables** in the Vercel project panel:
   - Include `VITE_FIREBASE_...` keys.
   - Add **`VITE_API_URL`** set to your hosted Render backend service URL: `https://fitsphere-backend-8vxz.onrender.com`.
5. Click **Deploy**. Vercel will automatically compile the static code and serve it via global Edge networks!
