# Plant Nursery Project Structure

## MERN application

- `frontend/`: React single-page application built with Vite
- `frontend/src/AppRouter.jsx`: route composition
- `frontend/src/pages/`: one page module per storefront, account, and care route
- `frontend/src/pages/admin/`: one page module per admin route
- `frontend/src/components/`: shared navigation, product cards, access guards, feedback, and admin shell
- `frontend/src/context/`: authenticated user, cart count, settings, and notifications
- `frontend/src/hooks/` and `frontend/src/lib/`: API loading, requests, and formatting helpers
- `frontend/src/styles.css`: shared responsive styles
- `backend/server.js`: Express server startup and MongoDB connection
- `backend/app.js`: middleware, API mount, shared assets, and production frontend
- `backend/controllers/`: feature logic for authentication, catalog, shopping, reviews, content, and admin
- `backend/routes/`: grouped API route definitions
- `backend/models/`: Mongoose schemas
- `backend/auth/`: JWT cookie authentication and admin role checks
- `backend/config/`: MongoDB and application configuration
- `backend/middleware/`: upload validation, async handling, and error responses
- `backend/scripts/`: catalog seed, admin setup, and legacy MySQL import
- `assets/images/catalog/`: existing nursery catalog and page imagery, served by Express

## Run locally

Install dependencies, seed the MongoDB catalog, and run the Vite and Express development servers:

```powershell
npm install
npm run seed
npm run dev
```

Open `http://localhost:5173`. MongoDB defaults to `mongodb://127.0.0.1:27017/plant_nursery`.

## Optional database migration

If you still have the former MySQL database, import its records with `npm run import:mysql`; see the main README for connection variables. To create an administrator, add `ADMIN_EMAIL` and `ADMIN_PASSWORD` to `.env`, run `npm run seed:admin`, and sign in at `http://localhost:5173/login`.

