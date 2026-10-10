# Plant Nursery Project Structure

## MERN Application Architecture

- `frontend/`: React single-page application built with Vite
- `frontend/src/AppRouter.jsx`: Route composition and global AI assistant mounting
- `frontend/src/pages/`: One page module per storefront, account, checkout, and care route
- `frontend/src/pages/admin/`: Admin pages (Dashboard, Products, Categories, Orders, Coupons, Inventory, Messages, Settings)
- `frontend/src/components/`:
  - `AIAssistantChatbot.jsx`: Floating 24/7 conversational botanical AI assistant ("GreenBot")
  - `GardenCalendar.jsx`: Interactive garden care calendar and watering/fertilizing checklist
  - `SoilPottingCalculator.jsx`: Potting mix volume, recipe breakdown, and fertilizer dosage calculator
  - `InvoiceModal.jsx`: Branded nursery tax invoice modal with printable formatting
  - `GardenSynergy.jsx`: Companion planting optimizer & pest repellence
  - `PrintableCareGuide.jsx`: Plant-specific printable care sheets
  - `AdminShell.jsx`, `SiteLayout.jsx`, `Access.jsx`, `ProductCard.jsx`, `Feedback.jsx`
- `frontend/src/context/`: Authenticated user, cart count, settings, and notifications
- `frontend/src/hooks/` and `frontend/src/lib/`: API loading, image optimizer, and formatting helpers
- `frontend/src/styles.css`: Complete responsive design and print stylesheets
- `backend/server.js`: Express server startup and MongoDB connection
- `backend/app.js`: Middleware, API mount, shared assets, and production frontend
- `backend/controllers/`: Feature logic for authentication, catalog, shopping, coupons, reviews, content, garden AI, and admin
- `backend/routes/`: Grouped API route definitions (auth, catalog, customer, content, coupon, garden, admin)
- `backend/models/`: Mongoose schemas (User, Product, Category, Cart, Order, Coupon, Review, GardenPlant, PlantDiagnosis, Notification)
- `backend/auth/`: JWT cookie authentication and admin role checks
- `backend/config/`: MongoDB and application configuration
- `backend/middleware/`: Upload validation, async handling, and error responses
- `backend/scripts/`: Catalog & coupon seed (`seed.js`) and admin setup (`seed-admin.js`)
- `assets/images/catalog/`: Shared catalog and review imagery served by Express

## Run Locally

```powershell
npm install
npm run seed
npm run dev
```

Open `http://localhost:5173`. MongoDB defaults to `mongodb://127.0.0.1:27017/plant_nursery`.
