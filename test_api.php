<?php
// Test UFC API functionality
require_once 'ufc_api.php';

echo "Testing UFC API...\n\n";

// Test upcoming events
echo "1. Testing Upcoming Events:\n";
$fetcher = new UFCDataFetcher();
$events = $fetcher->getUpcomingEvents();
echo "Result: " . json_encode($events, JSON_PRETTY_PRINT) . "\n\n";

// Test rankings
echo "2. Testing Rankings:\n";
$rankings = $fetcher->getRankings('lightweight');
echo "Result: " . json_encode($rankings, JSON_PRETTY_PRINT) . "\n\n";

// Test news
echo "3. Testing News:\n";
$news = $fetcher->getLatestNews();
echo "Result: " . json_encode($news, JSON_PRETTY_PRINT) . "\n\n";

// Test helper function
echo "4. Testing Helper Function:\n";
$helperEvents = getUFCData('upcoming_events');
echo "Result: " . json_encode($helperEvents, JSON_PRETTY_PRINT) . "\n\n";

echo "API Test Complete\n";
?>
