<?php
require_once 'config.php';

// Live Market Financial Data API Feed
$data = [
    'updated_at' => date('Y-m-d H:i:s'),
    'market_summary' => [
        'ihsg' => ['value' => '7.845,20', 'change' => '+0.68%', 'status' => 'up'],
        'gold_antam' => ['value' => 'Rp 1.540.000 / gr', 'change' => '+Rp 8.000', 'status' => 'up'],
        'usd_idr' => ['value' => 'Rp 15.680,00', 'change' => '-0.15%', 'status' => 'down'],
        'btc_usd' => ['value' => '$68.450,00', 'change' => '+1.85%', 'status' => 'up']
    ],
    'news_feed' => [
        [
            'id' => 1,
            'title' => 'Emas Antam Naik ke Rp 1,54 Juta/Gram, Jadi Pilihan Utama Tabungan Dana Darurat',
            'category' => 'Komoditas',
            'source' => 'Market Indonesia News',
            'time' => '10 menit lalu',
            'img' => 'assets/images/gold_bars.jpg'
        ],
        [
            'id' => 2,
            'title' => 'IHSG Menguat ke 7.845 Didorong Aksi Beli Saham Perbankan & Infrastruktur',
            'category' => 'Pasar Saham',
            'source' => 'Finance Daily',
            'time' => '30 menit lalu',
            'img' => 'assets/images/stock_market.jpg'
        ],
        [
            'id' => 3,
            'title' => 'Bank Indonesia Menjaga Suku Bunga BI-Rate Tetap Stabil untuk Menjaga Kinerja Rupiah',
            'category' => 'Moneter',
            'source' => 'Ekonomi Nasional',
            'time' => '1 jam lalu',
            'img' => 'assets/images/bank_central.jpg'
        ]
    ]
];

echo json_encode($data);
?>
