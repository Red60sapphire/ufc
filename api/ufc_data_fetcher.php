<?php
// UFC live data fetcher backed by ESPN's public MMA API.
//
// No API key is required. Requests use cURL when available and fall back to
// file_get_contents() (allow_url_fopen) so the site works on hosts without the
// PHP cURL extension. Responses are cached briefly on disk to keep page loads
// fast and to survive transient ESPN outages.

class UFCDataFetcher {
    private $scoreboardUrl = 'https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard';
    private $newsUrl = 'https://site.api.espn.com/apis/site/v2/sports/mma/ufc/news';
    private $cacheTtl = 600; // seconds

    /**
     * Upcoming UFC events with their full fight cards.
     */
    public function getUpcomingEvents($limit = 10) {
        $start = date('Ymd');
        $end = date('Ymd', strtotime('+120 days'));
        $events = $this->parseEvents($this->scoreboardUrl . '?dates=' . $start . '-' . $end, $limit);

        // If the upcoming window is empty, fall back to the default scoreboard
        // (the current or most recent event).
        if (empty($events)) {
            $events = $this->parseEvents($this->scoreboardUrl, $limit);
        }
        return $events;
    }

    /**
     * Fight card for a single event id.
     */
    public function getFightCard($eventId) {
        foreach ($this->getUpcomingEvents(25) as $event) {
            if ((string)($event['id'] ?? '') === (string)$eventId) {
                return $event['fight_card'] ?? [];
            }
        }
        return [];
    }

    /**
     * Latest MMA/UFC news headlines.
     */
    public function getLatestNews($limit = 10) {
        $json = $this->makeRequest($this->newsUrl);
        $data = $json ? json_decode($json, true) : null;
        $news = [];
        if (!empty($data['articles'])) {
            foreach ($data['articles'] as $article) {
                if (empty($article['headline'])) {
                    continue;
                }
                $news[] = [
                    'title' => $article['headline'],
                    'date' => $this->relativeTime($article['published'] ?? null),
                    'link' => $article['links']['web']['href'] ?? null,
                ];
                if (count($news) >= $limit) {
                    break;
                }
            }
        }
        return $news;
    }

    /**
     * ESPN does not expose official UFC rankings through this API, so rankings
     * remain curated in ufc_config.php. Returning an empty array lets the caller
     * fall back to that curated data.
     */
    public function getRankings($weightClass = 'lightweight') {
        return [];
    }

    // ------------------------------------------------------------------ helpers

    private function parseEvents($url, $limit) {
        $json = $this->makeRequest($url);
        $data = $json ? json_decode($json, true) : null;
        $events = [];
        if (!empty($data['events'])) {
            foreach ($data['events'] as $event) {
                $parsed = $this->parseEvent($event);
                if ($parsed) {
                    $events[] = $parsed;
                }
                if (count($events) >= $limit) {
                    break;
                }
            }
        }
        return $events;
    }

    private function parseEvent($event) {
        $competitions = $event['competitions'] ?? [];
        if (empty($competitions)) {
            return null;
        }

        // ESPN lists the main event last; present the card main-event first.
        $fightCard = [];
        foreach (array_reverse($competitions) as $competition) {
            $fight = $this->parseCompetition($competition);
            if ($fight) {
                $fightCard[] = $fight;
            }
        }
        if (empty($fightCard)) {
            return null;
        }

        $main = $fightCard[0];
        $state = $event['status']['type']['state']
            ?? ($competitions[0]['status']['type']['state'] ?? 'pre');
        $status = $state === 'in' ? 'live' : ($state === 'post' ? 'final' : 'upcoming');

        return [
            'id' => $event['id'] ?? null,
            'event_name' => $event['name'] ?? 'UFC Event',
            'name' => $event['name'] ?? 'UFC Event',
            'date' => $event['date'] ?? date('c'),
            'event_date' => $event['date'] ?? date('c'),
            'status' => $status,
            'main_event' => [
                'fighter_a' => $main['fighter_a'],
                'fighter_b' => $main['fighter_b'],
                'weight_class' => $main['weight_class'],
            ],
            'fight_card' => $fightCard,
        ];
    }

    private function parseCompetition($competition) {
        $competitors = $competition['competitors'] ?? [];
        if (count($competitors) < 2) {
            return null;
        }
        return [
            'fighter_a' => $this->fighterName($competitors[0]),
            'fighter_b' => $this->fighterName($competitors[1]),
            'record_a' => $this->fighterRecord($competitors[0]),
            'record_b' => $this->fighterRecord($competitors[1]),
            'weight_class' => $competition['type']['abbreviation']
                ?? ($competition['type']['text'] ?? ''),
        ];
    }

    private function fighterName($competitor) {
        return $competitor['athlete']['displayName']
            ?? ($competitor['athlete']['fullName'] ?? 'TBD');
    }

    private function fighterRecord($competitor) {
        if (!empty($competitor['records'][0]['summary'])) {
            return $competitor['records'][0]['summary'];
        }
        if (!empty($competitor['athlete']['record'])) {
            return $competitor['athlete']['record'];
        }
        return '';
    }

    private function relativeTime($iso) {
        if (!$iso) {
            return 'Recently';
        }
        $ts = strtotime($iso);
        if (!$ts) {
            return 'Recently';
        }
        $diff = time() - $ts;
        if ($diff < 0) {
            return date('M j, Y', $ts);
        }
        if ($diff < 60) {
            return 'Just now';
        }
        if ($diff < 3600) {
            $m = (int)floor($diff / 60);
            return $m . ' minute' . ($m === 1 ? '' : 's') . ' ago';
        }
        if ($diff < 86400) {
            $h = (int)floor($diff / 3600);
            return $h . ' hour' . ($h === 1 ? '' : 's') . ' ago';
        }
        $d = (int)floor($diff / 86400);
        if ($d < 30) {
            return $d . ' day' . ($d === 1 ? '' : 's') . ' ago';
        }
        return date('M j, Y', $ts);
    }

    private function makeRequest($url, $timeout = 8) {
        $cacheFile = sys_get_temp_dir() . '/ufc_espn_' . md5($url) . '.json';

        // Serve a fresh cached copy when available.
        if (is_readable($cacheFile) && (time() - filemtime($cacheFile)) < $this->cacheTtl) {
            $cached = file_get_contents($cacheFile);
            if ($cached !== false && $cached !== '') {
                return $cached;
            }
        }

        $body = $this->httpGet($url, $timeout);
        if ($body !== false && $body !== '') {
            @file_put_contents($cacheFile, $body);
            return $body;
        }

        // Network failed: fall back to a stale cache if we have one.
        if (is_readable($cacheFile)) {
            $stale = file_get_contents($cacheFile);
            if ($stale !== false && $stale !== '') {
                error_log("ESPN request failed for {$url}; serving stale cache");
                return $stale;
            }
        }
        return false;
    }

    private function httpGet($url, $timeout) {
        $userAgent = 'Mozilla/5.0 (compatible; ufc.solutions/1.0)';

        if (function_exists('curl_init')) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
            curl_setopt($ch, CURLOPT_USERAGENT, $userAgent);
            $body = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $err = curl_error($ch);
            curl_close($ch);
            if ($err || $code < 200 || $code >= 300) {
                error_log("ESPN cURL request failed ({$url}): code={$code} err={$err}");
                return false;
            }
            return $body;
        }

        if (ini_get('allow_url_fopen')) {
            $context = stream_context_create([
                'http' => [
                    'timeout' => $timeout,
                    'header' => "User-Agent: {$userAgent}\r\n",
                    'ignore_errors' => true,
                ],
            ]);
            $body = @file_get_contents($url, false, $context);
            if ($body === false) {
                error_log("ESPN file_get_contents request failed: {$url}");
                return false;
            }
            return $body;
        }

        error_log('No HTTP transport available (no cURL and allow_url_fopen disabled)');
        return false;
    }
}
