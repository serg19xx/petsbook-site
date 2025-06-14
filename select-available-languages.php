<?php
// Получаем переменные окружения
$dbHost = getenv('DB_HOST');
$dbName = getenv('DB_NAME');
$dbUser = getenv('DB_USER');
$dbPass = getenv('DB_PASS');

// Подключение к базе
$pdo = new PDO(
    "mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4",
    $dbUser,
    $dbPass,
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
);

// Получаем языки для выпадающего списка
$stmt = $pdo->query("SELECT code, name, native_name, flag_icon FROM i18n_locales WHERE already_translated = 1 ORDER BY name");
$languages = $stmt->fetchAll();

if (!$languages) {
    echo "Нет доступных языков\n";
    exit(0);
}

echo "Доступные языки:\n";
foreach ($languages as $lang) {
    echo "{$lang['code']} | {$lang['name']} | {$lang['native_name']} | {$lang['flag_icon']}\n";
} 