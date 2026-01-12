# AWS Amplify + EC2 + RDS Deployment Setup

## Architecture
- **Frontend**: AWS Amplify (auto-deploys from GitHub)
- **Backend API**: EC2 Instance (Node.js/Express)
- **Database**: AWS RDS PostgreSQL
- **Real-time**: Socket.io on EC2

## Pre-Deployment Checklist

### 1. AWS RDS Setup (PostgreSQL)
- [ ] Create RDS PostgreSQL instance (14+)
- [ ] Configure Multi-AZ for production
- [ ] Enable automated backups (7 days minimum)
- [ ] Create security group allowing only EC2 instance
- [ ] Save endpoint, username, password
- [ ] Run migrations: `npx prisma migrate deploy`

### 2. EC2 Instance Setup
- [ ] Create EC2 instance (t3.small or larger)
- [ ] Use Ubuntu 22.04 LTS AMI
- [ ] Create security group with rules:
  - Port 22 (SSH) from your IP
  - Port 80 (HTTP) from anywhere
  - Port 443 (HTTPS) from anywhere
  - Port 5000 (API) from Amplify
- [ ] Assign Elastic IP address
- [ ] Install Node.js 18+, npm, git
- [ ] Set up SSL certificate (Let's Encrypt/Certbot)

### 3. EC2 Environment Setup
```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Clone repository
git clone https://github.com/your-repo/sparkleville.git
cd sparkleville/server

# Install dependencies
npm install

# Create .env file with values from .env.example
nano .env

# Build TypeScript
npm run build

# Install PM2 for process management
sudo npm install -g pm2
pm2 start dist/index.js --name "sparkleville-api"
pm2 startup
pm2 save
```

### 4. Set Up HTTPS (SSL Certificate)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate (replace domain)
sudo certbot certonly --standalone -d api.yourdomain.com

# Set up auto-renewal
sudo certbot renew --dry-run
```

### 5. Configure Nginx Reverse Proxy
```bash
sudo apt install -y nginx

# Create config at /etc/nginx/sites-available/default
sudo nano /etc/nginx/sites-available/default
```

Add this configuration:
```nginx
upstream sparkleville {
    server localhost:5000;
}

server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://sparkleville;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
```

Enable and restart:
```bash
sudo systemctl enable nginx
sudo systemctl restart nginx
```

### 6. Amplify Frontend Deployment
- [ ] Connect GitHub repository to AWS Amplify
- [ ] Configure build settings from `amplify.yml`
- [ ] Add environment variables in Amplify console:
  - `VITE_API_URL` = `https://api.yourdomain.com/api`
  - `VITE_SOCKET_URL` = `https://api.yourdomain.com`
- [ ] Deploy

### 7. Environment Variables

**EC2 (.env file):**
```
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/sparkleville
JWT_SECRET=your-secret-key-min-32-chars
SENDGRID_API_KEY=your-api-key
GOOGLE_DRIVE_FOLDER_ID=your-folder-id
FRONTEND_URL=https://your-amplify-domain.amplifyapp.com
AWS_REGION=us-east-1
```

**Amplify Console:**
- `VITE_API_URL` = Your EC2 backend domain
- `VITE_SOCKET_URL` = Your EC2 backend domain

## Monitoring & Maintenance

### Check Server Status
```bash
# Check if Node process is running
pm2 status

# View logs
pm2 logs "sparkleville-api"

# Monitor in real-time
pm2 monit
```

### Database Backups
- Enable automated RDS backups
- Test restore procedures regularly
- Keep backup retention for at least 7 days

### SSL Certificate Renewal
Certbot auto-renewal runs daily. Check status:
```bash
sudo certbot renew --dry-run
```

## Troubleshooting

### Socket.io Connection Issues
- Check CORS configuration in both files
- Verify `FRONTEND_URL` environment variable is set correctly
- Ensure websocket transports are enabled

### Database Connection Issues
- Verify RDS security group allows EC2 instance
- Check `DATABASE_URL` format is correct
- Test connection: `psql $DATABASE_URL`

### HTTPS Issues
- Verify certificate is installed correctly
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Verify domain DNS points to EC2 Elastic IP

## Performance Optimization

1. **Enable Gzip Compression** in Nginx
2. **Set up CloudFront** for static assets
3. **Use RDS Read Replicas** for read-heavy operations
4. **Monitor with CloudWatch** and set alarms
5. **Enable VPC Flow Logs** for network analysis
