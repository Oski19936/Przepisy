<?php
require_once 'config.php';

$stmt = $pdo->query("SELECT id, title, ingredients, description, tags, created_at FROM recipes ORDER BY created_at DESC");
$recipes = [];

while($row = $stmt->fetch()) {
    // rozbijamy składniki na tablicę
    $ingredientsArr = array_filter(array_map('trim', explode(',', $row['ingredients'])));
    // rozbijamy tagi na tablicę
    $tagsArr = array_filter(array_map('trim', explode(',', $row['tags'])));
    $recipes[] = [
        "id" => (int)$row['id'],
        "title" => $row['title'],
        "ingredients" => $ingredientsArr,
        "description" => $row['description'],
        "tags" => $tagsArr,
        "created_at" => $row['created_at']
    ];
}

echo json_encode($recipes);
exit;
