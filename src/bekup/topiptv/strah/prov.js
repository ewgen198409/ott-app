version += ' strah-0323';
p_pref = 'strah';var key, provName = 'StrahTV';
parental = /XXX|Взрослые|Для взрослых|Эротика|18+|ХХХ/;

function _getParams(){
    key = providerGetItem('key') || '1234';
}
function getProviderParams(){
    _getParams();
    $("#key").val(key);
    if(key.length < 2) alert('Для доступа необходимо ввести ключь (токен)!');
    return key;
}
function setProviderParams(){
    providerSetItem("key", decodeURIComponent($("#key").val().trim()));
    var changed = key != providerGetItem("key");
    _getParams();
    if(key.length < 2) alert('Для доступа необходимо ввести ключь (токен)!');
    return changed;
}

function getChannelPicon(ch_id){ return chanels[ch_id].logo; }
function getChannelUrl(ch_id){ return chanels[ch_id].url; }
function getArchiveUrl(ch_id, time, time_to){
    function insPar(u){
        return u.replace(/\$\{start\}/g, Math.floor(time))
            .replace(/\$\{end\}/g, Math.floor(time_to))
            .replace(/\$\{timestamp\}/g, Math.floor(Date.now()/1000))
            .replace(/\$\{offset\}/g, Math.floor(Date.now()/1000)-Math.floor(time))
            .replace(/\$\{duration\}/g, Math.floor(time_to-time));
    }
    if(time_to < time) time_to = Date.now()/1000;
    if(browserName() == 'dune') time_to += 7200;
    if(chanels[ch_id].ca.indexOf('flussonic')!=-1){
        var spl = '', ts_hls = 0, url = chanels[ch_id].url;
        if(url.indexOf('mpegts')!=-1){ spl = 'mpegts'; ts_hls = 0; }
        else if(url.indexOf('video.m3u8')!=-1){ spl = 'video.m3u8'; ts_hls = 1; }
        else if(url.indexOf('index.m3u8')!=-1){ spl = 'index.m3u8'; ts_hls = 2; }
        else if(url.indexOf('index.mpd')!=-1){ spl = 'index.mpd'; ts_hls = 3; }
        if(spl){
            var u = url.split(spl);
            if(!ts_hls||(time > Date.now()/1000-600)) // мпег или последние 10 минут
                return u[0] + ['timeshift_abs/', 'timeshift_abs_video-', 'timeshift_abs-', 'timeshift_abs-'][ts_hls] + Math.floor(time) + ['', '.m3u8', '.m3u8', '.mdp'][ts_hls] + u[1];
            else
                return u[0] + ['', 'video-', 'index-', 'archive-'][ts_hls] + Math.floor(time) + '-' + Math.floor(time_to-time) + ['', '.m3u8', '.m3u8', '.mdp'][ts_hls] + u[1];
        }
    }
    if(chanels[ch_id].caso)
        switch (chanels[ch_id].ca){
            case 'append': return insPar(chanels[ch_id].url+chanels[ch_id].caso);
            default:
                return insPar(chanels[ch_id].caso);
        }
    var c = (chanels[ch_id].url.indexOf('?') == -1) ? '?' : '&';
    return chanels[ch_id].url + c + 'utc=' + Math.floor(time) + '&lutc=' + Math.floor(Date.now()/1000);
}

if(typeof catsArray == 'undefined') var catsArray = [];
function addChan2cat(cat, ci){
    if(!cat || !ci) return;
    if(!cats[cat]){
        catsArray.push(cat);
        cats[cat] = [];
    }
    cats[cat].push(ci);
}
function getChanelsArray(callback){

        function murmurhash3_32_gc(key, seed) {
        var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

        remainder = key.length & 3;
        bytes = key.length - remainder;
        h1 = seed;
        c1 = 0xcc9e2d51;
        c2 = 0x1b873593;
        i = 0;

        while (i < bytes) {
                k1 =
                  ((key.charCodeAt(i) & 0xff)) |
                  ((key.charCodeAt(++i) & 0xff) << 8) |
                  ((key.charCodeAt(++i) & 0xff) << 16) |
                  ((key.charCodeAt(++i) & 0xff) << 24);
                ++i;

                k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
                k1 = (k1 << 15) | (k1 >>> 17);
                k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

                h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
                h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
                h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
        }

        k1 = 0;

        switch (remainder) {
                case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
                case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
                case 1: k1 ^= (key.charCodeAt(i) & 0xff);

                k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
                k1 = (k1 << 15) | (k1 >>> 17);
                k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
                h1 ^= k1;
        }

        h1 ^= key.length;

        h1 ^= h1 >>> 16;
        h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
        h1 ^= h1 >>> 13;
        h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
        h1 ^= h1 >>> 16;

        return h1 >>> 0;
        }

        function getAttribute(text, attribute){
                var a = text.split(attribute + '=');
                if(a.length==1 || a[1].length==0) return '';
                if(a[1][0]=='"') return a[1].split('"')[1] || '';
                else return a[1].split(/[ ,]+/)[0] || '';
        }

        function getAint(text, attribute){ return parseInt(getAttribute(text, attribute)) || 0; }

        function loadPlaylist(url, success, callback){
                if(typeof(launch_id)=='undefined') launch_id = '#launch';
                if(!url){ callback(); return; }
                var cpurl = url;
                if(typeof(stbInterceptRequest) === 'function'){
                        stbInterceptRequest(url);
                        url += (url.indexOf('?')==-1 ? '?' : '&') + 'url=' + encodeURIComponent(url);
                }
                $.ajax({
                        url: url, dataType: 'text', timeout: 30000, success: success,
                        error: function(){
                                $(launch_id).append('p...');
                                $.ajax({
                                        url: host+'/m3u/cp.php', data: {url: '@'+cpurl}, method: 'post', dataType: 'text', timeout: 30000, success: success,
                                        error: function(jqXHR, textStatus, errorThrown){
                                                alert( _('Failed to load channel list!') );
                                                callback();
                                        },
                                });
                        },
                });
        }

        function getEpgList(cepg, callback){
                if(!cList.length){ callback(); return; }
                $(launch_id).append(_('epgs...'));
                $.ajax({
                        url: scheme+'epg.drm-play.com/m3u/gelist.php', data: {list: JSON.stringify(cepg)},
                        method: 'post', timeout: 120000,
                        success: function(data){
                                if(data) 
                                cList.forEach(function(val){
                                        if(data[val]) chanels[val].epg_url = data[val];
                                });
                        },
                        complete: function(){ callback(); },
                });
        }

        function getLogoList(cepg, callback){
                if(!cList.length){ callback(); return; }
                $(launch_id).append(_('logos...'));
                $.ajax({
                        url: scheme+'epg.drm-play.com/m3u/geicons.php', data: {list: JSON.stringify(cepg)},
                        method: 'post', timeout: 120000,
                        success: function(data){
                                // console.log(data);
                                if(data) //for (var val in data) { chanels[val].epg_url = data[val]; };
                                cList.forEach(function(val){
                                        if(data[val]) chanels[val].logo = data[val];
                                });
                                // console.log(chanels);
                        },
                        // error: function(jqXHR, textStatus, errorThrown){ console.log( 'epg : ' + ch_id + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
                        complete: function(){ callback(); },
                });
        }

    function aSuccess(data){
        try{
             //console.log(data);
            var ccat = '', cepg = {}, clogo = false;
            var arrEXTINF = data.split('#EXTINF:'), l1 = arrEXTINF[0],
                g_utvg = getAttribute(l1, 'url-tvg') || getAttribute(l1, 'x-tvg-url'),
                gRec = l1.indexOf('catchup-days')>-1 ? getAint(l1, 'catchup-days')*24 : l1.indexOf('timeshift')>-1 ? getAint(l1, 'timeshift')*24 : l1.indexOf('tvg-rec')>-1 ? getAint(l1, 'tvg-rec')*24:'',
                gC = getAttribute(l1, 'catchup') || getAttribute(l1, 'catchup-type'), gCS = getAttribute(l1, 'catchup-source');
            arrEXTINF.shift();
            arrEXTINF.forEach(function(val, i, arr){
                var e = val.split('\n'),
                    drm = getAttribute(e[0], 'drm'),
                    cat = getAttribute(e[0], 'group-title'),
                    epg = getAttribute(e[0], 'tvg-id'),
                    tn = getAttribute(e[0], 'tvg-name'),
                    logo = getAttribute(e[0], 'tvg-logo'),
                    logo = logo.indexOf('//') === 0 || logo.toLowerCase().indexOf('http') === 0 ? logo : '',
                    rec = e[0].indexOf('catchup-days')>-1 ? getAint(e[0], 'catchup-days')*24 : e[0].indexOf('timeshift')>-1 ? getAint(e[0], 'timeshift')*24 : e[0].indexOf('tvg-rec')>-1 ? getAint(e[0], 'tvg-rec')*24 : gRec,
                    ca = getAttribute(e[0], 'catchup') || getAttribute(e[0], 'catchup-type') || gC,
                    caso = getAttribute(e[0], 'catchup-source') || gCS,
                    utvg = getAttribute(e[0], 'url-tvg') || g_utvg,
                    cn = _('??? No channel name'),
                    url = '',
                    n = 1;
                try {
                    var i = e[0].indexOf(',');
                    cn = i>0?e[0].substr(i+1).trim():cn;
                } catch(e) {}
                try { url = e[1].trim(); } catch(e) {}
                while (url.indexOf('#') === 0) {
                    if(url.indexOf('#EXTGRP:') != -1)
                        if(!cat) cat = url.split('#EXTGRP:')[1].trim();
                    try { url = e[++n].trim(); } catch(e) { url = ''; }
                }
                if(cat == '') cat = ccat;
                else ccat = cat;
                var ci = murmurhash3_32_gc(url, 10);
                addChan2cat(cat, ci);
                if(url && (cList.indexOf(ci) == -1)){
                    cList.push(ci);
                    chanels[ci] = {channel_name: cn, category: {'class': catsArray.indexOf(cat)+2, 'name': cat}, rec: rec, time: 0, time_to: 0, url: url, logo: logo, epg: epg, tn: tn, ca: ca, caso: caso, utvg: utvg};
                    cepg[ci] = (epg && utvg) ? {n: tn || cn, e: epg, u: utvg} : (utvg) ? {n: cn, u: utvg || cn, u: utvg}:{n: tn || cn};
                    if(!logo){
                        if(!clogo) clogo = {}; var tn_l=tn+"|"+utvg,cn_l=cn+"|"+utvg
                        clogo[ci] = (utvg) ? cn_l||tn_l : tn || cn ;
                    }
                }
            });
        } catch(e) {
            console.log( "Exception: name " + e.name + ", message " + e.message + ", typeof " + typeof e );
            alert( _('Failed to load channel list!') );
        }
        callback();
        getEpgList(cepg, function(){ chanels[curList[primaryIndex]].time_request = 0; updateChanelInfo(curList[primaryIndex]); });
        if(clogo) getLogoList(clogo, function(){ updateChanelInfo(curList[primaryIndex]); });
    } //           
    loadPlaylist('http://nlist.pw/pl/'+key+'.m3u', aSuccess, callback);
}
function getEPGurl(ch_id){ return chanels[ch_id].epg_url }
_epgDomen = scheme+'epg.drm-play.com/';
function getEPGchanel(ch_id, callback){
    var d = null, epg_url = getEPGurl(ch_id);
    if(!epg_url){ callback(ch_id, d); return; }
    $.ajax({ url: _epgDomen+encodeURIComponent(epg_url)+'.json', dataType: 'json', timeout: 10000,
        success: function(data){ if(data !== null) d = data.epg_data; },
        complete: function(){ callback(ch_id, d); },
    });
}

function _xc2popup(){
    var p = provName+': ';
    popupArray[popupActions.indexOf(edit_key)] = p+_('Key')+': '+key;
}
function duneAddSettings(ind){
    _getParams();
    var r = _(' (after changing, restart player)');
    popupArray.splice(ind, 0, '', provName+': '+_('Load playlist'));
    popupDetail.splice(ind, 0, _('Enter key')+r);
    popupActions.splice(ind, 0, edit_key, loadChannels);
    _xc2popup();
}
function edit_key(){
    editCaption = _('Enter key')+' '+provName;
    editvar = key;
    setEdit = function(){
        if(key == editvar.trim()) return;
        if(editvar.length < 4){ alertXT(); showEditKey([0,1,2]); return; }
        key = editvar.trim();
        providerSetItem('key', key);
        _xc2popup();
        popupList(edit_key);
    };
    showEditKey([0,1,2]);
}