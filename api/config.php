<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

define('DB_HOST', 'oski1993.mysql.dhosting.pl');
define('DB_NAME', 'eenga9_przepisy');
define('DB_USER', 'eecev3_przepisy');
define('DB_PASS', 'ahNaephoo9yo');

try {
    $pdo = new PDO(
        "mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Błąd połączenia z bazą: " . $e->getMessage()]);
    exit;
}
