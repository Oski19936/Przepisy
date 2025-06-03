<?php
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Brak parametru id"]);
    exit;
}

$id = (int)$data['id'];
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Nieprawidłowe id"]);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM recipes WHERE id = :id");
    $stmt->execute(['id' => $id]);
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(["error" => "Przepis o podanym id nie istnieje"]);
        exit;
    }
    echo json_encode(["success" => true]);
    exit;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
    exit;
}
