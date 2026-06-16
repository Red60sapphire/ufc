<?php
session_start();

// Database configuration - Using SQLite for stability
$db_file = __DIR__ . '/streaming.db';

try {
    // Use SQLite for now (more stable)
    if (class_exists('SQLite3')) {
        $conn = new SQLite3($db_file);
        $conn->enableExceptions(true);
        
        // Create tables if they don't exist
        $conn->exec("CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            is_admin INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");
        
        $conn->exec("CREATE TABLE IF NOT EXISTS streams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            video_url TEXT NOT NULL,
            thumbnail_url TEXT,
            is_live INTEGER DEFAULT 0,
            created_by INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        )");
        
        $conn->exec("CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            stream_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (stream_id) REFERENCES streams(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )");
        
        // Insert default admin user if not exists
        $admin_check = $conn->querySingle("SELECT COUNT(*) FROM users WHERE username = 'admin'");
        if ($admin_check == 0) {
            $hashed_password = password_hash('admin123', PASSWORD_DEFAULT);
            $conn->exec("INSERT INTO users (username, email, password, is_admin) VALUES ('admin', 'admin@streaming.com', '$hashed_password', 1)");
        }
    } else {
        die("SQLite extension not available. Please install SQLite extension.");
    }
} catch (Exception $e) {
    die("Database connection error: " . $e->getMessage() . "<br><br>Troubleshooting:<br>1. Make sure the 'streaming.db' file can be created in this directory<br>2. Check directory permissions<br>3. Ensure SQLite extension is installed");
}

// Helper function to check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

// Helper function to check if user is admin
function isAdmin() {
    return isset($_SESSION['is_admin']) && $_SESSION['is_admin'] == 1;
}

// Helper function to redirect
function redirect($url) {
    header("Location: $url");
    exit();
}

// Helper function to sanitize input
function sanitize($conn, $input) {
    if ($conn instanceof SQLite3) {
        return SQLite3::escapeString(htmlspecialchars(trim($input)));
    }
    return mysqli_real_escape_string($conn, htmlspecialchars(trim($input)));
}

// Database abstraction functions
function db_prepare($conn, $query) {
    if ($conn instanceof SQLite3) {
        return $conn->prepare($query);
    }
    return $conn->prepare($query);
}

function db_execute($stmt, $params = []) {
    if ($stmt instanceof SQLite3Stmt) {
        if (!empty($params)) {
            $types = '';
            $bind_names = [];
            foreach ($params as $i => $param) {
                $bind_name = ':param' . $i;
                $bind_names[] = $bind_name;
                if (is_int($param)) {
                    $types .= 'i';
                } elseif (is_float($param)) {
                    $types .= 'd';
                } else {
                    $types .= 's';
                }
                $stmt->bindValue($bind_name, $param);
            }
            // Replace ? with :param0, :param1, etc.
            $query = $stmt->getSQL(true);
            foreach ($bind_names as $i => $name) {
                $query = preg_replace('/\?/', $name, $query, 1);
            }
            $stmt = $conn->prepare($query);
            foreach ($bind_names as $i => $name) {
                $stmt->bindValue($name, $params[$i]);
            }
        }
        $result = $stmt->execute();
        return $result;
    } else {
        if (!empty($params)) {
            $types = '';
            foreach ($params as $param) {
                if (is_int($param)) {
                    $types .= 'i';
                } elseif (is_float($param)) {
                    $types .= 'd';
                } else {
                    $types .= 's';
                }
            }
            $stmt->bind_param($types, ...$params);
        }
        return $stmt->execute();
    }
}

function db_fetch_all($stmt) {
    if ($stmt instanceof SQLite3Result) {
        $results = [];
        while ($row = $stmt->fetchArray(SQLITE3_ASSOC)) {
            $results[] = $row;
        }
        return $results;
    }
    $result = $stmt->get_result();
    $results = [];
    while ($row = $result->fetch_assoc()) {
        $results[] = $row;
    }
    return $results;
}

function db_query($conn, $query) {
    if ($conn instanceof SQLite3) {
        return $conn->query($query);
    }
    return $conn->query($query);
}

function db_num_rows($result) {
    if ($result instanceof SQLite3Result) {
        // SQLite doesn't have num_rows, need to count
        $count = 0;
        while ($result->fetchArray()) {
            $count++;
        }
        $result->reset();
        return $count;
    }
    return $result->num_rows;
}

function db_fetch_assoc($result) {
    if ($result instanceof SQLite3Result) {
        return $result->fetchArray(SQLITE3_ASSOC);
    }
    return $result->fetch_assoc();
}

function db_insert_id($conn) {
    if ($conn instanceof SQLite3) {
        return $conn->lastInsertRowID();
    }
    return $conn->insert_id;
}
?>
