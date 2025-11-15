# Billing Complete Package (includes Docker, Email, Invoice endpoints, Supabase guide)

## New files added
- docker-compose.yml
- backend/Dockerfile
- frontend/Dockerfile
- backend/email.js (nodemailer)
- backend/routes/invoice.js (generate/send invoice HTML/email)
- backend/templates/invoice_template.html
- frontend/admin.html
- backend/README_SUPABASE.md

## Quick run with Docker
1. Copy `.env.sample` to `.env` and set JWT_SECRET, SMTP settings if sending emails.
2. From project root run:
   docker-compose up --build
3. Frontend will be available at http://localhost:8080 and backend at http://localhost:3000

## Notes
- Invoice sending requires SMTP credentials in backend .env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
- For PDF generation from HTML consider adding `puppeteer` and rendering HTML to PDF in invoice route.
