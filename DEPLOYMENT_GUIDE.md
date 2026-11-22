# FITSYNC — Production Deployment Guide

This guide describes how to deploy the FITSYNC application in containerized, VPS, or cloud environments.

---

## 1. Environment Architecture

```
Internet / HTTPS (Port 443)
         │
         ▼
[ Nginx Reverse Proxy / SSL Termination ]
         │
         ├── /api & /uploads ──► [ Express Backend Server ] (:3001)
         │                               │
         │                               └──► [ SQLite3 DB (WAL mode) ]
         │                               └──► [ Local Uploads / Object Storage ]
         │
         └── /* (Static Assets) ──► [ Vite SPA Production Build ] (:80)
```

---

## 2. Environment Variables Reference

### Backend (`server/.env`)
| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3001` | Port to bind express listener |
| `NODE_ENV` | Yes | `production` | Enables secure cookies & hides stack traces |
| `FRONTEND_URL` | Yes | `https://yourdomain.com` | Allowed CORS origin |
| `JWT_SECRET` | Yes | [none] | High-entropy secret key for token signatures |
| `JWT_EXPIRES_IN` | No | `7d` | Token lifetime |
| `AI_PROVIDER` | Yes | `demo` or `openai` | AI vision & stylist reasoning provider |
| `AI_API_KEY` | If OpenAI | [none] | OpenAI API key with access to `gpt-4o` |
| `AI_VISION_MODEL` | No | `gpt-4o` | Vision model identifier |
| `UPLOAD_DIR` | No | `./uploads` | Directory for stored photographs |

---

## 3. Docker Deployment (`docker-compose.yml`)

Create a `docker-compose.yml` in the project root:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      - PORT=3001
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - AI_PROVIDER=${AI_PROVIDER:-demo}
      - AI_API_KEY=${AI_API_KEY:-}
    volumes:
      - fitsync_db:/app/data
      - fitsync_uploads:/app/uploads
    networks:
      - fitsync_net

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - fitsync_net

volumes:
  fitsync_db:
  fitsync_uploads:

networks:
  fitsync_net:
    driver: bridge
```

---

## 4. Nginx Reverse Proxy Configuration

```nginx
server {
    listen 80;
    server_name fitsync.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name fitsync.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/fitsync.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fitsync.yourdomain.com/privkey.pem;

    # Frontend Single Page App
    location / {
        root /var/www/fitsync/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Routes
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static Uploaded Photographs
    location /uploads/ {
        proxy_pass http://127.0.0.1:3001;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

---

## 5. Automated Backups & Disaster Recovery

### Database Backup Script (`backup.sh`)
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/fitsync"
mkdir -p "$BACKUP_DIR"

# Safe hot SQLite backup using online backup API
sqlite3 /var/www/fitsync/server/data/fitsync.db ".backup '$BACKUP_DIR/fitsync_$DATE.db'"
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C /var/www/fitsync/server uploads

# Retain 30 days of archives
find "$BACKUP_DIR" -type f -mtime +30 -delete
```
Schedule via Cron:
```cron
0 2 * * * /var/www/fitsync/backup.sh
```
