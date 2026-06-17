<?php
session_start();

$db = new SQLite3(__DIR__ . '/../database.db');

// Ensure table exists (prevents silent failure)
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

// Fetch safely (won’t crash even if columns differ)
$result = $db->query("SELECT * FROM ufc_replays ORDER BY id DESC");
?>

<!DOCTYPE html>
<html>
<head>
<title>UFC Replays</title>

<style>
body {
    margin:0;
    font-family: Arial;
    background:#0b0b0b;
    color:white;
}

.header {
    padding:20px;
    font-size:26px;
    font-weight:bold;
    border-bottom:2px solid red;
}

.container {
    padding:20px;
}

.card {
    background:#151515;
    padding:15px;
    margin-bottom:12px;
    border-radius:10px;
}

.top {
    display:flex;
    align-items:center;
    justify-content:space-between;
}

.fighters {
    display:flex;
    align-items:center;
    gap:10px;
}

img {
    width:45px;
    height:45px;
    border-radius:50%;
    object-fit:cover;
    border:2px solid red;
}

.vs {
    color:red;
    font-weight:bold;
}

button {
    background:red;
    color:white;
    border:none;
    padding:8px 12px;
    border-radius:6px;
    cursor:pointer;
}

.video {
    margin-top:12px;
    display:none;
}

iframe, video {
    width:100%;
    height:400px;
    border:none;
    border-radius:8px;
}
</style>
</head>

<body>

<div class="header">🥊 UFC REPLAYS</div>

<div class="container">

<?php while ($row = $result->fetchArray(SQLITE3_ASSOC)): ?>

<?php
$video = $row['video_url'] ?? '';
$videoEmbed = $video;

// convert youtube link
if (strpos($video, 'watch?v=') !== false) {
    $videoEmbed = str_replace('watch?v=', 'embed/', $video);
}
if (strpos($video, 'youtu.be/') !== false) {
    $id = basename($video);
    $videoEmbed = "https://www.youtube.com/embed/" . $id;
}
?>

<div class="card">

    <div class="top">
        <div class="fighters">
            <img src="<?= htmlspecialchars($row['fighter1_img'] ?? '') ?>">
            <b><?= htmlspecialchars($row['fighter1'] ?? 'TBD') ?></b>

            <div class="vs">VS</div>

            <img src="<?= htmlspecialchars($row['fighter2_img'] ?? '') ?>">
            <b><?= htmlspecialchars($row['fighter2'] ?? 'TBD') ?></b>
        </div>

        <button onclick="toggleVideo(<?= $row['id'] ?>)">WATCH</button>
    </div>

    <div style="margin-top:6px;color:#aaa;font-size:12px;">
        <?= htmlspecialchars($row['event'] ?? '') ?>
    </div>

    <div class="video" id="video-<?= $row['id'] ?>">

        <?php if ($video && strpos($video, '.mp4') !== false): ?>
            <video controls>
                <source src="<?= htmlspecialchars($video) ?>">
            </video>
        <?php elseif ($video): ?>
            <iframe src="<?= htmlspecialchars($videoEmbed) ?>" allowfullscreen></iframe>
        <?php else: ?>
            <p style="color:#888">No video uploaded</p>
        <?php endif; ?>

    </div>

</div>

<?php endwhile; ?>

</div>

<script>
function toggleVideo(id) {
    const el = document.getElementById("video-" + id);
    if (!el) return;
    el.style.display = (el.style.display === "block") ? "none" : "block";
}
</script>

</body>
</html>