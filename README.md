# GigFlow – Smart Leads Dashboard

GigFlow is a full-stack Lead Management Dashboard built using the MERN stack with TypeScript. The application helps users manage leads, track lead status, apply advanced filters, and export lead data with secure authentication and role-based access control.

---

## Live Demo

Frontend: https://gigflow-kappa-ten.vercel.app

Backend: https://gigflow-ng5v.onrender.com

Demo Video:  
https://drive.google.com/file/d/1DmxO_hd-EX3AJwRjc3KhxfTs7x5Ej6uS/view?usp=sharing

---

## Tech Stack

### Frontend
- React.js
- TypeScript
- TailwindCSS
- Vite

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB Atlas
- Mongoose

### Other Tools
- JWT Authentication
- bcryptjs
- Zustand
- React Query
- Docker

---

## Features

- User Registration & Login
- JWT Authentication
- Protected Routes
- Role-Based Access Control (Admin / Sales)
- Lead CRUD Operations
- Advanced Filtering & Search
- Debounced Search
- Backend Pagination
- CSV Export
- Responsive Dashboard UI
- Loading & Error States
- Docker Setup

---

## Project Setup

### Clone Repository

```bash
git clone https://github.com/Siljacr/gigflow.git
cd gigflow
```

---

## Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```bash
http://localhost:5000
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:3000
```

---

## Environment Variables

### Backend (.env)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## API Routes

### Authentication
- POST /api/auth/register
- POST /api/auth/login

### Leads
- GET /api/leads
- POST /api/leads
- PUT /api/leads/:id
- DELETE /api/leads/:id

---

## Deployment

- Frontend deployed on Vercel
- Backend deployed on Render

---

## Author

Silja CR
