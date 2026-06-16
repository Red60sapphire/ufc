<?php
require_once 'config.php';

// Curated UFC data acts as the always-available baseline / fallback so the page
// is never blank, even when the live API is unreachable.
$ufc_config = file_exists('ufc_config.php') ? require 'ufc_config.php' : null;

$ufc_events = (isset($ufc_config['current_event'])) ? [$ufc_config['current_event']] : [];
$ufc_rankings = $ufc_config['rankings'] ?? [];
$ufc_news = $ufc_config['news'] ?? [];
$featured_fights = $ufc_config['featured_fights'] ?? [];

// Get current stream ID from URL or default to latest live stream
$current_stream_id = isset($_GET['stream']) ? intval($_GET['stream']) : null;

// Get all streams
$streams_query = "SELECT s.*, u.username as creator_username FROM streams s JOIN users u ON s.created_by = u.id ORDER BY is_live DESC, created_at DESC";
$streams_result = db_query($conn, $streams_query);

// If no stream specified, get the first live stream or the most recent stream
if (!$current_stream_id && db_num_rows($streams_result) > 0) {
    if ($conn instanceof SQLite3) {
        $streams_result->reset();
    }
    $first_stream = db_fetch_assoc($streams_result);
    $current_stream_id = $first_stream['id'];
    if ($conn instanceof SQLite3) {
        $streams_result->reset();
    } else {
        $streams_result->data_seek(0);
    }
}

// Get current stream details
$current_stream = null;
if ($current_stream_id) {
    $stream_query = "SELECT s.*, u.username as creator_username FROM streams s JOIN users u ON s.created_by = u.id WHERE s.id = ?";
    $stmt = db_prepare($conn, $stream_query);
    db_execute($stmt, [$current_stream_id]);

    if ($conn instanceof SQLite3) {
        $stream_result = $stmt;
    } else {
        $stream_result = $stmt->get_result();
    }

    if (db_num_rows($stream_result) > 0) {
        $current_stream = db_fetch_assoc($stream_result);
    }
}

// Overlay live data from the ESPN-backed fetcher on top of the curated baseline.
// Any section the live API can't provide keeps its curated value, so the page
// always renders real content.
$useLiveAPI = false;
$fighter_a_detail = null; // headliner / "Tale of the Tape" left
$fighter_b_detail = null; // "Tale of the Tape" right
if (file_exists('api/ufc_data_fetcher.php')) {
    try {
        require_once 'api/ufc_data_fetcher.php';
        $fetcher = new UFCDataFetcher();

        $liveEvents = $fetcher->getUpcomingEvents(6);
        if (!empty($liveEvents)) {
            $ufc_events = $liveEvents;
            $useLiveAPI = true;

            // Pull full bios for the main-event fighters (featured card + tape).
            $mainBout = $liveEvents[0]['main_event'] ?? null;
            if ($mainBout) {
                $fighter_a_detail = $fetcher->getAthlete($mainBout['id_a'] ?? null);
                $fighter_b_detail = $fetcher->getAthlete($mainBout['id_b'] ?? null);
            }
        }

        $liveNews = $fetcher->getLatestNews(5);
        if (!empty($liveNews)) {
            $ufc_news = $liveNews;
        }

        // ESPN has no rankings endpoint; getRankings() returns [] and rankings
        // stay sourced from the curated config above.
        $liveRankings = $fetcher->getRankings('lightweight');
        if (!empty($liveRankings)) {
            $ufc_rankings = $liveRankings;
        }
    } catch (\Throwable $e) {
        error_log("UFC live data unavailable, using curated config: " . $e->getMessage());
    }
}

// Convenience handles for the templates below.
$primary_event = $ufc_events[0] ?? null;
$main_bout = $primary_event['main_event'] ?? null;
$silhouette = 'https://a.espncdn.com/combiner/i?img=/i/headshots/nophoto.png&w=350&h=254';

function last_name($full) {
    $parts = preg_split('/\s+/', trim((string)$full));
    $last = end($parts);
    return $last !== false ? $last : $full;
}
function tape_val($v) {
    return ($v === '' || $v === null) ? '—' : $v;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ufc.solutions - FREE UFC STREAMS</title>
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
            --red: #d20a0a;
            --bg: #0b0b0d;
            --panel: #131316;
            --panel-2: #1a1a1f;
            --line: #2a2a30;
            --muted: #9a9aa2;
        }
        body {
            font-family: 'Roboto', sans-serif;
            background: var(--bg);
            color: #fff;
            min-height: 100vh;
        }
        a { color: inherit; text-decoration: none; }
        img { display: block; }
        .oswald { font-family: 'Oswald', sans-serif; }

        /* Top announcement */
        .top-bar {
            background: linear-gradient(90deg, #d20a0a 0%, #8b0000 50%, #d20a0a 100%);
            padding: 8px 0; text-align: center; font-size: 12px;
            font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
        }

        /* Navbar */
        .navbar {
            background: #000; height: 64px; display: flex; align-items: center;
            justify-content: space-between; padding: 0 28px;
            border-bottom: 1px solid var(--line); position: sticky; top: 0; z-index: 50;
        }
        .logo { font-family: 'Oswald', sans-serif; font-size: 30px; font-weight: 700; letter-spacing: 1px; cursor: pointer; }
        .logo span { color: var(--red); }
        .nav-links { display: flex; gap: 26px; align-items: center; }
        .nav-links a { font-family: 'Oswald', sans-serif; font-weight: 500; font-size: 15px; letter-spacing: .5px; text-transform: uppercase; color: #e8e8ea; transition: color .2s; }
        .nav-links a:hover { color: var(--red); }
        .nav-right { display: flex; align-items: center; gap: 14px; }
        .nav-right .icon-btn { background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; }
        .btn {
            font-family: 'Oswald', sans-serif; font-weight: 600; text-transform: uppercase;
            letter-spacing: .5px; border: none; cursor: pointer; border-radius: 4px;
            padding: 9px 18px; font-size: 14px; transition: transform .15s, background .2s;
        }
        .btn:hover { transform: translateY(-1px); }
        .btn-outline { background: transparent; border: 1px solid #3a3a42; color: #fff; }
        .btn-outline:hover { border-color: var(--red); }
        .btn-red { background: var(--red); color: #fff; }
        .btn-red:hover { background: #b00808; }

        .wrap { max-width: 1320px; margin: 0 auto; padding: 22px; }

        /* Hero grid */
        .hero-grid { display: grid; grid-template-columns: 1.55fr 1fr; gap: 18px; }
        .hero {
            position: relative; border-radius: 10px; overflow: hidden; min-height: 430px;
            background:
                radial-gradient(120% 90% at 50% 0%, rgba(210,10,10,.25), transparent 60%),
                linear-gradient(180deg, #1c1c22 0%, #0d0d10 100%);
            border: 1px solid var(--line); display: flex; flex-direction: column; justify-content: flex-end;
        }
        .hero-faces { position: absolute; inset: 0; display: flex; justify-content: space-between; align-items: flex-end; }
        .hero-faces img { max-height: 96%; max-width: 52%; width: auto; object-fit: contain; object-position: bottom; filter: drop-shadow(0 10px 24px rgba(0,0,0,.6)); }
        .hero-faces .gradient-floor { position: absolute; bottom: 0; left: 0; right: 0; height: 55%; background: linear-gradient(180deg, transparent, rgba(11,11,13,.95)); }
        .hero-content { position: relative; z-index: 2; text-align: center; padding: 28px 24px 30px; }
        .event-badge { display: inline-block; background: var(--red); color: #fff; font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 1px; padding: 5px 12px; border-radius: 3px; margin-bottom: 12px; text-transform: uppercase; }
        .hero-title { font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 52px; line-height: .98; text-transform: uppercase; letter-spacing: 1px; }
        .hero-title .vs { color: var(--red); }
        .hero-sub { color: #cfcfd4; font-family: 'Oswald', sans-serif; font-weight: 500; letter-spacing: 2px; margin-top: 8px; text-transform: uppercase; font-size: 14px; }
        .hero-date { color: var(--red); font-family: 'Oswald', sans-serif; font-weight: 600; margin-top: 12px; letter-spacing: 1px; }
        .hero-meta { color: var(--muted); font-size: 13px; margin-top: 4px; }
        .hero-actions { margin-top: 18px; display: flex; gap: 12px; justify-content: center; }

        /* Fight card panel */
        .panel { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
        .card-head { background: #000; padding: 16px 18px; text-align: center; border-bottom: 1px solid var(--line); }
        .card-head h3 { font-family: 'Oswald', sans-serif; font-size: 22px; letter-spacing: 1px; text-transform: uppercase; }
        .card-head .sub { color: var(--muted); font-size: 12px; margin-top: 3px; text-transform: uppercase; letter-spacing: 1px; }
        .tabs { display: flex; border-bottom: 1px solid var(--line); }
        .tab { flex: 1; padding: 12px 6px; background: var(--panel-2); border: none; color: var(--muted); font-family: 'Oswald', sans-serif; font-weight: 600; font-size: 12px; letter-spacing: .5px; text-transform: uppercase; cursor: pointer; border-bottom: 2px solid transparent; }
        .tab.active { color: #fff; background: var(--panel); border-bottom-color: var(--red); }
        .bouts { max-height: 470px; overflow-y: auto; }
        .bout { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 8px; padding: 12px 14px; border-bottom: 1px solid var(--line); }
        .bout:hover { background: var(--panel-2); }
        .bout .f { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .bout .f.right { flex-direction: row-reverse; text-align: right; }
        .bout .f img { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; background: #000; border: 1px solid var(--line); }
        .bout .nm { font-family: 'Oswald', sans-serif; font-weight: 600; font-size: 14px; line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bout .rec { color: var(--muted); font-size: 11px; }
        .bout .mid { text-align: center; min-width: 64px; }
        .bout .mid .vs { color: var(--red); font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 13px; }
        .bout .mid .wc { color: var(--muted); font-size: 10px; text-transform: uppercase; letter-spacing: .5px; margin-top: 2px; }
        .card-foot { padding: 14px; }
        .card-foot .btn { width: 100%; }

        /* Section heading */
        .section { margin-top: 22px; }
        .section-title { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .section-title h2 { font-family: 'Oswald', sans-serif; font-size: 20px; letter-spacing: 1px; text-transform: uppercase; }
        .section-title a { color: var(--red); font-family: 'Oswald', sans-serif; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; }

        /* Events carousel */
        .events-row { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(220px, 1fr); gap: 14px; overflow-x: auto; padding-bottom: 6px; }
        .event-card {
            position: relative; border-radius: 8px; overflow: hidden; border: 1px solid var(--line);
            background: linear-gradient(135deg, #1d1d23, #0e0e11); padding: 18px 16px; min-height: 110px; cursor: pointer;
            transition: transform .15s, border-color .2s;
        }
        .event-card:hover { transform: translateY(-3px); border-color: var(--red); }
        .event-card .en { font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 20px; }
        .event-card .en span { color: var(--red); }
        .event-card .ed { color: #fff; font-family: 'Oswald', sans-serif; font-weight: 600; letter-spacing: 1px; margin-top: 8px; text-transform: uppercase; font-size: 13px; }
        .event-card .ev { color: var(--muted); font-size: 12px; margin-top: 3px; }

        /* Bottom grid */
        .bottom-grid { display: grid; grid-template-columns: 1fr 1.2fr 1fr; gap: 18px; }

        /* Featured fighter */
        .fighter-card { position: relative; }
        .fighter-card .fc-body { display: flex; gap: 14px; padding: 18px; }
        .fighter-card .fc-info { flex: 1; }
        .fighter-card .fc-name { font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 26px; line-height: 1; text-transform: uppercase; }
        .fighter-card .fc-name small { display: block; font-size: 13px; color: var(--muted); font-weight: 500; letter-spacing: 1px; }
        .fighter-card .fc-photo { width: 130px; }
        .fighter-card .fc-photo img { width: 130px; height: 150px; object-fit: cover; object-position: top; border-radius: 8px; background: #000; }
        .fc-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; margin-top: 14px; }
        .fc-stats .s .n { font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 18px; }
        .fc-stats .s .l { color: var(--muted); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
        .fc-country { display: flex; align-items: center; gap: 8px; margin-top: 6px; color: var(--muted); font-size: 13px; }
        .fc-country img { width: 22px; height: auto; border-radius: 2px; }
        .fc-champ { display: inline-block; background: var(--red); color: #fff; font-size: 10px; font-weight: 700; letter-spacing: 1px; padding: 3px 8px; border-radius: 3px; text-transform: uppercase; margin-top: 8px; }
        .fc-tabs { display: flex; gap: 16px; padding: 12px 18px; border-top: 1px solid var(--line); }
        .fc-tabs span { color: var(--muted); font-family: 'Oswald', sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: .5px; cursor: pointer; }
        .fc-tabs span:first-child { color: var(--red); border-bottom: 2px solid var(--red); padding-bottom: 4px; }

        /* News */
        .news-panel { padding: 0; }
        .news-lead { position: relative; border-radius: 10px 10px 0 0; overflow: hidden; }
        .news-lead img { width: 100%; height: 230px; object-fit: cover; }
        .news-lead .ov { position: absolute; bottom: 0; left: 0; right: 0; padding: 16px; background: linear-gradient(transparent, rgba(0,0,0,.92)); }
        .news-lead .ov h3 { font-family: 'Oswald', sans-serif; font-size: 22px; line-height: 1.05; text-transform: uppercase; }
        .news-lead .ov .t { color: var(--muted); font-size: 12px; margin-top: 6px; }
        .news-list { padding: 6px 0; }
        .news-item { display: flex; gap: 12px; padding: 12px 16px; border-top: 1px solid var(--line); cursor: pointer; }
        .news-item:hover { background: var(--panel-2); }
        .news-item img { width: 84px; height: 56px; object-fit: cover; border-radius: 5px; flex: 0 0 auto; background: #000; }
        .news-item .nt { font-family: 'Oswald', sans-serif; font-weight: 600; font-size: 14px; line-height: 1.15; }
        .news-item .nd { color: var(--muted); font-size: 11px; margin-top: 5px; }

        /* Tale of the tape */
        .tape-head { background: #000; text-align: center; padding: 14px; border-bottom: 1px solid var(--line); }
        .tape-head h3 { font-family: 'Oswald', sans-serif; font-size: 18px; letter-spacing: 1px; text-transform: uppercase; }
        .tape-fighters { display: grid; grid-template-columns: 1fr 1fr; }
        .tape-fighters .tf { padding: 16px 12px; text-align: center; }
        .tape-fighters .tf:first-child { border-right: 1px solid var(--line); }
        .tape-fighters .tf img { width: 84px; height: 84px; border-radius: 50%; object-fit: cover; margin: 0 auto 8px; background: #000; border: 2px solid var(--red); }
        .tape-fighters .tf .nm { font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 16px; text-transform: uppercase; line-height: 1; }
        .tape-rows { padding: 6px 0 14px; }
        .tape-row { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 9px 16px; }
        .tape-row .v { font-family: 'Oswald', sans-serif; font-weight: 600; font-size: 15px; }
        .tape-row .v.a { text-align: left; }
        .tape-row .v.b { text-align: right; }
        .tape-row .k { color: var(--muted); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }

        /* Live stream + chat */
        .stream-grid { display: grid; grid-template-columns: 1fr 340px; gap: 18px; }
        .video-container { position: relative; padding-bottom: 56.25%; height: 0; background: #000; border-radius: 10px 10px 0 0; overflow: hidden; }
        .video-container iframe, .video-container video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
        .stream-info { padding: 16px 18px; }
        .live-badge { display: inline-block; background: var(--red); color: #fff; font-weight: 700; font-size: 11px; padding: 3px 9px; border-radius: 3px; letter-spacing: 1px; text-transform: uppercase; }
        .stream-title { font-family: 'Oswald', sans-serif; font-size: 22px; margin-top: 8px; }
        .stream-meta { color: var(--muted); font-size: 13px; margin-top: 4px; }
        .stream-description { margin-top: 10px; color: #cfcfd4; font-size: 14px; }
        .no-stream { text-align: center; padding: 70px 20px; color: var(--muted); }
        .no-stream h2 { font-family: 'Oswald', sans-serif; font-size: 28px; margin-bottom: 8px; color: #fff; }
        .chat-section { display: flex; flex-direction: column; height: 100%; min-height: 420px; }
        .chat-header { background: #000; padding: 14px 16px; font-family: 'Oswald', sans-serif; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid var(--line); }
        .chat-messages { flex: 1; overflow-y: auto; padding: 14px 16px; max-height: 360px; }
        .chat-message { margin-bottom: 12px; }
        .chat-message .username { color: var(--red); font-weight: 700; font-size: 13px; }
        .chat-message .message { font-size: 14px; color: #e8e8ea; }
        .chat-message .time { color: #66666e; font-size: 10px; margin-top: 2px; }
        .login-prompt { padding: 14px 16px; color: var(--muted); font-size: 14px; }
        .login-prompt a { color: var(--red); font-weight: 600; }
        .chat-input { padding: 12px; border-top: 1px solid var(--line); }
        .chat-input form { display: flex; gap: 8px; }
        .chat-input input { flex: 1; padding: 10px 12px; background: var(--panel-2); border: 1px solid var(--line); border-radius: 5px; color: #fff; }
        .chat-input input:focus { outline: none; border-color: var(--red); }
        .chat-input button { padding: 10px 16px; background: var(--red); color: #fff; border: none; border-radius: 5px; font-weight: 600; cursor: pointer; }
        .chat-error { color: #ffb3b3; background: rgba(255, 0, 0, 0.08); border: 1px solid rgba(255, 0, 0, 0.2); border-radius: 6px; padding: 10px 12px; margin-bottom: 10px; font-size: 13px; }

        /* Admin chat controls */
        .chat-message { position: relative; }
        .chat-message:hover .del-msg { opacity: 1; }
        .del-msg {
            opacity: 0; transition: opacity .15s;
            background: none; border: none; color: var(--red);
            font-size: 13px; cursor: pointer; padding: 0 4px;
            position: absolute; right: 0; top: 0;
        }
        .admin-clear-bar {
            display: flex; gap: 8px; padding: 8px 12px;
            border-bottom: 1px solid var(--line); background: var(--panel-2);
        }
        .admin-clear-bar button {
            font-size: 11px; padding: 5px 10px; border-radius: 4px;
            border: 1px solid #3a3a42; background: transparent; color: #fff;
            cursor: pointer; font-family: 'Oswald', sans-serif; letter-spacing: .5px;
            text-transform: uppercase; transition: background .2s;
        }
        .admin-clear-bar button:hover { background: var(--red); border-color: var(--red); }
        .msg-admin-tag { color: var(--red); font-size: 10px; font-weight: 700; margin-left: 4px; letter-spacing: .5px; }

        /* Footer */
        .footer { border-top: 1px solid var(--line); margin-top: 30px; padding: 26px; text-align: center; }
        .footer-links { display: flex; gap: 22px; justify-content: center; margin-bottom: 12px; flex-wrap: wrap; }
        .footer-links a { color: var(--muted); font-size: 13px; }
        .footer-links a:hover { color: var(--red); }
        .footer-copyright { color: #66666e; font-size: 12px; }

        @media (max-width: 1000px) {
            .hero-grid, .bottom-grid, .stream-grid { grid-template-columns: 1fr; }
            .hero-title { font-size: 40px; }
            .nav-links { display: none; }
        }
    </style>
</head>
<body>
    <div class="top-bar">FREE UFC STREAMS &bull; LIVE EVENTS &amp; FIGHT CARDS &bull; JOIN OUR DISCORD</div>

    <nav class="navbar">
        <div class="logo" onclick="window.scrollTo({top:0,behavior:'smooth'})">UFC<span>.SOLUTIONS</span></div>
        <div class="nav-links">
            <a href="#events">Events</a>
            <a href="#card">Fighters</a>
            <a href="#card">Rankings</a>
            <a href="#news">News</a>
            <a href="#video-section">Video</a>
            <a href="https://discord.gg/Dh2gUUgYTg" target="_blank">Discord</a>
            <?php if (isAdmin()): ?><a href="admin.php">Admin</a><?php endif; ?>
        </div>
        <div class="nav-right">
            <button class="icon-btn" title="Search">&#128269;</button>
            <?php if (isLoggedIn()): ?>
                <span style="color:var(--muted);font-size:13px;">Hi, <?php echo htmlspecialchars($_SESSION['username']); ?></span>
                <a href="logout.php" class="btn btn-outline">Logout</a>
            <?php else: ?>
                <a href="login.php" class="btn btn-outline">Sign In</a>
                <a href="signup.php" class="btn btn-red">Sign Up</a>
            <?php endif; ?>
        </div>
    </nav>

    <div class="wrap">
        <!-- HERO + FIGHT CARD -->
        <div class="hero-grid">
            <div class="hero">
                <?php if ($main_bout): ?>
                    <div class="hero-faces">
                        <img class="left" src="<?php echo htmlspecialchars($main_bout['photo_a'] ?: $silhouette); ?>" onerror="this.src='<?php echo $silhouette; ?>'" alt="">
                        <img class="right" src="<?php echo htmlspecialchars($main_bout['photo_b'] ?: $silhouette); ?>" onerror="this.src='<?php echo $silhouette; ?>'" alt="">
                        <div class="gradient-floor"></div>
                    </div>
                <?php endif; ?>
                <div class="hero-content">
                    <?php if ($primary_event): ?>
                        <span class="event-badge"><?php echo htmlspecialchars($primary_event['short_name'] ?? 'UFC'); ?></span>
                        <?php if ($main_bout): ?>
                            <div class="hero-title oswald">
                                <?php echo htmlspecialchars(last_name($main_bout['fighter_a'])); ?>
                                <span class="vs">VS</span>
                                <?php echo htmlspecialchars(last_name($main_bout['fighter_b'])); ?>
                            </div>
                            <div class="hero-sub"><?php echo htmlspecialchars($main_bout['weight_class']); ?> Bout</div>
                        <?php else: ?>
                            <div class="hero-title oswald"><?php echo htmlspecialchars($primary_event['event_name']); ?></div>
                        <?php endif; ?>
                        <div class="hero-date"><?php echo strtoupper(date('l, F j', strtotime($primary_event['date'] ?? 'now'))); ?> &bull; <?php echo date('g:i A', strtotime($primary_event['date'] ?? 'now')); ?> ET</div>
                        <?php if (!empty($primary_event['venue'])): ?>
                            <div class="hero-meta"><?php echo htmlspecialchars($primary_event['venue']); ?></div>
                        <?php endif; ?>
                        <div class="hero-actions">
                            <a href="#video-section" class="btn btn-red">Watch Live</a>
                            <a href="#card" class="btn btn-outline">View Card</a>
                        </div>
                    <?php else: ?>
                        <div class="hero-title oswald">UFC EVENT</div>
                    <?php endif; ?>
                </div>
            </div>

            <div class="panel" id="card">
                <div class="card-head">
                    <h3><?php echo htmlspecialchars($primary_event['short_name'] ?? 'Fight Card'); ?></h3>
                    <div class="sub">
                        <?php if ($primary_event): ?>
                            <?php echo strtoupper(date('D, M j', strtotime($primary_event['date']))); ?>
                            <?php if (!empty($primary_event['venue'])): ?> &bull; <?php echo htmlspecialchars($primary_event['venue']); ?><?php endif; ?>
                        <?php endif; ?>
                    </div>
                </div>
                <?php $cardBouts = $primary_event['fight_card'] ?? []; ?>
                <?php if (!empty($cardBouts) && isset($cardBouts[0]['photo_a'])): ?>
                    <div class="tabs">
                        <button class="tab active" data-seg="main">Main Card</button>
                        <button class="tab" data-seg="prelims">Prelims</button>
                        <button class="tab" data-seg="early">Early Prelims</button>
                    </div>
                    <div class="bouts">
                        <?php foreach ($cardBouts as $bout): ?>
                            <div class="bout" data-seg="<?php echo htmlspecialchars($bout['segment'] ?? 'main'); ?>"<?php echo ($bout['segment'] ?? 'main') !== 'main' ? ' style="display:none"' : ''; ?>>
                                <div class="f">
                                    <img src="<?php echo htmlspecialchars($bout['photo_a'] ?: $silhouette); ?>" onerror="this.src='<?php echo $silhouette; ?>'" alt="">
                                    <div>
                                        <div class="nm"><?php echo htmlspecialchars($bout['fighter_a']); ?></div>
                                        <div class="rec"><?php echo htmlspecialchars($bout['record_a']); ?></div>
                                    </div>
                                </div>
                                <div class="mid">
                                    <div class="vs">VS</div>
                                    <div class="wc"><?php echo htmlspecialchars($bout['weight_class']); ?></div>
                                </div>
                                <div class="f right">
                                    <img src="<?php echo htmlspecialchars($bout['photo_b'] ?: $silhouette); ?>" onerror="this.src='<?php echo $silhouette; ?>'" alt="">
                                    <div>
                                        <div class="nm"><?php echo htmlspecialchars($bout['fighter_b']); ?></div>
                                        <div class="rec"><?php echo htmlspecialchars($bout['record_b']); ?></div>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php else: ?>
                    <div class="bouts">
                        <?php foreach ($cardBouts as $bout): ?>
                            <div class="bout">
                                <div class="f"><div><div class="nm"><?php echo htmlspecialchars($bout['fighter_a'] ?? 'TBD'); ?></div><div class="rec"><?php echo htmlspecialchars($bout['record_a'] ?? ''); ?></div></div></div>
                                <div class="mid"><div class="vs">VS</div><div class="wc"><?php echo htmlspecialchars($bout['weight_class'] ?? ''); ?></div></div>
                                <div class="f right"><div><div class="nm"><?php echo htmlspecialchars($bout['fighter_b'] ?? 'TBD'); ?></div><div class="rec"><?php echo htmlspecialchars($bout['record_b'] ?? ''); ?></div></div></div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
                <div class="card-foot"><a href="#video-section" class="btn btn-red">View Full Fight Card</a></div>
            </div>
        </div>

        <!-- UPCOMING EVENTS -->
        <div class="section" id="events">
            <div class="section-title"><h2>Upcoming Events</h2><a href="#">View All</a></div>
            <div class="events-row">
                <?php foreach ($ufc_events as $ev): ?>
                    <?php
                    $en = $ev['short_name'] ?? ($ev['event_name'] ?? 'UFC');
                    $en = preg_replace('/^UFC\s*/', 'UFC ', $en);
                    ?>
                    <div class="event-card" onclick="document.getElementById('card').scrollIntoView({behavior:'smooth'})">
                        <div class="en"><?php echo htmlspecialchars($en); ?></div>
                        <div class="ed"><?php echo strtoupper(date('M j D', strtotime($ev['date'] ?? 'now'))); ?></div>
                        <div class="ev"><?php echo htmlspecialchars($ev['venue'] ?: 'Venue TBA'); ?></div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- BOTTOM GRID -->
        <div class="section bottom-grid">
            <!-- Featured fighter -->
            <div class="panel fighter-card">
                <?php $ff = $fighter_a_detail; ?>
                <?php if ($ff): ?>
                    <div class="fc-body">
                        <div class="fc-info">
                            <div class="fc-name">
                                <?php echo htmlspecialchars($ff['name']); ?>
                                <?php if (!empty($ff['nickname'])): ?><small>"<?php echo htmlspecialchars($ff['nickname']); ?>"</small><?php endif; ?>
                            </div>
                            <?php if (!empty($ff['weight_class'])): ?><span class="fc-champ"><?php echo htmlspecialchars($ff['weight_class']); ?></span><?php endif; ?>
                            <div class="fc-country">
                                <?php if (!empty($ff['flag'])): ?><img src="<?php echo htmlspecialchars($ff['flag']); ?>" alt=""><?php endif; ?>
                                <?php echo htmlspecialchars($ff['country'] ?: ''); ?>
                            </div>
                            <div class="fc-stats">
                                <div class="s"><div class="n"><?php echo htmlspecialchars($main_bout['record_a'] ?? '—'); ?></div><div class="l">Record</div></div>
                                <div class="s"><div class="n"><?php echo htmlspecialchars(tape_val($ff['height'])); ?></div><div class="l">Height</div></div>
                                <div class="s"><div class="n"><?php echo htmlspecialchars(tape_val($ff['reach'])); ?></div><div class="l">Reach</div></div>
                                <div class="s"><div class="n"><?php echo htmlspecialchars(tape_val($ff['stance'])); ?></div><div class="l">Stance</div></div>
                            </div>
                        </div>
                        <div class="fc-photo">
                            <img src="<?php echo htmlspecialchars($ff['photo'] ?: $silhouette); ?>" onerror="this.src='<?php echo $silhouette; ?>'" alt="">
                        </div>
                    </div>
                    <div class="fc-tabs"><span>Overview</span><span>Stats</span><span>Fights</span><span>News</span><span>Videos</span></div>
                <?php else: ?>
                    <div class="card-head"><h3>Featured Fighter</h3></div>
                    <div style="padding:30px;text-align:center;color:var(--muted)">Fighter spotlight loading…</div>
                <?php endif; ?>
            </div>

            <!-- Latest news -->
            <div class="panel news-panel" id="news">
                <?php $newsLead = $ufc_news[0] ?? null; $newsRest = array_slice($ufc_news, 1, 4); ?>
                <?php if ($newsLead): ?>
                    <a class="news-lead" href="<?php echo htmlspecialchars($newsLead['link'] ?? '#'); ?>" target="_blank">
                        <img src="<?php echo htmlspecialchars($newsLead['image'] ?: $silhouette); ?>" onerror="this.src='<?php echo $silhouette; ?>'" alt="">
                        <div class="ov">
                            <h3><?php echo htmlspecialchars($newsLead['title']); ?></h3>
                            <div class="t"><?php echo htmlspecialchars($newsLead['date'] ?? ''); ?></div>
                        </div>
                    </a>
                    <div class="news-list">
                        <?php foreach ($newsRest as $n): ?>
                            <a class="news-item" href="<?php echo htmlspecialchars($n['link'] ?? '#'); ?>" target="_blank">
                                <?php if (!empty($n['image'])): ?><img src="<?php echo htmlspecialchars($n['image']); ?>" onerror="this.style.display='none'" alt=""><?php endif; ?>
                                <div>
                                    <div class="nt"><?php echo htmlspecialchars($n['title']); ?></div>
                                    <div class="nd"><?php echo htmlspecialchars($n['date'] ?? ''); ?></div>
                                </div>
                            </a>
                        <?php endforeach; ?>
                    </div>
                <?php else: ?>
                    <div class="card-head"><h3>Latest News</h3></div>
                    <div style="padding:30px;text-align:center;color:var(--muted)">No news available.</div>
                <?php endif; ?>
            </div>

            <!-- Tale of the tape -->
            <div class="panel">
                <div class="tape-head"><h3>Tale of the Tape</h3></div>
                <?php if ($fighter_a_detail && $fighter_b_detail): ?>
                    <div class="tape-fighters">
                        <div class="tf">
                            <img src="<?php echo htmlspecialchars($fighter_a_detail['photo'] ?: $silhouette); ?>" onerror="this.src='<?php echo $silhouette; ?>'" alt="">
                            <div class="nm"><?php echo htmlspecialchars(last_name($fighter_a_detail['name'])); ?></div>
                        </div>
                        <div class="tf">
                            <img src="<?php echo htmlspecialchars($fighter_b_detail['photo'] ?: $silhouette); ?>" onerror="this.src='<?php echo $silhouette; ?>'" alt="">
                            <div class="nm"><?php echo htmlspecialchars(last_name($fighter_b_detail['name'])); ?></div>
                        </div>
                    </div>
                    <div class="tape-rows">
                        <?php
                        $rows = [
                            ['Record', $main_bout['record_a'] ?? '', $main_bout['record_b'] ?? ''],
                            ['Height', $fighter_a_detail['height'], $fighter_b_detail['height']],
                            ['Reach', $fighter_a_detail['reach'], $fighter_b_detail['reach']],
                            ['Weight', $fighter_a_detail['weight'], $fighter_b_detail['weight']],
                            ['Age', $fighter_a_detail['age'], $fighter_b_detail['age']],
                            ['Stance', $fighter_a_detail['stance'], $fighter_b_detail['stance']],
                        ];
                        foreach ($rows as $r): ?>
                            <div class="tape-row">
                                <div class="v a"><?php echo htmlspecialchars(tape_val($r[1])); ?></div>
                                <div class="k"><?php echo htmlspecialchars($r[0]); ?></div>
                                <div class="v b"><?php echo htmlspecialchars(tape_val($r[2])); ?></div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php else: ?>
                    <div style="padding:30px;text-align:center;color:var(--muted)">Comparison unavailable.</div>
                <?php endif; ?>
            </div>
        </div>

        <!-- LIVE STREAM + CHAT -->
        <div class="section">
            <div class="section-title"><h2>Live Stream</h2></div>
            <div class="stream-grid">
                <div class="panel" id="video-section">
                    <?php if ($current_stream): ?>
                        <div class="video-container">
                            <?php if (strpos($current_stream['video_url'], 'youtube.com') !== false || strpos($current_stream['video_url'], 'youtu.be') !== false): ?>
                                <?php
                                $video_id = '';
                                if (preg_match('/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/', $current_stream['video_url'], $matches)) {
                                    $video_id = $matches[1];
                                } elseif (preg_match('/youtu\.be\/([a-zA-Z0-9_-]+)/', $current_stream['video_url'], $matches)) {
                                    $video_id = $matches[1];
                                }
                                ?>
                                <iframe src="https://www.youtube.com/embed/<?php echo $video_id; ?>" allowfullscreen></iframe>
                            <?php elseif (strpos($current_stream['video_url'], 'vimeo.com') !== false): ?>
                                <?php
                                $video_id = '';
                                if (preg_match('/vimeo\.com\/(\d+)/', $current_stream['video_url'], $matches)) {
                                    $video_id = $matches[1];
                                }
                                ?>
                                <iframe src="https://player.vimeo.com/video/<?php echo $video_id; ?>" allowfullscreen></iframe>
                            <?php else: ?>
                                <video controls>
                                    <source src="<?php echo htmlspecialchars($current_stream['video_url']); ?>" type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>
                            <?php endif; ?>
                        </div>
                        <div class="stream-info">
                            <?php if ($current_stream['is_live']): ?><span class="live-badge">&#128308; Live</span><?php endif; ?>
                            <h2 class="stream-title"><?php echo htmlspecialchars($current_stream['title']); ?></h2>
                            <div class="stream-meta">Streamed by <?php echo htmlspecialchars($current_stream['creator_username']); ?> &bull; <?php echo date('M j, Y g:i A', strtotime($current_stream['created_at'])); ?></div>
                            <?php if ($current_stream['description']): ?>
                                <div class="stream-description"><?php echo nl2br(htmlspecialchars($current_stream['description'])); ?></div>
                            <?php endif; ?>
                        </div>
                    <?php else: ?>
                        <div class="no-stream">
                            <h2>No Live Stream</h2>
                            <p>Check back later for upcoming events</p>
                        </div>
                    <?php endif; ?>
                </div>

                <div class="panel chat-section">
                    <div class="chat-header">Live Comments</div>
                    <?php if (isLoggedIn() && isset($_SESSION['is_admin']) && $_SESSION['is_admin']): ?>
                        <div class="admin-clear-bar">
                            <button id="btnClearStream">Clear This Stream</button>
                            <button id="btnClearAll">Clear All</button>
                        </div>
                    <?php endif; ?>
                    <div class="chat-messages" id="chatMessages">
                        <?php if (!$current_stream): ?>
                            <div class="chat-message">
                                <div class="username">System</div>
                                <div class="message">No chat available until a live stream is selected.</div>
                            </div>
                        <?php else: ?>
                            <div class="chat-message">
                                <div class="username">System</div>
                                <div class="message">Welcome to the UFC stream! Be respectful.</div>
                            </div>
                        <?php endif; ?>
                    </div>
                    <?php if (!$current_stream): ?>
                        <div class="login-prompt"><a href="login.php">Login</a> to participate</div>
                    <?php elseif (!isLoggedIn()): ?>
                        <div class="login-prompt"><a href="login.php">Login</a> to participate</div>
                    <?php else: ?>
                        <div class="chat-input">
                            <div id="chatError" class="chat-error" style="display:none"></div>
                            <?php if (!empty($_GET['chat_error'])): ?>
                                <div class="chat-error" style="display:block"><?php echo htmlspecialchars($_GET['chat_error']); ?></div>
                            <?php endif; ?>
                            <form id="chatForm">
                                <input type="hidden" name="stream_id" value="<?php echo $current_stream_id; ?>">
                                <input type="text" id="messageInput" name="message" placeholder="Type a message..." maxlength="500">
                                <button type="submit">Send</button>
                            </form>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <footer class="footer">
        <div class="footer-links">
            <a href="#">Terms of Use</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Contact</a>
            <a href="#">Careers</a>
        </div>
        <div class="footer-copyright">&copy; <?php echo date('Y'); ?> UFC.SOLUTIONS - All Rights Reserved</div>
    </footer>

    <script>
        // Fight card segment tabs
        document.querySelectorAll('.tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
                this.classList.add('active');
                var seg = this.getAttribute('data-seg');
                var shown = 0;
                document.querySelectorAll('.bout[data-seg]').forEach(function (b) {
                    var match = b.getAttribute('data-seg') === seg;
                    b.style.display = match ? '' : 'none';
                    if (match) shown++;
                });
                var box = document.querySelector('.bouts');
                if (box && !shown) {
                    // nothing in this segment; show a hint row
                }
            });
        });

        <?php if ($current_stream): ?>
        (function () {
            const streamId   = <?php echo $current_stream_id; ?>;
            const isAdmin    = <?php echo (isLoggedIn() && isset($_SESSION['is_admin']) && $_SESSION['is_admin']) ? 'true' : 'false'; ?>;
            const box        = document.getElementById('chatMessages');
            const form       = document.getElementById('chatForm');
            const input      = document.getElementById('messageInput');

            function esc(t) {
                const d = document.createElement('div');
                d.textContent = t;
                return d.innerHTML;
            }

            function buildMessage(msg) {
                const wrap = document.createElement('div');
                wrap.className = 'chat-message';
                wrap.dataset.id = msg.id;
                const adminTag = msg.is_admin ? '<span class="msg-admin-tag">MOD</span>' : '';
                wrap.innerHTML = `
                    <div class="username">${esc(msg.username)}${adminTag}
                        ${isAdmin ? `<button class="del-msg" data-id="${msg.id}">✕</button>` : ''}
                    </div>
                    <div class="message">${esc(msg.message)}</div>
                    <div class="time">${esc(msg.time)}</div>
                `;
                return wrap;
            }

            let lastCount = 0;

            function loadMessages() {
                fetch('get_messages.php?stream_id=' + streamId)
                    .then(r => r.json())
                    .then(data => {
                        const msgs = data.messages || [];
                        if (msgs.length === lastCount) return;
                        lastCount = msgs.length;
                        box.innerHTML = '';
                        if (msgs.length === 0) {
                            box.innerHTML = '<div class="chat-message"><div class="username">System</div><div class="message">No messages yet.</div></div>';
                            return;
                        }
                        msgs.forEach(m => box.appendChild(buildMessage(m)));
                        box.scrollTop = box.scrollHeight;
                    })
                    .catch(() => {});
            }

            setInterval(loadMessages, 3000);
            loadMessages();

            if (form) {
                form.addEventListener('submit', function (e) {
                    e.preventDefault();
                    const msg = input.value.trim();
                    if (!msg) return;
                    fetch('post_message.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: 'stream_id=' + streamId + '&message=' + encodeURIComponent(msg)
                    })
                    .then(r => r.json())
                    .then(d => { if (d.success) { input.value = ''; loadMessages(); } });
                });
            }

            box.addEventListener('click', function (e) {
                const btn = e.target.closest('.del-msg');
                if (!btn || !isAdmin) return;
                if (!confirm('Delete this message?')) return;
                fetch('delete_messages.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'action=delete_one&message_id=' + btn.dataset.id
                })
                .then(r => r.json())
                .then(d => { if (d.success) { lastCount = -1; loadMessages(); } });
            });

            const btnClearStream = document.getElementById('btnClearStream');
            if (btnClearStream) {
                btnClearStream.addEventListener('click', function () {
                    if (!confirm('Clear ALL messages for this stream?')) return;
                    fetch('delete_messages.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: 'action=clear_stream&stream_id=' + streamId
                    })
                    .then(r => r.json())
                    .then(d => { if (d.success) { lastCount = -1; loadMessages(); } });
                });
            }

            const btnClearAll = document.getElementById('btnClearAll');
            if (btnClearAll) {
                btnClearAll.addEventListener('click', function () {
                    if (!confirm('Clear ALL messages across every stream? This cannot be undone.')) return;
                    fetch('delete_messages.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: 'action=clear_all'
                    })
                    .then(r => r.json())
                    .then(d => { if (d.success) { lastCount = -1; loadMessages(); } });
                });
            }
        })();
        <?php endif; ?>
    </script>
</body>
</html>
