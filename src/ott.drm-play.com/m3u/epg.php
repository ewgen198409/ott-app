<?php
@ini_set('memory_limit', '128M');
@set_time_limit(30);
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

$resultCacheKey = '/tmp/epg_result_v2_' . md5($u . '|' . $s) . '.json';
if (is_file($resultCacheKey) && (time() - filemtime($resultCacheKey) < 86400)) {
    $cached = @file_get_contents($resultCacheKey);
    if ($cached !== false && $cached !== '') {
        echo $cached;
        exit;
    }
}

function outputEpg($data) {
    global $resultCacheKey;
    $json = json_encode(array('epg_data' => $data));
    if ($json === false) $json = '{"epg_data":[]}';
    @file_put_contents($resultCacheKey, $json);
    echo $json;
    exit;
}

function fetchUrl($url) {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
        curl_setopt($ch, CURLOPT_TIMEOUT, 12);
        curl_setopt($ch, CURLOPT_ENCODING, '');
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept: application/json,text/plain,*/*'));
        $body = curl_exec($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($body !== false && $code >= 200 && $code < 500) return $body;
    }
    $context = stream_context_create(array('http' => array('timeout' => 12, 'ignore_errors' => true)));
    return @file_get_contents($url, false, $context);
}

function normalizeChannelIds($channelId) {
    $ids = array();
    $channelId = trim($channelId);
    if ($channelId !== '') $ids[$channelId] = true;
    $noPrefix = preg_replace('/^[^:]+:/u', '', $channelId);
    if ($noPrefix !== '') $ids[$noPrefix] = true;
    return $ids;
}

function parseXmltvTime($value) {
    if (!$value) return 0;
    if (!preg_match('/^(\d{14})\s*([+\-]\d{4})?$/', trim($value), $m)) return 0;
    $dt = DateTime::createFromFormat('YmdHis O', $m[1] . ' ' . ($m[2] ?: '+0000'));
    if (!$dt) return 0;
    return $dt->getTimestamp();
}

function parseXmltvEpg($xmlRaw, $channelId) {
    $ids = normalizeChannelIds($channelId);
    $result = array();

    if (class_exists('XMLReader')) {
        $reader = new XMLReader();
        if (@$reader->XML($xmlRaw, null, LIBXML_NONET | LIBXML_COMPACT)) {
            while ($reader->read()) {
                if ($reader->nodeType !== XMLReader::ELEMENT || $reader->name !== 'programme') continue;
                $cid = (string)$reader->getAttribute('channel');
                if (!isset($ids[$cid])) continue;
                $start = (string)$reader->getAttribute('start');
                $stop = (string)$reader->getAttribute('stop');
                $time = parseXmltvTime($start);
                $timeTo = parseXmltvTime($stop);
                if (!$time || !$timeTo) continue;

                $title = '';
                $descr = '';
                $icon = '';
                $node = @simplexml_import_dom($reader->expand());
                if ($node) {
                    $title = trim((string)$node->title);
                    $descr = trim((string)$node->desc);
                    $icon = isset($node->icon) ? (string)$node->icon['src'] : '';
                }
                $result[] = array('time' => $time, 'time_to' => $timeTo, 'name' => $title, 'descr' => $descr, 'icon' => $icon);
            }
            $reader->close();
        }
    } elseif (function_exists('simplexml_load_string')) {
        libxml_use_internal_errors(true);
        $xml = @simplexml_load_string($xmlRaw);
        if (!$xml) return array();
        foreach ($xml->programme as $p) {
            $cid = (string)$p['channel'];
            if (!isset($ids[$cid])) continue;
            $time = parseXmltvTime((string)$p['start']);
            $timeTo = parseXmltvTime((string)$p['stop']);
            if (!$time || !$timeTo) continue;
            $result[] = array(
                'time' => $time,
                'time_to' => $timeTo,
                'name' => trim((string)$p->title),
                'descr' => trim((string)$p->desc),
                'icon' => isset($p->icon) ? (string)$p->icon['src'] : '',
            );
        }
    }
    usort($result, function($a, $b){
        if ($a['time'] == $b['time']) return 0;
        return ($a['time'] < $b['time']) ? -1 : 1;
    });
    return $result;
}

function parseProgrammeBlock($openTag, $xmlBlock) {
    $item = array('channel' => '', 'start' => '', 'stop' => '', 'title' => '', 'descr' => '', 'icon' => '');
    if (preg_match('/\schannel="([^"]+)"/u', $openTag, $m)) $item['channel'] = html_entity_decode($m[1], ENT_QUOTES | ENT_XML1, 'UTF-8');
    if (preg_match('/\sstart="([^"]+)"/u', $openTag, $m)) $item['start'] = $m[1];
    if (preg_match('/\sstop="([^"]+)"/u', $openTag, $m)) $item['stop'] = $m[1];
    if (preg_match('/<title(?:\s[^>]*)?>(.*?)<\/title>/us', $xmlBlock, $m)) $item['title'] = trim(html_entity_decode(strip_tags($m[1]), ENT_QUOTES | ENT_XML1, 'UTF-8'));
    if (preg_match('/<desc(?:\s[^>]*)?>(.*?)<\/desc>/us', $xmlBlock, $m)) $item['descr'] = trim(html_entity_decode(strip_tags($m[1]), ENT_QUOTES | ENT_XML1, 'UTF-8'));
    if (preg_match('/<icon[^>]*\ssrc="([^"]+)"/u', $xmlBlock, $m)) $item['icon'] = html_entity_decode($m[1], ENT_QUOTES | ENT_XML1, 'UTF-8');
    return $item;
}

function parseXmltvEpgFile($file, $channelId) {
    $ids = normalizeChannelIds($channelId);
    $isGz = (substr($file, -3) === '.gzcache') || preg_match('/\.gz(\.|$)/i', $file);
    $fh = $isGz ? @gzopen($file, 'rb') : @fopen($file, 'rb');
    if (!$fh) return array();

    $result = array();
    $inProgramme = false;
    $openTag = '';
    $block = '';
    $matchedChannel = false;
    $readLine = function() use ($fh, $isGz) {
        return $isGz ? gzgets($fh, 262144) : fgets($fh, 262144);
    };

    while (($line = $readLine()) !== false) {
        if (!$inProgramme) {
            $pos = strpos($line, '<programme');
            if ($pos === false) continue;
            $inProgramme = true;
            $openTag = $line;
            $block = $line;
            $matchedChannel = false;
            if (preg_match('/\schannel="([^"]+)"/u', $openTag, $m) && isset($ids[html_entity_decode($m[1], ENT_QUOTES | ENT_XML1, 'UTF-8')])) {
                $matchedChannel = true;
            }
            if (strpos($line, '</programme>') === false) continue;
        } else {
            if ($matchedChannel) $block .= $line;
            else $block = '';
        }

        if ($inProgramme && strpos($line, '</programme>') !== false) {
            if ($matchedChannel) {
                $p = parseProgrammeBlock($openTag, $block);
                $time = parseXmltvTime($p['start']);
                $timeTo = parseXmltvTime($p['stop']);
                if ($time && $timeTo) {
                    $result[] = array('time' => $time, 'time_to' => $timeTo, 'name' => $p['title'], 'descr' => $p['descr'], 'icon' => $p['icon']);
                }
            }
            $inProgramme = false;
            $openTag = '';
            $block = '';
            $matchedChannel = false;
        }
    }

    $isGz ? gzclose($fh) : fclose($fh);
    usort($result, function($a, $b){
        if ($a['time'] == $b['time']) return 0;
        return ($a['time'] < $b['time']) ? -1 : 1;
    });
    return $result;
}

function normalizeXmlSourceUrl($url) {
    // У epg.cdntv.online HTTPS-сертификат периодически просрочен, HTTP при этом доступен и отдаёт CORS.
    return preg_replace('#^https://epg\.cdntv\.online/#i', 'http://epg.cdntv.online/', $url);
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
        @file_put_contents($resultCacheKey, json_encode($json));
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
            $xmlSources[] = normalizeXmlSourceUrl($part);
        }
    }
}
// Common fallback sources for M3U lists that omit url-tvg.
$xmlSources[] = 'https://epg.it999.ru/edem.xml.gz';
$xmlSources[] = 'http://epg.cdntv.online/full.xml.gz';

$xmlSources = array_values(array_unique($xmlSources));
foreach ($xmlSources as $xmlUrl) {
    $cacheKey = '/tmp/epg_xmltv_' . md5($xmlUrl) . (preg_match('/\.gz(\?|$)/i', $xmlUrl) ? '.gzcache' : '.cache');
    $xmlRaw = '';
    if (is_file($cacheKey) && (time() - filemtime($cacheKey) < 86400)) {
        $xmlRaw = '';
    } else {
        $xmlRaw = fetchUrl($xmlUrl);
        if ($xmlRaw) @file_put_contents($cacheKey, $xmlRaw);
    }

    if (!is_file($cacheKey) || filesize($cacheKey) === 0) continue;
    $epgData = parseXmltvEpgFile($cacheKey, $u);
    if (empty($epgData) && $xmlRaw) $epgData = parseXmltvEpg($xmlRaw, $u);
    if (!empty($epgData)) {
        outputEpg($epgData);
    }
}

outputEpg(array());
