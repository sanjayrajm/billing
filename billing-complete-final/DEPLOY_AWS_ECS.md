# AWS ECS Deployment Guide (high level)
1. Build Docker images and push to ECR.
2. Create an ECS Task Definition referencing the images and set environment variables as secrets from AWS Secrets Manager.
3. Use Fargate service with an Application Load Balancer for HTTPS.
4. Use RDS (Postgres) instead of SQLite for production scale and reliability.
