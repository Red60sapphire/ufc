<?php
require_once 'config.php';

// Check if user is admin
if (!isLoggedIn() || !isAdmin()) {
    redirect('index.php');
}

$error = '';
$success = '';

// Handle stream creation/deletion
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['action']) && $_POST['action'] == 'add_stream') {
        $title = sanitize($conn, $_POST['title']);
        $description = sanitize($conn, $_POST['description']);
        $video_url = sanitize($conn, $_POST['video_url']);
        $thumbnail_url = sanitize($conn, $_POST['thumbnail_url']);
        $is_live = isset($_POST['is_live']) ? 1 : 0;
        
        if (empty($title) || empty($video_url)) {
            $error = 'Title and video URL are required';
        } else {
            $query = "INSERT INTO streams (title, description, video_url, thumbnail_url, is_live, created_by) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = db_prepare($conn, $query);
            
            if (db_execute($stmt, [$title, $description, $video_url, $thumbnail_url, $is_live, $_SESSION['user_id']])) {
                $success = 'Stream added successfully!';
            } else {
                $error = 'Error adding stream';
            }
        }
    }
    
    if (isset($_POST['action']) && $_POST['action'] == 'delete_stream') {
        $stream_id = intval($_POST['stream_id']);
        $query = "DELETE FROM streams WHERE id = ?";
        $stmt = db_prepare($conn, $query);
        
        if (db_execute($stmt, [$stream_id])) {
            $success = 'Stream deleted successfully!';
        } else {
            $error = 'Error deleting stream';
        }
    }
    
    if (isset($_POST['action']) && $_POST['action'] == 'toggle_live') {
        $stream_id = intval($_POST['stream_id']);
        $is_live = intval($_POST['is_live']);
        $query = "UPDATE streams SET is_live = ? WHERE id = ?";
        $stmt = db_prepare($conn, $query);
        
        if (db_execute($stmt, [$is_live, $stream_id])) {
            $success = 'Stream status updated!';
        } else {
            $error = 'Error updating stream status';
        }
    }
}

// Get all streams
$streams_query = "SELECT s.*, u.username as creator_username FROM streams s JOIN users u ON s.created_by = u.id ORDER BY s.created_at DESC";
$streams_result = db_query($conn, $streams_query);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - ufc.solutions - FREE UFC STREAMS</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            min-height: 100vh;
        }
        .navbar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .navbar h1 {
            font-size: 24px;
        }
        .navbar a {
            color: white;
            text-decoration: none;
            margin-left: 20px;
            font-weight: 500;
        }
        .navbar a:hover {
            text-decoration: underline;
        }
        .container {
            max-width: 1200px;
            margin: 30px auto;
            padding: 0 20px;
        }
        .card {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        .card h2 {
            color: #333;
            margin-bottom: 20px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 500;
        }
        input[type="text"],
        textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            font-family: inherit;
        }
        textarea {
            min-height: 100px;
            resize: vertical;
        }
        input:focus, textarea:focus {
            outline: none;
            border-color: #667eea;
        }
        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .checkbox-group input[type="checkbox"] {
            width: 20px;
            height: 20px;
        }
        button {
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        button:hover {
            transform: translateY(-2px);
        }
        .error {
            background: #fee;
            color: #c33;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            border-left: 4px solid #c33;
        }
        .success {
            background: #efe;
            color: #3c3;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            border-left: 4px solid #3c3;
        }
        .streams-table {
            width: 100%;
            border-collapse: collapse;
        }
        .streams-table th,
        .streams-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        .streams-table th {
            background: #f8f8f8;
            font-weight: 600;
            color: #333;
        }
        .streams-table tr:hover {
            background: #f9f9f9;
        }
        .live-badge {
            background: #4CAF50;
            color: white;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .offline-badge {
            background: #999;
            color: white;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .action-buttons {
            display: flex;
            gap: 10px;
        }
        .btn-small {
            padding: 8px 15px;
            font-size: 14px;
        }
        .btn-delete {
            background: #c33;
        }
        .btn-toggle {
            background: #ff9800;
        }
    </style>
</head>
<body>
    <div class="navbar">
        <h1>FREE UFC STREAMS - Admin</h1>
        <div>
            <a href="https://discord.gg/Dh2gUUgYTg" target="_blank">Join Discord</a>
            <span>Welcome, <?php echo htmlspecialchars($_SESSION['username']); ?></span>
            <a href="index.php">View Site</a>
            <a href="logout.php">Logout</a>
        </div>
    </div>
    
    <div class="container">
        <?php if ($error): ?>
            <div class="error"><?php echo $error; ?></div>
        <?php endif; ?>
        <?php if ($success): ?>
            <div class="success"><?php echo $success; ?></div>
        <?php endif; ?>
        
        <div class="card">
            <h2>Add New Stream</h2>
            <form method="POST">
                <input type="hidden" name="action" value="add_stream">
                <div class="form-group">
                    <label>Stream Title *</label>
                    <input type="text" name="title" required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description"></textarea>
                </div>
                <div class="form-group">
                    <label>Video URL (Hosting Link) *</label>
                    <input type="text" name="video_url" required placeholder="https://example.com/video.mp4 or embed URL">
                </div>
                <div class="form-group">
                    <label>Thumbnail URL</label>
                    <input type="text" name="thumbnail_url" placeholder="https://example.com/thumbnail.jpg">
                </div>
                <div class="form-group checkbox-group">
                    <input type="checkbox" name="is_live" id="is_live">
                    <label for="is_live" style="margin-bottom: 0;">Mark as Live</label>
                </div>
                <button type="submit">Add Stream</button>
            </form>
        </div>
        
        <div class="card">
            <h2>Manage Streams</h2>
            <?php if (db_num_rows($streams_result) > 0): ?>
                <table class="streams-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Creator</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php while ($stream = db_fetch_assoc($streams_result)): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($stream['title']); ?></td>
                                <td>
                                    <?php if ($stream['is_live']): ?>
                                        <span class="live-badge">LIVE</span>
                                    <?php else: ?>
                                        <span class="offline-badge">OFFLINE</span>
                                    <?php endif; ?>
                                </td>
                                <td><?php echo htmlspecialchars($stream['creator_username']); ?></td>
                                <td><?php echo date('M j, Y g:i A', strtotime($stream['created_at'])); ?></td>
                                <td>
                                    <div class="action-buttons">
                                        <form method="POST" style="display: inline;">
                                            <input type="hidden" name="action" value="toggle_live">
                                            <input type="hidden" name="stream_id" value="<?php echo $stream['id']; ?>">
                                            <input type="hidden" name="is_live" value="<?php echo $stream['is_live'] ? 0 : 1; ?>">
                                            <button type="submit" class="btn-small btn-toggle">
                                                <?php echo $stream['is_live'] ? 'Go Offline' : 'Go Live'; ?>
                                            </button>
                                        </form>
                                        <form method="POST" style="display: inline;">
                                            <input type="hidden" name="action" value="delete_stream">
                                            <input type="hidden" name="stream_id" value="<?php echo $stream['id']; ?>">
                                            <button type="submit" class="btn-small btn-delete">Delete</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>
            <?php else: ?>
                <p>No streams yet. Add your first stream above!</p>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
