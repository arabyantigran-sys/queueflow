# QueueFlow

Modern SaaS prototype for queue management, appointment booking, and customer management — built for service businesses (beauty salons, barbershops, clinics, and more).

**Tagline:** One place for every appointment.  
**UI language:** Armenian · **Currency:** AMD (֏)

## Run locally

```bash
cd queueflow
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Demo flow

1. Landing page `/`
2. Register `/register` → onboarding `/onboarding`
3. Or login `/login` (prefilled demo credentials) → admin `/admin`
4. Customer booking `/book/beauty-house`
5. Bookings created from the customer flow appear in the admin dashboard (shared mock API layer)

## Architecture

- **React + TypeScript + Vite**
- **React Router** for navigation
- **Zustand** for UI/app state
- **`src/data/api.ts`** — mock API layer (swap for a real REST backend later without rewriting UI)
- **`src/data/demoData.ts`** — seed data for Beauty House

## Key routes

| Route | Description |
|-------|-------------|
| `/` | Marketing landing |
| `/register`, `/onboarding` | Business signup |
| `/login` | Admin login |
| `/book/:slug` | Customer booking |
| `/admin/*` | Business dashboard |
