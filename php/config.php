<?php
// REXXALLFINANCE SECURITY & CONFIGURATION
define('APP_NAME', 'REXXALLFINANCE');
define('APP_VERSION', 'v4.0 Pro');
define('ADMIN_EMAIL', 'noreply.afif@gmail.com');

// Security Configuration
define('ENCRYPTION_METHOD', 'AES-256-GCM');
define('JWT_SECRET', 'rexxall_secret_key_2026_x89a_enc');

// Response Header Helper
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Encrypted-Key");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
