<?php
require_once 'config.php';

header('Content-Type: application/json');

$debug = [
    'session_id' => session_id(),
    'session_status' => session_status(),
    'is_logged_in' => isLoggedIn(),
    'user_id' => $_SESSION['user_id'] ?? null,
    'username' => $_SESSION['username'] ?? null,
    'session_vars' => array_keys($_SESSION),
    'cookie_sent' => isset($_COOKIE['PHPSESSID']),
    'server_header_accept' => $_SERVER['HTTP_ACCEPT'] ?? 'not set',
    'request_method' => $_SERVER['REQUEST_METHOD'],
];

echo json_encode($debug);
?>
