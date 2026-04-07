# 🏠 EstateHub — Full-Stack Real Estate Website

A complete full-stack real estate platform

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React.js + Next.js 15 (App Router) |
| Backend    | Next.js API Routes (REST API)     |
| Database   | MySQL                             |
| Auth       | JWT (jsonwebtoken) + bcryptjs     |
| Styling    | Vanilla CSS (no Tailwind)         |

---

## Project Structure

```
realestate-fullstack/
├── app/
│   ├── api/                        ← BACKEND (API Routes)
│   │   ├── auth/
│   │   │   ├── login/route.js      ← POST /api/auth/login
│   │   │   └── register/route.js   ← POST /api/auth/register
│   │   ├── listings/
│   │   │   ├── route.js            ← GET all + POST new listing
│   │   │   └── [id]/route.js       ← GET/PUT/DELETE by ID
│   │   ├── favourites/
│   │   │   ├── route.js            ← GET all + POST new fav
│   │   │   └── [id]/route.js       ← DELETE fav by listing ID
│   │   └── contact/route.js        ← POST contact message
│   │
│   ├── components/                 ← REUSABLE COMPONENTS
│   │   ├── Navbar.js
│   │   ├── PropertyCard.js
│   │   ├── PropertyDetail.js
│   │   └── ListingForm.js
│   │
│   ├── lib/                        ← HELPERS
│   │   ├── db.js                   ← MySQL connection pool
│   │   ├── auth.js                 ← JWT + bcrypt helpers
│   │   └── AuthContext.js          ← React auth context
│   │
│   ├── login/page.js               ← FRONTEND PAGES
│   ├── register/page.js
│   ├── favourites/page.js
│   ├── manage/page.js
│   ├── listings/[id]/page.js
│   ├── page.js                     ← Home page
│   ├── layout.js
│   └── globals.css
│
├── database/
│   └── schema.sql                  ← MySQL schema + seed data
│
├── .env.local.example              ← Environment variables template
├── package.json
└── next.config.mjs
```

---

## Setup Instructions

### Step 1 — Install MySQL

Download MySQL from https://dev.mysql.com/downloads/installer/
- Choose "MySQL Community Server"
- During install, set a root password (or leave blank)

### Step 2 — Create Database

Open **MySQL Workbench** or **phpMyAdmin**, then:
1. Open the file `database/schema.sql`
2. Copy all the SQL code
3. Paste it into MySQL Workbench's query window
4. Click **Execute** (⚡ button)

This creates the database, all tables, and adds 8 sample listings.

### Step 3 — Create Next.js Project

```bash
npx create-next-app@15.5.0
```

Answer questions:
```
Project name?                → realestate-fullstack
TypeScript?                  → No
ESLint?                      → Yes
Tailwind CSS?                → No
src/ directory?              → No
App Router?                  → Yes
Turbopack?                   → Yes
Customize import alias?      → No
```

### Step 4 — Copy Project Files

1. Unzip this project
2. Copy the `app/` folder → paste into your Next.js project (replace existing)
3. Copy `database/` folder → paste into your project root
4. Copy `.env.local.example` → paste into project root

### Step 5 — Configure Environment

1. Rename `.env.local.example` → `.env.local`
2. Open `.env.local` and set your MySQL password:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=         ← your MySQL root password here
DB_NAME=realestate_db
JWT_SECRET=realestate_super_secret_jwt_key_2024
```

### Step 6 — Install Dependencies

Open VS Code terminal in your project folder:

```bash
npm install mysql2 bcryptjs jsonwebtoken
```

### Step 7 — Run the Project

```bash
npm run dev
```

Open: **http://localhost:3000**

---

## Features

- ✅ Hero banner with Buy/Rent tabs + integrated search
- ✅ Property listing grid with cards
- ✅ Advanced search & filter (type, status, buy/rent, sort)
- ✅ Property detail modal + dedicated detail page
- ✅ User registration & login with JWT
- ✅ Role-based access: Admin / Agent / Buyer
- ✅ Add / Edit / Delete listings (CRUD)
- ✅ Status change: Available / Sold / Rented
- ✅ Save / Unsave favourites per user
- ✅ Contact agent form (stored in MySQL)
- ✅ Admin management table view
- ✅ Responsive CSS design

---

## Common Problems

| Problem                       | Fix                                                         |
|-------------------------------|-------------------------------------------------------------|
| "Cannot connect to database"  | Check `.env.local` DB settings and make sure MySQL is running |
| "Access denied for user root" | Set correct DB_PASSWORD in `.env.local`                     |
| "Module not found: mysql2"    | Run `npm install mysql2 bcryptjs jsonwebtoken`              |
| Demo accounts not working     | Run `database/schema.sql` again in MySQL Workbench          |
| Port 3000 busy                | Close other terminals or restart VS Code                    |
