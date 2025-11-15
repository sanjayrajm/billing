# Docker secrets example
For production, avoid embedding secrets in .env files. Use docker secrets or a secrets manager.
Example using docker-compose secrets:

secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
services:
  backend:
    secrets: [ jwt_secret ]
    environment:
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
