<?php
require_once 'config.php';

header('Content-Type: application/json');

$stream_id = isset($_GET['stream_id']) ? intval($_GET['stream_id']) : 0;

if ($stream_id <= 0) {
    echo json_encode(['messages' => []]);
    exit();
}

$query = "SELECT cm.id, cm.message, cm.created_at, u.username, u.is_admin
          FROM chat_messages cm 
          JOIN users u ON cm.user_id = u.id 
          WHERE cm.stream_id = ? 
          ORDER BY cm.created_at ASC 
          LIMIT 100";

$stmt = db_prepare($conn, $query);
db_execute($stmt, [$stream_id]);

$messages = [];
while ($row = db_fetch_assoc($stmt)) {
    $messages[] = [
        'id' => $row['id'],
        'username' => $row['username'],
        'message' => $row['message'],
        'time' => date('g:i A', strtotime($row['created_at'])),
        'is_admin' => (int)$row['is_admin'] === 1
    ];
}

echo json_encode(['messages' => $messages]);
?>
