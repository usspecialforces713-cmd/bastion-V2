<?php
require_once __DIR__ . '/bootstrap.php';
require_method('GET');
$userId = require_login();
try {
    $stmt = bastion_db()->prepare('SELECT profile_json, best_json, updated_at FROM player_saves WHERE user_id = :uid LIMIT 1');
    $stmt->execute(['uid'=>$userId]);
    $row = $stmt->fetch();
    if (!$row) json_response(['ok'=>true,'save'=>null]);
    json_response(['ok'=>true,'save'=>[
        'profile'=>json_decode((string)$row['profile_json'], true) ?: ['runs'=>0,'kills'=>0,'highestLevel'=>1],
        'best'=>json_decode((string)$row['best_json'], true) ?: ['wave'=>0,'score'=>0],
        'updatedAt'=>$row['updated_at'],
    ]]);
} catch (Throwable $e) {
    error_log('[Bastion load] ' . $e->getMessage());
    json_response(['ok'=>false,'message'=>'Impossible de charger la sauvegarde.'], 500);
}
