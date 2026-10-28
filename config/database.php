<?php
declare(strict_types=1);

/** Render PostgreSQL configuration.
 * Set DATABASE_URL to the Internal Database URL in Render when this web service
 * and database belong to the same Render workspace/region. Never commit secrets.
 */
function bastion_db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;

    $databaseUrl = getenv('DATABASE_URL') ?: '';
    if ($databaseUrl !== '') {
        $parts = parse_url($databaseUrl);
        if (!$parts || empty($parts['host']) || empty($parts['path'])) {
            throw new RuntimeException('DATABASE_URL is not a valid PostgreSQL URL.');
        }
        $host = $parts['host'];
        $port = $parts['port'] ?? 5432;
        $dbname = ltrim($parts['path'], '/');
        $user = rawurldecode($parts['user'] ?? '');
        $pass = rawurldecode($parts['pass'] ?? '');
        $query = [];
        if (!empty($parts['query'])) parse_str($parts['query'], $query);
        $sslmode = $query['sslmode'] ?? 'require';
    } else {
        // Optional manual variables for deployments that don't provide DATABASE_URL.
        $host = getenv('DB_HOST') ?: '127.0.0.1';
        $port = (int)(getenv('DB_PORT') ?: 5432);
        $dbname = getenv('DB_NAME') ?: 'bastion_arena';
        $user = getenv('DB_USER') ?: 'postgres';
        $pass = getenv('DB_PASSWORD') ?: '';
        $sslmode = getenv('DB_SSLMODE') ?: 'require';
    }

    $dsn = sprintf('pgsql:host=%s;port=%d;dbname=%s;sslmode=%s', $host, $port, $dbname, $sslmode);
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_TIMEOUT => 5,
    ]);
    return $pdo;
}
