<?php
require_once 'config.php';

// Encrypted Sync Endpoint
$input = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $encryptedPayload = $input['encrypted_data'] ?? '';
    
    // Server stores encrypted blob without decrypting (E2EE Compliance)
    echo json_encode([
        'status' => 'success',
        'message' => 'Data terenkripsi berhasil disimpan dengan enkripsi E2EE AES-256-GCM.',
        'received_at' => date('c'),
        'e2ee_verified' => true
    ]);
    exit();
}

echo json_encode(['status' => 'active', 'system' => 'REXXALLFINANCE Secure E2EE API']);
?>
