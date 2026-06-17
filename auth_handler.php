<?php
require_once 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit();
}

$action   = $_POST['action']   ?? '';
$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

if ($action === 'login') {
    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'error' => 'Username and password are required']);
        exit();
    }

    $stmt = db_prepare($conn, "SELECT id, username, password, is_admin FROM users WHERE username = ?");
    db_execute($stmt, [$username]);
    $user = db_fetch_assoc($stmt);

    if (!$user) {
        echo json_encode(['success' => false, 'error' => 'User not found']);
        exit();
    }

    if (!password_verify($password, $user['password'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid password']);
        exit();
    }

    $_SESSION['user_id']  = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['is_admin'] = $user['is_admin'];

    echo json_encode(['success' => true]);
} elseif ($action === 'signup') {
    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'error' => 'Username and password are required']);
        exit();
    }

    if (strlen($password) < 6) {
        echo json_encode(['success' => false, 'error' => 'Password must be at least 6 characters']);
        exit();
    }

    $stmt = db_prepare($conn, "SELECT id FROM users WHERE username = ?");
    db_execute($stmt, [$username]);
    if (db_fetch_assoc($stmt)) {
        echo json_encode(['success' => false, 'error' => 'Username already taken']);
        exit();
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = db_prepare($conn, "INSERT INTO users (username, password) VALUES (?, ?)");
    db_execute($stmt, [$username, $hash]);
    $newId = db_insert_id($conn);

    $_SESSION['user_id']  = $newId;
    $_SESSION['username'] = $username;
    $_SESSION['is_admin'] = 0;

    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Unknown action']);
}
?>
