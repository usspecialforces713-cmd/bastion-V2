<?php
declare(strict_types=1);

ini_set('session.use_strict_mode', '1');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Lax');
$isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => $isHttps,
    'httponly' => true,
    'samesite' => 'Lax',
]);
if (session_status() !== PHP_SESSION_ACTIVE) session_start();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
require_once __DIR__ . '/../config/database.php';

function json_response(array $data, int $status = 200): never {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function request_json(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '', true);
    return is_array($data) ? $data : [];
}
function require_method(string $method): void {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $method) {
        header('Allow: ' . $method);
        json_response(['ok' => false, 'message' => 'Méthode non autorisée.'], 405);
    }
}
function current_user_id(): int {
    return isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : 0;
}
function require_login(): int {
    $id = current_user_id();
    if ($id < 1) json_response(['ok' => false, 'message' => 'Connecte-toi pour synchroniser la sauvegarde.'], 401);
    return $id;
}
function ensure_same_origin(): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') return; // Same-origin form/navigation clients may omit Origin.
    $host = $_SERVER['HTTP_HOST'] ?? '';
    $originHost = parse_url($origin, PHP_URL_HOST);
    if (!$originHost || strtolower((string)$originHost) !== strtolower(explode(':', $host)[0])) {
        json_response(['ok' => false, 'message' => 'Origine de requête refusée.'], 403);
    }
}
