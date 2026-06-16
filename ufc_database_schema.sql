-- UFC Data Database Schema
-- This schema supports live UFC data with caching and automatic updates

-- UFC Events Table
CREATE TABLE IF NOT EXISTS ufc_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME,
    location VARCHAR(255),
    venue VARCHAR(255),
    is_main_event TINYINT(1) DEFAULT 0,
    status ENUM('scheduled', 'live', 'completed', 'cancelled') DEFAULT 'scheduled',
    api_event_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (event_date),
    INDEX (status),
    INDEX (api_event_id)
);

-- Fighters Table
CREATE TABLE IF NOT EXISTS ufc_fighters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    nickname VARCHAR(100),
    weight_class VARCHAR(50),
    record_wins INT DEFAULT 0,
    record_losses INT DEFAULT 0,
    record_draws INT DEFAULT 0,
    height_inches DECIMAL(5,2),
    reach_inches DECIMAL(5,2),
    weight_lbs INT,
    country VARCHAR(100),
    api_fighter_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (last_name),
    INDEX (weight_class),
    INDEX (api_fighter_id)
);

-- Fight Cards Table
CREATE TABLE IF NOT EXISTS ufc_fight_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    fighter_a_id INT NOT NULL,
    fighter_b_id INT NOT NULL,
    weight_class VARCHAR(50),
    bout_order INT,
    card_type ENUM('main_card', 'preliminary', 'early_prelims') DEFAULT 'main_card',
    rounds INT DEFAULT 3,
    result VARCHAR(50),
    method VARCHAR(100),
    fight_time VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES ufc_events(id) ON DELETE CASCADE,
    FOREIGN KEY (fighter_a_id) REFERENCES ufc_fighters(id) ON DELETE CASCADE,
    FOREIGN KEY (fighter_b_id) REFERENCES ufc_fighters(id) ON DELETE CASCADE,
    INDEX (event_id),
    INDEX (card_type),
    INDEX (bout_order)
);

-- Rankings Table
CREATE TABLE IF NOT EXISTS ufc_rankings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fighter_id INT NOT NULL,
    weight_class VARCHAR(50) NOT NULL,
    rank_position INT,
    is_champion TINYINT(1) DEFAULT 0,
    ranking_date DATE NOT NULL,
    points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fighter_id) REFERENCES ufc_fighters(id) ON DELETE CASCADE,
    UNIQUE KEY (fighter_id, weight_class, ranking_date),
    INDEX (weight_class),
    INDEX (rank_position),
    INDEX (ranking_date)
);

-- Fighter Statistics Table
CREATE TABLE IF NOT EXISTS ufc_fighter_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fighter_id INT NOT NULL,
    significant_strikes_landed INT DEFAULT 0,
    significant_strikes_attempted INT DEFAULT 0,
    striking_accuracy DECIMAL(5,2),
    takedowns_landed INT DEFAULT 0,
    takedowns_attempted INT DEFAULT 0,
    takedown_accuracy DECIMAL(5,2),
    submission_attempts INT DEFAULT 0,
    knockdowns INT DEFAULT 0,
    total_fight_time INT DEFAULT 0, -- in seconds
    stat_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fighter_id) REFERENCES ufc_fighters(id) ON DELETE CASCADE,
    UNIQUE KEY (fighter_id, stat_date),
    INDEX (fighter_id),
    INDEX (stat_date)
);

-- API Cache Table
CREATE TABLE IF NOT EXISTS ufc_api_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    cache_data TEXT NOT NULL,
    cache_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    api_source VARCHAR(100),
    INDEX (cache_key),
    INDEX (expires_at)
);

-- News Table
CREATE TABLE IF NOT EXISTS ufc_news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    source VARCHAR(100),
    news_url VARCHAR(500),
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (published_at)
);

-- Insert default weight classes
INSERT INTO ufc_rankings (weight_class, ranking_date) VALUES
('Heavyweight', CURDATE()),
('Light Heavyweight', CURDATE()),
('Middleweight', CURDATE()),
('Welterweight', CURDATE()),
('Lightweight', CURDATE()),
('Featherweight', CURDATE()),
('Bantamweight', CURDATE()),
('Flyweight', CURDATE())
ON DUPLICATE KEY UPDATE weight_class=weight_class;
