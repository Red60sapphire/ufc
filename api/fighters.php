<?php
// UFC Fighters API Endpoint
// Returns fighter profiles and statistics

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config.php';
require_once 'ufc_data_fetcher.php';

try {
    $fetcher = new UFCDataFetcher();
    
    if (isset($_GET['id'])) {
        // Get specific fighter
        $fighterId = intval($_GET['id']);
        $fighter = $fetcher->getFighterProfile($fighterId);
        
        echo json_encode([
            'success' => true,
            'data' => $fighter,
            'timestamp' => time()
        ]);
    } else {
        // Get all fighters or filter by weight class
        $weightClass = isset($_GET['weight_class']) ? $_GET['weight_class'] : null;
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
        
        $query = "SELECT * FROM ufc_fighters";
        $params = [];
        
        if ($weightClass) {
            $query .= " WHERE weight_class = ?";
            $params[] = $weightClass;
        }
        
        $query .= " ORDER BY last_name LIMIT ?";
        $params[] = $limit;
        
        $stmt = db_prepare($conn, $query);
        db_execute($stmt, $params);
        
        $fighters = [];
        while ($row = db_fetch_assoc($stmt)) {
            $fighters[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'data' => $fighters,
            'count' => count($fighters),
            'timestamp' => time()
        ]);
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
