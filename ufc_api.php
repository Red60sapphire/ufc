<?php
// UFC API Integration - Fighting Intelligence Engine
// This fetches live UFC data from the Apify API

class UFCDataFetcher {
    private $apiUrl = 'https://api.apify.com/v2/acts/visita~fighting-intelligence-engine/runs';
    private $apiToken = 'apify_api_iZgcdFviaD1rR1xFYmZMQrrSyauUy63oh2Ie'; // Add your Apify API token here
    
    public function __construct($apiToken = null) {
        if ($apiToken) {
            $this->apiToken = $apiToken;
        }
    }
    
    /**
     * Fetch upcoming UFC events and fight cards
     */
    public function getUpcomingEvents() {
        return $this->makeRequest([
            'operation' => 'upcoming_events'
        ]);
    }
    
    /**
     * Get current UFC rankings for a specific weight class
     */
    public function getRankings($weightClass = 'lightweight') {
        return $this->makeRequest([
            'operation' => 'rankings',
            'weightClass' => $weightClass
        ]);
    }
    
    /**
     * Get fighter profile by name
     */
    public function getFighterProfile($fighterName) {
        return $this->makeRequest([
            'operation' => 'fighter_profile',
            'fighterName' => $fighterName
        ]);
    }
    
    /**
     * Get latest MMA news
     */
    public function getLatestNews() {
        return $this->makeRequest([
            'operation' => 'latest_news'
        ]);
    }
    
    /**
     * Compare two fighters head-to-head
     */
    public function compareFighters($fighterA, $fighterB) {
        return $this->makeRequest([
            'operation' => 'head_to_head',
            'fighterA' => $fighterA,
            'fighterB' => $fighterB
        ]);
    }
    
    /**
     * Make API request to Apify
     */
    private function makeRequest($params) {
        $url = $this->apiUrl;
        
        $headers = [
            'Content-Type: application/json'
        ];
        
        if ($this->apiToken) {
            $headers[] = 'Authorization: Bearer ' . $this->apiToken;
        }
        
        error_log("UFC API Request URL: " . $url);
        error_log("UFC API Request Params: " . json_encode($params));
        error_log("UFC API Token: " . ($this->apiToken ? 'SET' : 'NOT SET'));
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_VERBOSE, true);
        
        $verboseLog = fopen('php://temp', 'w+');
        curl_setopt($ch, CURLOPT_STDERR, $verboseLog);
        
        $response = curl_exec($ch);
        $error = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        rewind($verboseLog);
        $verboseLogContents = stream_get_contents($verboseLog);
        fclose($verboseLog);
        
        curl_close($ch);
        
        error_log("UFC API Verbose Log: " . $verboseLogContents);
        error_log("UFC API HTTP Code: " . $httpCode);
        error_log("UFC API Response: " . $response);
        
        if ($error) {
            error_log("UFC API curl error: " . $error);
            return ['error' => 'API request failed: ' . $error];
        }
        
        if ($httpCode !== 200 && $httpCode !== 201) {
            error_log("UFC API HTTP error: " . $httpCode . " Response: " . $response);
            return ['error' => 'API returned HTTP code: ' . $httpCode];
        }
        
        $data = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("UFC API JSON decode error: " . json_last_error_msg());
            return ['error' => 'Failed to decode API response'];
        }
        
        error_log("UFC API Decoded Data: " . json_encode($data));
        
        // Wait for the run to complete and get results
        if (isset($data['id'])) {
            $runId = $data['id'];
            error_log("UFC API Run ID: " . $runId);
            return $this->getRunResults($runId);
        }
        
        return $data;
    }
    
    /**
     * Get results from a completed run
     */
    private function getRunResults($runId) {
        $url = "https://api.apify.com/v2/acts/visita~fighting-intelligence-engine/runs/{$runId}";
        
        $headers = [
            'Content-Type: application/json'
        ];
        
        if ($this->apiToken) {
            $headers[] = 'Authorization: Bearer ' . $this->apiToken;
        }
        
        // Poll for results
        $maxAttempts = 15;
        $attempt = 0;
        
        while ($attempt < $maxAttempts) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            
            $response = curl_exec($ch);
            $error = curl_error($ch);
            curl_close($ch);
            
            if ($error) {
                error_log("UFC API run status check error: " . $error);
                $attempt++;
                sleep(2);
                continue;
            }
            
            $data = json_decode($response, true);
            
            if (isset($data['status']) && $data['status'] === 'SUCCEEDED') {
                // Get the dataset items
                $datasetUrl = "https://api.apify.com/v2/acts/visita~fighting-intelligence-engine/runs/{$runId}/dataset/items";
                
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $datasetUrl);
                curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 10);
                
                $datasetResponse = curl_exec($ch);
                $datasetError = curl_error($ch);
                curl_close($ch);
                
                if ($datasetError) {
                    error_log("UFC API dataset fetch error: " . $datasetError);
                    return ['error' => 'Failed to fetch dataset'];
                }
                
                $datasetData = json_decode($datasetResponse, true);
                
                if (json_last_error() !== JSON_ERROR_NONE) {
                    error_log("UFC API dataset JSON decode error: " . json_last_error_msg());
                    return ['error' => 'Failed to decode dataset'];
                }
                
                return $datasetData;
            } elseif (isset($data['status']) && $data['status'] === 'FAILED') {
                error_log("UFC API run failed: " . ($data['error'] ?? 'Unknown error'));
                return ['error' => 'API run failed: ' . ($data['error'] ?? 'Unknown error')];
            }
            
            $attempt++;
            sleep(2);
        }
        
        error_log("UFC API timeout after " . $maxAttempts . " attempts");
        return ['error' => 'Timeout waiting for API results'];
    }
    
    /**
     * Fallback to mock data if API fails
     */
    public function getMockData($type) {
        switch ($type) {
            case 'upcoming_events':
                return [
                    [
                        'event_name' => 'UFC Fight Night 248',
                        'date' => date('Y-m-d'),
                        'main_event' => [
                            'fighter_a' => 'Michael Chandler',
                            'fighter_b' => 'Charles Oliveira',
                            'weight_class' => 'Lightweight'
                        ],
                        'fight_card' => [
                            ['fighter_a' => 'Michael Chandler', 'fighter_b' => 'Charles Oliveira', 'record_a' => '23-8-0', 'record_b' => '34-10-0'],
                            ['fighter_a' => 'Justin Gaethje', 'fighter_b' => 'Dustin Poirier', 'record_a' => '25-4-0', 'record_b' => '29-8-0'],
                            ['fighter_a' => 'Islam Makhachev', 'fighter_b' => 'Beneil Dariush', 'record_a' => '25-1-0', 'record_b' => '22-5-0']
                        ]
                    ]
                ];
                
            case 'rankings':
                return [
                    [
                        'rank' => 'C',
                        'fighter' => 'Islam Makhachev',
                        'record' => '25-1-0',
                        'weight_class' => 'Lightweight'
                    ],
                    [
                        'rank' => '1',
                        'fighter' => 'Charles Oliveira',
                        'record' => '34-10-0',
                        'weight_class' => 'Lightweight'
                    ],
                    [
                        'rank' => '2',
                        'fighter' => 'Dustin Poirier',
                        'record' => '29-8-0',
                        'weight_class' => 'Lightweight'
                    ],
                    [
                        'rank' => '3',
                        'fighter' => 'Justin Gaethje',
                        'record' => '25-4-0',
                        'weight_class' => 'Lightweight'
                    ],
                    [
                        'rank' => '4',
                        'fighter' => 'Michael Chandler',
                        'record' => '23-8-0',
                        'weight_class' => 'Lightweight'
                    ]
                ];
                
            case 'news':
                return [
                    ['title' => "Makhachev: 'I'm Ready For Anyone'", 'date' => '2 hours ago'],
                    ['title' => 'Chandler vs Oliveira Rematch Announced', 'date' => '5 hours ago'],
                    ['title' => 'UFC Fight Night 248 Card Official', 'date' => '1 day ago']
                ];
                
            default:
                return [];
        }
    }
}

// Helper function to get UFC data with fallback
function getUFCData($type, $params = []) {
    $fetcher = new UFCDataFetcher();
    
    try {
        switch ($type) {
            case 'upcoming_events':
                $data = $fetcher->getUpcomingEvents();
                break;
            case 'rankings':
                $weightClass = $params['weight_class'] ?? 'lightweight';
                $data = $fetcher->getRankings($weightClass);
                break;
            case 'news':
                $data = $fetcher->getLatestNews();
                break;
            default:
                $data = ['error' => 'Unknown data type'];
        }
        
        // If API fails or returns empty data, use mock data
        if (isset($data['error']) || empty($data)) {
            error_log("UFC API failed or returned empty data for type: " . $type . ", using mock data");
            return $fetcher->getMockData($type);
        }
        
        return $data;
    } catch (Exception $e) {
        // Fallback to mock data on error
        error_log("UFC API exception: " . $e->getMessage() . ", using mock data");
        $fetcher = new UFCDataFetcher();
        return $fetcher->getMockData($type);
    }
}
?>
