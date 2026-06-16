<?php
// Test Database Connection
echo "<h2>Database Connection Test</h2>";
echo "<pre>";

// Test MySQL
echo "=== Testing MySQL Connection ===\n";
define('DB_HOST', 'sql211.infinityfree.com');
define('DB_USER', 'if0_40107222');
define('DB_PASS', '9ODw0aGO7tk6uKx');
define('DB_NAME', 'if0_40107222_ufc');

try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        echo "✗ MySQL Connection Failed: " . $conn->connect_error . "\n";
    } else {
        echo "✓ MySQL Connection Successful\n";
        echo "✓ Database: " . DB_NAME . "\n";
        echo "✓ Host: " . DB_HOST . "\n";
        
        // Test query
        $result = $conn->query("SHOW TABLES");
        echo "✓ Tables in database: " . $result->num_rows . "\n";
        
        // Check for UFC tables
        $ufc_tables = ['ufc_events', 'ufc_fighters', 'ufc_fight_cards', 'ufc_rankings', 'ufc_fighter_stats', 'ufc_api_cache', 'ufc_news'];
        echo "\n=== UFC Tables Check ===\n";
        foreach ($ufc_tables as $table) {
            $check = $conn->query("SHOW TABLES LIKE '$table'");
            echo $check->num_rows > 0 ? "✓ $table exists\n" : "✗ $table missing\n";
        }
        
        $conn->close();
    }
} catch (Exception $e) {
    echo "✗ MySQL Error: " . $e->getMessage() . "\n";
}

// Test SQLite
echo "\n=== Testing SQLite Connection ===\n";
$db_file = __DIR__ . '/streaming.db';
try {
    if (class_exists('SQLite3')) {
        $conn = new SQLite3($db_file);
        echo "✓ SQLite Connection Successful\n";
        echo "✓ Database file: $db_file\n";
        
        // Check tables
        $result = $conn->query("SELECT name FROM sqlite_master WHERE type='table'");
        $tables = [];
        while ($row = $result->fetchArray()) {
            $tables[] = $row['name'];
        }
        echo "✓ Tables in database: " . count($tables) . "\n";
        
        // Check for UFC tables
        $ufc_tables = ['ufc_events', 'ufc_fighters', 'ufc_fight_cards', 'ufc_rankings', 'ufc_fighter_stats', 'ufc_api_cache', 'ufc_news'];
        echo "\n=== UFC Tables Check ===\n";
        foreach ($ufc_tables as $table) {
            echo in_array($table, $tables) ? "✓ $table exists\n" : "✗ $table missing\n";
        }
        
        $conn->close();
    } else {
        echo "✗ SQLite extension not available\n";
    }
} catch (Exception $e) {
    echo "✗ SQLite Error: " . $e->getMessage() . "\n";
}

echo "\n=== Recommendation ===\n";
echo "Based on the results above, the site will use the database that connects successfully.\n";
echo "If MySQL works, run setup_ufc_database.php to create UFC tables.\n";
echo "If SQLite works, the site will use SQLite automatically.\n";

echo "</pre>";
echo "<p><a href='index.php'>Return to Homepage</a></p>";
?>
