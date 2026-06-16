<?php
require_once 'config.php';

header('Content-Type: application/json');

// Only admins can delete
if (!isLoggedIn() || !isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Not authorized']);
    exit;
}

$action = isset($_POST['action']) ? $_POST['action'] : '';

if ($action === 'delete_one') {
    $message_id = isset($_POST['message_id']) ? intval($_POST['message_id']) : 0;
    
    if ($message_id <= 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid message ID']);
        exit;
    }
    
    $query = "DELETE FROM chat_messages WHERE id = ?";
    $stmt = db_prepare($conn, $query);
    
    if (db_execute($stmt, [$message_id])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to delete message']);
    }
} 
elseif ($action === 'clear_stream') {
    $stream_id = isset($_POST['stream_id']) ? intval($_POST['stream_id']) : 0;
    
    if ($stream_id <= 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid stream ID']);
        exit;
    }
    
    $query = "DELETE FROM chat_messages WHERE stream_id = ?";
    $stmt = db_prepare($conn, $query);
    
    if (db_execute($stmt, [$stream_id])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to clear stream']);
    }
}
elseif ($action === 'clear_all') {
    $query = "DELETE FROM chat_messages";
    $stmt = db_prepare($conn, $query);
    
    if (db_execute($stmt, [])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to clear all messages']);
    }
}
else {
    echo json_encode(['success' => false, 'error' => 'Invalid action']);
}
?>
