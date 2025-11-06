# Deployment Guide

## Production Deployment Checklist

### Pre-Deployment

- [ ] Update all configuration files with production values
- [ ] Set strong JWT secret key (minimum 32 characters)
- [ ] Configure production database (PostgreSQL)
- [ ] Set up S3 bucket (AWS S3 or MinIO)
- [ ] Configure SMTP for production emails
- [ ] Create Stripe account and get live API keys
- [ ] Set up SSL certificates
- [ ] Configure domain DNS records
- [ ] Review and update CORS settings
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Environment Variables

Create a `.env.production` file with production values:

```env
# Database
POSTGRES_DB=personalitytest_prod
POSTGRES_USER=prod_user
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE
DB_HOST=your-postgres-host.com
DB_PORT=5432

# JWT
JWT_SECRET_KEY=VERY_STRONG_SECRET_KEY_AT_LEAST_32_CHARACTERS_LONG
JWT_ISSUER=PersonalityTest
JWT_AUDIENCE=PersonalityTestClient
JWT_ACCESS_TOKEN_EXPIRY_MINUTES=15

# S3 (AWS)
S3_SERVICE_URL=https://s3.amazonaws.com
S3_ACCESS_KEY=YOUR_AWS_ACCESS_KEY
S3_SECRET_KEY=YOUR_AWS_SECRET_KEY
S3_BUCKET_NAME=personality-test-prod

# Email (Production SMTP)
EMAIL_FROM_EMAIL=noreply@yourpersonalitytest.com
EMAIL_FROM_NAME=Personality Test
EMAIL_SMTP_HOST=smtp.sendgrid.net
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=apikey
EMAIL_SMTP_PASSWORD=YOUR_SENDGRID_API_KEY

# Stripe (LIVE keys)
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Application URLs
APP_BASE_URL=https://yourpersonalitytest.com
APP_FRONTEND_URL=https://yourpersonalitytest.com
APP_API_URL=https://api.yourpersonalitytest.com

# Environment
ASPNETCORE_ENVIRONMENT=Production
NODE_ENV=production
```

### Docker Production Deployment

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec api \
  dotnet ef database update --project PersonalityTest.Infrastructure.dll

# Check logs
docker-compose -f docker-compose.prod.yml logs -f api
```

### Manual Deployment (Ubuntu Server)

#### 1. Install Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install .NET 8
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt update
sudo apt install -y dotnet-sdk-8.0

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx
```

#### 2. Deploy Backend

```bash
# Clone repository
git clone <repository-url> /var/www/personality-test
cd /var/www/personality-test/backend

# Restore and build
dotnet restore
dotnet publish -c Release -o /var/www/personality-test-api

# Create systemd service
sudo nano /etc/systemd/system/personality-test-api.service
```

Service file content:
```ini
[Unit]
Description=Personality Test API
After=network.target

[Service]
WorkingDirectory=/var/www/personality-test-api
ExecStart=/usr/bin/dotnet /var/www/personality-test-api/PersonalityTest.API.dll
Restart=always
RestartSec=10
SyslogIdentifier=personality-test-api
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production

[Install]
WantedBy=multi-user.target
```

```bash
# Start service
sudo systemctl enable personality-test-api
sudo systemctl start personality-test-api
sudo systemctl status personality-test-api
```

#### 3. Deploy Frontend

```bash
cd /var/www/personality-test/frontend

# Install and build
npm ci
npm run build -- --configuration=production

# Copy to nginx directory
sudo cp -r dist/personality-test-frontend/* /var/www/html/
```

#### 4. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/personality-test
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourpersonalitytest.com www.yourpersonalitytest.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourpersonalitytest.com www.yourpersonalitytest.com;

    ssl_certificate /etc/letsencrypt/live/yourpersonalitytest.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourpersonalitytest.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/personality-test /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourpersonalitytest.com -d www.yourpersonalitytest.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Database Setup

```bash
# Create production database
sudo -u postgres psql

CREATE DATABASE personalitytest_prod;
CREATE USER prod_user WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE personalitytest_prod TO prod_user;
\q

# Run migrations
cd /var/www/personality-test-api
dotnet ef database update
```

### Stripe Webhook Configuration

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://api.yourpersonalitytest.com/api/payments/webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy webhook signing secret to `.env` as `STRIPE_WEBHOOK_SECRET`

### Monitoring and Logging

```bash
# View API logs
sudo journalctl -u personality-test-api -f

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Monitor system resources
htop
```

### Backup Strategy

```bash
# Database backup script
#!/bin/bash
BACKUP_DIR="/var/backups/personalitytest"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U prod_user personalitytest_prod | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Backup S3 files (if using MinIO locally)
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /path/to/minio/data

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
```

Add to crontab:
```bash
crontab -e

# Daily backup at 2 AM
0 2 * * * /path/to/backup-script.sh
```

### Health Checks

Set up health check endpoints monitoring:
- API health: `https://api.yourpersonalitytest.com/health`
- Database connectivity
- S3 connectivity
- SMTP connectivity

### Post-Deployment

- [ ] Test user registration and email verification
- [ ] Test taking the personality test
- [ ] Test payment flow with Stripe test cards
- [ ] Test PDF generation
- [ ] Test social sharing
- [ ] Monitor logs for errors
- [ ] Set up alerting for critical failures
- [ ] Document any deployment-specific issues

### Rollback Plan

```bash
# Stop current version
sudo systemctl stop personality-test-api

# Restore previous version
cd /var/www/personality-test-api
sudo cp -r ../backups/api-previous/* .

# Rollback database if needed
psql -U prod_user personalitytest_prod < /var/backups/db_rollback.sql

# Restart service
sudo systemctl start personality-test-api
```

## Cloud Deployment Options

### AWS
- EC2 for API
- RDS for PostgreSQL
- S3 for file storage
- SES for emails
- CloudFront for CDN

### Azure
- App Service for API
- Azure Database for PostgreSQL
- Azure Blob Storage
- Azure Communication Services for emails

### DigitalOcean
- Droplets for API
- Managed PostgreSQL
- Spaces for S3-compatible storage

## Scaling Considerations

- Use load balancer for multiple API instances
- Set up Redis for caching and session management
- Enable CDN for static assets
- Use read replicas for database
- Implement horizontal pod autoscaling (Kubernetes)
