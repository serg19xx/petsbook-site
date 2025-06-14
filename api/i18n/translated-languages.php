<?php
// Получаем только те языки, которые:
// 1. Переведены (already_translated = 1)
// 2. Имеют флаг
// 3. Должны показываться в диалоге (show_in_dialog = 1)
$query = "SELECT * FROM languages 
          WHERE is_enabled = 1 
          AND already_translated = 1 
          AND flag_icon IS NOT NULL 
          AND show_in_dialog = 1
          ORDER BY name ASC";

$stmt = $pdo->query($query);
$languages = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Декодируем HTML-сущности в названиях языков
foreach ($languages as &$lang) {
    $lang['name'] = html_entity_decode($lang['name'], ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $lang['native_name'] = html_entity_decode($lang['native_name'], ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

// Формируем ответ
$response = [
    'status' => 200,
    'data' => [
        'languages' => $languages
    ]
];

header('Content-Type: application/json');
echo json_encode($response); 