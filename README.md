# GigFlow – Smart Leads Dashboard

A full-stack Lead Management Dashboard built with the MERN stack and TypeScript. Manage leads, track their pipeline stage, filter/search across multiple dimensions, and export data — all with role-based access control.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, TailwindCSS, Vite |
| State | Zustand (auth), TanStack Query v5 (server state) |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Containerisation | Docker + Docker Compose |

---

## Features

### Core
- **JWT Authentication** — register, login, protected routes, token persistence
- **Role-Based Access Control** — Admin sees all leads; Sales users see only their own
- **Lead CRUD** — create, read, update, delete with full validation
- **Advanced Filtering** — filter by status, source, combined with search; all filters compose
- **Debounced Search** — 400ms debounce on name/email search
- **Backend Pagination** — `skip/limit` with metadata (`total`, `totalPages`, `hasNextPage`)
- **CSV Export** — respects active filters; streams file download
- **Lead Stats** — aggregated breakdown by status and source on the dashboard

### UI/UX
- Dark theme with custom design system (Syne font, brand blue palette)
- Responsive layout
- Loading states (skeleton spinners, opacity fade during refetch)
- Empty states with contextual messaging
- Form validation with inline error messages
- Confirm dialogs for destructive actions
- Toast notifications for all mutations

---

## Project Structure

```
gigflow/
├── backend/
│   ├── src/
│   │   ├── config/        # DB connection, env config
│   │   ├── controllers/   # authController, leadController
│   │   ├── middleware/    # auth (JWT), errorHandler, validate
│   │   ├── models/        # User, Lead (Mongoose)
│   │   ├── routes/        # authRoutes, leadRoutes
│   │   ├── types/         # Shared TypeScript interfaces
│   │   ├── utils/         # response helpers, jwt, csv
│   │   └── index.ts       # Express app entry
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/    # Layout, sidebar nav
│   │   │   ├── leads/     # LeadForm, LeadTable, LeadFilters, LeadDetail
│   │   │   └── ui/        # Badge, Modal, Spinner, ConfirmDialog
│   │   ├── hooks/         # useDebounce, useLeads (React Query)
│   │   ├── pages/         # LoginPage, RegisterPage, DashboardPage, LeadsPage
│   │   ├── services/      # api.ts (axios), authService, leadService
│   │   ├── store/         # authStore (Zustand + persist)
│   │   ├── types/         # Shared frontend types
│   │   └── App.tsx        # Router + protected/public routes
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Local Setup (Without Docker)

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/gigflow.git
cd gigflow
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET
npm install
npm run dev      # starts on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev      # starts on http://localhost:3000
```

---

## Docker Setup

```bash
# From the project root
cp .env.example .env
# Edit .env — set JWT_SECRET at minimum

docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/health

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Server port |
| `NODE_ENV` | No | `development` | Environment |
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | Min 32-char secret for signing JWTs |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiry duration |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed frontend origin |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | No | `/api` | Backend API base URL |

---

## API Documentation

All responses follow this shape:
```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "meta": { "total": 42, "page": 1, "limit": 10, "totalPages": 5, "hasNextPage": true, "hasPrevPage": false }
}
```

### Auth

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/api/auth/register` | ❌ | `{ name, email, password, role? }` | Register user |
| POST | `/api/auth/login` | ❌ | `{ email, password }` | Login |
| GET | `/api/auth/me` | ✅ | — | Get current user |

### Leads

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/api/leads` | ✅ | any | List leads (paginated, filtered) |
| POST | `/api/leads` | ✅ | any | Create lead |
| GET | `/api/leads/stats` | ✅ | any | Get lead stats |
| GET | `/api/leads/export` | ✅ | any | Export CSV |
| GET | `/api/leads/:id` | ✅ | any | Get single lead |
| PUT | `/api/leads/:id` | ✅ | any | Update lead |
| DELETE | `/api/leads/:id` | ✅ | any | Delete lead |

#### Query Parameters for `GET /api/leads`

| Param | Type | Values | Description |
|---|---|---|---|
| `page` | number | ≥1 | Page number (default: 1) |
| `limit` | number | 1–100 | Results per page (default: 10) |
| `status` | string | `New` \| `Contacted` \| `Qualified` \| `Lost` | Filter by status |
| `source` | string | `Website` \| `Instagram` \| `Referral` | Filter by source |
| `search` | string | any | Regex search on name and email |
| `sort` | string | `latest` \| `oldest` | Sort by createdAt |

---

## Role-Based Access Control

| Action | Admin | Sales |
|---|---|---|
| View all leads | ✅ | ❌ (own only) |
| Create lead | ✅ | ✅ |
| Update any lead | ✅ | ❌ (own only) |
| Delete any lead | ✅ | ❌ (own only) |
| Export CSV | ✅ (all) | ✅ (own only) |
| View stats | ✅ (all) | ✅ (own only) |

---

## Lead Schema

```typescript
{
  name:      string        // 2–100 chars, required
  email:     string        // valid email, required
  status:    'New' | 'Contacted' | 'Qualified' | 'Lost'
  source:    'Website' | 'Instagram' | 'Referral'
  notes?:    string        // max 500 chars, optional
  createdBy: ObjectId      // ref: User
  createdAt: Date
  updatedAt: Date
}
```

---

## TypeScript Highlights

- `strict: true` in both `tsconfig.json` files
- Zero usage of `any` — all types explicitly defined
- Shared interfaces for `IUser`, `ILead`, `ApiResponse<T>`, `PaginationMeta`, `JwtPayload`
- Generic `sendSuccess<T>` and `sendError` response utilities
- Type-safe Mongoose documents via `IUserDocument` and `ILeadDocument` interfaces
- Frontend: full typing of all API responses, Zustand store, React Query hooks

---

## Deployment

### Backend → Render / Railway
1. Set environment variables in the dashboard
2. Build command: `npm run build`
3. Start command: `node dist/index.js`

### Frontend → Vercel / Netlify
1. Set `VITE_API_URL` to your backend URL
2. Build command: `npm run build`
3. Output directory: `dist`

---

## Git Commit Convention

```
feat: add CSV export with active filters
fix: role check on lead update endpoint
chore: add docker-compose healthchecks
refactor: extract pagination meta to utility
```
