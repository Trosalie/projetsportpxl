# BoardPXL - Production Docker Deployment

This guide explains how to deploy BoardPXL to your OVH VPS with Docker.

## Prerequisites

- Debian VPS with Docker and Docker Compose installed
- SSH access to your VPS
- Git repository with your code

## Quick Start

### 1. Configure Deployment Script

Edit `deploy-vps.sh` and set your values:

```bash
VPS_USER="root"              # Your VPS username
VPS_HOST="YOUR_VPS_IP"       # Your VPS IP address
VPS_PATH="/opt/boardpxl"     # Deployment directory
GIT_BRANCH="main"            # Git branch to deploy
```

### 2. Configure Environment Variables

Create `.env.production` file with secure passwords:

```bash
DB_PASSWORD=your_secure_laravel_password
MYSQL_ROOT_PASSWORD=your_secure_root_password
```

### 3. Initial VPS Setup

SSH into your VPS and clone your repository:

```bash
ssh root@YOUR_VPS_IP
cd /opt
git clone YOUR_REPOSITORY_URL boardpxl
cd boardpxl
```

Copy the production environment file:

```bash
cp .env.production .env
```

### 4. Deploy

From your local machine, run:

```bash
chmod +x deploy-vps.sh
./deploy-vps.sh
```

## Access Your Application

After successful deployment:

- **Main Application**: `http://YOUR_VPS_IP`
- **API**: `http://YOUR_VPS_IP/api`

Admin tools are only accessible via SSH tunnel for security:

```bash
ssh -L 8080:localhost:8080 -L 8025:localhost:8025 root@YOUR_VPS_IP
```

Then access:
- **PHPMyAdmin**: `http://localhost:8080`
- **Mailpit**: `http://localhost:8025`

## Architecture

The production setup uses:

- **Nginx Reverse Proxy** (port 80) - Routes all traffic
  - `/` → Angular Frontend
  - `/api` → Laravel Backend
- **Angular Frontend** - Production build served by Nginx
- **Laravel Backend** - PHP-FPM + Nginx
- **MySQL 8.0** - Database
- **PHPMyAdmin** - Database management (localhost only)
- **Mailpit** - Email testing (localhost only)

## Files Created

- `docker-compose.prod.yml` - Production Docker Compose configuration
- `boardpxl-backend/Dockerfile.prod` - Production backend Dockerfile
- `boardpxl-frontend/Dockerfile.prod` - Production frontend Dockerfile
- `nginx/nginx.conf` - Nginx main configuration
- `nginx/conf.d/app.conf` - Application routing configuration
- `deploy-vps.sh` - Automated deployment script

## Manual Deployment Steps

If you prefer manual deployment:

```bash
# On VPS
cd /opt/boardpxl
git pull origin main

# Build and start containers
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Run Laravel post-deployment
docker-compose -f docker-compose.prod.yml exec backend php artisan migrate --force
docker-compose -f docker-compose.prod.yml exec backend php artisan config:cache
docker-compose -f docker-compose.prod.yml exec backend php artisan route:cache
docker-compose -f docker-compose.prod.yml exec backend php artisan view:cache
```

## Useful Commands

### View Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Restart Services
```bash
docker-compose -f docker-compose.prod.yml restart
docker-compose -f docker-compose.prod.yml restart backend
```

### Check Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Execute Commands in Backend
```bash
docker-compose -f docker-compose.prod.yml exec backend php artisan migrate
docker-compose -f docker-compose.prod.yml exec backend php artisan cache:clear
```

### Stop Everything
```bash
docker-compose -f docker-compose.prod.yml down
```

## SSL/HTTPS Setup (Optional)

To add SSL with Let's Encrypt:

1. Install certbot on your VPS
2. Obtain certificate
3. Update `nginx/conf.d/app.conf` to listen on port 443
4. Add SSL certificate paths
5. Expose port 443 in `docker-compose.prod.yml`

## Troubleshooting

### Check if containers are running
```bash
docker ps
```

### View container logs
```bash
docker logs backend
docker logs frontend
docker logs nginx-proxy
```

### Rebuild containers
```bash
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Database connection issues
Check that backend can reach MySQL:
```bash
docker-compose -f docker-compose.prod.yml exec backend ping mysql
```

## Security Notes

- Change default passwords in `.env.production`
- PHPMyAdmin and Mailpit are only accessible from localhost
- Consider setting up a firewall (UFW) on your VPS
- Enable HTTPS in production
- Keep Docker and system packages updated

## Differences from Development Setup

- Uses production Dockerfiles with optimized builds
- No live code volumes (changes require rebuild)
- All traffic goes through Nginx reverse proxy on port 80
- Admin tools restricted to localhost
- Optimized PHP and Nginx configurations
- Frontend served as static files (no ng serve)
- Backend uses PHP-FPM instead of artisan serve
