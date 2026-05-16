# ⚡ Hit List — Team Task Manager

> ⚡ A production-grade full-stack SaaS application designed for efficient 👥 team, 📂 project, and ✅ task management with 🔒 role-based access control and seamless collaboration features.

![Tech Stack](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)
![Deploy](https://img.shields.io/badge/Deploy-Railway-purple)

## 🔗 Live Demo
- **Frontend:** [https://hit-list-snowy.vercel.app](https://hit-list-snowy.vercel.app)
- **Backend API:** [https://hit-list-production.up.railway.app](https://hit-list-production.up.railway.app)
- **Test Admin:** admin@test.com / Admin@123456
- **Test Member:** member@test.com / Member@123456

## ✨ Features
- 🔐 JWT Authentication (Register/Login)
- 👥 Project & Team Management
- ✅ Task Creation, Assignment & Status Tracking
- 📊 Real-time Dashboard (Total/Completed/In Progress/Overdue)
- 🔒 Role-Based Access Control (Admin/Member)
- 📋 Kanban Board (Todo/In Progress/Done)
- 📅 Calendar View with Task Deadlines
- 🔍 Global Search (Tasks & Projects)
- 🔔 Smart Notifications (Overdue & Due-Soon alerts)
- 📈 Reports & Analytics

## 🛠 Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT + bcryptjs |
| Security | Helmet, CORS, Rate Limiting |
| Deploy | Railway (Backend) + Vercel (Frontend) |

## 🚀 Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (free tier)

### Backend Setup
```bash
cd backend
cp .env .env
# Add your MONGO_URI in .env
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

## 📡 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/register | Public | Register user |
| POST | /api/auth/login | Public | Login user |
| GET | /api/auth/me | Protected | Get current user |

### Projects
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/projects | Admin | Create project |
| GET | /api/projects | Auth | List projects |
| GET | /api/projects/:id | Auth | Get project |
| PUT | /api/projects/:id | Admin | Update project |
| DELETE | /api/projects/:id | Admin | Delete project |
| POST | /api/projects/:id/members | Admin | Add member |

### Tasks
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/tasks | Admin | Create task |
| GET | /api/tasks | Auth | List tasks |
| PUT | /api/tasks/:id | Auth* | Update task |
| DELETE | /api/tasks/:id | Admin | Delete task |
| GET | /api/dashboard/stats | Auth | Dashboard stats |

*Members can only update status field

## 🔐 Role-Based Access
| Feature | Admin | Member |
|---------|-------|--------|
| Create Project | ✅ | ❌ |
| Delete Project | ✅ | ❌ |
| Create Task | ✅ | ❌ |
| Delete Task | ✅ | ❌ |
| Update Task (all fields) | ✅ | ❌ |
| Update Task (status only) | ✅ | ✅ |
| View Dashboard | ✅ | ✅ |
| View Projects (assigned) | ✅ | ✅ |

## 📁 Project Structure

```text
team-task-manager/
├── backend/
│   ├── controllers/      # Route controllers (auth, projects, tasks)
│   ├── middleware/       # Custom middleware (auth, error handler)
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   └── server.js         # Express app entry point
└── frontend/
    ├── src/
    │   ├── api/          # Axios configuration
    │   ├── components/   # Reusable UI components
    │   ├── context/      # React Context (Auth, Tasks)
    │   ├── hooks/        # Custom React hooks
    │   ├── pages/        # Route pages
    │   ├── utils/        # Helper functions
    │   ├── App.jsx       # Main app component
    │   └── main.jsx      # React entry point
    ├── index.html
    └── tailwind.css
```
