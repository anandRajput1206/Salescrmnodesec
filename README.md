# CyberSecurity Sales CRM

React + Vite + Supabase PostgreSQL sales analytics dashboard.

## Production checklist

1. **Supabase**
   - Run `supabase/schema.sql` in SQL Editor (creates `users`, `uploads`, `sales_entries`)
   - Add users in Supabase Table Editor (`admin` / `manager` / `sales_team`)
   - Optionally run `supabase/fix_users.sql` to trim dirty IDs

2. **Environment (local + Vercel)**
   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_KEY
   ```
   - Never commit `.env` (already in `.gitignore`)

3. **Vercel deploy**
   - Framework: Vite
   - Add the two env vars above
   - Deploy — `vercel.json` SPA rewrite is included

4. **Verify after deploy**
   - Login with a DB user
   - Upload template from sidebar
   - Sales user sees own charts
   - Manager/Admin sees team comparison charts
   - Filters: Weekly / Monthly / Quarterly work

## Excel template

- Download from app sidebar: `CyberSecurity_Sales_Template_With_Validation.xlsx`
- Sheet: **Sales_Data_Entry**
- Weighted Pipeline auto-fills as `Opportunity Value × Probability %` when blank

## Calculations

| Metric | Formula |
|--------|---------|
| Pipeline Value | Sum of Opportunity Value (INR) |
| Weighted Pipeline | Sum of Weighted Pipeline (or Value × Probability / 100) |
| Revenue Closed | Sum of Revenue Closed (INR) |
| Win Rate | Won opportunities ÷ Total opportunities × 100 |
| Won | Status/Stage contains "won" (excludes "lost") |
| POC Conversion | POCs Initiated ÷ Demos Conducted × 100 |
| Sales Funnel | Lead (rows) → Demo → POC → Proposal → Won |
| Target vs Achievement | Revenue Closed vs Opportunity Value by employee |

## Roles (from Supabase `users.role`)

- **sales_team** — upload + own dashboard
- **manager** — all team data + comparison charts
- **admin** — same as manager + region filter
