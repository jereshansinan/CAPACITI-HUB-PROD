# CAPACITI Intelligent Talent Hub

A comprehensive Employee Self-Service (ESS) and Talent Management platform designed to streamline operations for CAPACITI. This application features role-based access control, AI-driven analytics, and automated administrative workflows.

🔗 **Live Demo:** [https://capacitihub.vercel.app/](https://capacitihub.vercel.app/)

## 👥 Team PentaCore

| Name | Role |
| :--- | :--- |
| **Jereshan Sinan** | Developer |
| **Thato Msina** | Developer |
| **Kamogelo Mothupi** | Developer |
| **Buhlaluse Ngcobo** | Developer |
| **Nkosimphile Mnisi** | Developer |


## 🚀 Features

*   **Role-Based Access Control (RBAC):** Distinct dashboards for Candidates (Employees), Tech Champions, Managers, and Admins.
*   **AI Policy Navigator:** An interactive chat assistant powered by **Google Gemini** to answer HR policy questions.
*   **AI Certificate Verification:** Computer vision (Gemini Vision) to verify uploaded certificates and automatically update learning progress.
*   **Predictive Risk Analytics:** AI analysis of candidate performance data to identify at-risk students based on attendance, technical scores, and soft skills.
*   **Digital Forms & Approvals:** Streamlined workflows for Leave Requests, IT Support Tickets, and Profile Updates.
*   **Broadcast Center:** Company-wide announcements with target audience filtering and Unsplash image integration.
*   **Performance Management:** Digital scorecards with trend analysis and PDF report generation.

## 🛠️ Tech Stack

*   **Frontend:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **Backend / Database:** Firebase (Authentication & Firestore)
*   **AI / ML:** Google Gemini API (Text & Vision models)
*   **Visualization:** Recharts
*   **Utilities:** jsPDF (Reporting), Lucide React (Icons)

## 📦 Setup Instructions

If you wish to run the source code locally:

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd capaciti-talent-hub
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

4.  **Open in Browser**
    Navigate to `http://localhost:5173` (or the port shown in your terminal).

## 📂 Folder Structure

```
/
├── components/          # Reusable UI components
│   ├── Sidebar.tsx      # Main navigation
│   └── ...
├── pages/               # Main application views
│   ├── Dashboard.tsx    # Role-specific dashboards
│   ├── Login.tsx        # Auth & Portal selection
│   ├── RiskAnalytics.tsx# AI predictive charts
│   ├── CertVerifier.tsx # AI document verification
│   └── ...
├── services/            # API and Database logic
│   ├── firebase.ts      # Firebase Auth & Firestore config
│   ├── geminiService.ts # Google AI interactions
│   ├── mockDatabase.ts  # Seed data & types
│   └── ...
├── types.ts             # TypeScript interfaces
├── App.tsx              # Main routing logic
├── index.html           # Entry point (Import maps & Tailwind)
└── README.md            # Documentation
```

## 🔑 Environment Variables

To fully enable the AI and Database features, the following keys are required.
*Note: For the current demo version, Firebase keys are pre-configured in `services/firebase.ts`.*

You can configure these in Vercel or a local `.env` file:

```env
# Google Gemini API (Required for Chat & Vision)
API_KEY=your_gemini_api_key

# Unsplash API (Optional - for Announcement images)
UNSPLASH_ACCESS_KEY=your_unsplash_key

# Firebase Cpnfig
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_key
ITE_FIREBASE_PROJECT_ID=your_key
VITE_FIREBASE_STORAGE_BUCKET=your_key
VITE_FIREBASE_MESSAGING_SENDER_ID=your_key
VITE_FIREBASE_APP_ID=your_key
VITE_FIREBASE_MEASUREMENT_ID=your_key
```

## 🧪 Demo Credentials

The login page features a **"Demo Credentials"** key icon in the bottom right corner. Click it to view and copy valid login details for testing different roles:

*   **Candidate:** jereshan.s@capaciti.org (Student Portal)
*   **Manager/TDC:** kefiloe.m@capaciti.org (Manager View)
*   **Tech Champion:** dikgobe.m@capaciti.org (Tech Champion View)
*   **Admin:** kalebe.n@capaciti.org (Admin View)

**Default Password:** `password123`
