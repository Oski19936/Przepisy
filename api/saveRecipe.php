<?php
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (
    !isset($data['title']) ||
    !isset($data['ingredients']) ||
    !isset($data['description'])
) {
    http_response_code(400);
    echo json_encode(["error" => "Brak wymaganych pól"]);
    exit;
}

$title = trim($data['title']);
$ingredientsArr = $data['ingredients'];
$description = trim($data['description']);
$tagsArr = isset($data['tags']) ? $data['tags'] : [];

if ($title === '' || empty($ingredientsArr) || $description === '') {
    http_response_code(400);
    echo json_encode(["error" => "Nieprawidłowe dane"]);
    exit;
}

$ingredients = implode(',', array_map('trim', $ingredientsArr));
$tags = implode(',', array_map('trim', $tagsArr));

try {
    $stmt = $pdo->prepare("
        INSERT INTO recipes (title, ingredients, description, tags)
        VALUES (:title, :ingredients, :description, :tags)
    ");
    $stmt->execute([
        'title'       => $title,
        'ingredients' => $ingredients,
        'description' => $description,
        'tags'        => $tags
    ]);
    $newId = $pdo->lastInsertId();

    $stmt2 = $pdo->prepare("SELECT id, title, ingredients, description, tags, created_at FROM recipes WHERE id = :id");
    $stmt2->execute(['id' => $newId]);
    $row = $stmt2->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(500);
        echo json_encode(["error" => "Nie znaleziono zapisanego rekordu"]);
        exit;
    }

    $saved = [
        "id"          => (int)$row['id'],
        "title"       => $row['title'],
        "ingredients" => array_filter(array_map('trim', explode(',', $row['ingredients']))),
        "description" => $row['description'],
        "tags"        => array_filter(array_map('trim', explode(',', $row['tags']))),
        "created_at"  => $row['created_at']
    ];

    http_response_code(201);
    echo json_encode($saved);
    exit;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Błąd zapisu: " . $e->getMessage()]);
    exit;
}
