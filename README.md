# 🍵 Tea Counter – Office Tea Entry & Tracking System
### **FAME IT NETWORKS**

A premium, mobile-first web app designed for office staff tea & coffee tracking, deployed serverlessly on Vercel with zero extra servers, powered by Next.js 14 App Router, Neon Postgres, Drizzle ORM, and Tailwind CSS + Framer Motion.

The administrative interface closely mirrors the design language of [inventory.famenetworks.net](https://inventory.famenetworks.net/#employees) with a curved emerald sidebar, glassmorphic cards, and crisp typography.

---

## 🚀 Live Demo & Local Development

### 1. Prerequisites
- Node.js 18+ (Tested on Node 20 & 24)
- Neon Postgres Database (Already configured in `.env.local`)

### 2. Quick Start
```bash
# Clone or navigate to the workspace
cd "c:\Users\Fame IT\Documents\3d test\TEA DATA SOFTWARE"

# Install dependencies
npm install --legacy-peer-deps

# Push database schema to Neon Postgres
npx drizzle-kit push

# Seed 22 FAME IT NETWORKS employees & beverage types
npm run db:seed

# Start the dev server
npm run dev
```

Visit:
- **Counter Screen (for office boy)**: [http://localhost:3000/counter](http://localhost:3000/counter)
  - Default PIN: `1234`
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
  - Default Password: `admin123`

---

## 🔑 Default Credentials

| Portal | URL Path | Auth Type | Default Credential |
|--------|----------|-----------|--------------------|
| **Counter App** | `/counter-login` | 4-Digit PIN | `1234` |
| **Admin Portal** | `/admin-login` | Password | `admin123` |

*(Note: Both the Counter PIN and Admin Password can be changed securely at any time inside `/admin/settings`)*

---

## 🌟 Key Features

### 1. Counter Screen (Office Boy)
- **2-Tap Order Flow**: Tap employee card ➔ select beverage & quantity ➔ tap "Record Tea Entry".
- **Quick-Add Shortcut**: Long-press on any employee card to instantly add 1 default cup.
- **10-Second Undo**: Success feedback displays an active countdown button to instantly revert mistakes.
- **Duplicate Prevention**: If the same employee and drink is added within 60 seconds, prompts confirmation.
- **Offline Tolerance**: Automatically buffers orders into IndexedDB when connection drops and syncs once restored.
- **Live Dhaka Time (Asia/Dhaka)** & real-time daily order counter.
- **Collapsible Today's Log**: Bottom sheet showing orders served today with instant undo capabilities.
- **Multilingual**: Toggle between English and Bengali (বাংলা).

### 2. Admin Management (Matches FAME IT UI)
- **Employees Management**: View all 22 seeded employees with active status indicators, department badges, and daily counts. Add new staff, edit details, or soft-deactivate.
- **Analytics & Recharts**: Real-time donut chart for beverage popularity, 7-day trend bar charts, and department consumption breakdown.
- **Monthly Matrix Report**: Full 31-day employee-by-day matrix with total cups and BDT consumption.
- **Multi-Format Export**: One-click download to **Excel (.xlsx)**, **CSV**, and print-friendly **PDF**.
- **Tea Types & Price Management**: Adjust pricing with historical preservation (snapshot pricing ensures past reports remain untouched).

---

## 👥 Seeded Employees (FAME IT NETWORKS)
1. Dr Arshi Tasnim – *Upasham Plus*
2. Dr Shuvojit Paik – *Upasham Plus*
3. Farjana – *Admin*
4. Habibur Rahman – *IT*
5. Imtiaz Sajid – *IT*
6. Jebrun Nesa Jarin – *Upasham Plus*
7. Md Azizul Haque Nadim – *IT*
8. Md Sazzad Hossen – *IT*
9. MD. ALI HOSSAIN IMRAN – *Media*
10. Md. Imtiaz Rana – *IT*
11. Md. Monbir Rahman Metul – *IT*
12. Md. Rabbi Ahmed Noman – *Admin*
13. Md. Sadad-Ul-Hasan – *Business Analyst*
14. Md. Sanwarul Islam – *IT*
15. Monsur – *Media*
16. Mr. Asad – *(General)*
17. Ms. Mohosina Akter Mim – *Upasham Plus*
18. Ms. Sadia Tabassum – *IT*
19. Nurun Nahar Nina – *Accounts*
20. S. M. Fahim Farhat – *Upasham Plus*
21. S. M. Ruhul Azam Rupom – *Management*
22. S. M. Ruhul Azim Rifath – *Management*

---

## ☁️ Zero-Server Vercel Deployment

1. Push this repository to GitHub.
2. In [Vercel Dashboard](https://vercel.com), click **Add New Project** and import the repository.
3. In **Environment Variables**, add:
   - `DATABASE_URL`: Your Neon Postgres connection string
   - `COUNTER_PIN`: A private four-digit PIN
   - `ADMIN_PASSWORD`: A strong, unique admin password
   - `SESSION_SECRET`: A cryptographically random secret of at least 32 characters
4. Under **Settings ➔ Functions**, select the Region closest to Bangladesh (e.g., `sin1` Singapore) for sub-50ms latency.
5. Click **Deploy**. Vercel will build and host the app with zero servers required.

---

## 🧪 Testing
Run the automated test suite:
```bash
npm test
```

