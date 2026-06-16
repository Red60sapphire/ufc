<?php
require_once 'config.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit();
}

$stream_id = isset($_POST['stream_id']) ? intval($_POST['stream_id']) : 0;
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

if ($stream_id <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid stream']);
    exit();
}

if (empty($message)) {
    echo json_encode(['success' => false, 'error' => 'Message cannot be empty']);
    exit();
}

if (strlen($message) > 500) {
    echo json_encode(['success' => false, 'error' => 'Message too long']);
    exit();
}

// Check if stream exists
$stream_check = "SELECT id FROM streams WHERE id = ?";
$stmt = db_prepare($conn, $stream_check);
db_execute($stmt, [$stream_id]);

if ($conn instanceof SQLite3) {
    $result = $stmt;
} else {
    $result = $stmt->get_result();
}

if (db_num_rows($result) == 0) {
    echo json_encode(['success' => false, 'error' => 'Stream not found']);
    exit();
}

// Insert message
$insert_query = "INSERT INTO chat_messages (stream_id, user_id, message) VALUES (?, ?, ?)";
$stmt = db_prepare($conn, $insert_query);

if (db_execute($stmt, [$stream_id, $_SESSION['user_id'], $message])) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Failed to send message']);
}
?>
