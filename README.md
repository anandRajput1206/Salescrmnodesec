# CyberSecurity Sales CRM

Professional role-based sales analytics dashboard built with React, Supabase, and Recharts.

## Roles

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | admin@company.com | Admin@2024 | All regions + team comparison charts |
| Manager | manager@company.com | Manager@2024 | All team data + comparison charts |
| Sales Team | rahul.sharma@company.com | Rahul@2024 | Upload + own dashboard only |

Other sales users: priya.nair, amit.patel, kavita.singh, rohan.mehta @company.com with `FirstName@2024`

## Excel template

Download from the app sidebar or use:
`public/CyberSecurity_Sales_Template_With_Validation.xlsx`

Sheet: **Sales_Data_Entry** with 28 columns (Month, Week Number, Date, Region/Zone, Lead Source, etc.)

Supports `.xlsx`, `.xls`, and `.csv`.

## Features

- Role-based login (Admin, Manager, Sales Team)
- Upload page for sales team
- Manager/Admin comparative analytics across all employees
- Sales team personal charts (6 charts)
- Manager comparison charts (8 charts)
- Weekly / Monthly / Quarterly filters
- Admin region filter
- KPI cards with totals (meetings, pipeline, revenue, win rate)
- Template download
- Supabase cloud storage

## Setup

```bash
npm install
npm run dev
```

### Supabase

1. Run `supabase/schema.sql` in Supabase SQL Editor
2. Add to `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_KEY
```

3. Restart dev server

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel (Vite)
3. Add env variables
4. Deploy

## Flow

```
Login → Dashboard (role-based charts)
      → Upload (sales team uploads Excel/CSV)
      → Download Template
```

Sales team sees only their data. Manager and Admin see consolidated team comparison.
