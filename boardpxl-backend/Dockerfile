FROM php:7.4.11-fpm

# Corriger les dépôts Debian archivés
RUN sed -i 's|deb.debian.org|archive.debian.org|g' /etc/apt/sources.list && \
    sed -i 's|security.debian.org|archive.debian.org|g' /etc/apt/sources.list && \
    echo 'Acquire::Check-Valid-Until "false";' > /etc/apt/apt.conf.d/99no-check-valid && \
    apt-get update && apt-get install -y \
        build-essential \
        libpng-dev \
        libjpeg-dev \
        libwebp-dev \
        libxpm-dev \
        libfreetype6-dev \
        libzip-dev \
        zip unzip git bash libonig-dev libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Installer les extensions PHP requises par Laravel 8
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install gd pdo_mysql pdo_pgsql mbstring zip exif pcntl bcmath opcache

# Installer Composer depuis l’image officielle
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Définir le dossier de travail
WORKDIR /var/www/html

# Copier le code Laravel
COPY . .

# Installer les dépendances Laravel
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Donner les bons droits
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Exposer le port du serveur Laravel
EXPOSE 9000

# Lancer le serveur Laravel et lancer php artisan schedule:work en arrière-plan
CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=9000 & php artisan schedule:work"]
