<?php
require_once 'config.php';

// Curated UFC data
$ufc_config = file_exists('ufc_config.php') ? require 'ufc_config.php' : null;
$ufc_news = $ufc_config['news'] ?? [];

// Try to get live data from ESPN fetcher
if (file_exists('api/ufc_data_fetcher.php')) {
    try {
        require_once 'api/ufc_data_fetcher.php';
        $fetcher = new UFCDataFetcher();
        $liveNews = $fetcher->getLatestNews(20);
        if (!empty($liveNews)) {
            $ufc_news = $liveNews;
        }
    } catch (\Throwable $e) {
        error_log("UFC live data unavailable: " . $e->getMessage());
    }
}

$silhouette = 'https://a.espncdn.com/combiner/i?img=/i/headshots/nophoto.png&w=350&h=254';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UFC News - ufc.solutions</title>
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

        /* News grid */
        .news-grid {
            display: grid;
            grid-template-columns: 1.4fr 1fr;
            gap: 18px;
        }

        /* Lead story */
        .news-lead-card {
            background: var(--panel);
            border: 1px solid var(--line);
            border-radius: 10px;
            overflow: hidden;
            position: relative;
            height: 360px;
            cursor: pointer;
            transition: all .2s;
        }
        .news-lead-card:hover {
            border-color: var(--red);
            box-shadow: 0 12px 30px rgba(210, 10, 10, 0.2);
        }
        .news-lead-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .news-lead-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 24px;
            background: linear-gradient(transparent, rgba(0,0,0,.95));
        }
        .news-lead-title {
            font-family: 'Oswald', sans-serif;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 1px;
            line-height: 1.15;
            margin-bottom: 8px;
        }
        .news-lead-meta {
            color: var(--muted);
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* News list */
        .news-list {
            display: flex;
            flex-direction: column;
            gap: 14px;
        }

        .news-item {
            background: var(--panel);
            border: 1px solid var(--line);
            border-radius: 10px;
            padding: 16px;
            display: flex;
            gap: 12px;
            cursor: pointer;
            transition: all .2s;
        }
        .news-item:hover {
            border-color: var(--red);
            transform: translateX(4px);
        }

        .news-item-img {
            width: 100px;
            height: 70px;
            object-fit: cover;
            border-radius: 6px;
            flex: 0 0 100px;
        }

        .news-item-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .news-item-title {
            font-family: 'Oswald', sans-serif;
            font-size: 14px;
            font-weight: 600;
            line-height: 1.15;
        }

        .news-item-meta {
            color: var(--muted);
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: .5px;
        }

        .no-news {
            text-align: center;
            padding: 60px 20px;
            color: var(--muted);
        }

        .no-news h2 {
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
            .news-grid { grid-template-columns: 1fr; }
            .news-lead-card { height: 300px; }
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
            <h1>UFC News</h1>
            <p>Latest updates from the world of mixed martial arts</p>
        </div>

        <?php if (!empty($ufc_news)): ?>
            <div class="news-grid">
                <?php
                $leadStory = $ufc_news[0];
                $otherStories = array_slice($ufc_news, 1, 10);
                ?>

                <!-- Lead story -->
                <a href="<?php echo htmlspecialchars($leadStory['link'] ?? '#'); ?>" target="_blank" class="news-lead-card">
                    <img src="<?php echo htmlspecialchars($leadStory['image'] ?: $silhouette); ?>" onerror="this.src='<?php echo $silhouette; ?>'" alt="" class="news-lead-img">
                    <div class="news-lead-overlay">
                        <div class="news-lead-title"><?php echo htmlspecialchars($leadStory['title']); ?></div>
                        <div class="news-lead-meta"><?php echo htmlspecialchars($leadStory['date'] ?? ''); ?></div>
                    </div>
                </a>

                <!-- Other stories -->
                <div class="news-list">
                    <?php foreach ($otherStories as $story): ?>
                        <a href="<?php echo htmlspecialchars($story['link'] ?? '#'); ?>" target="_blank" class="news-item">
                            <?php if (!empty($story['image'])): ?>
                                <img src="<?php echo htmlspecialchars($story['image']); ?>" onerror="this.style.display='none'" alt="" class="news-item-img">
                            <?php else: ?>
                                <div class="news-item-img" style="background:#000;"></div>
                            <?php endif; ?>
                            <div class="news-item-content">
                                <div class="news-item-title"><?php echo htmlspecialchars($story['title']); ?></div>
                                <div class="news-item-meta"><?php echo htmlspecialchars($story['date'] ?? ''); ?></div>
                            </div>
                        </a>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php else: ?>
            <div class="no-news">
                <h2>No News Available</h2>
                <p>Check back soon for the latest UFC news</p>
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
