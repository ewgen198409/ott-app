<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$u = isset($_GET['u']) ? trim($_GET['u']) : '';
$s = isset($_GET['s']) ? trim($_GET['s']) : '';
if ($u === '') {
    echo '{"epg_data":[]}';
    exit;
}

function fetchUrl($url) {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        curl_setopt($ch, CURLOPT_ENCODING, '');
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept: application/json,text/plain,*/*'));
        $body = curl_exec($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($body !== false && $code >= 200 && $code < 500) return $body;
    }
    $context = stream_context_create(array('http' => array('timeout' => 20, 'ignore_errors' => true)));
    return @file_get_contents($url, false, $context);
}

function parseXmltvTime($value) {
    if (!$value) return 0;
    if (!preg_match('/^(\d{14})\s*([+\-]\d{4})?$/', trim($value), $m)) return 0;
    $dt = DateTime::createFromFormat('YmdHis O', $m[1] . ' ' . ($m[2] ?: '+0000'));
    if (!$dt) return 0;
    return $dt->getTimestamp();
}

function parseXmltvEpg($xmlRaw, $channelId) {
    if (substr($xmlRaw, 0, 2) === "\x1f\x8b") {
        $decoded = function_exists('gzdecode') ? @gzdecode($xmlRaw) : false;
        if ($decoded !== false) $xmlRaw = $decoded;
    }
    if (!function_exists('simplexml_load_string')) return array();
    libxml_use_internal_errors(true);
    $xml = @simplexml_load_string($xmlRaw);
    if (!$xml) return array();

    $channelId = trim($channelId);
    $channelIdNoPrefix = preg_replace('/^[^:]+:/u', '', $channelId);
    $result = array();
    foreach ($xml->programme as $p) {
        $cid = (string)$p['channel'];
        if ($cid !== $channelId && $cid !== $channelIdNoPrefix) continue;
        $time = parseXmltvTime((string)$p['start']);
        $timeTo = parseXmltvTime((string)$p['stop']);
        if (!$time || !$timeTo) continue;

        $title = trim((string)$p->title);
        $descr = trim((string)$p->desc);
        $icon = isset($p->icon) ? (string)$p->icon['src'] : '';

        $result[] = array(
            'time' => $time,
            'time_to' => $timeTo,
            'name' => $title,
            'descr' => $descr,
            'icon' => $icon,
        );
    }
    usort($result, function($a, $b){
        if ($a['time'] == $b['time']) return 0;
        return ($a['time'] < $b['time']) ? -1 : 1;
    });
    return $result;
}

$encodedKey = rawurlencode($u) . '.json';
$uNoPrefix = preg_replace('/^[^:]+:/u', '', $u);
$encodedNoPrefix = rawurlencode($uNoPrefix) . '.json';
$sources = array();

// Legacy DRM-Play EPG API format: /{urlencoded_key}.json
$sources[] = 'http://epg.drm-play.com/' . $encodedKey;
$sources[] = 'https://epg.drm-play.com/' . $encodedKey;
$sources[] = 'http://epg1.drm-play.com/' . $encodedKey;
$sources[] = 'https://epg1.drm-play.com/' . $encodedKey;
if ($uNoPrefix !== $u) {
    $sources[] = 'http://epg.drm-play.com/' . $encodedNoPrefix;
    $sources[] = 'https://epg.drm-play.com/' . $encodedNoPrefix;
    $sources[] = 'http://epg1.drm-play.com/' . $encodedNoPrefix;
    $sources[] = 'https://epg1.drm-play.com/' . $encodedNoPrefix;
}

// If provider already gives direct URL, try it as-is too.
if (preg_match('#^https?://#i', $u)) {
    $sources[] = $u;
}

foreach ($sources as $source) {
    $res = fetchUrl($source);
    if (!$res) continue;
    $json = json_decode($res, true);
    if (is_array($json) && isset($json['epg_data']) && is_array($json['epg_data'])) {
        echo json_encode($json);
        exit;
    }
}

// XMLTV fallback: source URL from playlist/provider (e.g. edem.xml.gz), id from tvg-id.
$xmlSources = array();
if ($s !== '') {
    $parts = preg_split('/[;,]+/', $s);
    foreach ($parts as $part) {
        $part = trim($part);
        if ($part !== '' && preg_match('#^https?://#i', $part) && preg_match('/\.(xml|xml\.gz)(\?|$)/i', $part)) {
            $xmlSources[] = $part;
        }
    }
}
// Common fallback sources for M3U lists that omit url-tvg.
$xmlSources[] = 'http://epg.it999.ru/edem.xml.gz';
$xmlSources[] = 'http://epg.cdntv.online/full.xml.gz';

$xmlSources = array_values(array_unique($xmlSources));
foreach ($xmlSources as $xmlUrl) {
    $cacheKey = '/tmp/epg_xmltv_' . md5($xmlUrl) . '.cache';
    $xmlRaw = '';
    if (is_file($cacheKey) && (time() - filemtime($cacheKey) < 900)) {
        $xmlRaw = @file_get_contents($cacheKey);
    } else {
        $xmlRaw = fetchUrl($xmlUrl);
        if ($xmlRaw) @file_put_contents($cacheKey, $xmlRaw);
    }
    if (!$xmlRaw) continue;

    $epgData = parseXmltvEpg($xmlRaw, $u);
    if (!empty($epgData)) {
        echo json_encode(array('epg_data' => $epgData));
        exit;
    }
}

echo '{"epg_data":[]}';
