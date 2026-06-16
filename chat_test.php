<?php
ob_start();
require_once 'config.php';
ob_end_clean();

if (!isLoggedIn()) {
    http_response_code(401);
    echo '<p style="font-family:monospace;color:red;">Not logged in. Please <a href="login.php">login first</a>.</p>';
    exit;
}

$test_stream_id = isset($_GET['stream']) ? intval($_GET['stream']) : 1;
?>
<!DOCTYPE html>
<html>
<head>
    <title>Chat Send Test</title>
    <style>
        body { font-family: monospace; background: #222; color: #fff; padding: 20px; }
        .test-section { margin: 20px 0; padding: 15px; background: #333; border-radius: 5px; }
        .success { color: #0f0; }
        .error { color: #f00; }
        input, button { padding: 8px; width: 100%; margin: 5px 0; }
        button { background: #d20a0a; color: #fff; border: none; cursor: pointer; }
        #log { background: #1a1a1a; padding: 10px; height: 300px; overflow-y: auto; border: 1px solid #555; margin-top: 10px; }
    </style>
</head>
<body>
    <h1>Chat Send Diagnostic Test</h1>
    <p>Logged in as: <strong><?php echo htmlspecialchars($_SESSION['username']); ?></strong></p>
    
    <div class="test-section">
        <h2>Test Chat Send</h2>
        <form id="testForm">
            <input type="hidden" name="stream_id" value="<?php echo $test_stream_id; ?>">
            <input type="text" id="message" name="message" placeholder="Test message" value="test message">
            <button type="button" onclick="testSend()">Send Test Message</button>
        </form>
    </div>
    
    <div class="test-section">
        <h2>Session Debug Info</h2>
        <pre id="sessionInfo"></pre>
    </div>
    
    <div class="test-section">
        <h2>Request Log</h2>
        <div id="log"></div>
    </div>

    <script>
        const log = document.getElementById('log');
        const sessionInfo = document.getElementById('sessionInfo');
        
        function logMessage(msg, type = 'info') {
            const time = new Date().toLocaleTimeString();
            const className = type === 'error' ? 'error' : (type === 'success' ? 'success' : '');
            const line = `<div class="${className}">[${time}] ${msg}</div>`;
            log.innerHTML += line;
            log.scrollTop = log.scrollHeight;
        }
        
        function getSessionInfo() {
            fetch('debug_session.php', {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' }
            }).then(r => r.json()).then(data => {
                sessionInfo.textContent = JSON.stringify(data, null, 2);
                logMessage('Session info fetched', 'success');
            }).catch(e => {
                logMessage('Failed to fetch session info: ' + e, 'error');
            });
        }
        
        function testSend() {
            const form = document.getElementById('testForm');
            const formData = new FormData(form);
            formData.append('action', 'send_message');
            
            logMessage('Starting test send...');
            logMessage('Request body: stream_id=' + formData.get('stream_id') + ', message=' + formData.get('message'));
            
            fetch('api.php', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' }
            }).then(r => {
                logMessage('Response status: ' + r.status + ' (' + (r.ok ? 'OK' : 'NOT OK') + ')', r.ok ? 'success' : 'error');
                return r.text();
            }).then(text => {
                logMessage('Response body: ' + text.substring(0, 100));
                try {
                    const data = JSON.parse(text);
                    if (data.success) {
                        logMessage('Message sent successfully!', 'success');
                    } else {
                        logMessage('Server error: ' + (data.error || 'unknown'), 'error');
                    }
                } catch (e) {
                    logMessage('Failed to parse response: ' + e, 'error');
                }
            }).catch(e => {
                logMessage('Fetch failed: ' + e, 'error');
            });
        }
        
        // Load session info on page load
        getSessionInfo();
    </script>
</body>
</html>
