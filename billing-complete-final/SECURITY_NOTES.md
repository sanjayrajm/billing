# Security Hardening Notes
- Set a strong JWT_SECRET in backend/.env (use Docker secrets in production)
- Use HTTPS / TLS termination (nginx, load balancer, or cloud provider)
- Keep puppeteer/chrome in mind: use --no-sandbox if running in containers and ensure isolation
- Limit API rate using express-rate-limit (already added)
- Use helmet for HTTP headers (already added)
- Back up SQLite DB regularly or use a managed DB for production
