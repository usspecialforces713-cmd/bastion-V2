<?php
require_once __DIR__ . '/bootstrap.php';
require_method('POST');
ensure_same_origin();
$userId = require_login();
$data = request_json();
$profile = $data['profile'] ?? null;
$best = $data['best'] ?? null;
if (!is_array($profile) || !is_array($best)) json_response(['ok'=>false,'message'=>'Format de sauvegarde invalide.'], 422);
$cleanProfile = [
    'runs' => max(0, min(100000000, (int)($profile['runs'] ?? 0))),
    'kills' => max(0, min(1000000000, (int)($profile['kills'] ?? 0))),
    'highestLevel' => max(1, min(100000, (int)($profile['highestLevel'] ?? 1))),
];
$cleanBest = [
    'wave' => max(0, min(100000, (int)($best['wave'] ?? 0))),
    'score' => max(0, min(1000000000, (int)($best['score'] ?? 0))),
];
try {
    $pdo = bastion_db();
    $stmt = $pdo->prepare('SELECT profile_json, best_json FROM player_saves WHERE user_id = :uid LIMIT 1');
    $stmt->execute(['uid'=>$userId]);
    $old = $stmt->fetch();
    if ($old) {
        $oldProfile = json_decode((string)$old['profile_json'], true) ?: [];
        $oldBest = json_decode((string)$old['best_json'], true) ?: [];
        // Prevent a stale browser from lowering persistent stats/records.
        $cleanProfile['runs'] = max($cleanProfile['runs'], (int)($oldProfile['runs'] ?? 0));
        $cleanProfile['kills'] = max($cleanProfile['kills'], (int)($oldProfile['kills'] ?? 0));
        $cleanProfile['highestLevel'] = max($cleanProfile['highestLevel'], (int)($oldProfile['highestLevel'] ?? 1));
        if ((int)($oldBest['score'] ?? 0) > $cleanBest['score']) $cleanBest = ['score'=>(int)$oldBest['score'], 'wave'=>(int)($oldBest['wave'] ?? 0)];
    }
    $stmt = $pdo->prepare(
        'INSERT INTO player_saves (user_id, profile_json, best_json)
         VALUES (:uid, CAST(:profile AS JSONB), CAST(:best AS JSONB))
         ON CONFLICT (user_id) DO UPDATE SET
           profile_json = EXCLUDED.profile_json,
           best_json = EXCLUDED.best_json,
           updated_at = CURRENT_TIMESTAMP'
    );
    $stmt->execute([
        'uid' => $userId,
        'profile' => json_encode($cleanProfile, JSON_THROW_ON_ERROR),
        'best' => json_encode($cleanBest, JSON_THROW_ON_ERROR),
    ]);
    json_response(['ok'=>true,'profile'=>$cleanProfile,'best'=>$cleanBest,'savedAt'=>date(DATE_ATOM)]);
} catch (Throwable $e) {
    error_log('[Bastion save] ' . $e->getMessage());
    json_response(['ok'=>false,'message'=>'Impossible de sauvegarder sur le serveur.'], 500);
}
