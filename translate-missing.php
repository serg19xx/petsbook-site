<?php
require_once __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

echo "asfafgsdfg";

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Получаем переменные окружения
$dbHost = getenv('DB_HOST');
$dbName = getenv('DB_NAME');
$dbUser = getenv('DB_USER');
$dbPass = getenv('DB_PASSWORD');


// Создаем подключение к БД
$db = new PDO(
    "mysql:host={$_ENV['DB_HOST']};dbname={$_ENV['DB_NAME']};charset=utf8mb4",
    $_ENV['DB_USER'],
    $_ENV['DB_PASSWORD']
);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);



var_dump($db);

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