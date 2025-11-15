# Render.com Deployment Guide
1. Create a new Web Service for backend: connect GitHub repo, build command `npm install && npm run create-admin && npm start`, publish directory `backend`.
2. Set environment variables in Render dashboard (JWT_SECRET, DB_FILE, SMTP_* etc).
3. For frontend, create a static site on Render serving the `frontend` folder (or serve via backend).
4. Use persistent disk for SQLite or prefer managed Postgres for production.
