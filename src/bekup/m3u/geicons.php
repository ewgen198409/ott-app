<?php
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

$context = stream_context_create(array(
    'http' => array(
        'method' => 'POST',
        'header' => "Content-Type: application/x-www-form-urlencoded\r\n" .
            "Content-Length: " . strlen($postData) . "\r\n",
        'content' => $postData,
        'timeout' => 30,
        'ignore_errors' => true,
    ),
));

$result = @file_get_contents('http://epg1.drm-play.com/m3u/geicons.php', false, $context);

if ($result === false) {
    http_response_code(502);
    echo '{}';
    exit;
}

echo $result;
