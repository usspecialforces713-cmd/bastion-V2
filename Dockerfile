FROM php:8.3-apache

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && a2enmod headers rewrite \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html
COPY . /var/www/html/
RUN chown -R www-data:www-data /var/www/html \
    && printf 'ServerName localhost\n' > /etc/apache2/conf-available/servername.conf \
    && a2enconf servername

ENV PORT=80
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD php -r '$c=@file_get_contents("http://127.0.0.1/health.php"); exit($c!==false?0:1);'
