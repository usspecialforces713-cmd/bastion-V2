<?php
require_once __DIR__ . '/bootstrap.php';
require_method('POST');
ensure_same_origin();
$data = request_json();
$action = (string)($data['action'] ?? 'login');
$username = trim((string)($data['username'] ?? ''));
$password = (string)($data['password'] ?? '');
if (!preg_match('/^[A-Za-z0-9_]{3,24}$/', $username)) json_response(['ok'=>false,'message'=>'Le nom doit contenir 3 à 24 caractères : lettres, chiffres ou _.'], 422);
if (strlen($password) < 8 || strlen($password) > 200) json_response(['ok'=>false,'message'=>'Le mot de passe doit contenir au moins 8 caractères.'], 422);
try {
    $pdo = bastion_db();
    if ($action === 'register') {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        try {
            $stmt = $pdo->prepare('INSERT INTO users (username, password_hash) VALUES (:username, :hash) RETURNING id');
            $stmt->execute(['username' => $username, 'hash' => $hash]);
        } catch (PDOException $e) {
            if ($e->getCode() === '23505') json_response(['ok'=>false,'message'=>'Ce nom d’utilisateur est déjà utilisé.'], 409);
            throw $e;
        }
        $userId = (int)$stmt->fetchColumn();
    } elseif ($action === 'login') {
        $stmt = $pdo->prepare('SELECT id, username, password_hash FROM users WHERE username = :username LIMIT 1');
        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch();
        if (!$user || !password_verify($password, $user['password_hash'])) json_response(['ok'=>false,'message'=>'Nom d’utilisateur ou mot de passe incorrect.'], 401);
        $userId = (int)$user['id'];
        $username = (string)$user['username'];
        $touch = $pdo->prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = :id');
        $touch->execute(['id' => $userId]);
    } else {
        json_response(['ok'=>false,'message'=>'Action inconnue.'], 400);
    }
    session_regenerate_id(true);
    $_SESSION['user_id'] = $userId;
    $_SESSION['username'] = $username;
    json_response(['ok'=>true,'user'=>['id'=>$userId,'username'=>$username]]);
} catch (Throwable $e) {
    error_log('[Bastion auth] ' . $e->getMessage());
    json_response(['ok'=>false,'message'=>'Erreur serveur/base de données. Vérifie l’installation XAMPP.'], 500);
}
