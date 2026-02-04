# How to Fix Laravel Backend with PHP 7.4 in Docker

## Problem

When running a Laravel backend with PHP 7.4 in Docker, you may encounter errors like:
- `Class "Termwind\Laravel\TermwindServiceProvider" not found`
- `Class "Facade\Ignition\IgnitionServiceProvider" not found`
- Corrupted bootstrap cache files

## Root Cause

1. **Development dependencies** were being installed in the Docker container
2. **Bootstrap cache files** from the host were being copied into the container
3. These dev packages register service providers that aren't available in production

## Solution: Commands & Actions

### 1. Create `.dockerignore` file

Create a new file `boardpxl-backend/.dockerignore`:

```
bootstrap/cache/
storage/framework/cache/
storage/framework/sessions/
storage/framework/views/
vendor/
node_modules/
.env
.git
.gitignore
```

This prevents host files from being copied into the Docker build context.

### 2. Update Dockerfile

Modify `boardpxl-backend/Dockerfile` to exclude dev dependencies:

```dockerfile
# Install Laravel dependencies (WITHOUT dev packages)
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --ignore-platform-reqs
```

The `--no-dev` flag is critical. It prevents installation of:
- `facade/ignition`
- `spatie/laravel-ignition`
- `nunomaduro/collision`
- Other development-only packages

### 3. Clean up host cache files

```bash
# Navigate to backend directory
cd boardpxl-backend

# Delete corrupted cache files
rm -rf bootstrap/cache/services.php
rm -rf bootstrap/cache/packages.php
rm -rf bootstrap/cache/*.php
```

### 4. Rebuild and restart containers

```bash
# From project root (where docker-compose.yml is)
docker-compose down

# Rebuild from scratch without cache
docker-compose build --no-cache backend

# Start containers
docker-compose up -d

# Check logs
docker-compose logs backend --tail 50
```

## What This Does

- ✅ Reduces packages from 105 → **79 production packages**
- ✅ Avoids installing dev-only packages (Ignition, Collision, Termwind service providers)
- ✅ Prevents host cache corruption from affecting containers
- ✅ Ensures clean bootstrap cache on every container start
- ✅ Fixes all "Class not found" errors
- ✅ Container starts successfully on port 9000

## Verification

After following these steps, check the logs show:

```
INFO  Discovering packages.

laravel/sanctum ....................................................... DONE
laravel/tinker ........................................................ DONE
nesbot/carbon ......................................................... DONE
nunomaduro/termwind ................................................... DONE

INFO  Server running on [http://0.0.0.0:9000].
Press Ctrl+C to stop the server
```

Instead of errors about missing classes.

## Container Status

Verify all containers are running:

```bash
docker-compose ps
```

Expected output:
```
NAME         STATUS
backend      Up 29 seconds
frontend     Up 3 minutes
mysql        Up 28 minutes
phpmyadmin   Up 28 minutes
mailpit      Up 28 minutes
```

## Key Files Modified

1. **boardpxl-backend/.dockerignore** - NEW
   - Prevents bootstrap cache files from being copied into container

2. **boardpxl-backend/Dockerfile**
   - Added `--no-dev` flag to `composer install` command

3. **boardpxl-backend/bootstrap/cache/*** - DELETED
   - Removed all corrupted cache files from host machine
