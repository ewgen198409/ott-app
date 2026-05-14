<?php
$cacheFile = __DIR__ . '/epg.xml';
$tmpGz = __DIR__ . '/epg.xml.gz';
$cacheTime = 21600;


if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheTime)) {
    header('Content-Type: application/xml');
    readfile($cacheFile);
    exit;
}


$url = "http://epg.cdntv.online/lite.xml.gz";

// --- скачиваем в файл (НЕ в память!) ---
$fp = fopen($tmpGz, 'w');

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_FILE, $fp);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);
curl_exec($ch);
curl_close($ch);

fclose($fp);

// --- распаковка потоком ---
$gz = gzopen($tmpGz, 'rb');
$out = fopen($cacheFile, 'w');

if ($gz && $out) {
    while (!gzeof($gz)) {
        fwrite($out, gzread($gz, 4096));
    }
    gzclose($gz);
    fclose($out);

    unlink($tmpGz); // удаляем архив

    header('Content-Type: application/xml');
    readfile($cacheFile);
    exit;
}

// fallback
if (file_exists($cacheFile)) {
    header('Content-Type: application/xml');
    readfile($cacheFile);
} else {
    echo 'EPG load failed';
}
?>
