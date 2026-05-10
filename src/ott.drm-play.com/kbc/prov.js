version += ' kbc-0722';
p_pref = 'kbc';
parental = /XXX|Взрослые|Для взрослых|Эротика|18+|ХХХ/;
sPlayers=0;
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
            // case 'default':
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
                                if(data)
                                cList.forEach(function(val){
                                        if(data[val]) chanels[val].logo = data[val];
                                });
                        },
                        complete: function(){ callback(); },
                });
        }

    function aSuccess(data){
        try{
            var ccat = '', cepg = {}, clogo = false;
            var arrEXTINF = data.split('#EXTINF:'), l1 = arrEXTINF[0],
                g_utvg = 'kbc'; 
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
                var url_m=url.split('?');
                var ci = murmurhash3_32_gc(url_m[0], 10);
                addChan2cat(cat, ci);
                if(url && (cList.indexOf(ci) == -1)){
                    cList.push(ci);
                    chanels[ci] = {channel_name: cn, category: {'class': catsArray.indexOf(cat)+2, 'name': cat}, drm: drm, rec: rec, time: 0, time_to: 0, url: url, logo: logo, epg: epg, tn: tn, ca: ca, caso: caso, utvg: utvg};
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
    }
  if (v_list==0){loadPlaylist('http://kb-team.club/?do=/plugin&id=iptvkino&m3u&box_mac='+box_mac, aSuccess, callback);}
  else if(v_list==1){loadPlaylist('http://kb-team.club/?do=/plugin&bid=federaltv&m3u&box_mac='+box_mac, aSuccess, callback);}
  else if(v_list==2){loadPlaylist('http://kb-team.club/?do=/plugin&bid=iptvk&m3u&box_mac='+box_mac, aSuccess, callback);}
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

function xml2json1(xml, tab) {
   var X = {
      toObj: function(xml) {
         var o = {};
         if (xml.nodeType==1) {   
            if (xml.attributes.length)  
               for (var i=0; i<xml.attributes.length; i++)
                  o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
            if (xml.firstChild) { 
               var textChild=0, cdataChild=0, hasElementChild=false;
               for (var n=xml.firstChild; n; n=n.nextSibling) {
                  if (n.nodeType==1) hasElementChild = true;
                  else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; 
                  else if (n.nodeType==4) cdataChild++; 
               }
               if (hasElementChild) {
                  if (textChild < 2 && cdataChild < 2) { 
                     X.removeWhite(xml);
                     for (var n=xml.firstChild; n; n=n.nextSibling) {
                        if (n.nodeType == 3)  
                           o["#text"] = X.escape(n.nodeValue);
                        else if (n.nodeType == 4)  
                           o["#cdata"] = X.escape(n.nodeValue);
                        else if (o[n.nodeName]) {  
                           if (o[n.nodeName] instanceof Array)
                              o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                           else
                              o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                        }
                        else  
                           o[n.nodeName] = X.toObj(n);
                     }
                  }
                  else { 
                     if (!xml.attributes.length)
                        o = X.escape(X.innerXml(xml));
                     else
                        o["#text"] = X.escape(X.innerXml(xml));
                  }
               }
               else if (textChild) { 
                  if (!xml.attributes.length)
                     o = X.escape(X.innerXml(xml));
                  else
                     o["#text"] = X.escape(X.innerXml(xml));
               }
               else if (cdataChild) {
                  if (cdataChild > 1)
                     o = X.escape(X.innerXml(xml));
                  else
                     for (var n=xml.firstChild; n; n=n.nextSibling)
                        o = X.escape(n.nodeValue);
               }
            }
            if (!xml.attributes.length && !xml.firstChild) o = null;
         }
         else if (xml.nodeType==9) { 
            o = X.toObj(xml.documentElement);
         }
         return o;
      },
      toJson: function(o, name, ind) {
         var json = name ? ("\""+name+"\"") : "";
         if (o instanceof Array) {
            for (var i=0,n=o.length; i<n; i++)
               o[i] = X.toJson(o[i], "", ind+"\t");
            json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
         }
         else if (o == null)
            json += (name&&":") + "null";
         else if (typeof(o) == "object") {
            var arr = [];
            for (var m in o)
               arr[arr.length] = X.toJson(o[m], m, ind+"\t");
            json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
         }
         else if (typeof(o) == "string")
            json += (name&&":") + "\"" + o.toString() + "\"";
         else
            json += (name&&":") + o.toString();
         return json;
      },
      innerXml: function(node) {
         var s = ""
         if ("innerHTML" in node)
            s = node.innerHTML;
         else {
            var asXml = function(n) {
               var s = "";
               if (n.nodeType == 1) {
                  s += "<" + n.nodeName;
                  for (var i=0; i<n.attributes.length;i++)
                     s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
                  if (n.firstChild) {
                     s += ">";
                     for (var c=n.firstChild; c; c=c.nextSibling)
                        s += asXml(c);
                     s += "</"+n.nodeName+">";
                  }
                  else
                     s += "/>";
               }
               else if (n.nodeType == 3)
                  s += n.nodeValue;
               else if (n.nodeType == 4)
                  s += "<![CDATA[" + n.nodeValue + "]]>";
               return s;
            };
            for (var c=node.firstChild; c; c=c.nextSibling)
               s += asXml(c);
         }
         return s;
      },
      escape: function(txt) {
         return txt.replace(/[\\]/g, "\\\\")
                   .replace(/[\"]/g, '\\"')
                   .replace(/[\n]/g, '\\n')
                   .replace(/[\r]/g, '\\r');
      },
      removeWhite: function(e) {
         e.normalize();
         for (var n = e.firstChild; n; ) {
            if (n.nodeType == 3) { 
               if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { 
                  var nxt = n.nextSibling;
                  e.removeChild(n);
                  n = nxt;
               }
               else
                  n = n.nextSibling;
            }
            else if (n.nodeType == 1) { 
               X.removeWhite(n);
               n = n.nextSibling;
            }
            else                     
               n = n.nextSibling;
         }
         return e;
      }
   };
   if (xml.nodeType == 9) 
      xml = xml.documentElement;
   var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
   return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
}

function getMediaArrayXML(murl, callback){
    mediaUrls[mediaUrls.length-1] = murl;
    if(murl === '') { callback(); return; }
    $('#dialogbox').html('<img src="'+host+'/stbPlayer/buffering.gif" height="40"> '+_('Download! Wait ...')).show();
    if((typeof box_mac !== 'undefined') && box_mac) murl += ((murl.indexOf('?') == -1) ? '?' : '&')+'box_client=ott-play&box_mac='+box_mac;
    $.ajax({
        url: murl, dataType: 'text',
        timeout: 60000,
        success: function(data, textStatus, jqXHR){
            try {
                var i=data.indexOf('<?xml');
                if(i!==-1){ 
                    if(i>0) data = data.substr(i);
                    var jj;
                    try { data = xml2json1(jQuery.parseXML(data), ' '); }
                    catch (e) { alert("Error XML !!!"); return; }
                } else {
                    i=data.indexOf('#EXTM3U');
                    if(i!==-1){ 
                        getMediaArrayEXTM3U(data);
                        return;
                    }
                }
                try { jj = JSON.parse(data); }
                catch (e) { alert("Error JSON !!!"); return; }
                if(jj.items) jj = jj.items;
                mediaName = jj.playlist_name || jj.title || mediaName || '?';
                var cc = jj.channel || jj.channels;
                mediaRecords = !cc ? [] : Array.isArray(cc) ? cc : [cc];
                if(jj.next_page_url) mediaRecords.push( {title: '...', logo_30x30: '', description: '...', playlist_url: jj.next_page_url} );
            } catch (e) {
                console.log(e);
            }
        },
        complete: function(){ $('#dialogbox').hide(); callback(); },
    });
}

function getMediaArrayEXTM3U(data){
    function getAttribute(text, attribute){
    var a = text.split(attribute + '=');
    if(a.length==1 || a[1].length==0) return '';
    if(a[1][0]=='"') return a[1].split('"')[1] || '';
    else return a[1].split(/[ ,]+/)[0] || '';
}

    function item2descr(n, i){
        return '<table>'
            + '<h2><center>'+n+'</center></h2>'
            + (i?'<img id="detal" height="285" src="'+i+'" style="float: left; margin-right: 5px; margin-bottom: 5px; border-width: 0px; border-style: solid;" width="210">':'')
            + '</table>';
    }
    try{
        mediaName = mediaName || '?';
        mediaRecords = [];
        var arrEXTINF = data.split('#EXTINF:');
        arrEXTINF.shift();
        arrEXTINF.forEach(function(val, i, arr){
            var e = val.split('\n');
            var logo = getAttribute(e[0], 'tvg-logo');
            var cn = '??? Нет названия';
            try { cn = e[0].split(',')[1].trim(); } catch(e) {}
            var url = '', n = 1;
            try { url = e[1].trim(); } catch(e) {}
            while (url.indexOf('#') === 0) {
                try { url = e[++n].trim(); } catch(e) { url = ''; }
            }
            if(url)
                mediaRecords.push({title: cn, logo_30x30: logo, description: item2descr(cn, logo), stream_url: url});
        });
    } catch(e) {
        alert("Error M3U !!!");
    }
}

var getMediaArray = function (murl, callback){
    if(murl === '') murl = 'http://89.163.215.125';
    getMediaArrayXML(murl, callback);
}
var dind, edTlist = ['IPTV #1', 'IPTV #2', 'IPTV #3'];
//sNoSmall=parseInt(stbGetItem('sNoSmall')) || 1; 

var vdList =[
'Выбор встроенного плейлиста IPTV #1',
'Выбор встроенного плейлиста IPTV #2',
'Выбор встроенного плейлиста IPTV #3'
]; 
var v_list=parseInt(providerGetItem('v_list')) || 0;
function _m3u2popup(){
    var b,c;
    b='Загрузить: '+ edTlist[v_list];c='Загрузить встроенный плейлист: '+ edTlist[v_list];
    popupArray[popupActions.indexOf(doEditList)] = 'Выбор встроенного плейлиста: '+ edTlist[v_list];
    popupArray[popupActions.indexOf(loadVlist)] = b;
}
function duneAddSettings(ind){
   try{ if(typeof(AndroidInterface.getMac)==='function'){
        if (AndroidInterface.getMac()=='02:00:00:00:00:00'){
                stb.getMacAddress = function (){
                        var m = stbGetItem('mac') ||'';
                        if(!m){
                        m = '44:5c:e9:XX:XX:XX'.replace(/X/g, function(){ return "0123456789abcdef".charAt(Math.floor(Math.random() * 16)) });
                        stbSetItem('mac', m);
                        }
                        return m;
                };
        }
   } } catch (e){}

    box_mac = stb.getMacAddress().replace(/:/g, '');
    p_pref = 'kbc'+v_list;
    if(isNaN(parseInt(providerGetItem('sShowArchive')))) {providerSetItem('sShowArchive', 1);}
    if(isNaN(parseInt(stbGetItem('sNoSmall')))) {stbSetItem('sNoSmall', 1);sNoSmall=1;}
    box_mac = box_mac.toLowerCase();
    popupArray.splice(ind, 1,  '','','Данные доступа KBC (Kinoboom)');
    popupDetail.splice(ind, 1, 'Встроенные плейлисты','Загрузить встроенный плейлист: '+ edTlist[v_list],'Данные доступа KBC (Kinoboom)');
    popupActions.splice(ind, 1, doEditList,loadVlist, doUserInfo);
    _m3u2popup();
}
function doEditList(){
    if(++v_list==edTlist.length) v_list = 0;
    _m3u2popup();
    popupList(doEditList); 
}
function loadVlist(){
    p_pref = 'kbc';
    providerSetItem("v_list", v_list);
    p_pref = 'kbc'+v_list;
    providerSetItem("v_list", v_list);
    if(isNaN(parseInt(providerGetItem('sShowArchive')))) providerSetItem('sShowArchive', 1);
    _m3u2popup();
    loadChannels();//primaryIndex=0; 
}
function doUserInfo(){
    saveCPD();
    listCaption.innerHTML = 'Данные доступа KBC (Kinoboom)';
    aboutKeyHandler = function (code){ restoreCPD(); $('#listAbout').hide(); return true; };
    $('#listAbout').html('Загрузка. Подождите...').show();
    $.ajax({
        url: 'http://kb-team.club/info.php?box_client=ott-play&box_mac='+box_mac,
        dataType: 'json', timeout: 5000,
        success: function(data){
            if(data&&data.title == 'KinoBoom User Info'&&data.channels){
                var s='';
                data.channels.forEach(function(val){
                    if(val.title!='Speedtest')s+=val.title+'<br/>';
                });
                $('#listAbout').html(s);
            } else $('#listAbout').html('Ошибка получения данных пользователя!!!');
        },
        error: function(jqXHR, textStatus, errorThrown){ $('#listAbout').html( 'ОШИБКА!<br/><br/>jqXHR:'+JSON.stringify(jqXHR)+ '<br/>textStatus: '+textStatus+ '<br/>errorThrown: '+errorThrown ); }
    });
}