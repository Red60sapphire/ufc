<?php
require_once 'config.php';

header('Content-Type: application/json');

$action = isset($_POST['action']) ? $_POST['action'] : (isset($_GET['action']) ? $_GET['action'] : '');

if ($action === 'send_message') {
    // Handle message send through this proxy endpoint
    
    if (!isLoggedIn()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Not logged in']);
        exit();
    }
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit();
    }
    
    $stream_id = isset($_POST['stream_id']) ? intval($_POST['stream_id']) : 0;
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';
    
    if (!$stream_id || empty($message)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing parameters']);
        exit();
    }
    
    if (strlen($message) > 500) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Message too long']);
        exit();
    }
    
    // Check if stream exists
    $stmt = db_prepare($conn, "SELECT id FROM streams WHERE id = ?");
    db_execute($stmt, [$stream_id]);
    $result = $conn instanceof SQLite3 ? $stmt : $stmt->get_result();
    
    if (db_num_rows($result) == 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Stream not found']);
        exit();
    }
    
    // Insert message
    $stmt = db_prepare($conn, "INSERT INTO chat_messages (stream_id, user_id, message) VALUES (?, ?, ?)");
    if (db_execute($stmt, [$stream_id, $_SESSION['user_id'], $message])) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to save message']);
    }
    exit();
}

if ($action === 'get_messages') {
    $stream_id = isset($_GET['stream_id']) ? intval($_GET['stream_id']) : 0;
    
    if (!$stream_id) {
        echo json_encode(['messages' => []]);
        exit();
    }
    
    $stmt = db_prepare($conn, "SELECT cm.*, u.username FROM chat_messages cm JOIN users u ON cm.user_id = u.id WHERE cm.stream_id = ? ORDER BY cm.created_at ASC LIMIT 100");
    db_execute($stmt, [$stream_id]);
    $result = $conn instanceof SQLite3 ? $stmt : $stmt->get_result();
    
    $messages = [];
    while ($row = db_fetch_assoc($result)) {
        $messages[] = [
            'username' => $row['username'],
            'message' => $row['message'],
            'time' => date('g:i A', strtotime($row['created_at']))
        ];
    }
    
    echo json_encode(['messages' => $messages]);
    exit();
}

// Unknown action
http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Unknown action']);
?>
