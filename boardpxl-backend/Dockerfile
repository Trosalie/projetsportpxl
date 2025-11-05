FROM php:8.3.11-fpm

# Installer dépendances système
RUN apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    libjpeg-dev \
    libwebp-dev \
    libxpm-dev \
    libfreetype6-dev \
    libzip-dev \
    zip unzip git bash libonig-dev libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Installer extensions PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install gd pdo pdo_pgsql mbstring zip exif pcntl bcmath opcache

# Installer Composer
COPY --from=composer/composer:latest-bin /composer /usr/bin/composer

# Définir le répertoire de travail
WORKDIR /var/www/html

# Copier tout le projet Laravel d'un coup (pour que 'artisan' soit déjà présent)
COPY . .

# Installer les dépendances Composer
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Donner les bonnes permissions
RUN chown -R www-data:www-data /var/www/html

# Exposer le port de Laravel
EXPOSE 9000

# Lancer le serveur Laravel
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=9000"]
