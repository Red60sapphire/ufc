<?php
session_start();
$db = new SQLite3(__DIR__ . '/../database.db');

/* Admin check */
if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] != 1) {
    die("Not authorized");
}

/* Ensure table exists */
$db->exec("
CREATE TABLE IF NOT EXISTS ufc_replays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fighter1 TEXT,
    fighter2 TEXT,
    fighter1_img TEXT,
    fighter2_img TEXT,
    event TEXT,
    video_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
");

$msg = "";

/* Handle upload */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $fighter1 = trim($_POST['fighter1'] ?? '');
    $fighter2 = trim($_POST['fighter2'] ?? '');
    $event    = trim($_POST['event'] ?? '');
    $link     = trim($_POST['drive_link'] ?? '');

    if (!$fighter1 || !$fighter2 || !$event || !$link) {
        $msg = "Missing fields";
    } else {

        // Extract Google Drive ID
        preg_match('/\/d\/([a-zA-Z0-9_-]+)/', $link, $match);

        if (!isset($match[1])) {
            $msg = "Invalid Google Drive link";
        } else {

            $file_id = $match[1];

            $stmt = $db->prepare("
                INSERT INTO ufc_replays (fighter1, fighter2, event, video_url)
                VALUES (:f1, :f2, :event, :video)
            ");

            $stmt->bindValue(':f1', $fighter1);
            $stmt->bindValue(':f2', $fighter2);
            $stmt->bindValue(':event', $event);
            $stmt->bindValue(':video', $file_id);

            $stmt->execute();

            $msg = "Upload successful";
        }
    }
}
?>

<!DOCTYPE html>
<html>
<head>
<title>Upload UFC Replay</title>

<style>
body {
    background:#0b0b0b;
    color:white;
    font-family:Arial;
    padding:20px;
}

.box {
    max-width:500px;
    margin:auto;
    background:#151515;
    padding:20px;
    border-radius:10px;
}

input {
    width:100%;
    padding:10px;
    margin:8px 0;
    background:#111;
    border:1px solid #333;
    color:white;
    border-radius:6px;
}

button {
    width:100%;
    padding:12px;
    background:red;
    border:none;
    color:white;
    font-weight:bold;
    cursor:pointer;
    border-radius:6px;
}

.msg {
    margin-bottom:10px;
    color:#ff5555;
}
</style>
</head>

<body>

<div class="box">

<h2>🥊 Upload UFC Replay</h2>

<?php if ($msg): ?>
    <div class="msg"><?= htmlspecialchars($msg) ?></div>
<?php endif; ?>

<form method="POST">

    <input name="fighter1" placeholder="Fighter 1">
    <input name="fighter2" placeholder="Fighter 2">
    <input name="event" placeholder="Event Name">

    <input name="drive_link" placeholder="Google Drive Share Link">

    <button type="submit">Upload</button>

</form>

</div>

</body>
</html>