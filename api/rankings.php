<?php
// UFC Rankings API Endpoint
// Returns current UFC rankings by weight class

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config.php';
require_once 'ufc_data_fetcher.php';

try {
    $fetcher = new UFCDataFetcher();
    $weightClass = isset($_GET['weight_class']) ? $_GET['weight_class'] : 'pound-for-pound';
    
    $rankings = $fetcher->getRankings($weightClass);
    
    if (empty($rankings)) {
        // Fallback to database
        $stmt = db_prepare($conn, "
            SELECT r.*, f.first_name, f.last_name, f.nickname, f.record_wins, f.record_losses, f.record_draws
            FROM ufc_rankings r
            JOIN ufc_fighters f ON r.fighter_id = f.id
            WHERE r.weight_class = ? AND r.ranking_date = (
                SELECT MAX(ranking_date) FROM ufc_rankings WHERE weight_class = ?
            )
            ORDER BY r.rank_position ASC
        ");
        db_execute($stmt, [$weightClass, $weightClass]);
        
        $rankings = [];
        while ($row = db_fetch_assoc($stmt)) {
            $rankings[] = $row;
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $rankings,
        'weight_class' => $weightClass,
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
