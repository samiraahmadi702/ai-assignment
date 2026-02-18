# Invoice Generator

A simple invoice generator built with Angular 18 and Node.js/Express with SQLite storage.

## Features

- **Dashboard** — View all invoices, filter by status (Draft / Sent / Paid)
- **Create / Edit Invoice** — Client selector, dynamic line items, auto-calculated totals
- **Invoice Preview** — Clean printable layout with PDF download (via browser print)
- **Client Management** — Save and reuse clients across invoices
- **Auto-calculations** — Subtotal, tax, and total computed automatically
- **Invoice Numbering** — Sequential auto-generated numbers (INV-0001, INV-0002...)

## Tech Stack

- **Frontend:** Angular 18 (standalone components)
- **Backend:** Node.js + Express
- **Database:** SQLite (via sql.js)
- **Hosting:** Render (free tier)

## Local Development

### Prerequisites
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Setup

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd frontend && npm install
```

### Run

Start both servers:

```bash
# Terminal 1 — Backend API (port 3000)
cd backend && node server.js

# Terminal 2 — Angular dev server (port 4200, proxies /api to 3000)
cd frontend && ng serve
```

Open http://localhost:4200

## Deployment (Render)

This app deploys as a single Render Web Service. Express serves both the API and the Angular build.

**Build Command:**
```
cd frontend && npm install && npx ng build --output-path ../backend/public && cd ../backend && npm install
```

**Start Command:**
```
node backend/server.js
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/clients | List all clients |
| POST | /api/clients | Create client |
| PUT | /api/clients/:id | Update client |
| DELETE | /api/clients/:id | Delete client |
| GET | /api/invoices | List invoices (query: ?status=draft/sent/paid) |
| GET | /api/invoices/:id | Get invoice with items |
| POST | /api/invoices | Create invoice with items |
| PUT | /api/invoices/:id | Update invoice with items |
| DELETE | /api/invoices/:id | Delete invoice |
| PATCH | /api/invoices/:id/status | Update invoice status |
