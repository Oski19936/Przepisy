<?php
require_once 'config.php';

try {
    $stmt = $pdo->query("SELECT id, title, ingredients, description, tags, created_at FROM recipes ORDER BY created_at DESC");
    $recipes = [];
    while ($row = $stmt->fetch()) {
        $ingredientsArr = array_filter(array_map('trim', explode(',', $row['ingredients'])));
        $tagsArr = array_filter(array_map('trim', explode(',', $row['tags'])));
        $recipes[] = [
            "id"          => (int)$row['id'],
            "title"       => $row['title'],
            "ingredients" => $ingredientsArr,
            "description" => $row['description'],
            "tags"        => $tagsArr,
            "created_at"  => $row['created_at']
        ];
    }
    echo json_encode($recipes);
    exit;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Błąd zapytania: " . $e->getMessage()]);
    exit;
}
