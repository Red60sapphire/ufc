<?php
require_once 'config.php';

function send_json($payload) {
    header('Content-Type: application/json');
    echo json_encode($payload);
    exit();
}

function redirect_back($message) {
    $redirect = $_POST['redirect'] ?? 'index.php';
    header('Location: ' . $redirect . (strpos($redirect, '?') === false ? '?' : '&') . 'chat_error=' . urlencode($message));
    exit();
}

// Debug logging for troubleshooting
$is_json_request = isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;
error_log('send_chat: method=' . $_SERVER['REQUEST_METHOD'] . ' logged_in=' . (isLoggedIn() ? 'yes' : 'no') . ' session_id=' . (session_id() ?: 'none') . ' user_id=' . ($_SESSION['user_id'] ?? 'none'));

// Check if user is logged in
if (!isLoggedIn()) {
    error_log('send_chat: login check failed, is_json=' . ($is_json_request ? 'yes' : 'no'));
    if ($is_json_request) {
        send_json(['success' => false, 'error' => 'Not logged in']);
    }
    redirect_back('Not logged in');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_log('send_chat: invalid method ' . $_SERVER['REQUEST_METHOD']);
    if ($is_json_request) {
        send_json(['success' => false, 'error' => 'Invalid request method']);
    }
    redirect_back('Invalid request method');
}

$stream_id = isset($_POST['stream_id']) ? intval($_POST['stream_id']) : 0;
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

if (!isset($_POST['stream_id']) || !isset($_POST['message'])) {
    error_log('send_chat: missing params, stream_id=' . (isset($_POST['stream_id']) ? 'yes' : 'no') . ' message=' . (isset($_POST['message']) ? 'yes' : 'no'));
    if ($is_json_request) {
        send_json(['success' => false, 'error' => 'Missing parameters']);
    }
    redirect_back('Missing parameters');
}

if ($stream_id <= 0) {
    error_log('send_chat: invalid stream_id ' . $stream_id);
    if ($is_json_request) {
        send_json(['success' => false, 'error' => 'Invalid stream']);
    }
    redirect_back('Invalid stream');
}

if (empty($message)) {
    error_log('send_chat: message empty');
    if ($is_json_request) {
        send_json(['success' => false, 'error' => 'Message cannot be empty']);
    }
    redirect_back('Message cannot be empty');
}

if (strlen($message) > 500) {
    error_log('send_chat: message too long');
    if ($is_json_request) {
        send_json(['success' => false, 'error' => 'Message too long']);
    }
    redirect_back('Message too long');
}

// Check if stream exists
$stream_check = "SELECT id FROM streams WHERE id = ?";
$stmt = db_prepare($conn, $stream_check);
db_execute($stmt, [$stream_id]);

if (db_num_rows($stmt) == 0) {
    error_log('send_chat: stream not found, stream_id=' . $stream_id);
    send_json(['success' => false, 'error' => 'Stream not found']);
}

// Insert message
$insert_query = "INSERT INTO chat_messages (stream_id, user_id, message) VALUES (?, ?, ?)";
$stmt = db_prepare($conn, $insert_query);

if (db_execute($stmt, [$stream_id, $_SESSION['user_id'], $message])) {
    error_log('send_chat: success, user_id=' . $_SESSION['user_id'] . ' stream_id=' . $stream_id);
    if ($is_json_request) {
        send_json(['success' => true]);
    }
    redirect_back('');
} else {
    error_log('send_chat: insert failed for stream_id=' . $stream_id . ' user_id=' . $_SESSION['user_id']);
    if ($is_json_request) {
        send_json(['success' => false, 'error' => 'Failed to send message']);
    }
    redirect_back('Failed to send message');
}
?>
