<?php
require_once 'config.php';

// Try to load UFC data fetcher, fall back to config if it fails
$useLiveAPI = false;
if (file_exists('api/ufc_data_fetcher.php')) {
    try {
        require_once 'api/ufc_data_fetcher.php';
        $useLiveAPI = true;
    } catch (\Throwable $e) {
        $useLiveAPI = false;
        error_log("Failed to load UFC API: " . $e->getMessage());
    }
}

// Fall back to config file
if (!$useLiveAPI && file_exists('ufc_config.php')) {
    $ufc_config = require 'ufc_config.php';
}

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

// Load UFC data - try live API first, fall back to config, then database
if ($useLiveAPI) {
    try {
        $fetcher = new UFCDataFetcher();
        
        // Get upcoming events
        $ufc_events = $fetcher->getUpcomingEvents(5);
        
        // Get rankings (default to lightweight)
        $ufc_rankings = $fetcher->getRankings('lightweight');
        
        // Get latest news
        $ufc_news = $fetcher->getLatestNews(5);
        
        // Create featured fights from events
        $featured_fights = [];
        if (!empty($ufc_events)) {
            foreach (array_slice($ufc_events, 0, 4) as $event) {
                $featured_fights[] = [
                    'name' => $event['event_name'] ?? 'UFC Event',
                    'fighters' => 'Main Event',
                    'status' => isset($event['status']) && $event['status'] === 'live' ? 'LIVE NOW' : 'UPCOMING',
                    'date' => isset($event['event_date']) ? date('F j, Y', strtotime($event['event_date'])) : 'TBD'
                ];
            }
        }
        
    } catch (\Throwable $e) {
        // Fallback to config file if API fails
        error_log("UFC API Error: " . $e->getMessage());
        $useLiveAPI = false;
    }
}

// Fallback to config file or database
if (!$useLiveAPI) {
    if (isset($ufc_config)) {
        // Use config file
        $ufc_events = [$ufc_config['current_event']];
        $ufc_rankings = $ufc_config['rankings'];
        $ufc_news = $ufc_config['news'];
        $featured_fights = $ufc_config['featured_fights'];
    } else {
        // Final fallback to database if tables exist
        try {
            // Check if UFC tables exist first
            $tablesExist = false;
            if ($conn instanceof SQLite3) {
                $result = $conn->query("SELECT name FROM sqlite_master WHERE type='table' AND name='ufc_events'");
                $tablesExist = $result->fetchArray() !== false;
            } else {
                $result = $conn->query("SHOW TABLES LIKE 'ufc_events'");
                $tablesExist = $result->num_rows > 0;
            }
            
            if ($tablesExist) {
                $stmt = db_prepare($conn, "SELECT * FROM ufc_events WHERE event_date >= CURDATE() ORDER BY event_date ASC LIMIT 5");
                db_execute($stmt);
                $ufc_events = [];
                while ($row = db_fetch_assoc($stmt)) {
                    $ufc_events[] = $row;
                }
                
                $stmt = db_prepare($conn, "
                    SELECT r.*, f.first_name, f.last_name, f.record_wins, f.record_losses, f.record_draws
                    FROM ufc_rankings r
                    JOIN ufc_fighters f ON r.fighter_id = f.id
                    WHERE r.weight_class = 'lightweight' AND r.ranking_date = (SELECT MAX(ranking_date) FROM ufc_rankings WHERE weight_class = 'lightweight')
                    ORDER BY r.rank_position ASC
                ");
                db_execute($stmt);
                $ufc_rankings = [];
                while ($row = db_fetch_assoc($stmt)) {
                    $ufc_rankings[] = $row;
                }
                
                $stmt = db_prepare($conn, "SELECT * FROM ufc_news ORDER BY published_at DESC LIMIT 5");
                db_execute($stmt);
                $ufc_news = [];
                while ($row = db_fetch_assoc($stmt)) {
                    $ufc_news[] = $row;
                }
                
                // Create fallback featured fights
                $featured_fights = [
                    ['name' => 'UFC Event', 'fighters' => 'Coming Soon', 'status' => 'UPCOMING', 'date' => 'TBD']
                ];
            } else {
                throw new Exception("UFC tables don't exist yet");
            }
        } catch (Exception $e) {
            // Ultimate fallback - use hardcoded data
            $ufc_events = [['event_name' => 'UFC Event', 'date' => date('F j, Y')]];
            $ufc_rankings = [];
            $ufc_news = [];
            $featured_fights = [['name' => 'UFC Event', 'fighters' => 'Coming Soon', 'status' => 'UPCOMING', 'date' => 'TBD']];
        }
    }
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
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Roboto', sans-serif;
            background: #0d0d0d;
            color: #ffffff;
            min-height: 100vh;
        }
        .top-bar {
            background: linear-gradient(90deg, #d20a0a 0%, #8b0000 50%, #d20a0a 100%);
            padding: 10px 0;
            text-align: center;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 1px;
            animation: shimmer 3s infinite;
        }
        @keyframes shimmer {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        .navbar {
            background: #1a1a1a;
            padding: 0 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 70px;
            border-bottom: 2px solid #d20a0a;
        }
        .logo {
            font-family: 'Oswald', sans-serif;
            font-size: 36px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: 2px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: transform 0.3s;
        }
        .logo:hover {
            transform: scale(1.05);
        }
        .logo span {
            color: #d20a0a;
        }
        .nav-links {
            display: flex;
            gap: 30px;
            align-items: center;
        }
        .nav-links a {
            color: #ffffff;
            text-decoration: none;
            font-weight: 500;
            font-size: 14px;
            letter-spacing: 1px;
            transition: color 0.3s;
            text-transform: uppercase;
            cursor: pointer;
        }
        .nav-links a:hover {
            color: #d20a0a;
        }
        .live-btn {
            background: linear-gradient(135deg, #d20a0a 0%, #8b0000 100%);
            color: white;
            padding: 10px 25px;
            border-radius: 4px;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 1px;
            box-shadow: 0 4px 15px rgba(210,10,10,0.4);
            animation: pulse-btn 2s infinite;
        }
        .live-btn:hover {
            background: linear-gradient(135deg, #b30808 0%, #6b0000 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(210,10,10,0.6);
        }
        @keyframes pulse-btn {
            0%, 100% { box-shadow: 0 4px 15px rgba(210,10,10,0.4); }
            50% { box-shadow: 0 4px 25px rgba(210,10,10,0.8); }
        }
        .hero-section {
            background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
            padding: 60px 30px;
            position: relative;
            overflow: hidden;
            min-height: 700px;
        }
        .hero-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23d20a0a" fill-opacity="0.03" width="100" height="100"/></svg>');
            pointer-events: none;
        }
        .hero-section::after {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(210,10,10,0.1) 0%, transparent 70%);
            pointer-events: none;
        }
        .hero-content {
            max-width: 1400px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 40px;
            position: relative;
            z-index: 1;
        }
        .main-fight {
            background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 15px 50px rgba(0,0,0,0.6);
            border: 1px solid #333;
        }
        .fight-banner {
            background: linear-gradient(135deg, #d20a0a 0%, #8b0000 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .fight-banner::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
            animation: rotate 20s linear infinite;
        }
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .fight-banner h2 {
            font-family: 'Oswald', sans-serif;
            font-size: 56px;
            font-weight: 700;
            letter-spacing: 3px;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .fight-banner .subtitle {
            font-size: 20px;
            font-weight: 500;
            letter-spacing: 2px;
            opacity: 0.95;
            position: relative;
            z-index: 1;
        }
        .fighters {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 40px;
            padding: 40px;
        }
        .fighter {
            text-align: center;
        }
        .fighter-image {
            width: 180px;
            height: 180px;
            background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
            border-radius: 50%;
            margin: 0 auto 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 70px;
            border: 4px solid #d20a0a;
            box-shadow: 0 0 30px rgba(210,10,10,0.3);
            position: relative;
            overflow: hidden;
        }
        .fighter-image::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
            transform: rotate(45deg);
        }
        .fighter-name {
            font-family: 'Oswald', sans-serif;
            font-size: 24px;
            font-weight: 600;
            letter-spacing: 1px;
        }
        .vs {
            font-family: 'Oswald', sans-serif;
            font-size: 36px;
            font-weight: 700;
            color: #d20a0a;
        }
        .fight-actions {
            padding: 30px;
            text-align: center;
            background: #1a1a1a;
        }
        .btn {
            display: inline-block;
            padding: 18px 45px;
            margin: 0 10px;
            font-family: 'Oswald', sans-serif;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 2px;
            text-transform: uppercase;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
        }
        .btn::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
        }
        .btn:hover::before {
            width: 300px;
            height: 300px;
        }
        .btn-primary {
            background: linear-gradient(135deg, #d20a0a 0%, #8b0000 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(210,10,10,0.4);
        }
        .btn-primary:hover {
            background: linear-gradient(135deg, #b30808 0%, #6b0000 100%);
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(210,10,10,0.6);
        }
        .btn-secondary {
            background: transparent;
            color: white;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 15px rgba(255,255,255,0.1);
        }
        .btn-secondary:hover {
            background: white;
            color: #0d0d0d;
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(255,255,255,0.2);
        }
        .sidebar {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .sidebar-card {
            background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.4);
            border: 1px solid #333;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        .sidebar-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 40px rgba(0,0,0,0.5);
        }
        .sidebar-card h3 {
            font-family: 'Oswald', sans-serif;
            font-size: 22px;
            font-weight: 600;
            letter-spacing: 1px;
            margin-bottom: 25px;
            color: #d20a0a;
            text-transform: uppercase;
            border-bottom: 2px solid #d20a0a;
            padding-bottom: 10px;
        }
        .fight-card-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid #333;
            cursor: pointer;
            transition: background 0.3s;
            border-radius: 4px;
            padding: 12px;
        }
        .fight-card-item:hover {
            background: rgba(210,10,10,0.1);
        }
        .fight-card-item:last-child {
            border-bottom: none;
        }
        .fighters-names {
            flex: 1;
        }
        .fighters-names .name {
            font-weight: 600;
            font-size: 14px;
        }
        .fighters-names .record {
            font-size: 12px;
            color: #888;
        }
        .fight-date {
            font-size: 12px;
            color: #d20a0a;
            font-weight: 600;
        }
        .ranking-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #333;
            cursor: pointer;
            transition: background 0.3s;
            border-radius: 4px;
            padding: 10px;
        }
        .ranking-item:hover {
            background: rgba(210,10,10,0.1);
        }
        .ranking-item:last-child {
            border-bottom: none;
        }
        .rank {
            font-family: 'Oswald', sans-serif;
            font-size: 24px;
            font-weight: 700;
            color: #d20a0a;
            width: 40px;
        }
        .fighter-info {
            flex: 1;
        }
        .fighter-info .name {
            font-weight: 600;
            font-size: 14px;
        }
        .fighter-info .record {
            font-size: 12px;
            color: #888;
        }
        .champion-badge {
            background: #d20a0a;
            color: white;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .news-item {
            padding: 15px 0;
            border-bottom: 1px solid #333;
            cursor: pointer;
            transition: background 0.3s;
            border-radius: 4px;
            padding: 12px;
        }
        .news-item:hover {
            background: rgba(210,10,10,0.1);
        }
        .news-item:last-child {
            border-bottom: none;
        }
        .news-item h4 {
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 5px;
            line-height: 1.4;
        }
        .news-item .date {
            font-size: 11px;
            color: #888;
        }
        .video-section {
            background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
            border-radius: 12px;
            overflow: hidden;
            margin-top: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            border: 1px solid #333;
        }
        .video-container {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            background: #000;
        }
        .video-container iframe,
        .video-container video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
        }
        .stream-info {
            padding: 20px;
        }
        .stream-title {
            font-family: 'Oswald', sans-serif;
            font-size: 28px;
            margin-bottom: 10px;
            letter-spacing: 1px;
            color: #d20a0a;
        }
        .stream-meta {
            color: #888;
            font-size: 14px;
            margin-bottom: 15px;
        }
        .live-badge {
            background: linear-gradient(135deg, #d20a0a 0%, #8b0000 100%);
            color: white;
            padding: 6px 15px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            display: inline-block;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            animation: pulse 2s infinite;
            box-shadow: 0 0 15px rgba(210,10,10,0.5);
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; box-shadow: 0 0 15px rgba(210,10,10,0.5); }
            50% { opacity: 0.8; box-shadow: 0 0 25px rgba(210,10,10,0.8); }
        }
        .chat-section {
            background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            height: 500px;
            margin-top: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            border: 1px solid #333;
        }
        .chat-header {
            padding: 15px 20px;
            border-bottom: 1px solid #333;
            font-weight: 600;
            font-family: 'Oswald', sans-serif;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .chat-message {
            background: #2a2a2a;
            padding: 10px 15px;
            border-radius: 5px;
            word-wrap: break-word;
        }
        .chat-message .username {
            color: #d20a0a;
            font-weight: 600;
            margin-bottom: 5px;
            font-size: 13px;
        }
        .chat-message .message {
            color: #ccc;
            font-size: 14px;
        }
        .chat-message .time {
            color: #666;
            font-size: 11px;
            margin-top: 5px;
        }
        .chat-input {
            padding: 15px;
            border-top: 1px solid #333;
        }
        .chat-input form {
            display: flex;
            gap: 10px;
        }
        .chat-input input {
            flex: 1;
            padding: 12px;
            background: #2a2a2a;
            border: 1px solid #333;
            border-radius: 3px;
            color: white;
            font-size: 14px;
        }
        .chat-input input:focus {
            outline: none;
            border-color: #d20a0a;
        }
        .chat-input button {
            padding: 12px 25px;
            background: #d20a0a;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .chat-input button:hover {
            background: #b30808;
        }
        .login-prompt {
            background: #2a2a2a;
            padding: 20px;
            border-radius: 5px;
            text-align: center;
            margin-bottom: 15px;
        }
        .login-prompt a {
            color: #d20a0a;
            text-decoration: none;
            font-weight: 600;
        }
        .footer {
            background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
            padding: 50px 30px;
            margin-top: 60px;
            border-top: 2px solid #d20a0a;
        }
        .footer-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .footer-links {
            display: flex;
            gap: 30px;
        }
        .footer-links a {
            color: #888;
            text-decoration: none;
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 1px;
            transition: color 0.3s;
        }
        .footer-links a:hover {
            color: #d20a0a;
        }
        .footer-copyright {
            color: #666;
            font-size: 12px;
        }
        .featured-section {
            background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
            padding: 60px 30px;
            margin-top: 60px;
            border-top: 2px solid #d20a0a;
        }
        .featured-section h2 {
            font-family: 'Oswald', sans-serif;
            font-size: 42px;
            color: #d20a0a;
            margin-bottom: 40px;
            text-align: center;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        .featured-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 30px;
            max-width: 1400px;
            margin: 0 auto;
        }
        .featured-card {
            background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #333;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }
        .featured-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 50px rgba(0,0,0,0.6);
        }
        .featured-card-image {
            height: 220px;
            background: linear-gradient(135deg, #d20a0a 0%, #8b0000 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 80px;
            position: relative;
            overflow: hidden;
        }
        .featured-card-image::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
        }
        .featured-card-content {
            padding: 25px;
        }
        .featured-card h3 {
            font-family: 'Oswald', sans-serif;
            font-size: 20px;
            margin-bottom: 12px;
            color: #ffffff;
            letter-spacing: 1px;
        }
        .featured-card p {
            color: #888;
            font-size: 15px;
            line-height: 1.6;
        }
        .stats-section {
            background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
            padding: 60px 30px;
            margin-top: 60px;
            border-top: 2px solid #d20a0a;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            max-width: 1400px;
            margin: 0 auto;
        }
        .stat-card {
            background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
            border-radius: 12px;
            padding: 40px;
            text-align: center;
            border: 1px solid #333;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.5);
        }
        .stat-number {
            font-family: 'Oswald', sans-serif;
            font-size: 56px;
            font-weight: 700;
            color: #d20a0a;
            margin-bottom: 15px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .stat-label {
            color: #888;
            font-size: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
        }
        @media (max-width: 1024px) {
            .hero-content {
                grid-template-columns: 1fr;
            }
            .navbar {
                padding: 0 20px;
            }
            .nav-links {
                gap: 15px;
            }
            .nav-links a {
                font-size: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="top-bar">
        🥊 FREE UFC STREAMS - LIVE EVENTS & FIGHT CARDS - JOIN OUR DISCORD 🥊
    </div>
    
    <nav class="navbar">
        <div class="logo">UFC<span>.SOLUTIONS</span></div>
        <div class="nav-links">
            <a href="#">Home</a>
            <a href="#">Fights</a>
            <a href="#">Rankings</a>
            <a href="#">Fighters</a>
            <a href="#">News</a>
            <a href="https://discord.gg/Dh2gUUgYTg" target="_blank">Discord</a>
            <?php if (isAdmin()): ?>
                <a href="admin.php">Admin</a>
            <?php endif; ?>
            <?php if (isLoggedIn()): ?>
                <a href="logout.php">Logout</a>
            <?php else: ?>
                <a href="login.php">Login</a>
            <?php endif; ?>
            <a href="#" class="live-btn">Live</a>
        </div>
    </nav>
    
    <div class="hero-section">
        <div class="hero-content">
            <div class="main-fight">
                <div class="fight-banner">
                    <?php if (!empty($ufc_events) && isset($ufc_events[0])): ?>
                        <?php $main_event = $ufc_events[0]; ?>
                        <h2><?php echo htmlspecialchars($main_event['event_name']); ?></h2>
                        <div class="subtitle">
                            <?php
                            if (isset($main_event['main_event'])) {
                                echo htmlspecialchars($main_event['main_event']['fighter_a']) . ' VS ' . htmlspecialchars($main_event['main_event']['fighter_b']);
                            } else {
                                echo 'MAIN EVENT';
                            }
                            ?>
                        </div>
                    <?php else: ?>
                        <h2>UFC EVENT</h2>
                        <div class="subtitle">MAIN EVENT</div>
                    <?php endif; ?>
                </div>
                <div class="fighters">
                    <?php if (!empty($ufc_events) && isset($ufc_events[0]['main_event'])): ?>
                        <?php $main_event = $ufc_events[0]['main_event']; ?>
                        <div class="fighter">
                            <div class="fighter-image">🥊</div>
                            <div class="fighter-name"><?php echo htmlspecialchars($main_event['fighter_a']); ?></div>
                        </div>
                        <div class="vs">VS</div>
                        <div class="fighter">
                            <div class="fighter-image">🥊</div>
                            <div class="fighter-name"><?php echo htmlspecialchars($main_event['fighter_b']); ?></div>
                        </div>
                    <?php else: ?>
                        <div class="fighter">
                            <div class="fighter-image">🥊</div>
                            <div class="fighter-name">Fighter A</div>
                        </div>
                        <div class="vs">VS</div>
                        <div class="fighter">
                            <div class="fighter-image">🥊</div>
                            <div class="fighter-name">Fighter B</div>
                        </div>
                    <?php endif; ?>
                </div>
                <div class="fight-actions">
                    <button class="btn btn-primary" onclick="document.getElementById('video-section').scrollIntoView({behavior: 'smooth'})">Watch Live</button>
                    <button class="btn btn-secondary" onclick="document.querySelector('.sidebar-card').scrollIntoView({behavior: 'smooth'})">View Fight Card</button>
                </div>
            </div>
            
            <div class="sidebar">
                <div class="sidebar-card">
                    <h3>Upcoming Fight Card</h3>
                    <?php if (!empty($ufc_events) && isset($ufc_events[0]['fight_card'])): ?>
                        <?php foreach ($ufc_events[0]['fight_card'] as $fight): ?>
                            <div class="fight-card-item">
                                <div class="fighters-names">
                                    <div class="name"><?php echo htmlspecialchars($fight['fighter_a'] ?? 'Fighter A'); ?> vs <?php echo htmlspecialchars($fight['fighter_b'] ?? 'Fighter B'); ?></div>
                                    <div class="record"><?php echo htmlspecialchars($fight['record_a'] ?? '0-0-0'); ?> vs <?php echo htmlspecialchars($fight['record_b'] ?? '0-0-0'); ?></div>
                                </div>
                                <div class="fight-date"><?php echo date('M d D', strtotime($ufc_events[0]['date'] ?? 'now')); ?></div>
                            </div>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <div class="fight-card-item">
                            <div class="fighters-names">
                                <div class="name">Fighter A vs Fighter B</div>
                                <div class="record">0-0-0 vs 0-0-0</div>
                            </div>
                            <div class="fight-date">MAIN CARD</div>
                        </div>
                    <?php endif; ?>
                </div>
                
                <div class="sidebar-card">
                    <h3>Rankings - Lightweight</h3>
                    <?php if (!empty($ufc_rankings)): ?>
                        <?php foreach ($ufc_rankings as $index => $fighter): ?>
                            <div class="ranking-item">
                                <div class="rank"><?php echo htmlspecialchars($fighter['rank'] ?? ($index + 1)); ?></div>
                                <div class="fighter-info">
                                    <div class="name">
                                        <?php echo htmlspecialchars($fighter['fighter'] ?? 'Unknown'); ?>
                                        <?php if (isset($fighter['rank']) && $fighter['rank'] === 'C'): ?>
                                            <span class="champion-badge">Champion</span>
                                        <?php endif; ?>
                                    </div>
                                    <div class="record"><?php echo htmlspecialchars($fighter['record'] ?? '0-0-0'); ?></div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <div class="ranking-item">
                            <div class="rank">C</div>
                            <div class="fighter-info">
                                <div class="name">Islam Makhachev <span class="champion-badge">Champion</span></div>
                                <div class="record">25-1-0</div>
                            </div>
                        </div>
                        <div class="ranking-item">
                            <div class="rank">1</div>
                            <div class="fighter-info">
                                <div class="name">Charles Oliveira</div>
                                <div class="record">34-10-0</div>
                            </div>
                        </div>
                        <div class="ranking-item">
                            <div class="rank">2</div>
                            <div class="fighter-info">
                                <div class="name">Dustin Poirier</div>
                                <div class="record">29-8-0</div>
                            </div>
                        </div>
                        <div class="ranking-item">
                            <div class="rank">3</div>
                            <div class="fighter-info">
                                <div class="name">Justin Gaethje</div>
                                <div class="record">25-4-0</div>
                            </div>
                        </div>
                        <div class="ranking-item">
                            <div class="rank">4</div>
                            <div class="fighter-info">
                                <div class="name">Michael Chandler</div>
                                <div class="record">23-8-0</div>
                            </div>
                        </div>
                    <?php endif; ?>
                </div>
                
                <div class="sidebar-card">
                    <h3>Latest News</h3>
                    <?php if (!empty($ufc_news)): ?>
                        <?php foreach ($ufc_news as $news): ?>
                            <div class="news-item">
                                <h4><?php echo htmlspecialchars($news['title'] ?? 'News Headline'); ?></h4>
                                <div class="date"><?php echo htmlspecialchars($news['date'] ?? 'Just now'); ?></div>
                            </div>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <div class="news-item">
                            <h4>Makhachev: "I'm Ready For Anyone"</h4>
                            <div class="date">2 hours ago</div>
                        </div>
                        <div class="news-item">
                            <h4>Chandler vs Oliveira Rematch Announced</h4>
                            <div class="date">5 hours ago</div>
                        </div>
                        <div class="news-item">
                            <h4>UFC Fight Night 248 Card Official</h4>
                            <div class="date">1 day ago</div>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
    
    <div class="hero-content" style="padding: 0 30px;">
        <div class="video-section" id="video-section">
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
                    <?php if ($current_stream['is_live']): ?>
                        <span class="live-badge">Live</span>
                    <?php endif; ?>
                    <h2 class="stream-title"><?php echo htmlspecialchars($current_stream['title']); ?></h2>
                    <div class="stream-meta">
                        Streamed by <?php echo htmlspecialchars($current_stream['creator_username']); ?> • 
                        <?php echo date('M j, Y g:i A', strtotime($current_stream['created_at'])); ?>
                    </div>
                    <?php if ($current_stream['description']): ?>
                        <div class="stream-description">
                            <?php echo nl2br(htmlspecialchars($current_stream['description'])); ?>
                        </div>
                    <?php endif; ?>
                </div>
            <?php else: ?>
                <div style="text-align: center; padding: 60px 20px; color: #888;">
                    <h2 style="font-family: 'Oswald', sans-serif; font-size: 32px; margin-bottom: 15px;">No Live Stream</h2>
                    <p>Check back later for upcoming events</p>
                </div>
            <?php endif; ?>
        </div>
        
        <div class="sidebar">
            <div class="chat-section">
                <div class="chat-header">Live Chat</div>
                <?php if (!isLoggedIn()): ?>
                    <div class="login-prompt">
                        <a href="login.php">Login</a> to participate in chat
                    </div>
                <?php endif; ?>
                <div class="chat-messages" id="chatMessages">
                    <div class="chat-message">
                        <div class="username">System</div>
                        <div class="message">Welcome to the UFC chat! Be respectful and have fun.</div>
                    </div>
                </div>
                <?php if (isLoggedIn()): ?>
                    <div class="chat-input">
                        <form id="chatForm">
                            <input type="text" id="messageInput" placeholder="Type a message..." maxlength="500">
                            <button type="submit">Send</button>
                        </form>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
    
    <div class="featured-section">
        <h2>🔥 FEATURED FIGHTS</h2>
        <div class="featured-grid">
            <?php foreach ($featured_fights as $fight): ?>
                <div class="featured-card">
                    <div class="featured-card-image">🥊</div>
                    <div class="featured-card-content">
                        <h3><?php echo htmlspecialchars($fight['name']); ?></h3>
                        <p><?php echo htmlspecialchars($fight['fighters']); ?></p>
                        <p style="color: <?php echo $fight['status'] === 'LIVE NOW' ? '#d20a0a' : '#888'; ?>; font-weight: 600; margin-top: 10px;">
                            <?php echo $fight['status'] === 'LIVE NOW' ? '🔴 ' : ''; ?><?php echo htmlspecialchars($fight['status']); ?>
                        </p>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
    
    <div class="stats-section">
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">500+</div>
                <div class="stat-label">UFC Events</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">1000+</div>
                <div class="stat-label">Elite Fighters</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">50+</div>
                <div class="stat-label">Countries</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">24/7</div>
                <div class="stat-label">Live Coverage</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">10M+</div>
                <div class="stat-label">Fans Worldwide</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">12</div>
                <div class="stat-label">Weight Classes</div>
            </div>
        </div>
    </div>
    
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-links">
                <a href="#">Terms of Use</a>
                <a href="#">Privacy Policy</a>
                <a href="#">Contact</a>
                <a href="#">Careers</a>
            </div>
            <div class="footer-copyright">
                © 2024 UFC.SOLUTIONS - All Rights Reserved
            </div>
        </div>
    </footer>
    
    <script>
        // General button functionality
        document.addEventListener('DOMContentLoaded', function() {
            // Navigation links
            const navLinks = document.querySelectorAll('.nav-links a');
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    if (href === '#' || href === '') {
                        e.preventDefault();
                        // Visual feedback
                        this.style.color = '#d20a0a';
                        setTimeout(() => {
                            this.style.color = '';
                        }, 300);
                    }
                });
            });
            
            // Logo click
            const logo = document.querySelector('.logo');
            if (logo) {
                logo.addEventListener('click', function() {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }
            
            // Live button
            const liveBtn = document.querySelector('.live-btn');
            if (liveBtn) {
                liveBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const videoSection = document.getElementById('video-section');
                    if (videoSection) {
                        videoSection.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        alert('No live stream available at the moment');
                    }
                });
            }
            
            // Watch Live button
            const watchLiveBtn = document.querySelector('.btn-primary');
            if (watchLiveBtn) {
                watchLiveBtn.addEventListener('click', function() {
                    const videoSection = document.getElementById('video-section');
                    if (videoSection) {
                        videoSection.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        alert('No live stream available at the moment');
                    }
                });
            }
            
            // View Fight Card button
            const viewFightCardBtn = document.querySelector('.btn-secondary');
            if (viewFightCardBtn) {
                viewFightCardBtn.addEventListener('click', function() {
                    const fightCard = document.querySelector('.sidebar-card');
                    if (fightCard) {
                        fightCard.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            }
            
            // Featured cards
            const featuredCards = document.querySelectorAll('.featured-card');
            featuredCards.forEach(card => {
                card.addEventListener('click', function() {
                    const videoSection = document.getElementById('video-section');
                    if (videoSection) {
                        videoSection.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        alert('Featured fights coming soon!');
                    }
                });
            });
            
            // Fight card items
            const fightCardItems = document.querySelectorAll('.fight-card-item');
            fightCardItems.forEach(item => {
                item.addEventListener('click', function() {
                    this.style.background = 'rgba(210,10,10,0.2)';
                    setTimeout(() => {
                        this.style.background = '';
                    }, 300);
                });
            });
            
            // Ranking items
            const rankingItems = document.querySelectorAll('.ranking-item');
            rankingItems.forEach(item => {
                item.addEventListener('click', function() {
                    this.style.background = 'rgba(210,10,10,0.2)';
                    setTimeout(() => {
                        this.style.background = '';
                    }, 300);
                });
            });
            
            // News items
            const newsItems = document.querySelectorAll('.news-item');
            newsItems.forEach(item => {
                item.addEventListener('click', function() {
                    this.style.background = 'rgba(210,10,10,0.2)';
                    setTimeout(() => {
                        this.style.background = '';
                    }, 300);
                });
            });
            
            // Stat cards
            const statCards = document.querySelectorAll('.stat-card');
            statCards.forEach(card => {
                card.addEventListener('click', function() {
                    this.style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 300);
                });
            });
            
            // Auto-refresh data every 5 minutes (only if API is available)
            if (<?php echo $useLiveAPI ? 'true' : 'false'; ?>) {
                setInterval(function() {
                    fetch('api/events.php?limit=5')
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                console.log('Data refreshed successfully');
                                // Optional: Update DOM elements here
                            }
                        })
                        .catch(error => console.error('Refresh error:', error));
                }, 300000);
            }
        });
        
        <?php if ($current_stream): ?>
        // Chat functionality
        const streamId = <?php echo $current_stream_id; ?>;
        const chatMessages = document.getElementById('chatMessages');
        const chatForm = document.getElementById('chatForm');
        const messageInput = document.getElementById('messageInput');
        
        function loadMessages() {
            fetch('get_chat.php?stream_id=' + streamId)
                .then(response => response.json())
                .then(data => {
                    chatMessages.innerHTML = '';
                    data.messages.forEach(msg => {
                        addMessage(msg.username, msg.message, msg.time);
                    });
                });
        }
        
        function addMessage(username, message, time) {
            const msgDiv = document.createElement('div');
            msgDiv.className = 'chat-message';
            msgDiv.innerHTML = `
                <div class="username">${escapeHtml(username)}</div>
                <div class="message">${escapeHtml(message)}</div>
                <div class="time">${time}</div>
            `;
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const message = messageInput.value.trim();
            if (message) {
                fetch('send_chat.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: 'stream_id=' + streamId + '&message=' + encodeURIComponent(message)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        messageInput.value = '';
                        loadMessages();
                    }
                });
            }
        });
        
        setInterval(loadMessages, 3000);
        loadMessages();
        <?php endif; ?>
    </script>
</body>
</html>
