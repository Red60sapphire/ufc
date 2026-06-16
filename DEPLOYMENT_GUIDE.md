# UFC Website Deployment Guide

## Audit Summary

### Fixed Hardcoded Data Sources:
1. **ufc_config.php** - Replaced with live API integration
2. **index.php fallback data** - Replaced with database/API fallbacks
3. **ufc_api.php** - Replaced with new multi-source API fetcher
4. **Missing UFC tables** - Added comprehensive database schema

### New Files Created:
- `ufc_database_schema.sql` - Complete UFC data database schema
- `api/ufc_data_fetcher.php` - Live API integration with caching
- `api/events.php` - Events API endpoint
- `api/fighters.php` - Fighter profiles API endpoint
- `api/rankings.php` - Rankings API endpoint
- `api/fightcard.php` - Fight card API endpoint
- `api/news.php` - News API endpoint

### Modified Files:
- `index.php` - Updated to use live API data instead of hardcoded config
- `database.sql` - Needs to be updated with new UFC schema

## Deployment Instructions

### 1. Database Setup

#### Option A: MySQL (Recommended for InfinityFree)
```sql
-- Import the new UFC schema
mysql -u your_username -p your_database < ufc_database_schema.sql

-- Or run through phpMyAdmin:
-- 1. Open phpMyAdmin
-- 2. Select your database
-- 3. Click "Import" tab
-- 4. Choose ufc_database_schema.sql
-- 5. Click "Go"
```

#### Option B: SQLite (Current Setup)
```bash
# The existing SQLite setup will work, but you need to run the schema
sqlite3 streaming.db < ufc_database_schema.sql
```

### 2. File Upload to InfinityFree

#### Upload Structure:
```
/htdocs
  ├── api/
  │   ├── ufc_data_fetcher.php
  │   ├── events.php
  │   ├── fighters.php
  │   ├── rankings.php
  │   ├── fightcard.php
  │   └── news.php
  ├── admin.php
  ├── config.php
  ├── database.sql
  ├── ufc_database_schema.sql
  ├── index.php
  ├── login.php
  ├── signup.php
  ├── logout.php
  ├── get_chat.php
  ├── send_chat.php
  └── (other existing files)
```

#### Upload Steps:
1. **Access InfinityFree File Manager**
   - Login to InfinityFree control panel
   - Go to "Online File Manager"

2. **Upload Files**
   - Create `api/` directory if it doesn't exist
   - Upload all new API files to `api/` directory
   - Upload updated `index.php`
   - Upload `ufc_database_schema.sql`

3. **Set Permissions**
   - Ensure all PHP files have 644 permissions
   - Ensure directories have 755 permissions

### 3. Database Configuration

#### Update config.php for MySQL:
```php
// Update these lines in config.php
$db_host = 'sqlxxx.infinityfree.com'; // Your MySQL host
$db_name = 'if0_xxxxxx_ufc'; // Your database name
$db_user = 'if0_xxxxxx'; // Your database username
$db_password = 'your_password'; // Your database password
```

#### For SQLite (no changes needed):
```php
// Current SQLite setup will work automatically
$db_file = __DIR__ . '/streaming.db';
```

### 4. Run Database Schema

#### Via PHP Script (Recommended):
Create `setup_database.php`:
```php
<?php
require_once 'config.php';

// Read and execute the schema
$schema = file_get_contents('ufc_database_schema.sql');

// Split by semicolon and execute each statement
$statements = explode(';', $schema);

foreach ($statements as $statement) {
    $statement = trim($statement);
    if (!empty($statement)) {
        try {
            db_query($conn, $statement);
            echo "Executed: " . substr($statement, 0, 50) . "...\n";
        } catch (Exception $e) {
            echo "Error: " . $e->getMessage() . "\n";
        }
    }
}

echo "Database setup complete!\n";
?>
```

Access: `https://yoursite.infinityfreeapp.com/setup_database.php`

#### Via phpMyAdmin:
1. Open phpMyAdmin from InfinityFree control panel
2. Select your database
3. Click "SQL" tab
4. Paste contents of `ufc_database_schema.sql`
5. Click "Go"

### 5. Test API Endpoints

#### Test Events API:
```
https://yoursite.infinityfreeapp.com/api/events.php
```

#### Test Rankings API:
```
https://yoursite.infinityfreeapp.com/api/rankings.php?weight_class=lightweight
```

#### Test News API:
```
https://yoursite.infinityfreeapp.com/api/news.php
```

### 6. Verify Frontend

1. **Access your website**
   ```
   https://yoursite.infinityfreeapp.com
   ```

2. **Check for live data:**
   - Events should show upcoming UFC events
   - Rankings should display current rankings
   - News should show recent MMA news
   - No hardcoded fighter names should appear

3. **Check browser console:**
   - Open Developer Tools (F12)
   - Check Console tab for API errors
   - Check Network tab for API requests

### 7. Troubleshooting

#### API Returns Empty Data:
- Check database tables exist
- Verify API endpoints are accessible
- Check PHP error logs in InfinityFree control panel
- Ensure curl is enabled on server

#### Database Connection Issues:
- Verify database credentials in config.php
- Check database exists in phpMyAdmin
- Test connection with simple PHP script

#### Cache Issues:
- Clear cache: Access `api/ufc_data_fetcher.php` and add cache clearing
- Check `ufc_api_cache` table in database
- Manually delete cache entries if needed

#### Permission Issues:
- Ensure PHP files have 644 permissions
- Ensure directories have 755 permissions
- Check file ownership

### 8. Maintenance

#### Daily Data Refresh:
The system automatically refreshes data every 5 minutes via JavaScript. For manual refresh:

1. **Clear API Cache:**
   ```php
   // Add to admin panel
   $cache = new UFCCache();
   $cache->clear();
   ```

2. **Update Rankings:**
   - Rankings update automatically via API
   - Manual update: Access `api/rankings.php` to trigger refresh

3. **Monitor API Health:**
   - Check error logs regularly
   - Monitor API response times
   - Set up alerts for API failures

### 9. Performance Optimization

#### Enable Caching:
- Already implemented in `ufc_data_fetcher.php`
- Cache duration: 1 hour for events/rankings, 30 minutes for news
- Automatic cache expiration

#### Database Indexing:
- All tables have proper indexes
- Regular database optimization recommended

#### CDN for Static Assets:
- Consider using CDN for images
- Enable gzip compression on server

### 10. Security Considerations

#### API Security:
- Add API key authentication if needed
- Rate limiting for API endpoints
- HTTPS only for production

#### Database Security:
- Use prepared statements (already implemented)
- Regular database backups
- Secure database credentials

#### Input Validation:
- All user inputs are validated
- SQL injection prevention via prepared statements
- XSS prevention via output escaping

## Testing Checklist

- [ ] Database schema imported successfully
- [ ] API endpoints return JSON data
- [ ] Frontend displays live UFC data
- [ ] No hardcoded fighter names visible
- [ ] Cache system working
- [ ] Error handling functioning
- [ ] Auto-refresh working (5-minute intervals)
- [ ] Mobile responsive design maintained
- [ ] All buttons and links functional
- [ ] Chat system still working

## Rollback Plan

If issues occur:

1. **Restore previous index.php:**
   ```bash
   git checkout HEAD~1 index.php
   ```

2. **Restore ufc_config.php:**
   ```bash
   git checkout HEAD~1 ufc_config.php
   ```

3. **Drop new UFC tables:**
   ```sql
   DROP TABLE ufc_events, ufc_fighters, ufc_fight_cards, ufc_rankings, ufc_fighter_stats, ufc_api_cache, ufc_news;
   ```

## Support

For issues:
1. Check InfinityFree error logs
2. Verify database connectivity
3. Test API endpoints individually
4. Check browser console for JavaScript errors
5. Review PHP error logs

## Next Steps

1. **Monitor for 24-48 hours** to ensure stability
2. **Set up automated backups** of database
3. **Implement monitoring** for API health
4. **Add analytics** to track API usage
5. **Consider CDN** for static assets
