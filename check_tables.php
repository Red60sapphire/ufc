<?php
// Check if UFC tables exist
require_once 'config.php';

echo "<h2>UFC Database Table Check</h2>";
echo "<pre>";

// Check for each UFC table
$tables = ['ufc_events', 'ufc_fighters', 'ufc_fight_cards', 'ufc_rankings', 'ufc_fighter_stats', 'ufc_api_cache', 'ufc_news'];

foreach ($tables as $table) {
    if ($conn instanceof SQLite3) {
        $result = $conn->query("SELECT name FROM sqlite_master WHERE type='table' AND name='$table'");
        $exists = $result->fetchArray() !== false;
    } else {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        $exists = $result->num_rows > 0;
    }
    
    echo $exists ? "✓ $table exists\n" : "✗ $table missing\n";
}

// Check if api directory exists and has files
echo "\n=== API Directory Check ===\n";
$apiDir = __DIR__ . '/api';
if (is_dir($apiDir)) {
    echo "✓ api/ directory exists\n";
    $apiFiles = ['ufc_data_fetcher.php', 'events.php', 'fighters.php', 'rankings.php', 'fightcard.php', 'news.php'];
    foreach ($apiFiles as $file) {
        $exists = file_exists($apiDir . '/' . $file);
        echo $exists ? "✓ $file exists\n" : "✗ $file missing\n";
    }
} else {
    echo "✗ api/ directory missing\n";
}

// Check config file
echo "\n=== Config File Check ===\n";
$configExists = file_exists(__DIR__ . '/ufc_config.php');
echo $configExists ? "✓ ufc_config.php exists\n" : "✗ ufc_config.php missing\n";

echo "\n=== Current Database Type ===\n";
echo $conn instanceof SQLite3 ? "Using SQLite\n" : "Using MySQL\n";

echo "</pre>";
echo "<p><a href='index.php'>Return to Homepage</a></p>";
?>
