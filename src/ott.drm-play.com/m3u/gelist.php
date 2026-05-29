<?php
@set_time_limit(12);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$postData = http_build_query(array(
    'list' => isset($_POST['list']) ? $_POST['list'] : '',
    'a' => isset($_POST['a']) ? $_POST['a'] : '',
));

function requestRemote($url, $postData) {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_ENCODING, '');
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36');
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
        curl_setopt($ch, CURLOPT_TIMEOUT, 6);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/x-www-form-urlencoded',
            'Content-Length: ' . strlen($postData),
            'Accept: application/json,text/plain,*/*',
            'Origin: http://ott.drm-play.com',
            'Referer: http://ott.drm-play.com/',
        ));
        $body = curl_exec($ch);
        $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($body !== false && $httpCode >= 200 && $httpCode < 500) {
            return $body;
        }
    }

    $context = stream_context_create(array(
        'http' => array(
            'method' => 'POST',
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n" .
                "Content-Length: " . strlen($postData) . "\r\n",
            'content' => $postData,
            'timeout' => 6,
            'ignore_errors' => true,
        ),
    ));
    return @file_get_contents($url, false, $context);
}

$sources = array(
    'http://epg.drm-play.com/m3u/gelist.php',
    'https://epg.drm-play.com/m3u/gelist.php',
    'http://epg1.drm-play.com/m3u/gelist.php',
    'https://epg1.drm-play.com/m3u/gelist.php',
);

foreach ($sources as $source) {
    $result = requestRemote($source, $postData);
    if ($result === false || $result === '') {
        continue;
    }
    $decoded = json_decode($result, true);
    if (is_array($decoded)) {
        echo json_encode($decoded);
        exit;
    }
}

// Keep response successful to avoid breaking UI flow when upstream EPG is unavailable.
echo '{}';
