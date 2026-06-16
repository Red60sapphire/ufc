# StreamHub - Full Streaming Site

A complete streaming platform with live chat, user authentication, and an admin panel for managing streams.

## Features

- **User Authentication**: Sign up, login, and logout functionality
- **Admin Panel**: Upload and manage streaming content with hosting links
- **Live Chat**: Real-time chat system for each stream
- **Video Support**: Supports YouTube, Vimeo, and direct MP4 links
- **Responsive Design**: Modern dark theme that works on all devices
- **Live Status**: Mark streams as live or offline

## Setup Instructions

### 1. Requirements

- PHP 7.0 or higher
- MySQL/MariaDB
- Web server (Apache, Nginx, or PHP built-in server)

### 2. Database Setup

1. Create a MySQL database
2. Import the database schema:

```bash
mysql -u your_username -p your_database < database.sql
```

Or run the SQL commands in `database.sql` manually.

3. Update database credentials in `config.php`:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('DB_NAME', 'streaming_site');
```

### 3. Default Admin Account

The system creates a default admin user:
- **Username**: admin
- **Email**: admin@streaming.com
- **Password**: admin123

**Important**: Change this password after first login!

### 4. Running the Site

#### Using PHP Built-in Server (Development)

```bash
php -S localhost:8000
```

Then visit: http://localhost:8000

#### Using Apache/Nginx (Production)

Place all files in your web server's document root and configure as needed.

## Usage

### For Users

1. Visit the site and click "Sign Up" to create an account
2. Login with your credentials
3. Browse available streams
4. Participate in live chat (requires login)

### For Admins

1. Login with admin credentials
2. Click "Admin Panel" in the navigation
3. Add new streams:
   - Enter stream title
   - Add description (optional)
   - Paste video URL (YouTube, Vimeo, or direct MP4 link)
   - Add thumbnail URL (optional)
   - Mark as live if applicable
4. Manage existing streams (delete, toggle live status)

## Supported Video Sources

- **YouTube**: Paste any YouTube watch URL or short URL
- **Vimeo**: Paste any Vimeo video URL
- **Direct MP4**: Paste direct link to MP4 file

## File Structure

```
ufc/
├── admin.php          # Admin panel for managing streams
├── config.php         # Database configuration and helper functions
├── database.sql       # Database schema
├── get_chat.php       # API endpoint for fetching chat messages
├── index.php          # Main streaming interface
├── login.php          # User login page
├── logout.php         # User logout handler
├── send_chat.php      # API endpoint for sending chat messages
├── signup.php         # User registration page
└── README.md          # This file
```

## Security Notes

- Change the default admin password immediately
- Use HTTPS in production
- Keep PHP and MySQL updated
- Consider implementing rate limiting for chat
- Add CSRF protection for forms in production

## Customization

### Changing the Site Name

Edit the `<h1>` tag in `index.php` and `admin.php` to change "StreamHub" to your desired name.

### Styling

All styles are embedded in the respective PHP files. You can modify the CSS sections to customize the appearance.

### Database Configuration

Update `config.php` to match your database settings.

## Troubleshooting

### Database Connection Error

- Verify MySQL is running
- Check credentials in `config.php`
- Ensure the database exists

### Chat Not Working

- Ensure you're logged in
- Check browser console for JavaScript errors
- Verify `get_chat.php` and `send_chat.php` are accessible

### Video Not Playing

- Verify the video URL is correct and accessible
- Check if the video source is supported (YouTube, Vimeo, MP4)
- Some video sources may have embedding restrictions

## License

This project is provided as-is for educational and personal use.
