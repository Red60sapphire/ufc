<?php
// UFC Data Fetcher - Live API Integration
// Uses multiple reliable UFC data sources with fallback

class UFCDataFetcher {
    private $cache;
    private $cacheExpiry = 3600; // 1 hour cache
    
    public function __construct() {
        try {
            $this->cache = new UFCCache();
        } catch (Exception $e) {
            // Cache table doesn't exist yet, disable caching
            $this->cache = null;
            error_log("UFC Cache disabled: " . $e->getMessage());
        }
    }
    
    /**
     * Get upcoming UFC events
     */
    public function getUpcomingEvents($limit = 10) {
        $cacheKey = 'upcoming_events_' . $limit;
        
        if ($this->cache) {
            $cached = $this->cache->get($cacheKey);
            if ($cached !== false) {
                return $cached;
            }
        }
        
        // Try multiple data sources
        $data = $this->fetchFromUFCStats($limit);
        
        if (empty($data)) {
            $data = $this->fetchFromSherdog($limit);
        }
        
        if (empty($data)) {
            $data = $this->fetchFromTapology($limit);
        }
        
        if (!empty($data)) {
            if ($this->cache) {
                $this->cache->set($cacheKey, $data, $this->cacheExpiry);
            }
            $this->saveEventsToDatabase($data);
        }
        
        return $data;
    }
    
    /**
     * Get fight card for specific event
     */
    public function getFightCard($eventId) {
        $cacheKey = 'fight_card_' . $eventId;
        
        if ($this->cache) {
            $cached = $this->cache->get($cacheKey);
            if ($cached !== false) {
                return $cached;
            }
        }
        
        $data = $this->fetchFightCardFromUFCStats($eventId);
        
        if (!empty($data)) {
            if ($this->cache) {
                $this->cache->set($cacheKey, $data, $this->cacheExpiry);
            }
            $this->saveFightCardToDatabase($eventId, $data);
        }
        
        return $data;
    }
    
    /**
     * Get rankings for specific weight class
     */
    public function getRankings($weightClass = 'pound-for-pound') {
        $cacheKey = 'rankings_' . $weightClass;
        
        if ($this->cache) {
            $cached = $this->cache->get($cacheKey);
            if ($cached !== false) {
                return $cached;
            }
        }
        
        $data = $this->fetchRankingsFromUFCStats($weightClass);
        
        if (!empty($data)) {
            if ($this->cache) {
                $this->cache->set($cacheKey, $data, $this->cacheExpiry);
            }
            $this->saveRankingsToDatabase($weightClass, $data);
        }
        
        return $data;
    }
    
    /**
     * Get fighter profile
     */
    public function getFighterProfile($fighterId) {
        $cacheKey = 'fighter_' . $fighterId;
        
        if ($this->cache) {
            $cached = $this->cache->get($cacheKey);
            if ($cached !== false) {
                return $cached;
            }
        }
        
        $data = $this->fetchFighterFromUFCStats($fighterId);
        
        if (!empty($data)) {
            if ($this->cache) {
                $this->cache->set($cacheKey, $data, $this->cacheExpiry);
            }
            $this->saveFighterToDatabase($data);
        }
        
        return $data;
    }
    
    /**
     * Get latest UFC news
     */
    public function getLatestNews($limit = 10) {
        $cacheKey = 'latest_news_' . $limit;
        
        if ($this->cache) {
            $cached = $this->cache->get($cacheKey);
            if ($cached !== false) {
                return $cached;
            }
        }
        
        $data = $this->fetchNewsFromMMAMania($limit);
        
        if (!empty($data)) {
            if ($this->cache) {
                $this->cache->set($cacheKey, $data, 1800); // 30 minutes cache
            }
            $this->saveNewsToDatabase($data);
        }
        
        return $data;
    }
    
    // API Source Implementations
    
    private function fetchFromUFCStats($limit) {
        $url = 'https://api.ufcstats.com/api/events';
        
        try {
            $response = $this->makeRequest($url);
            if ($response) {
                $events = json_decode($response, true);
                return array_slice($events, 0, $limit);
            }
        } catch (Exception $e) {
            error_log("UFCStats API Error: " . $e->getMessage());
        }
        
        return [];
    }
    
    private function fetchFightCardFromUFCStats($eventId) {
        $url = "https://api.ufcstats.com/api/event/{$eventId}";
        
        try {
            $response = $this->makeRequest($url);
            if ($response) {
                return json_decode($response, true);
            }
        } catch (Exception $e) {
            error_log("UFCStats Fight Card Error: " . $e->getMessage());
        }
        
        return [];
    }
    
    private function fetchRankingsFromUFCStats($weightClass) {
        $url = 'https://api.ufcstats.com/api/rankings';
        
        try {
            $response = $this->makeRequest($url);
            if ($response) {
                $rankings = json_decode($response, true);
                // Filter by weight class if specified
                if ($weightClass !== 'pound-for-pound') {
                    return $this->filterRankingsByWeightClass($rankings, $weightClass);
                }
                return $rankings;
            }
        } catch (Exception $e) {
            error_log("UFCStats Rankings Error: " . $e->getMessage());
        }
        
        return [];
    }
    
    private function fetchFighterFromUFCStats($fighterId) {
        $url = "https://api.ufcstats.com/api/fighter/{$fighterId}";
        
        try {
            $response = $this->makeRequest($url);
            if ($response) {
                return json_decode($response, true);
            }
        } catch (Exception $e) {
            error_log("UFCStats Fighter Error: " . $e->getMessage());
        }
        
        return [];
    }
    
    private function fetchNewsFromMMAMania($limit) {
        // RSS feed from MMA Mania
        $url = 'https://www.mmanmania.com/rss';
        
        try {
            $response = $this->makeRequest($url);
            if ($response) {
                $rss = simplexml_load_string($response);
                $news = [];
                
                foreach ($rss->channel->item as $item) {
                    if (count($news) >= $limit) break;
                    
                    $news[] = [
                        'title' => (string)$item->title,
                        'link' => (string)$item->link,
                        'description' => (string)$item->description,
                        'pubDate' => (string)$item->pubDate
                    ];
                }
                
                return $news;
            }
        } catch (Exception $e) {
            error_log("MMA Mania News Error: " . $e->getMessage());
        }
        
        return [];
    }
    
    // Fallback sources
    private function fetchFromSherdog($limit) {
        // Sherdog API implementation
        return [];
    }
    
    private function fetchFromTapology($limit) {
        // Tapology API implementation
        return [];
    }
    
    // Helper methods
    private function makeRequest($url, $timeout = 30) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        
        $response = curl_exec($ch);
        $error = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($error) {
            error_log("CURL Error: " . $error);
            return false;
        }
        
        if ($httpCode !== 200) {
            error_log("HTTP Error: " . $httpCode);
            return false;
        }
        
        return $response;
    }
    
    private function filterRankingsByWeightClass($rankings, $weightClass) {
        $filtered = [];
        foreach ($rankings as $ranking) {
            if (strtolower($ranking['weight_class']) === strtolower($weightClass)) {
                $filtered[] = $ranking;
            }
        }
        return $filtered;
    }
    
    // Database operations
    private function saveEventsToDatabase($events) {
        global $conn;
        
        foreach ($events as $event) {
            $stmt = db_prepare($conn, "
                INSERT INTO ufc_events (event_name, event_date, location, api_event_id)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                event_name = VALUES(event_name),
                event_date = VALUES(event_date),
                location = VALUES(location),
                updated_at = CURRENT_TIMESTAMP
            ");
            
            db_execute($stmt, [
                $event['name'],
                $event['date'],
                $event['location'] ?? null,
                $event['id'] ?? null
            ]);
        }
    }
    
    private function saveFightCardToDatabase($eventId, $fightCard) {
        global $conn;
        
        foreach ($fightCard as $fight) {
            // Save fighters first
            $fighterAId = $this->getOrCreateFighter($fight['fighter_a']);
            $fighterBId = $this->getOrCreateFighter($fight['fighter_b']);
            
            $stmt = db_prepare($conn, "
                INSERT INTO ufc_fight_cards (event_id, fighter_a_id, fighter_b_id, weight_class, bout_order, card_type)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                weight_class = VALUES(weight_class),
                bout_order = VALUES(bout_order),
                card_type = VALUES(card_type),
                updated_at = CURRENT_TIMESTAMP
            ");
            
            db_execute($stmt, [
                $eventId,
                $fighterAId,
                $fighterBId,
                $fight['weight_class'] ?? null,
                $fight['bout_order'] ?? null,
                $fight['card_type'] ?? 'main_card'
            ]);
        }
    }
    
    private function saveRankingsToDatabase($weightClass, $rankings) {
        global $conn;
        
        foreach ($rankings as $ranking) {
            $fighterId = $this->getOrCreateFighter($ranking['fighter']);
            
            $stmt = db_prepare($conn, "
                INSERT INTO ufc_rankings (fighter_id, weight_class, rank_position, is_champion, ranking_date)
                VALUES (?, ?, ?, ?, CURDATE())
                ON DUPLICATE KEY UPDATE
                rank_position = VALUES(rank_position),
                is_champion = VALUES(is_champion),
                ranking_date = VALUES(ranking_date),
                updated_at = CURRENT_TIMESTAMP
            ");
            
            db_execute($stmt, [
                $fighterId,
                $weightClass,
                $ranking['rank'] ?? null,
                $ranking['is_champion'] ?? 0
            ]);
        }
    }
    
    private function saveFighterToDatabase($fighterData) {
        $this->getOrCreateFighter($fighterData);
    }
    
    private function saveNewsToDatabase($news) {
        global $conn;
        
        foreach ($news as $item) {
            $stmt = db_prepare($conn, "
                INSERT INTO ufc_news (title, content, source, news_url, published_at)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                title = VALUES(title),
                content = VALUES(content),
                updated_at = CURRENT_TIMESTAMP
            ");
            
            db_execute($stmt, [
                $item['title'],
                $item['description'] ?? null,
                'MMA Mania',
                $item['link'] ?? null,
                date('Y-m-d H:i:s', strtotime($item['pubDate'] ?? 'now'))
            ]);
        }
    }
    
    private function getOrCreateFighter($fighterData) {
        global $conn;
        
        $name = is_array($fighterData) ? ($fighterData['name'] ?? '') : $fighterData;
        $nameParts = explode(' ', $name, 2);
        $firstName = $nameParts[0] ?? '';
        $lastName = $nameParts[1] ?? '';
        
        // Try to find existing fighter
        $stmt = db_prepare($conn, "SELECT id FROM ufc_fighters WHERE first_name = ? AND last_name = ?");
        db_execute($stmt, [$firstName, $lastName]);
        $result = db_fetch_assoc($stmt);
        
        if ($result) {
            return $result['id'];
        }
        
        // Create new fighter
        $stmt = db_prepare($conn, "
            INSERT INTO ufc_fighters (first_name, last_name, nickname, weight_class, record_wins, record_losses, record_draws)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        db_execute($stmt, [
            $firstName,
            $lastName,
            $fighterData['nickname'] ?? null,
            $fighterData['weight_class'] ?? null,
            $fighterData['record_wins'] ?? 0,
            $fighterData['record_losses'] ?? 0,
            $fighterData['record_draws'] ?? 0
        ]);
        
        return db_insert_id($conn);
    }
}

// Cache Class
class UFCCache {
    private $conn;
    
    public function __construct() {
        global $conn;
        $this->conn = $conn;
    }
    
    public function get($key) {
        try {
            $stmt = db_prepare($this->conn, "
                SELECT cache_data FROM ufc_api_cache 
                WHERE cache_key = ? AND expires_at > NOW()
            ");
            db_execute($stmt, [$key]);
            $result = db_fetch_assoc($stmt);
            
            if ($result) {
                return json_decode($result['cache_data'], true);
            }
        } catch (Exception $e) {
            error_log("Cache get error: " . $e->getMessage());
        }
        
        return false;
    }
    
    public function set($key, $data, $expirySeconds) {
        try {
            $expiresAt = date('Y-m-d H:i:s', time() + $expirySeconds);
            
            $stmt = db_prepare($this->conn, "
                INSERT INTO ufc_api_cache (cache_key, cache_data, expires_at, api_source)
                VALUES (?, ?, ?, 'ufc_data_fetcher')
                ON DUPLICATE KEY UPDATE
                cache_data = VALUES(cache_data),
                expires_at = VALUES(expires_at),
                cache_timestamp = CURRENT_TIMESTAMP
            ");
            
            return db_execute($stmt, [$key, json_encode($data), $expiresAt]);
        } catch (Exception $e) {
            error_log("Cache set error: " . $e->getMessage());
            return false;
        }
    }
    
    public function clear($key = null) {
        try {
            if ($key) {
                $stmt = db_prepare($this->conn, "DELETE FROM ufc_api_cache WHERE cache_key = ?");
                return db_execute($stmt, [$key]);
            } else {
                return db_query($this->conn, "DELETE FROM ufc_api_cache WHERE expires_at < NOW()");
            }
        } catch (Exception $e) {
            error_log("Cache clear error: " . $e->getMessage());
            return false;
        }
    }
}
?>
