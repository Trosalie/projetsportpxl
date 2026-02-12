# Deployment Guide for Alwaysdata

## Prerequisites
- Alwaysdata free account created
- SSH access enabled in Alwaysdata panel
- Git Bash or WSL installed on Windows

## Step-by-Step Deployment

### 1. Alwaysdata Panel Setup

#### A. Create MySQL Database
1. Log into Alwaysdata admin panel
2. Navigate to **Databases** > **MySQL**
3. Click **Add a database**
4. Note the credentials:
   - Host: `mysql-boardpxl.alwaysdata.net`
   - Database: `boardpxl_sportpxl`
   - Username: `boardpxl_sportpxl`
   - Password: 

#### B. Configure Site
1. Go to **Web** > **Sites**
2. Click on your default site or create new one
3. Set configuration:
   - **Type**: PHP
   - **PHP version**: 7.4 or 8.0+
   - **Root directory**: `/home/boardpxl/www/public`
   - **Application server**: Apache

#### C. Configure API Subdomain (Optional but recommended)
1. Go to **Web** > **Sites** > **Add a site**
2. Configuration:
   - **Addresses**: `api.boardpxl.alwaysdata.net`
   - **Type**: PHP
   - **Root directory**: `/home/boardpxl/www/backend/public`
   - **Application server**: Apache

### 2. Update Configuration Files

#### Update `.env.production`
Edit `boardpxl-backend/.env.production` with your Alwaysdata credentials:
```env
DB_HOST=mysql-boardpxl.alwaysdata.net
DB_DATABASE=boardpxl_sportpxl
DB_USERNAME=boardpxl_sportpxl
DB_PASSWORD=your_actual_password
```

#### Update Frontend Environment
If using API subdomain, edit `boardpxl-frontend/src/environments/environment.ts`:
```typescript
apiUrl: 'https://api.boardpxl.alwaysdata.net/api'
// OR if using main domain:
apiUrl: 'https://boardpxl.alwaysdata.net/backend/public/api'
```

### 3. Manual Deployment (First Time)

#### A. Connect via SSH
```bash
ssh boardpxl@ssh-boardpxl.alwaysdata.net
```

#### B. Create Directory Structure
```bash
mkdir -p ~/www/backend
mkdir -p ~/www/public
```

#### C. Upload Backend
From your local machine (Git Bash/WSL):
```bash
cd /c/Users/Kevin/OneDrive\ -\ IUT\ de\ Bayonne/Documents/dev/IUT/sae/projetsportpxl

# Upload Laravel files
rsync -avz --exclude 'node_modules' --exclude 'vendor' --exclude '.git' \
  boardpxl-backend/ yourname@ssh-yourname.alwaysdata.net:~/www/backend/

# Upload production .env
scp boardpxl-backend/.env.production yourname@ssh-yourname.alwaysdata.net:~/www/backend/.env
```

#### D. Install Backend Dependencies
SSH back into Alwaysdata:
```bash
ssh yourname@ssh-yourname.alwaysdata.net
cd ~/www/backend
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
php artisan config:cache
php artisan route:cache
chmod -R 775 storage bootstrap/cache
```

#### E. Build and Upload Frontend
From local machine:
```bash
cd boardpxl-frontend
npm install
npm run build

# Upload built files
rsync -avz dist/boardpxl-frontend/browser/ \
  yourname@ssh-yourname.alwaysdata.net:~/www/public/
```

### 4. Alternative: Deploy via FTP

If you prefer FTP (using FileZilla):
1. **Server**: ftp-yourname.alwaysdata.net
2. **Username**: yourname
3. **Password**: your Alwaysdata password
4. **Port**: 21

Upload:
- Laravel files → `/www/backend/`
- Built Angular files → `/www/public/`

Then run Laravel commands via SSH.

### 5. Configure CORS (Important!)

Edit `boardpxl-backend/config/cors.php`:
```php
'allowed_origins' => [
    'https://yourname.alwaysdata.net',
    'https://api.yourname.alwaysdata.net',
],
```

### 6. File Structure on Alwaysdata

```
/home/yourname/www/
├── backend/                  (Laravel app)
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── public/              (Laravel public folder)
│   │   └── index.php
│   ├── routes/
│   ├── storage/
│   ├── .env                 (production config)
│   └── artisan
└── public/                  (Angular frontend - website root)
    ├── index.html
    ├── main.*.js
    └── ...
```

### 7. Troubleshooting

#### Check Laravel logs
```bash
ssh yourname@ssh-yourname.alwaysdata.net
tail -f ~/www/backend/storage/logs/laravel.log
```

#### Fix permissions
```bash
chmod -R 775 ~/www/backend/storage
chmod -R 775 ~/www/backend/bootstrap/cache
```

#### Clear cache
```bash
cd ~/www/backend
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

#### Database connection issues
- Verify credentials in `.env`
- Test connection: `php artisan tinker` then `DB::connection()->getPdo();`

### 8. Automated Deployment Script

For subsequent deployments, use the `deploy.sh` script:
```bash
# Edit deploy.sh with your credentials first
chmod +x deploy.sh
./deploy.sh
```

## Important Notes

### Free Plan Limitations
- **Disk space**: 100 MB
- **Database**: 10 MB
- **Daily transfers**: Limited
- Optimize your app accordingly

### Security
- Never commit `.env.production` with real passwords to Git
- Add to `.gitignore`:
```
.env.production
deploy.sh
```

### Laravel Optimization
```bash
# On server after each deploy
php artisan config:cache
php artisan route:cache
php artisan view:cache
composer install --optimize-autoloader --no-dev
```

### Angular Optimization
Build with production flag:
```bash
npm run build -- --configuration=production
```

## Testing

After deployment:
1. Visit `https://yourname.alwaysdata.net` (frontend)
2. Test API: `https://yourname.alwaysdata.net/backend/public/api/...`
   OR `https://api.yourname.alwaysdata.net/api/...`
3. Check browser console for CORS errors
4. Monitor Laravel logs for backend errors

## Support

- Alwaysdata docs: https://help.alwaysdata.com/
- Laravel deployment: https://laravel.com/docs/deployment
