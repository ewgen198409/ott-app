<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Range, Origin, X-Requested-With, Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$url = isset($_GET['url']) ? $_GET['url'] : '';
if (!$url || !preg_match('~^https?://~i', $url)) {
    http_response_code(400);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Bad url';
    exit;
}

function proxy_url($url) {
    return 'hls-proxy.php?url=' . rawurlencode($url);
}

function absolute_url($base, $ref) {
    if (preg_match('~^https?://~i', $ref)) return $ref;
    if (strpos($ref, '//') === 0) {
        $scheme = parse_url($base, PHP_URL_SCHEME) ?: 'http';
        return $scheme . ':' . $ref;
    }
    $p = parse_url($base);
    if (!$p || empty($p['scheme']) || empty($p['host'])) return $ref;
    $root = $p['scheme'] . '://' . $p['host'] . (isset($p['port']) ? ':' . $p['port'] : '');
    if (strpos($ref, '/') === 0) return $root . $ref;
    $path = isset($p['path']) ? $p['path'] : '/';
    $dir = preg_replace('~/[^/]*$~', '/', $path);
    $full = $dir . $ref;
    $out = array();
    foreach (explode('/', $full) as $seg) {
        if ($seg === '' || $seg === '.') continue;
        if ($seg === '..') array_pop($out);
        else $out[] = $seg;
    }
    return $root . '/' . implode('/', $out);
}

function rewrite_playlist($body, $baseUrl) {
    $lines = preg_split("/\r\n|\n|\r/", $body);
    foreach ($lines as &$line) {
        $trim = trim($line);
        if ($trim === '') continue;
        if (strpos($trim, '#') === 0) {
            // URI="..." внутри EXT-X-KEY / EXT-X-MAP тоже может указывать на HTTP.
            $line = preg_replace_callback('/URI="([^"]+)"/', function($m) use ($baseUrl) {
                return 'URI="' . proxy_url(absolute_url($baseUrl, $m[1])) . '"';
            }, $line);
            continue;
        }
        $line = proxy_url(absolute_url($baseUrl, $trim));
    }
    return implode("\n", $lines);
}

$headers = array(
    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari',
    'Accept: */*',
);
if (!empty($_SERVER['HTTP_RANGE'])) {
    $headers[] = 'Range: ' . $_SERVER['HTTP_RANGE'];
}

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);
curl_setopt($ch, CURLOPT_ENCODING, '');
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
$body = curl_exec($ch);
$code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
$type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$effectiveUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL) ?: $url;
$err = curl_error($ch);
curl_close($ch);

if ($body === false) {
    http_response_code(502);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Proxy fetch failed: ' . $err;
    exit;
}

if ($code >= 400) http_response_code($code);

$isPlaylist = stripos($type, 'mpegurl') !== false || stripos($type, 'm3u') !== false || preg_match('~\.m3u8?(\?|$)~i', $effectiveUrl) || strpos($body, '#EXTM3U') === 0;

if ($isPlaylist) {
    header('Content-Type: application/vnd.apple.mpegurl; charset=utf-8');
    header('Cache-Control: no-cache, no-store, must-revalidate');
    echo rewrite_playlist($body, $effectiveUrl);
} else {
    header('Content-Type: ' . ($type ?: 'application/octet-stream'));
    header('Cache-Control: no-cache');
    echo $body;
}
