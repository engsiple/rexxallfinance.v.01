<?php
require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action === 'google_sso') {
    // Verify Google ID Token (Simulated Server Token Validation)
    $token = isset($input['token']) ? $input['token'] : '';
    if(!empty($token)) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Otentikasi Google berhasil',
            'user' => [
                'username' => $input['email'] ?? 'afif_rasyid',
                'name' => $input['name'] ?? 'Afif Nur Rasyid',
                'email' => $input['email'] ?? 'afif.rasyid@example.com',
                'is_verified' => true,
                'e2ee_enabled' => true
            ],
            'token' => bin2hex(random_bytes(16))
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Token Google tidak valid']);
    }
    exit();
}

if ($action === 'login') {
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';

    if (!empty($username) && !empty($password)) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Login berhasil!',
            'user' => [
                'username' => $username,
                'name' => 'Afif Nur Rasyid',
                'email' => 'afif.rasyid@example.com',
                'e2ee_enabled' => true
            ],
            'auth_key' => hash('sha256', $username . $password)
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Username/Password harus diisi.']);
    }
    exit();
}

echo json_encode(['status' => 'error', 'message' => 'Aksi tidak dikenali']);
?>
