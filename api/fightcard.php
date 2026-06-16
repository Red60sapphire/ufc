<?php
// UFC Fight Card API Endpoint
// Returns complete fight card for specific event

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config.php';
require_once 'ufc_data_fetcher.php';

try {
    $fetcher = new UFCDataFetcher();
    
    if (isset($_GET['event_id'])) {
        $eventId = intval($_GET['event_id']);
        $fightCard = $fetcher->getFightCard($eventId);
        
        if (empty($fightCard)) {
            // Fallback to database
            $stmt = db_prepare($conn, "
                SELECT fc.*, 
                       fa.first_name as fighter_a_first, fa.last_name as fighter_a_last, fa.nickname as fighter_a_nick,
                       fb.first_name as fighter_b_first, fb.last_name as fighter_b_last, fb.nickname as fighter_b_nick,
                       e.event_name, e.event_date
                FROM ufc_fight_cards fc
                JOIN ufc_fighters fa ON fc.fighter_a_id = fa.id
                JOIN ufc_fighters fb ON fc.fighter_b_id = fb.id
                JOIN ufc_events e ON fc.event_id = e.id
                WHERE fc.event_id = ?
                ORDER BY fc.bout_order ASC
            ");
            db_execute($stmt, [$eventId]);
            
            $fightCard = [];
            while ($row = db_fetch_assoc($stmt)) {
                $fightCard[] = $row;
            }
        }
        
        echo json_encode([
            'success' => true,
            'data' => $fightCard,
            'event_id' => $eventId,
            'timestamp' => time(),
            'source' => 'live_api'
        ]);
    } else {
        // Get latest event fight card
        $stmt = db_prepare($conn, "
            SELECT id FROM ufc_events 
            WHERE event_date >= CURDATE() 
            ORDER BY event_date ASC 
            LIMIT 1
        ");
        db_execute($stmt);
        $event = db_fetch_assoc($stmt);
        
        if ($event) {
            $fightCard = $fetcher->getFightCard($event['id']);
            
            if (empty($fightCard)) {
                // Database fallback
                $stmt = db_prepare($conn, "
                    SELECT fc.*, 
                           fa.first_name as fighter_a_first, fa.last_name as fighter_a_last, fa.nickname as fighter_a_nick,
                           fb.first_name as fighter_b_first, fb.last_name as fighter_b_last, fb.nickname as fighter_b_nick,
                           e.event_name, e.event_date
                    FROM ufc_fight_cards fc
                    JOIN ufc_fighters fa ON fc.fighter_a_id = fa.id
                    JOIN ufc_fighters fb ON fc.fighter_b_id = fb.id
                    JOIN ufc_events e ON fc.event_id = e.id
                    WHERE fc.event_id = ?
                    ORDER BY fc.bout_order ASC
                ");
                db_execute($stmt, [$event['id']]);
                
                $fightCard = [];
                while ($row = db_fetch_assoc($stmt)) {
                    $fightCard[] = $row;
                }
            }
            
            echo json_encode([
                'success' => true,
                'data' => $fightCard,
                'event_id' => $event['id'],
                'timestamp' => time(),
                'source' => 'live_api'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'error' => 'No upcoming events found',
                'timestamp' => time()
            ]);
        }
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => time()
    ]);
}
?>
