<?php
require_once __DIR__ . '/bootstrap.php';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'GET') {
    if (current_user_id() < 1) json_response(['ok'=>true,'user'=>null]);
    json_response(['ok'=>true,'user'=>['id'=>current_user_id(),'username'=>(string)($_SESSION['username'] ?? '')]]);
}
if ($method === 'POST') {
    ensure_same_origin();
    $data = request_json();
    if (($data['action'] ?? '') !== 'logout') json_response(['ok'=>false,'message'=>'Action inconnue.'], 400);
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', (bool)$params['secure'], (bool)$params['httponly']);
    }
    session_destroy();
    json_response(['ok'=>true]);
}
require_method('GET');
