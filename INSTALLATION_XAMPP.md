# Installation — XAMPP + PostgreSQL

**Important :** XAMPP fournit Apache/PHP, mais son service « MySQL » est MariaDB, pas PostgreSQL. Cette édition utilise une base PostgreSQL locale ou distante (par exemple Supabase).

## 1. Placer le jeu
1. Décompresse le dossier dans `C:\xampp\htdocs\bastion\`.
2. Démarre **Apache** dans XAMPP.
3. Ouvre `http://localhost/bastion/` (ne lance pas le fichier HTML directement depuis le disque).

## 2. Activer PDO PostgreSQL
1. Dans XAMPP, clique sur **Apache > Config > PHP (php.ini)**.
2. Cherche `;extension=pdo_pgsql` et `;extension=pgsql`; retire le `;` au début si les lignes existent.
3. Enregistre puis redémarre Apache.
4. Si les extensions ne sont pas incluses dans ta version de PHP/XAMPP, installe une version compatible de PHP contenant `pdo_pgsql`.

## 3. Créer les tables
Crée une base PostgreSQL nommée `bastion_arena`, ou utilise ta base existante. Exécute `database/bastion.sql` dans cette base. Avec Supabase, ouvre **SQL Editor** et colle le contenu du fichier. **N'importe pas ce SQL dans phpMyAdmin.**

## 4. Configurer la connexion
Dans `config/database.php`, configure host, port, nom de base, utilisateur et mot de passe. Pour Supabase, récupère les paramètres dans **Project Settings > Database > Connection string** et règle `BASTION_DB_SSLMODE` sur `require`. Ne partage jamais le mot de passe ni la chaîne de connexion complète.

## 5. Tester
Ouvre `http://localhost/bastion/`, crée un compte, déconnecte-toi et reconnecte-toi. Les statistiques et records restent en local et se synchronisent avec PostgreSQL quand le joueur est connecté.

## Dépannage
- `could not find driver` : `pdo_pgsql` n'est pas disponible/activé dans PHP.
- `connection refused` : vérifie l'hôte, le port et l'accès réseau.
- Erreur SSL : vérifie le mode SSL (Supabase demande généralement `require`).
- Erreur d'authentification : vérifie les paramètres de `config/database.php`.
