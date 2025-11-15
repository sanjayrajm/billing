# Billing Complete Extended - How to run everything

## Local (development)
1. Backend
   cd backend
   cp .env.sample .env
   # edit .env: set JWT_SECRET, ADMIN_USER, ADMIN_PASS, SMTP settings if needed
   npm install
   npm run create-admin
   npm run dev

2. Frontend
   # served by backend automatically (server serves ../frontend)
   open http://localhost:3000

3. Generate invoice PDFs on server
   The backend uses puppeteer. On some systems puppeteer downloads Chromium during `npm install`.
   In Docker we rely on the official Node image and puppeteer will download a compatible Chromium.
   If you face issues, install necessary libs for Chromium (on Debian/Ubuntu):
     apt-get update && apt-get install -y gconf-service libasound2 libatk1.0-0 libc6                libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1                libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4                libnss3 libpango-1.0-0 libx11-6 libx11-xcb1 libxcb1 libxcomposite1                libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2                libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation                libappindicator1 libnss3 lsb-release xdg-utils wget

## Docker (production)
1. Build and run with docker-compose (example):
   docker-compose up --build -d

2. Use deploy.sh or GitHub Actions to automate deployment.

## Notes
- GitHub Actions workflows added to .github/workflows for CI and deployment to server via SSH
- Use Docker Hub credentials in GitHub secrets for image push
