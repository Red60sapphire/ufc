<?php
session_start();

// Database configuration - Using SQLite for stability
$db_file = __DIR__ . '/streaming.db';

try {
    // Use SQLite for now (more stable)
    if (class_exists('SQLite3')) {
        $conn = new SQLite3($db_file);
        $conn->enableExceptions(true);
        
        // Create tables if they don't exist. Signup only needs username +
        // password, so email is optional.
        $conn->exec("CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT,
            password TEXT NOT NULL,
            is_admin INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");

        // Migration: older installs created `email` as NOT NULL UNIQUE. Since
        // signup no longer collects an email, relax that constraint in place.
        $emailNotNull = false;
        $info = $conn->query("PRAGMA table_info(users)");
        while ($col = $info->fetchArray(SQLITE3_ASSOC)) {
            if ($col['name'] === 'email' && (int)$col['notnull'] === 1) {
                $emailNotNull = true;
            }
        }
        if ($emailNotNull) {
            $conn->exec("CREATE TABLE users_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT,
                password TEXT NOT NULL,
                is_admin INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )");
            $conn->exec("INSERT INTO users_new (id, username, email, password, is_admin, created_at)
                         SELECT id, username, email, password, is_admin, created_at FROM users");
            $conn->exec("DROP TABLE users");
            $conn->exec("ALTER TABLE users_new RENAME TO users");
        }
        
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
            $i = 1;
            foreach ($params as $param) {
                if (is_int($param)) {
                    $type = SQLITE3_INTEGER;
                } elseif (is_float($param)) {
                    $type = SQLITE3_FLOAT;
                } elseif (is_null($param)) {
                    $type = SQLITE3_NULL;
                } else {
                    $type = SQLITE3_TEXT;
                }
                $stmt->bindValue($i, $param, $type);
                $i++;
            }
        }
        $result = $stmt->execute();
        // Remember the result so the helpers below can be called with the
        // statement object (the convention used throughout the callers).
        $GLOBALS['__sqlite_stmt_results'][spl_object_id($stmt)] = $result;
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

// Resolve a SQLite3Stmt to its most recent SQLite3Result. Callers throughout
// the app pass the statement object where a result is expected, so map it back
// to the result produced by db_execute().
function db_sqlite_result($result) {
    if ($result instanceof SQLite3Stmt) {
        $id = spl_object_id($result);
        if (isset($GLOBALS['__sqlite_stmt_results'][$id])) {
            return $GLOBALS['__sqlite_stmt_results'][$id];
        }
        return $result->execute();
    }
    return $result;
}

function db_fetch_all($stmt) {
    $stmt = db_sqlite_result($stmt);
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
    $result = db_sqlite_result($result);
    if ($result instanceof SQLite3Result) {
        // SQLite doesn't have num_rows, need to count
        $count = 0;
        while ($result->fetchArray(SQLITE3_NUM)) {
            $count++;
        }
        $result->reset();
        return $count;
    }
    return $result->num_rows;
}

function db_fetch_assoc($result) {
    $result = db_sqlite_result($result);
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
