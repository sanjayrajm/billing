# DB Migration & Backup Guidance
- For production, consider migrating from SQLite to Postgres.
- Use `pgloader` or custom scripts to move data; export CSVs from SQLite then import into Postgres.
- Regular backups: copy the `billing.db` file to remote storage every night using cron or backup services.
