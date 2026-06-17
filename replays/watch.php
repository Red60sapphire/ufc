<?php
require_once "../config.php";
$db = new SQLite3('../database.db');

$id = $_GET['id'] ?? null;

$stmt = $db->prepare("SELECT * FROM ufc_replays WHERE id = :id");
$stmt->bindValue(':id', $id);
$result = $stmt->execute();
$row = $result->fetchArray(SQLITE3_ASSOC);

if (!$row) {
    exit("Video not found");
}

$file = "../uploads/" . $row['video_path'];
?>
<!DOCTYPE html>
<html>
<head>
<title>Watch Replay</title>
<style>
body { background:#0b0b0b; color:white; text-align:center; font-family:Arial; }
video { width:80%; margin-top:40px; border:2px solid red; }
</style>
</head>
<body>

<h1><?= htmlspecialchars($row['fighter1']) ?> VS <?= htmlspecialchars($row['fighter2']) ?></h1>
<p><?= htmlspecialchars($row['event']) ?></p>

<video controls autoplay>
    <source src="<?= $file ?>" type="video/mp4">
</video>

</body>
</html>