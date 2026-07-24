# ClassRoomConnect

ClassRoomConnect is a modern, real-time collaboration and virtual classroom platform designed to bridge the gap between students and educators. The application enables institutions, instructors, and students to interact seamlessly in shared digital workspaces. By combining features such as instant text communication, file resource sharing, structured timetables, announcements, and assignment workflows, ClassRoomConnect provides a cohesive environment for academic management.

---

## Authors and Contributors

This project was built, developed, and maintained by:

*   **Bolli Harika**
*   **Rajarajeshwari Nimmanagoti**
*   **Venkatasrith Konam**

---

## Live Link: https://classroomconnect01.netlify.app/login
## Core Features

ClassRoomConnect is divided into several modules, each serving a specific educational and collaborative purpose:

### 1. Workspace Onboarding and Management
*   **Unique Workspace Creation:** Users can create custom workspaces tailored for specific subjects, departments, or projects.
*   **Secure Invite Codes:** Workspace access is managed via secure, auto-generated invite codes to prevent unauthorized access.
*   **Role-Based Access Control:** Differentiates functionality and permissions based on user roles (Admin, Teacher, Student).

### 2. Channels and Real-Time Chat
*   **Topic-Specific Channels:** Support for multiple channels under a single workspace to organize discussions.
*   **Real-Time Socket Messaging:** Integrated communication via Socket.IO for instant text exchange and updates.
*   **Persistent Chat History:** Full database logging for auditability and reference.

### 3. Official Announcements
*   **Course-Wide Notices:** Instructors can publish and pin vital notices to ensure visibility.
*   **Chronological Feed:** Organized dashboard notifications for new announcements.

### 4. Assignment Workflow and Submissions
*   **Assignment Distribution:** Teachers can create assignments complete with description text, due dates, and reference attachment files.
*   **Student Submissions:** Students can submit deliverables directly through the platform.
*   **File Upload Support:** Local file buffering and uploading using Multer middleware on the backend.

### 5. Resources Hub
*   **Lecture Material Storage:** Instructors can upload slides, study materials, and syllabi.
*   **Structured Organization:** Instant cataloging of academic resource uploads.

### 6. Interactive Timetable and Schedule
*   **Weekly Planner:** Schedule upcoming lectures, seminars, laboratory tasks, and examinations.
*   **Agenda Tracking:** Dynamic updates for upcoming academic deadlines and event structures.

### 7. Transparent Activity Logging
*   **Workspace Log Trail:** Records administrative actions (such as joining members, assignment publishing, and system alerts) for workspace review.

---

## Technology Stack

The application employs a decoupled architecture consisting of a single MongoDB database, an Express-based REST/WebSocket server, and a modern Single Page Application (SPA) frontend.

### Frontend
*   **Framework:** React 19 (TypeScript)
*   **Build Tool:** Vite
*   **State Management:** Zustand (lightweight client-side store)
*   **Data Fetching:** TanStack React Query (caching and sync)
*   **HTTP Client:** Axios (configured with automated request/response interceptors)
*   **UI and Styling:** Tailwind CSS, PostCSS, Lucide React (vector icons)
*   **Linter:** Oxlint

### Backend
*   **Runtime:** Node.js (TypeScript)
*   **Web Framework:** Express
*   **Real-Time Protocol:** Socket.IO
*   **Database Object Modeling:** Mongoose (MongoDB ODM)
*   **Validation:** Zod schemas
*   **File Processing:** Multer

### Security and Database
*   **Authentication:** JSON Web Tokens (JWT) using standard access and refresh token rotation.
*   **Hashing:** Cryptographic passwords using bcryptjs.
*   **Database:** MongoDB Atlas (Cloud Instance) or local MongoDB Community Server.

---

## Configuration and Environment Variables

Both the backend and the frontend require environment configuration files to operate correctly.

### Backend Setup (`backend/.env`)
Create a `.env` file inside the `backend` folder and define the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_access_token_secret
JWT_REFRESH_SECRET=your_jwt_refresh_token_secret
```

*   `PORT`: The port number on which the Node server listens (default: 5000).
*   `MONGODB_URI`: Connection string for MongoDB (local or Atlas URI).
*   `JWT_SECRET`: Secret key used to sign access tokens (recommended minimum of 32 characters).
*   `JWT_REFRESH_SECRET`: Secret key used to sign refresh tokens.

### Frontend Setup (`frontend/.env`)
Create a `.env` file (or duplicate and modify `.env.example`) inside the `frontend` folder:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

*   `VITE_API_BASE_URL`: The URL where the frontend routes API requests.
*   `VITE_SOCKET_URL`: The URL of the WebSocket host.

---

## Getting Started

Follow these steps to set up and run ClassRoomConnect locally.

### Prerequisites
*   Node.js (version 18.x or above recommended)
*   npm (installed with Node.js)
*   A running MongoDB instance (local or MongoDB Atlas)

### Setup Guide

#### Step 1: Clone the Repository and Navigate to Workspace
```bash
cd ClassConnect
```

#### Step 2: Install Dependencies
Install dependencies for both the frontend and backend microservices:

```bash
# Install backend dependencies
cd backend
npm install

# Return to root and install frontend dependencies
cd ../frontend
npm install
```

#### Step 3: Run the Services (Development Mode)

*   **To run the Backend Server:**
    ```bash
    cd backend
    npm run dev
    ```
    The server will start, connect to MongoDB, and listen on the configured port (default: `http://localhost:5000`).

*   **To run the Frontend Client:**
    ```bash
    cd frontend
    npm run dev
    ```
    The Vite dev server will boot up and print a local address (usually `http://localhost:5173`). Open this URL in your web browser.

---

## Build and Production Guidelines

To deploy ClassRoomConnect to a production environment, both modules must be built into production-ready assets.

### Backend Compilation
Compile TypeScript files to JavaScript inside the `backend` directory:
```bash
cd backend
npm run build
```
This produces compiled JS assets inside the `backend/dist` directory. Run the production server using:
```bash
npm start
```

### Frontend Compilation
Generate optimized static static assets for distribution:
```bash
cd frontend
npm run build
```
This runs the TypeScript compiler and compiles static assets into `frontend/dist`. These files can be hosted via static web hosts or served statically using the backend Express application.

---

## Code Quality and Verification

To verify that the code compiles without type-errors and adheres to code styling guidelines, execute the following commands:

*   **Linting the Frontend (Oxlint):**
    ```bash
    cd frontend
    npm run lint
    ```
*   **Checking Frontend Types:**
    ```bash
    cd frontend
    npx tsc --noEmit
    ```
*   **Checking Backend Types:**
    ```bash
    cd backend
    npx tsc --noEmit
    ```
