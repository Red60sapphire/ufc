<?php
// UFC Events API Endpoint
// Returns upcoming UFC events with live data

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config.php';
require_once 'ufc_data_fetcher.php';

try {
    $fetcher = new UFCDataFetcher();
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    
    $events = $fetcher->getUpcomingEvents($limit);
    
    if (empty($events)) {
        // Try to get from database as fallback
        $stmt = db_prepare($conn, "
            SELECT * FROM ufc_events 
            WHERE event_date >= CURDATE() 
            ORDER BY event_date ASC 
            LIMIT ?
        ");
        db_execute($stmt, [$limit]);
        
        $events = [];
        while ($row = db_fetch_assoc($stmt)) {
            $events[] = $row;
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $events,
        'timestamp' => time(),
        'source' => 'live_api'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => time()
    ]);
}
?>
