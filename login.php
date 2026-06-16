<?php
require_once 'config.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = sanitize($conn, $_POST['username']);
    $password = $_POST['password'];
    
    if (empty($username) || empty($password)) {
        $error = 'Username and password are required';
    } else {
        $query = "SELECT id, username, email, password, is_admin FROM users WHERE username = ?";
        $stmt = db_prepare($conn, $query);
        db_execute($stmt, [$username]);
        
        if ($conn instanceof SQLite3) {
            $result = $stmt;
        } else {
            $result = $stmt->get_result();
        }
        
        if (db_num_rows($result) == 1) {
            $user = db_fetch_assoc($result);
            if (password_verify($password, $user['password'])) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['email'] = $user['email'];
                $_SESSION['is_admin'] = $user['is_admin'];
                
                redirect('index.php');
            } else {
                $error = 'Invalid password';
            }
        } else {
            $error = 'User not found';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In - ufc.solutions</title>
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Roboto', sans-serif;
            background:
                radial-gradient(120% 80% at 50% 0%, rgba(210,10,10,.18), transparent 60%),
                #0b0b0d;
            min-height: 100vh; display: flex; justify-content: center; align-items: center;
            padding: 20px; color: #fff;
        }
        .container {
            background: #131316; padding: 40px; border-radius: 12px;
            border: 1px solid #2a2a30; box-shadow: 0 20px 60px rgba(0,0,0,.5);
            width: 100%; max-width: 400px;
        }
        .brand { font-family: 'Oswald', sans-serif; font-size: 30px; font-weight: 700; text-align: center; letter-spacing: 1px; }
        .brand span { color: #d20a0a; }
        h1 { font-family: 'Oswald', sans-serif; text-align: center; margin: 6px 0 26px; font-size: 18px; font-weight: 500; color: #9a9aa2; text-transform: uppercase; letter-spacing: 2px; }
        .form-group { margin-bottom: 18px; }
        label { display: block; margin-bottom: 6px; color: #cfcfd4; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; }
        input[type="text"], input[type="password"] {
            width: 100%; padding: 13px; background: #1a1a1f; border: 1px solid #2a2a30;
            border-radius: 6px; font-size: 16px; color: #fff;
        }
        input:focus { outline: none; border-color: #d20a0a; }
        button {
            width: 100%; padding: 13px; background: #d20a0a; color: #fff; border: none;
            border-radius: 6px; font-size: 15px; font-weight: 700; cursor: pointer;
            font-family: 'Oswald', sans-serif; letter-spacing: 1px; text-transform: uppercase;
            transition: background .2s, transform .15s; margin-top: 4px;
        }
        button:hover { background: #b00808; transform: translateY(-1px); }
        .error { background: rgba(210,10,10,.15); color: #ff6b6b; padding: 11px; border-radius: 6px; margin-bottom: 18px; border-left: 3px solid #d20a0a; font-size: 14px; }
        .signup-link { text-align: center; margin-top: 22px; color: #9a9aa2; font-size: 14px; }
        .signup-link a { color: #d20a0a; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="brand">UFC<span>.SOLUTIONS</span></div>
        <h1>Sign In</h1>
        <?php if ($error): ?>
            <div class="error"><?php echo $error; ?></div>
        <?php endif; ?>
        <form method="POST">
            <div class="form-group">
                <label>Username</label>
                <input type="text" name="username" required autofocus>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" name="password" required>
            </div>
            <button type="submit">Sign In</button>
        </form>
        <div class="signup-link">
            Don't have an account? <a href="signup.php">Sign up</a>
        </div>
    </div>
</body>
</html>
