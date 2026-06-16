<?php
// UFC News API Endpoint
// Returns latest MMA/UFC news

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config.php';
require_once 'ufc_data_fetcher.php';

try {
    $fetcher = new UFCDataFetcher();
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    
    $news = $fetcher->getLatestNews($limit);
    
    if (empty($news)) {
        // Fallback to database
        $stmt = db_prepare($conn, "
            SELECT * FROM ufc_news 
            ORDER BY published_at DESC 
            LIMIT ?
        ");
        db_execute($stmt, [$limit]);
        
        $news = [];
        while ($row = db_fetch_assoc($stmt)) {
            $news[] = $row;
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $news,
        'count' => count($news),
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
