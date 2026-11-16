# Student Study Group Finder
## Uganda Christian University (UCU)
### Department of Computing and Technology
### Course Unit: Web and Mobile Application Development Group Assignment

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-0B3B60?style=for-the-badge&logo=github)](https://tukamushaba-tech.github.io/Student-Study-Group-Finder/)

> **🌐 Live Demo URL:** [https://tukamushaba-tech.github.io/Student-Study-Group-Finder/](https://tukamushaba-tech.github.io/Student-Study-Group-Finder/)

---

## 1. Project Introduction

The **Student Study Group Finder** is a modern, responsive, full-stack web application developed for students at **Uganda Christian University (UCU)**. The platform enables university students to discover, create, join, and manage academic study groups across all faculties, coordinate structured revision sessions, share announcements, and engage in peer discussions.

### Institutional Information
- **Institution:** Uganda Christian University (UCU), Mukono Campus
- **Faculty:** Faculty of Science and Technology
- **Department:** Computing and Information Technology
- **Programme:** Bachelor of Science in Information Technology (BSIT)
- **Year of Study:** Year One Group Project

---

## 2. Problem Statement

At higher institutions of learning like Uganda Christian University, students across faculties often encounter difficulties:
1. **Discovering Peers in the Same Course Unit:** Outside of physical lectures, students frequently struggle to find peers taking identical units (e.g., `BIT 1101` Introduction to IT, `BIT 1102` Structured Programming, `BBA 1104` Business Accounting).
2. **Unstructured Communication Channels:** WhatsApp and Telegram groups often turn into unstructured social chat feeds where study schedules, academic announcements, and past-paper revision links get buried.
3. **Session Scheduling Disorganization:** Without a dedicated calendar view, students miss out on study times, library room bookings, and Zoom revision links.
4. **Lack of Institutional Visibility:** Lecturers and department heads have no metric insights into peer-to-peer learning engagement or which courses require additional academic intervention.

---

## 3. Project Objectives & Scope

### 3.1 Specific Objectives
- Develop a secure user authentication system utilizing **JWT (JSON Web Tokens)** and **bcrypt** salted password hashing.
- Build a searchable repository of study groups filterable by **Course Code** and **Faculty**.
- Empower student group creators with automated **Group Leader** privileges to schedule revision sessions, manage members, and post announcements.
- Deliver an interactive **Discussion Forum & Q&A Board** allowing members to ask questions and comment on threads.
- Implement an **Administrator Dashboard** displaying analytics on total students, total study pods, and the most active courses on campus.

### 3.2 User Roles & Access Control
1. **Student:** Register, sign in, manage profile, search groups by course or faculty, join/leave study groups, view upcoming sessions, and participate in discussions.
2. **Group Leader:** All student permissions plus: automatically assigned upon group creation, edit group details, schedule revision sessions, remove inactive students, and post announcements.
3. **Administrator:** Full supervisory dashboard, monitor platform adoption, view the most active courses, manage user accounts (role assignment/deletion), and moderate study groups.

---

## 4. Technology Stack & Architecture

### 4.1 Technologies Used
- **Frontend:**
  - React.js 18 (Component-based architecture)
  - React Router DOM v6 (Declarative client-side routing)
  - Axios (Promise-based HTTP client with interceptors)
  - Custom Responsive CSS3 (UCU Academic Blue `#0B3B60` & Gold `#E6A217` theme)
  - Lucide React (Clean semantic iconography)
  - Vite (High-speed build tool and dev server)
- **Backend:**
  - Node.js (Asynchronous JavaScript runtime)
  - Express.js (RESTful API framework)
  - JSON Web Tokens (`jsonwebtoken`)
  - Bcrypt.js (`bcryptjs` password hashing)
  - CORS middleware
- **Database:**
  - MySQL / MariaDB (Database: `student_study_group_finder`)
  - `mysql2/promise` connection pooling with parameterized SQL queries

### 4.2 System Architecture
```
[ React Client (Port 3000) ]
        │  ▲
        │  │ HTTP REST (JSON + JWT)
        ▼  │
[ Express.js API Server (Port 5000) ]
        │  ▲
        │  │ Parameterized Queries (Pool)
        ▼  │
[ MySQL Database (Port 3306) ]
```

---

## 5. Database Design & Entity Relationships

The relational database is named **`student_study_group_finder`** and contains 6 interconnected tables:

1. **`users`**: `(id, full_name, email, password, programme, year_of_study, role, created_at, updated_at)`
2. **`study_groups`**: `(id, name, course_code, faculty, description, meeting_location, leader_id, created_at, updated_at)`
3. **`memberships`**: `(id, user_id, group_id, role, joined_at)` — UNIQUE `(user_id, group_id)`
4. **`study_sessions`**: `(id, group_id, title, session_date, session_time, location, description, created_by, created_at)`
5. **`posts`**: `(id, group_id, user_id, title, content, post_type, created_at)`
6. **`comments`**: `(id, post_id, user_id, content, created_at)`

All foreign keys use `ON DELETE CASCADE` to guarantee referential integrity.

---

## 6. Installation & Setup Guide

### 6.1 Prerequisites
- **Node.js** (v18 or v20 LTS)
- **MySQL Server** (via **XAMPP**, WAMP, or standalone MySQL)
- Modern Web Browser (Google Chrome, Microsoft Edge, Firefox)

### 6.2 Database Configuration (XAMPP / MySQL)
1. Open the **XAMPP Control Panel** and click **Start** next to **MySQL** (and Apache).
2. Open your browser and navigate to `http://localhost/phpmyadmin`.
3. Click on the **Import** tab.
4. Choose the file located at:
   ```
   student-study-group-finder/database.sql
   ```
5. Click **Import** (or **Go**).
   This creates the `student_study_group_finder` database, creates all 6 tables, and populates initial sample data with test users, groups, sessions, and discussion threads.

> **Note on Resilient Architecture:** If MySQL is not running yet, the backend automatically activates a high-fidelity persistent local data store with identical seed data, allowing immediate testing and grading. Once MySQL is started in XAMPP, the application connects to MySQL seamlessly.

---

## 7. How to Run the Application

Open two separate terminals in VS Code:

### Terminal 1: Backend API Server
```powershell
cd backend
npm install
npm start
```
- The backend server will start at: `http://localhost:5000`
- API Health check: `http://localhost:5000/api/health`

### Terminal 2: Frontend React Application
```powershell
cd frontend
npm install
npm run dev
```
- The React application will start at: `http://localhost:3000`
- Open `http://localhost:3000` in your web browser.

---

## 8. Demo User Accounts for Testing

All test accounts share the password: **`Password123!`**

| Name | Role | Email | Permissions |
| :--- | :--- | :--- | :--- |
| **Grace Atuhaire** | **Student** | `grace@ucu.ac.ug` | Browse, join/leave groups, view sessions, participate in group discussions |
| **Baker Mugisa** | **Group Leader** | `baker@ucu.ac.ug` | Student rights + edit own group, schedule sessions, remove inactive members |
| **Administrator** | **Admin** | `admin@ucu.ac.ug` | Full platform control, user moderation, role updates, analytics |

*(Note: On the login page, you can also click the quick one-click demo account buttons to sign in instantly without typing).*

---

## 9. REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create student account (Full name, email, password, programme, year of study).
- `POST /api/auth/login` - Validate credentials and return JWT token.
- `GET /api/auth/profile` - Fetch current user profile (requires JWT).
- `PUT /api/auth/profile` - Update student profile details (requires JWT).

### Study Groups (`/api/groups`)
- `GET /api/groups` - List all groups with optional `?search=` and `?faculty=` query filters.
- `GET /api/groups/my-groups` - List groups joined or created by the logged-in student.
- `GET /api/groups/:id` - Detailed view of a study group, member count, and user status.
- `POST /api/groups` - Create a new study group (promotes student to group leader).
- `PUT /api/groups/:id` - Update group details (Leader or Admin).
- `DELETE /api/groups/:id` - Delete study group (Leader or Admin).

### Memberships (`/api/members`)
- `POST /api/members/:groupId/join` - Join an available study group.
- `POST /api/members/:groupId/leave` - Leave an enrolled study group.
- `GET /api/members/:groupId/members` - View member roster.
- `DELETE /api/members/:groupId/members/:userId` - Remove inactive student (Leader or Admin).

### Study Sessions (`/api/sessions`)
- `POST /api/sessions` - Schedule study session (Leader or Admin).
- `GET /api/sessions/upcoming` - Get upcoming sessions for user's joined groups.
- `GET /api/sessions/group/:groupId` - List all scheduled sessions for a group.
- `DELETE /api/sessions/:id` - Cancel and delete a session (Leader or Admin).

### Discussions & Communication (`/api/posts`)
- `POST /api/posts` - Create post (discussion, question, announcement).
- `GET /api/posts/group/:groupId` - List posts in group (restricted to members).
- `POST /api/posts/:postId/comments` - Reply to discussion post.
- `GET /api/posts/:postId/comments` - List all replies on post.
- `DELETE /api/posts/:id` - Remove post (Author, Leader or Admin).

### Administration (`/api/admin`)
- `GET /api/admin/stats` - Total users, groups, memberships, sessions, most active courses.
- `GET /api/admin/users` - Directory of all registered students.
- `PUT /api/admin/users/:id/role` - Update user role (`student`, `leader`, `admin`).
- `DELETE /api/admin/users/:id` - Remove student account from platform.

---

## 10. Verification & Test Results

| Test Case | Scenario Description | Expected Result | Outcome |
| :--- | :--- | :--- | :---: |
| **TC-01** | Student Registration | Account created, password hashed with bcrypt, JWT issued | **PASS** |
| **TC-02** | Student Login | Valid credentials return 200 OK + token; Invalid returns 401 | **PASS** |
| **TC-03** | Group Creation | Group created, creator automatically promoted to Group Leader | **PASS** |
| **TC-04** | Group Search & Filter | Filter by faculty (e.g. Science & Tech) and code (e.g. BIT 1101) | **PASS** |
| **TC-05** | Duplicate Membership | Attempting to re-join returns 400 "Already a member" | **PASS** |
| **TC-06** | Session Scheduling | Leader schedules session; appears on student calendar | **PASS** |
| **TC-07** | Discussion Security | Non-members cannot access or post in private group chat | **PASS** |
| **TC-08** | Inactive Member Removal| Group leader removes student from group roster | **PASS** |
| **TC-09** | Admin Dashboard | Displays active courses chart, user table, role modification | **PASS** |

---

## 11. Conclusion

The **Student Study Group Finder** fulfills all requirements set forth by the Uganda Christian University Department of Computing and Technology for the Web and Mobile Application Development coursework. By combining a clean React frontend, a resilient Node.js Express backend, and a normalized MySQL database, this system addresses peer learning fragmentation and provides an extensible foundation for academic collaboration across the university.
