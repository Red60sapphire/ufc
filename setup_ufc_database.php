<?php
// UFC Database Setup Script for MySQL
// Run this file to create all required UFC data tables

require_once 'config.php';

echo "<h2>UFC Database Setup</h2>";
echo "<pre>";

// UFC database schema for SQLite
$schema = "
-- UFC Events Table
CREATE TABLE IF NOT EXISTS ufc_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name TEXT NOT NULL,
    event_date TEXT NOT NULL,
    event_time TEXT,
    location TEXT,
    venue TEXT,
    is_main_event INTEGER DEFAULT 0,
    status TEXT DEFAULT 'scheduled',
    api_event_id TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Fighters Table
CREATE TABLE IF NOT EXISTS ufc_fighters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    nickname TEXT,
    weight_class TEXT,
    record_wins INTEGER DEFAULT 0,
    record_losses INTEGER DEFAULT 0,
    record_draws INTEGER DEFAULT 0,
    height_inches REAL,
    reach_inches REAL,
    weight_lbs INTEGER,
    country TEXT,
    api_fighter_id TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Fight Cards Table
CREATE TABLE IF NOT EXISTS ufc_fight_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    fighter_a_id INTEGER NOT NULL,
    fighter_b_id INTEGER NOT NULL,
    weight_class TEXT,
    bout_order INTEGER,
    card_type TEXT DEFAULT 'main_card',
    rounds INTEGER DEFAULT 3,
    result TEXT,
    method TEXT,
    fight_time TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES ufc_events(id) ON DELETE CASCADE,
    FOREIGN KEY (fighter_a_id) REFERENCES ufc_fighters(id) ON DELETE CASCADE,
    FOREIGN KEY (fighter_b_id) REFERENCES ufc_fighters(id) ON DELETE CASCADE
);

-- Rankings Table
CREATE TABLE IF NOT EXISTS ufc_rankings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fighter_id INTEGER NOT NULL,
    weight_class TEXT NOT NULL,
    rank_position INTEGER,
    is_champion INTEGER DEFAULT 0,
    ranking_date TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fighter_id) REFERENCES ufc_fighters(id) ON DELETE CASCADE,
    UNIQUE (fighter_id, weight_class, ranking_date)
);

-- Fighter Statistics Table
CREATE TABLE IF NOT EXISTS ufc_fighter_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fighter_id INTEGER NOT NULL,
    significant_strikes_landed INTEGER DEFAULT 0,
    significant_strikes_attempted INTEGER DEFAULT 0,
    striking_accuracy REAL,
    takedowns_landed INTEGER DEFAULT 0,
    takedowns_attempted INTEGER DEFAULT 0,
    takedown_accuracy REAL,
    submission_attempts INTEGER DEFAULT 0,
    knockdowns INTEGER DEFAULT 0,
    total_fight_time INTEGER DEFAULT 0,
    stat_date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fighter_id) REFERENCES ufc_fighters(id) ON DELETE CASCADE,
    UNIQUE (fighter_id, stat_date)
);

-- API Cache Table
CREATE TABLE IF NOT EXISTS ufc_api_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_key TEXT UNIQUE NOT NULL,
    cache_data TEXT NOT NULL,
    cache_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    api_source TEXT
);

-- News Table
CREATE TABLE IF NOT EXISTS ufc_news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    source TEXT,
    news_url TEXT,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
";

// Split by semicolon and execute each statement
$statements = explode(';', $schema);

$successCount = 0;
$errorCount = 0;
$skipCount = 0;

foreach ($statements as $statement) {
    $statement = trim($statement);
    if (!empty($statement) && !preg_match('/^--/', $statement)) {
        try {
            if ($conn instanceof SQLite3) {
                $conn->exec($statement);
            } else {
                $conn->query($statement);
            }
            echo "✓ Created: " . substr($statement, 0, 60) . "...\n";
            $successCount++;
        } catch (Exception $e) {
            // Check if table already exists
            if (strpos($e->getMessage(), 'already exists') !== false || strpos($e->getMessage(), 'Table') !== false) {
                echo "⊘ Skipped (already exists): " . substr($statement, 0, 60) . "...\n";
                $skipCount++;
            } else {
                echo "✗ Error: " . $e->getMessage() . "\n";
                echo "   Statement: " . substr($statement, 0, 100) . "...\n";
                $errorCount++;
            }
        }
    }
}

echo "\n=== Setup Complete ===\n";
echo "Successful: $successCount\n";
echo "Skipped (already exist): $skipCount\n";
echo "Errors: $errorCount\n";

$totalCreated = $successCount + $skipCount;

if ($totalCreated >= 7) { // We expect 7 tables
    echo "\n✓ All UFC database tables are ready!\n";
    echo "✓ You can now use the live UFC API features.\n";
    echo "\nNext steps:\n";
    echo "1. Upload the API files to the api/ directory if not already done\n";
    echo "2. Run check_tables.php to verify everything is setup\n";
    echo "3. Test the API endpoints\n";
    echo "4. Delete setup_ufc_database.php for security\n";
} else {
    echo "\n⚠ Not all tables were created. Expected 7 tables, got $totalCreated.\n";
    echo "Please check the errors above.\n";
}

echo "</pre>";
echo "<p><a href='index.php'>Return to Homepage</a></p>";
?>
