# DineFlow

**Smart QR Restaurant Ordering Platform**

DineFlow is a SaaS platform that lets restaurants create their own digital ordering system. Restaurant owners manage menus, generate QR codes for tables, and receive orders in real-time. Customers scan a QR code and order — no account required.

## Features

- **Restaurant Auth** — Register, login, logout with JWT + bcrypt
- **Dashboard** — Modern SaaS dashboard with sidebar navigation
- **Menu Management** — CRUD food items with images, categories, veg/non-veg, pricing
- **Category Management** — Custom categories (Starters, Main Course, etc.)
- **Table & QR Codes** — Create tables, generate/download/print QR codes
- **Customer Ordering** — Scan QR → browse menu → cart → place order
- **Real-time Updates** — Socket.IO for live orders and status tracking
- **Order Status Flow** — Pending → Accepted → Preparing → Ready → Served
- **Offers & Analytics** — Promotions and 30-day performance metrics
- **Multi-tenant** — Complete data isolation per restaurant

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express, MongoDB, Socket.IO, Multer, QRCode |
| Frontend | React, Vite, Tailwind CSS, React Router, Axios |
| Auth | JWT, bcrypt (Google OAuth-ready architecture) |

## Prerequisites

- **Node.js** 18+
- **MongoDB** running locally on `mongodb://127.0.0.1:27017`

## Quick Start

```bash
# Install all dependencies
npm run install:all

# Start both backend (port 5000) and frontend (port 5173)
npm run dev
```

Or run separately:

```bash
# Terminal 1 — Backend
cd backend && npm install && npm run dev

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev
```

Open **http://localhost:5173**

## Demo Workflow

1. **Register** a restaurant at `/register`
2. **Login** and go to **Categories** — add Starters, Main Course, etc.
3. Go to **Menu** — add food items with images and prices
4. Go to **Tables** — create Table 1, view/download/print QR code
5. Open the QR URL: `/menu?restaurant=<slug>&table=1`
6. **Place an order** as a customer
7. See the order appear **live** in the dashboard **Orders** page
8. Update order status — customer sees real-time updates

## Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/dineflow
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register restaurant + owner |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/restaurant/dashboard` | Dashboard stats |
| CRUD | `/api/categories` | Category management |
| CRUD | `/api/menu` | Menu item management |
| CRUD | `/api/tables` | Table + QR management |
| CRUD | `/api/orders` | Order management |
| CRUD | `/api/offers` | Offer management |
| GET | `/api/public/restaurant/:slug/menu` | Public menu |
| POST | `/api/public/orders` | Place customer order |

## Project Structure

```
dineflow/
├── backend/
│   └── src/
│       ├── config/       # DB, env
│       ├── controllers/  # Route handlers
│       ├── middlewares/  # Auth, upload, errors
│       ├── models/       # Mongoose schemas
│       ├── routes/       # Express routes
│       ├── services/     # Socket.IO, QR
│       └── utils/        # JWT, password, helpers
├── frontend/
│   └── src/
│       ├── components/   # UI + layout
│       ├── context/      # Auth context
│       ├── pages/        # Dashboard + customer pages
│       └── services/     # API + socket
└── package.json          # Root scripts
```

## License

MIT
