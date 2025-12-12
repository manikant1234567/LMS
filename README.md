# Library Management System (MERN) — Level 1-2

Modern dashboard-style library app with JWT auth, role-based access (admin, librarian, member), book CRUD, search/filters, borrow/return with fines, reservations queue, inventory tracking, and activity logs.

## Stack
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Multer
- Frontend: React (Vite), TailwindCSS, React Router, Axios

## Quick start (local)
1. Prereqs: Node 18+, MongoDB running locally.
2. Backend
   ```bash
   cd backend
   cp .env.example .env   # edit values
   npm install
   npm run seed           # seeds admin/librarian/member + sample books
   npm run dev
   ```
3. Frontend
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Open the printed Vite URL (default http://localhost:5173). Login with `admin@example.com / Admin@123`.

## Env samples
- `backend/.env.example`
  ```
  PORT=5000
  MONGO_URI=mongodb://127.0.0.1:27017/librarydb
  JWT_SECRET=supersecret
  LOAN_PERIOD_DAYS=14
  FINE_PER_DAY=2
  ```
- `frontend/.env.example`
  ```
  VITE_API_URL=http://localhost:5000/api
  ```

## Backend API (high level)
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/librarians` (admin)
- Books: `GET /api/books` (q, category, available), `GET /api/books/:id`, `POST/PUT/DELETE /api/books` (admin/librarian, supports `cover` upload)
- Loans: `GET /api/loans` (admin/librarian), `GET /api/loans/mine`, `GET /api/loans/overdue` (admin/librarian), `POST /api/loans/issue`, `POST /api/loans/return`
- Reservations: `POST /api/reservations` (member), `GET /api/reservations` (admin/librarian), `GET /api/reservations/mine`, `PUT /api/reservations/:id/fulfill`
- Activity: `GET /api/activity` (admin/librarian)

## Deployment (AWS EC2 quick notes)
- Provision Ubuntu EC2, install Node, MongoDB (or connect to Atlas), and Nginx for reverse proxy.
- Clone repo, set `.env` files, run `npm install` in both `/backend` and `/frontend`.
- Build frontend: `npm run build` (serves static files via Nginx or `vite preview`).
- Run backend with a process manager (PM2 or systemd): `PORT=5000 pm2 start src/server.js --name library-api`.
- Configure Nginx:
  - Proxy `https://your-domain/api` -> `http://localhost:5000`
  - Serve frontend `frontend/dist` as static root.
- Store uploads under `/var/www/library/uploads` or similar; update `MULTER` destination if you move it.

## Notes
- Images are stored locally under `backend/uploads` during development.
- Fine per day and loan duration are configurable via env.
- Activity logs capture book CRUD and loan return/issue events.
- UI is desktop-first, responsive, with a clean minimal palette and rounded cards.

## Suggested test flow
1. Seed data, start backend/front.
2. Login as admin, add a book, create a librarian if needed.
3. Issue a book to the seeded member (copy their user id from Mongo).
4. Return the book to trigger fine calculation and reservation wake-up.
5. Reserve a book as the member when unavailable to see queue behavior.

