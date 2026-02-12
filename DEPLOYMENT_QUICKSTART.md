# Quick Start - Alwaysdata Deployment

## 🚀 Fast Track Deployment

### 1. Alwaysdata Setup (5 minutes)
- Create account at alwaysdata.com
- Note your username (replace `yourname` everywhere)
- Create MySQL database in panel
- Enable SSH access

### 2. Update Config Files (2 minutes)

**Update these 3 files with YOUR credentials:**

1. `boardpxl-backend/.env.production`
   - DB_HOST → `mysql-yourname.alwaysdata.net`
   - DB_DATABASE → `yourname_sportpxl`
   - DB_USERNAME → `yourname_sportpxl`
   - DB_PASSWORD → (from Alwaysdata panel)
   - APP_URL → `https://yourname.alwaysdata.net`

2. `boardpxl-frontend/src/environments/environment.ts`
   - apiUrl → `https://yourname.alwaysdata.net/backend/public/api`

3. `deploy.sh` OR `deploy.ps1`
   - ALWAYSDATA_USER → `yourname`

### 3. Deploy (10 minutes)

**Option A: Git Bash (Easiest for Windows)**
```bash
cd "/c/Users/Kevin/OneDrive - IUT de Bayonne/Documents/dev/IUT/sae/projetsportpxl"

# Build frontend
cd boardpxl-frontend
npm install
npm run build
cd ..

# Upload everything
rsync -avz --exclude 'node_modules' --exclude 'vendor' --exclude '.git' \
  boardpxl-backend/ yourname@ssh-yourname.alwaysdata.net:~/www/backend/

scp boardpxl-backend/.env.production \
  yourname@ssh-yourname.alwaysdata.net:~/www/backend/.env

rsync -avz boardpxl-frontend/dist/boardpxl-frontend/browser/ \
  yourname@ssh-yourname.alwaysdata.net:~/www/public/

# Setup Laravel
ssh yourname@ssh-yourname.alwaysdata.net
cd ~/www/backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
chmod -R 775 storage bootstrap/cache
exit
```

**Option B: FileZilla (If Git Bash fails)**
1. Connect: `ftp-yourname.alwaysdata.net`
2. Upload `boardpxl-backend/` → `/www/backend/`
3. Upload `.env.production` → `/www/backend/.env`
4. Upload `boardpxl-frontend/dist/.../browser/` → `/www/public/`
5. SSH and run Laravel commands above

### 4. Configure Alwaysdata Panel (3 minutes)

**Web → Sites → Edit your site:**
- Type: PHP
- PHP Version: 7.4 or 8.0+
- Root directory: `/home/yourname/www/public`

**Done!** Visit `https://yourname.alwaysdata.net`

## 📋 Checklist
- [ ] Alwaysdata account created
- [ ] MySQL database created
- [ ] `.env.production` updated with DB credentials
- [ ] `environment.ts` updated with API URL
- [ ] Frontend built (`npm run build`)
- [ ] Files uploaded to server
- [ ] Laravel setup commands run
- [ ] Site configured in Alwaysdata panel
- [ ] Website tested

## ⚠️ Common Issues

**"Database connection failed"**
→ Check `.env` credentials match Alwaysdata panel

**"500 Internal Server Error"**
→ Run `chmod -R 775 storage bootstrap/cache`

**"API calls fail"**
→ Update CORS in `config/cors.php`

**Frontend shows blank page**
→ Check files are in `/www/public/` not `/www/public/browser/`

## 📞 Need Help?
See [DEPLOYMENT_ALWAYSDATA.md](DEPLOYMENT_ALWAYSDATA.md) for detailed guide.
