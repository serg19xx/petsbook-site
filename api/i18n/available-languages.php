<?php
// Получаем только те языки, которые:
// 1. Не переведены (already_translated = 0)
// 2. Имеют флаг
// 3. Должны показываться в диалоге (show_in_dialog = 1)
$query = "SELECT * FROM languages 
          WHERE is_enabled = 1 
          AND already_translated = 0 
          AND flag_icon IS NOT NULL 
          AND show_in_dialog = 1
          ORDER BY name ASC";

$stmt = $pdo->query($query);  ///adfgadfgad
$languages = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Формируем ответ
$response = [
    'status' => 200,
    'data' => [
        'languages' => $languages
    ]
];

header('Content-Type: application/json');
echo json_encode($response); 