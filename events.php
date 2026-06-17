<?php
require_once 'config.php';

// Curated UFC data
$ufc_config = file_exists('ufc_config.php') ? require 'ufc_config.php' : null;
$ufc_events = (isset($ufc_config['current_event'])) ? [$ufc_config['current_event']] : [];

// Try to get live data from ESPN fetcher
if (file_exists('api/ufc_data_fetcher.php')) {
    try {
        require_once 'api/ufc_data_fetcher.php';
        $fetcher = new UFCDataFetcher();
        $liveEvents = $fetcher->getUpcomingEvents(12);
        if (!empty($liveEvents)) {
            $ufc_events = $liveEvents;
        }
    } catch (\Throwable $e) {
        error_log("UFC live data unavailable: " . $e->getMessage());
    }
}

function last_name($full) {
    $parts = preg_split('/\s+/', trim((string)$full));
    $last = end($parts);
    return $last !== false ? $last : $full;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UFC Events - ufc.solutions</title>
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
            --red: #d20a0a;
            --bg: #0b0b0d;
            --panel: #131316;
            --panel-2: #1a1a1f;
            --line: #2a2a30;
            --muted: #9a9aa2;
        }
        body {
            font-family: 'Roboto', sans-serif;
            background: var(--bg);
            color: #fff;
            min-height: 100vh;
        }
        a { color: inherit; text-decoration: none; }
        img { display: block; }
        .oswald { font-family: 'Oswald', sans-serif; }

        /* Navbar */
        .navbar {
            background: #000; height: 64px; display: flex; align-items: center;
            justify-content: space-between; padding: 0 28px;
            border-bottom: 1px solid var(--line); position: sticky; top: 0; z-index: 50;
        }
        .logo { font-family: 'Oswald', sans-serif; font-size: 30px; font-weight: 700; letter-spacing: 1px; cursor: pointer; }
        .logo span { color: var(--red); }
        .nav-links { display: flex; gap: 26px; align-items: center; }
        .nav-links a { font-family: 'Oswald', sans-serif; font-weight: 500; font-size: 15px; letter-spacing: .5px; text-transform: uppercase; color: #e8e8ea; transition: color .2s; }
        .nav-links a:hover { color: var(--red); }
        .nav-right { display: flex; align-items: center; gap: 14px; }
        .nav-right .icon-btn { background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; }
        .btn {
            font-family: 'Oswald', sans-serif; font-weight: 600; text-transform: uppercase;
            letter-spacing: .5px; border: none; cursor: pointer; border-radius: 4px;
            padding: 9px 18px; font-size: 14px; transition: transform .15s, background .2s;
        }
        .btn:hover { transform: translateY(-1px); }
        .btn-outline { background: transparent; border: 1px solid #3a3a42; color: #fff; }
        .btn-outline:hover { border-color: var(--red); }
        .btn-red { background: var(--red); color: #fff; }
        .btn-red:hover { background: #b00808; }

        .wrap { max-width: 1320px; margin: 0 auto; padding: 22px; }

        /* Page header */
        .page-header {
            margin-bottom: 30px;
        }
        .page-header h1 {
            font-family: 'Oswald', sans-serif;
            font-size: 52px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 12px;
        }
        .page-header p {
            color: var(--muted);
            font-size: 16px;
        }

        /* Events grid */
        .events-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 18px;
        }

        /* Event card */
        .event-card {
            background: var(--panel);
            border: 1px solid var(--line);
            border-radius: 10px;
            overflow: hidden;
            transition: all .2s;
        }
        .event-card:hover {
            border-color: var(--red);
            transform: translateY(-4px);
            box-shadow: 0 12px 30px rgba(210, 10, 10, 0.2);
        }

        .event-card-top {
            background: linear-gradient(135deg, #1d1d23, #0e0e11);
            padding: 22px 18px;
            text-align: center;
            border-bottom: 1px solid var(--line);
        }

        .event-badge {
            display: inline-block;
            background: var(--red);
            color: #fff;
            font-family: 'Oswald', sans-serif;
            font-weight: 700;
            font-size: 13px;
            letter-spacing: 1px;
            padding: 5px 12px;
            border-radius: 3px;
            margin-bottom: 12px;
            text-transform: uppercase;
        }

        .event-name {
            font-family: 'Oswald', sans-serif;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            line-height: 1.1;
            margin-bottom: 8px;
        }

        .event-date {
            color: var(--red);
            font-family: 'Oswald', sans-serif;
            font-weight: 600;
            font-size: 15px;
            letter-spacing: 1px;
        }

        .event-venue {
            color: var(--muted);
            font-size: 12px;
            margin-top: 4px;
            text-transform: uppercase;
            letter-spacing: .5px;
        }

        .event-card-main-bout {
            padding: 18px;
            border-bottom: 1px solid var(--line);
        }

        .event-bout-title {
            font-family: 'Oswald', sans-serif;
            font-weight: 700;
            font-size: 18px;
            text-transform: uppercase;
            margin-bottom: 12px;
            letter-spacing: 1px;
        }

        .event-bout-fighters {
            display: flex;
            align-items: center;
            gap: 12px;
            text-align: center;
        }

        .event-bout-fighter {
            flex: 1;
            font-size: 13px;
            line-height: 1.2;
            font-weight: 600;
        }

        .event-bout-vs {
            color: var(--red);
            font-family: 'Oswald', sans-serif;
            font-weight: 700;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .event-weight-class {
            color: var(--muted);
            font-size: 11px;
            margin-top: 8px;
            letter-spacing: .5px;
            text-transform: uppercase;
        }

        .event-card-footer {
            padding: 14px 18px;
        }

        .event-card-footer a {
            display: inline-block;
            width: 100%;
            text-align: center;
            padding: 10px;
            background: var(--red);
            color: #fff;
            border-radius: 6px;
            font-family: 'Oswald', sans-serif;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: .5px;
            transition: background .2s;
        }

        .event-card-footer a:hover {
            background: #b00808;
        }

        .no-events {
            text-align: center;
            padding: 60px 20px;
            color: var(--muted);
        }

        .no-events h2 {
            font-family: 'Oswald', sans-serif;
            font-size: 28px;
            color: #fff;
            margin-bottom: 8px;
        }

        /* Footer */
        .footer {
            border-top: 1px solid var(--line);
            margin-top: 30px;
            padding: 26px;
            text-align: center;
        }
        .footer-links {
            display: flex;
            gap: 22px;
            justify-content: center;
            margin-bottom: 12px;
            flex-wrap: wrap;
        }
        .footer-links a {
            color: var(--muted);
            font-size: 13px;
        }
        .footer-links a:hover { color: var(--red); }
        .footer-copyright {
            color: #66666e;
            font-size: 12px;
        }

        @media (max-width: 1000px) {
            .page-header h1 { font-size: 40px; }
            .nav-links { display: none; }
            .events-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="logo" onclick="window.location.href='index.php'">UFC<span>.SOLUTIONS</span></div>
        <div class="nav-links">
            <a href="events.php">Events</a>
            <a href="index.php#card">Fighters</a>
            <a href="index.php#rankings-section">Rankings</a>
            <a href="news.php">News</a>
            <a href="index.php#video-section">Video</a>
            <a href="https://discord.gg/Dh2gUUgYTg" target="_blank">Discord</a>
            <?php if (isAdmin()): ?><a href="admin.php">Admin</a><?php endif; ?>
        </div>
        <div class="nav-right">
            <button class="icon-btn" title="Search">&#128269;</button>
            <?php if (isLoggedIn()): ?>
                <span style="color:var(--muted);font-size:13px;">Hi, <?php echo htmlspecialchars($_SESSION['username']); ?></span>
                <a href="logout.php" class="btn btn-outline">Logout</a>
            <?php else: ?>
                <button class="btn btn-outline" onclick="openModal('login')">Sign In</button>
                <button class="btn btn-red" onclick="openModal('signup')">Sign Up</button>
            <?php endif; ?>
        </div>
    </nav>

    <div class="wrap">
        <div class="page-header">
            <h1>Upcoming UFC Events</h1>
            <p>View all scheduled fights and events</p>
        </div>

        <?php if (!empty($ufc_events)): ?>
            <div class="events-grid">
                <?php foreach ($ufc_events as $event): ?>
                    <div class="event-card">
                        <div class="event-card-top">
                            <div class="event-badge"><?php echo htmlspecialchars($event['short_name'] ?? 'UFC'); ?></div>
                            <div class="event-name"><?php echo htmlspecialchars($event['event_name'] ?? 'UFC Event'); ?></div>
                            <div class="event-date"><?php echo strtoupper(date('M j D', strtotime($event['date'] ?? 'now'))); ?></div>
                            <div class="event-venue"><?php echo htmlspecialchars($event['venue'] ?? 'Venue TBA'); ?></div>
                        </div>

                        <?php if (!empty($event['fight_card']) && is_array($event['fight_card'])): ?>
                            <?php $mainBout = $event['fight_card'][0] ?? null; ?>
                            <?php if ($mainBout): ?>
                                <div class="event-card-main-bout">
                                    <div class="event-bout-title">Main Event</div>
                                    <div class="event-bout-fighters">
                                        <div class="event-bout-fighter"><?php echo htmlspecialchars(last_name($mainBout['fighter_a'] ?? 'TBD')); ?></div>
                                        <div class="event-bout-vs">VS</div>
                                        <div class="event-bout-fighter"><?php echo htmlspecialchars(last_name($mainBout['fighter_b'] ?? 'TBD')); ?></div>
                                    </div>
                                    <?php if (!empty($mainBout['weight_class'])): ?>
                                        <div class="event-weight-class"><?php echo htmlspecialchars($mainBout['weight_class']); ?></div>
                                    <?php endif; ?>
                                </div>
                            <?php endif; ?>
                        <?php endif; ?>

                        <div class="event-card-footer">
                            <a href="index.php#card">View Full Card</a>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php else: ?>
            <div class="no-events">
                <h2>No Events Available</h2>
                <p>Check back soon for upcoming UFC events</p>
            </div>
        <?php endif; ?>
    </div>

    <footer class="footer">
        <div class="footer-links">
            <a href="#">Terms of Use</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Contact</a>
            <a href="#">Careers</a>
        </div>
        <div class="footer-copyright">&copy; <?php echo date('Y'); ?> UFC.SOLUTIONS - All Rights Reserved</div>
    </footer>

    <script>
        // Smooth scroll helper
        function smoothTo(e, id) {
            if (e) e.preventDefault();
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }

        // Modal open/close
        function openModal(tab) {
            document.getElementById('authModal').style.display = 'flex';
            switchModal(tab);
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            document.getElementById('authModal').style.display = 'none';
            document.body.style.overflow = '';
        }

        function switchModal(tab) {
            document.getElementById('modalLogin').style.display  = tab === 'login'  ? '' : 'none';
            document.getElementById('modalSignup').style.display = tab === 'signup' ? '' : 'none';
        }

        // Close on backdrop click
        document.getElementById('authModal').addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });

        // Close on Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeModal();
        });

        // Login form submit
        document.getElementById('modalLoginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const err = document.getElementById('modalLoginError');
            err.style.display = 'none';
            fetch('auth_handler.php', {
                method: 'POST',
                headers: {'Content-Type':'application/x-www-form-urlencoded'},
                body: 'action=login&username=' + encodeURIComponent(document.getElementById('loginUsername').value) + '&password=' + encodeURIComponent(document.getElementById('loginPassword').value)
            })
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    location.reload();
                } else {
                    err.textContent = d.error;
                    err.style.display = 'block';
                }
            });
        });

        // Signup form submit
        document.getElementById('modalSignupForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const err = document.getElementById('modalSignupError');
            err.style.display = 'none';
            fetch('auth_handler.php', {
                method: 'POST',
                headers: {'Content-Type':'application/x-www-form-urlencoded'},
                body: 'action=signup&username=' + encodeURIComponent(document.getElementById('signupUsername').value) + '&password=' + encodeURIComponent(document.getElementById('signupPassword').value)
            })
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    location.reload();
                } else {
                    err.textContent = d.error;
                    err.style.display = 'block';
                }
            });
        });
    </script>

    <!-- AUTH MODAL -->
    <div id="authModal" style="display:none;position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.75);backdrop-filter:blur(4px);justify-content:center;align-items:center;">
        <div style="background:#131316;border:1px solid #2a2a30;border-radius:12px;width:100%;max-width:400px;padding:40px;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.6);">
            <button onclick="closeModal()" style="position:absolute;top:14px;right:16px;background:none;border:none;color:#9a9aa2;font-size:22px;cursor:pointer;">✕</button>

            <!-- LOGIN FORM -->
            <div id="modalLogin">
                <div style="font-family:'Oswald',sans-serif;font-size:28px;font-weight:700;text-align:center;">UFC<span style="color:#d20a0a;">.SOLUTIONS</span></div>
                <div style="font-family:'Oswald',sans-serif;text-align:center;color:#9a9aa2;font-size:15px;letter-spacing:2px;text-transform:uppercase;margin:6px 0 24px;">Sign In</div>
                <div id="modalLoginError" style="display:none;background:rgba(210,10,10,.15);color:#ff6b6b;padding:11px;border-radius:6px;margin-bottom:16px;border-left:3px solid #d20a0a;font-size:14px;"></div>
                <form id="modalLoginForm">
                    <div style="margin-bottom:16px;">
                        <label style="display:block;margin-bottom:6px;color:#cfcfd4;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Username</label>
                        <input type="text" id="loginUsername" style="width:100%;padding:13px;background:#1a1a1f;border:1px solid #2a2a30;border-radius:6px;font-size:15px;color:#fff;" required>
                    </div>
                    <div style="margin-bottom:20px;">
                        <label style="display:block;margin-bottom:6px;color:#cfcfd4;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Password</label>
                        <input type="password" id="loginPassword" style="width:100%;padding:13px;background:#1a1a1f;border:1px solid #2a2a30;border-radius:6px;font-size:15px;color:#fff;" required>
                    </div>
                    <button type="submit" style="width:100%;padding:13px;background:#d20a0a;color:#fff;border:none;border-radius:6px;font-size:15px;font-weight:700;cursor:pointer;font-family:'Oswald',sans-serif;letter-spacing:1px;text-transform:uppercase;">Sign In</button>
                </form>
                <div style="text-align:center;margin-top:20px;color:#9a9aa2;font-size:14px;">
                    No account? <a href="#" onclick="switchModal('signup')" style="color:#d20a0a;font-weight:600;">Sign up</a>
                </div>
            </div>

            <!-- SIGNUP FORM -->
            <div id="modalSignup" style="display:none;">
                <div style="font-family:'Oswald',sans-serif;font-size:28px;font-weight:700;text-align:center;">UFC<span style="color:#d20a0a;">.SOLUTIONS</span></div>
                <div style="font-family:'Oswald',sans-serif;text-align:center;color:#9a9aa2;font-size:15px;letter-spacing:2px;text-transform:uppercase;margin:6px 0 24px;">Create Account</div>
                <div id="modalSignupError" style="display:none;background:rgba(210,10,10,.15);color:#ff6b6b;padding:11px;border-radius:6px;margin-bottom:16px;border-left:3px solid #d20a0a;font-size:14px;"></div>
                <form id="modalSignupForm">
                    <div style="margin-bottom:16px;">
                        <label style="display:block;margin-bottom:6px;color:#cfcfd4;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Username</label>
                        <input type="text" id="signupUsername" style="width:100%;padding:13px;background:#1a1a1f;border:1px solid #2a2a30;border-radius:6px;font-size:15px;color:#fff;" required>
                    </div>
                    <div style="margin-bottom:20px;">
                        <label style="display:block;margin-bottom:6px;color:#cfcfd4;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Password</label>
                        <input type="password" id="signupPassword" style="width:100%;padding:13px;background:#1a1a1f;border:1px solid #2a2a30;border-radius:6px;font-size:15px;color:#fff;" required>
                    </div>
                    <button type="submit" style="width:100%;padding:13px;background:#d20a0a;color:#fff;border:none;border-radius:6px;font-size:15px;font-weight:700;cursor:pointer;font-family:'Oswald',sans-serif;letter-spacing:1px;text-transform:uppercase;">Create Account</button>
                </form>
                <div style="text-align:center;margin-top:20px;color:#9a9aa2;font-size:14px;">
                    Have an account? <a href="#" onclick="switchModal('login')" style="color:#d20a0a;font-weight:600;">Sign in</a>
                </div>
            </div>
        </div>
    </div>

</body>
</html>
