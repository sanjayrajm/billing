#!/bin/bash
# deploy.sh - copy repo to remote server and run docker-compose (assumes docker & docker-compose installed on remote)
if [ -z "$REMOTE_HOST" ]; then
  echo "Set REMOTE_HOST env var (eg: user@yourserver)"; exit 1;
fi
if [ -z "$REMOTE_PATH" ]; then
  REMOTE_PATH=~/billing-deploy
fi
echo "Deploying to $REMOTE_HOST:$REMOTE_PATH"
ssh $REMOTE_HOST "mkdir -p $REMOTE_PATH"
rsync -av --exclude '.git' . $REMOTE_HOST:$REMOTE_PATH
ssh $REMOTE_HOST "cd $REMOTE_PATH && docker-compose pull && docker-compose up -d --build"
echo "Deployment triggered"
