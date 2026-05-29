version += ' antifriz-0927';
var key, mpeg;
p_pref = 'az';
parental = /Взрослые/;
mp4 = false; // for dunehd

function _getParams(){
    key = providerGetItem('key') || '';
    mpeg = parseInt(providerGetItem('mpeg')) || 0;
}
function getProviderParams(){
    _getParams();
    $("#key").val(key);
    if(key.length != 8) alert('Для доступа необходимо ввести ключ! (Ключ доступа для приложений - 8 символов)');
    return key.length == 8;
}
function setProviderParams(){
    providerSetItem("key", $("#key").val().trim());
    var changed = key != providerGetItem("key");
    _getParams();
    if(key.length != 8) alert('Для доступа необходимо ввести ключ! (Ключ доступа для приложений - 8 символов)');
    return key.length == 8;
}

function getChannelPicon(ch_id){ return chanels[ch_id].logo || ''; }

// var nativelUrlStyle = navigator.userAgent.indexOf("Tizen") === -1;
// function getChannelUrl(ch_id){
//     // return 'http://' + chanels[ch_id].server + ':80/' + ch_id + (mpeg==1? '/mpegts':'/index.m3u8') + '?token=' + chanels[ch_id].token;
//     if(mpeg==1)
//         return 'http://' + chanels[ch_id].server + ':80/' + ch_id + '/mpegts?token=' + chanels[ch_id].token;
//     else
//         // return 'http://' + chanels[ch_id].server + ':80/' + ch_id + '/video.m3u8?token=' + chanels[ch_id].token;
//         if(nativelUrlStyle)
//             return 'http://'+chanels[ch_id].server+':80/'+ch_id+'/index.m3u8?token='+chanels[ch_id].token;
//         else
//             return chanels[ch_id].url;
// }
// function getArchiveUrl(ch_id, time, time_to){
//     if(time_to < time) time_to = Date.now()/1000;
//     if(browserName() == 'dune'){
//         if(mpeg==1)
//             return 'http://' + chanels[ch_id].server + ':80/' + ch_id + '/timeshift_abs/' + Math.floor(time) + '?token=' + chanels[ch_id].token;
//         else
//             // return 'http://' + chanels[ch_id].server + ':80/' + ch_id + '/timeshift_abs-' + Math.floor(time) + '.m3u8?token=' + chanels[ch_id].token;
//             if(nativelUrlStyle){
//                 time_to += 7200;
//                 return 'http://'+chanels[ch_id].server+':80/'+ch_id+'/index-' + Math.floor(time) + '-' + Math.floor(time_to-time) + '.m3u8?token='+chanels[ch_id].token;
//             } else
//                 return getChannelUrl(ch_id) + '?utc=' + Math.floor(time) + '&lutc=' + Math.floor(Date.now()/1000);
//     } else {
//         return 'http://' + chanels[ch_id].server + ':80/' + ch_id + '/video-' + Math.floor(time) + '-' + Math.floor(time_to-time) + '.m3u8?token=' + chanels[ch_id].token;
//     }
// }
function getServ(ch_id){ return chanels[ch_id].server; }
var __hls = navigator.userAgent.indexOf("Tizen")===-1? 0:2;
function getChannelUrl(ch_id){
    var _m = mpeg||__hls;
    return 'http://'+getServ(ch_id)+':80/'+ch_id+'/'+['index.m3u8','mpegts','video.m3u8','mono.m3u8','index.mpd'][_m]+'?token='+chanels[ch_id].token;
}
function getArchiveUrl(ch_id, time, time_to){
    var _m = mpeg||__hls;
    if(time_to < time) time_to = Date.now()/1000+600;
    // if((_m==1)||(time_to > Date.now()/1000)) // мпег или текущая передача
    if((_m==1)||(time > Date.now()/1000-600)) // мпег или последние 10 минут
        return 'http://'+getServ(ch_id)+':80/'+ch_id+'/'+['timeshift_abs-', 'timeshift_abs/', 'video-timeshift_abs-', 'mono-timeshift_abs-', 'timeshift_abs-'][_m]+Math.floor(time)+['.m3u8', '', '.m3u8', '.m3u8', '.mpd'][_m]+'?token='+chanels[ch_id].token;
    else {
        if(browserName() == 'dune') time_to = Math.floor(time_to) + 7200;
        return 'http://'+getServ(ch_id)+':80/'+ch_id+'/'+['index-', '', 'video-', 'mono-', 'index-'][_m]+Math.floor(time)+'-'+ Math.floor(time_to-time)+['.m3u8', '', '.m3u8', '.m3u8', '.mpd'][_m]+'?token='+chanels[ch_id].token;
    }
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
function getAttribute(text, attribute){
    var a = text.split(attribute + '=');
    if(a.length==1 || a[1].length==0) return '';
    if(a[1][0]=='"') return a[1].split('"')[1] || '';
    else return a[1].split(/[ ,]+/)[0] || '';
}

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
                    console.log( 'channels : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown );
                    alert( _('Failed to load channel list!') );
                    callback();
                },
            });
        },
    });
}

    function aSuccess(data){
        try{
            // console.log(data);
            // var cats = [];
            var arrEXTINF = data.split('#EXTINF:');
            arrEXTINF.shift();
            // alert(arrEXTINF.length);
            arrEXTINF.forEach(function(val, i, arr){
                // console.log(val);
                var e = val.split(','),
                    cat = getAttribute(e[0], 'group-title'),
                    rec = parseInt(getAttribute(e[0], 'tvg-rec')) || 0,
                    epg = getAttribute(e[0], 'tvg-id'),
                    logo = getAttribute(e[0], 'tvg-logo').replace('https:', 'http:'),
                    e1 = e[1].split("\n"),
                    cn = e1[0],
                    url = e1[2],
                    ci = url.split("/")[5].split(".")[0],
                    serv = url.split("/")[2].split(":")[0],
                    token = url.split("/")[4];
                // epg = epg || (cnames[cn] ? cnames[cn].id : '');
                // logo = logo || (cnames[cn] ? cnames[cn].logo : '');
                // logo = logo.replace('https:', 'http:');
                // if(cats.indexOf(cat) == -1)
                    // cats.push(cat);
                // console.log('cat: ' + cat + ', epg: ' + epg + ', cn: ' + cn + ', url: ' + url + ', ci: ' + ci);
                addChan2cat(cat, ci);
                cList.push(ci);
                chanels[ci] = {channel_name: cn, category: {'class': catsArray.indexOf(cat)+2, 'name': cat}, rec: rec*24, time: 0, time_to: 0, epg_id: epg, logo: logo, url: url, server: serv, token: token};
            });
        } catch(e) {
            console.log( "Exception: name " + e.name + ", message " + e.message + ", typeof " + typeof e );
            alert( _('Failed to load channel list!') );
        }
        callback();
    }
    loadPlaylist('http://af-play.com/playlist/'+key+'.m3u8', aSuccess, callback);

    // var cnames = {};
    // $.ajax({
    //     url: 'http://epg.ott-play.com/antifriz/logolink.json', timeout: 10000,
    //     // dataType: "json",
    //     success: function(data){ if(data !== null) cnames = data; },
    //     error: function(jqXHR, textStatus, errorThrown){ console.log( 'epglink : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
    //     complete: function(jqXHR, textStatus){
            // www = 'http://antifriz.tv/playlist/'+key+'.m3u8';
            // $.ajax({
            //     url: www, dataType: 'text', timeout: 30000, success: aSuccess,
            //     error: function(){
            //         $.ajax({
            //             url: host+'/m3u/cp.php', data: {url: '@'+www}, method: 'post', dataType: 'text', timeout: 30000, success: aSuccess,
            //             error: function(jqXHR, textStatus, errorThrown){
            //                 console.log( 'channels : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown );
            //                 alert( _('Failed to load channel list!') );
            //                 callback();
            //             },
            //         });
            //     },
            // });
    //     },
    // });
}
// function getEPGurl(ch_id){ return 'antifriz/epg/' + chanels[ch_id].epg_id }
// < !--#include virtual="/js/getepgchanel._js"-->
// < !--#include virtual="/js/getepgchanelcur._js"-->
if(typeof sNextCount == 'undefined') sNextCount = -1;
function _getEPGchanel(ch_id, callback, all){
    var d = [];
    $.ajax({
        url: 'http://protected-api.com/epg/'+(all?chanels[ch_id].epg_id+'?date=':'current/'+chanels[ch_id].epg_id+'?num='+(sNextCount+1)), dataType: 'json', timeout: 30000, cache: false,
        // url: 'http://api.iptvx.tv/epg/'+chanels[ch_id].epg_id+(all?'?date=':''), dataType: 'json', timeout: 30000,
        success: function(data){ if(data) data.forEach(function(val){ d.push( {time: val.time, time_to: val.time_to, name: val.name, descr: val.descr} ); }); },
        // error: function(jqXHR, textStatus, errorThrown){ console.log( 'epg : ' + ch_id + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
        complete: function(){ callback(ch_id, d); },
    });
}
function getEPGchanel(ch_id, callback){ _getEPGchanel(ch_id, callback, true) }
function getEPGchanelCur(ch_id, callback){ _getEPGchanel(ch_id, callback, false) }


/*	This work is licensed under Creative Commons GNU LGPL License.

	License: http://creativecommons.org/licenses/LGPL/2.1/
   Version: 0.9
	Author:  Stefan Goessner/2006
	Web:     http://goessner.net/
*/
function xml2json1(xml, tab) {
   var X = {
      toObj: function(xml) {
         var o = {};
         if (xml.nodeType==1) {   // element node ..
            if (xml.attributes.length)   // element with attributes  ..
               for (var i=0; i<xml.attributes.length; i++)
                  o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
            if (xml.firstChild) { // element has child nodes ..
               var textChild=0, cdataChild=0, hasElementChild=false;
               for (var n=xml.firstChild; n; n=n.nextSibling) {
                  if (n.nodeType==1) hasElementChild = true;
                  else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                  else if (n.nodeType==4) cdataChild++; // cdata section node
               }
               if (hasElementChild) {
                  if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                     X.removeWhite(xml);
                     for (var n=xml.firstChild; n; n=n.nextSibling) {
                        if (n.nodeType == 3)  // text node
                           o["#text"] = X.escape(n.nodeValue);
                        else if (n.nodeType == 4)  // cdata node
                           o["#cdata"] = X.escape(n.nodeValue);
                        else if (o[n.nodeName]) {  // multiple occurence of element ..
                           if (o[n.nodeName] instanceof Array)
                              o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                           else
                              o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                        }
                        else  // first occurence of element..
                           o[n.nodeName] = X.toObj(n);
                     }
                  }
                  else { // mixed content
                     if (!xml.attributes.length)
                        o = X.escape(X.innerXml(xml));
                     else
                        o["#text"] = X.escape(X.innerXml(xml));
                  }
               }
               else if (textChild) { // pure text
                  if (!xml.attributes.length)
                     o = X.escape(X.innerXml(xml));
                  else
                     o["#text"] = X.escape(X.innerXml(xml));
               }
               else if (cdataChild) { // cdata
                  if (cdataChild > 1)
                     o = X.escape(X.innerXml(xml));
                  else
                     for (var n=xml.firstChild; n; n=n.nextSibling)
                        // o["#cdata"] = X.escape(n.nodeValue);
                        o = X.escape(n.nodeValue);
               }
            }
            if (!xml.attributes.length && !xml.firstChild) o = null;
         }
         else if (xml.nodeType==9) { // document.node
            o = X.toObj(xml.documentElement);
         }
         // else
            // alert("unhandled node type: " + xml.nodeType);
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
            if (n.nodeType == 3) {  // text node
               if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                  var nxt = n.nextSibling;
                  e.removeChild(n);
                  n = nxt;
               }
               else
                  n = n.nextSibling;
            }
            else if (n.nodeType == 1) {  // element node
               X.removeWhite(n);
               n = n.nextSibling;
            }
            else                      // any other node
               n = n.nextSibling;
         }
         return e;
      }
   };
   if (xml.nodeType == 9) // document node
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
            // console.log(data);
            // console.log(textStatus, jqXHR);
            try {
                var i=data.indexOf('<?xml');
                if(i!==-1){ // XML
                    if(i>0) data = data.substr(i);
                    var jj;
                    try { data = xml2json1(jQuery.parseXML(data), ' '); }
                    catch (e) { alert("Error XML !!!"); return; }
                } else {
                    i=data.indexOf('#EXTM3U');
                    if(i!==-1){ // m3u
                        getMediaArrayEXTM3U(data);
                        // console.log(mediaRecords);
                        return;
                    }
                }
                try { jj = JSON.parse(data); }
                catch (e) { alert("Error JSON !!!"); return; }
                console.log(jj);
                if(jj.items) jj = jj.items;
                mediaName = jj.playlist_name || jj.title || mediaName || '?';
                var cc = jj.channel || jj.channels;
                mediaRecords = !cc ? [] : Array.isArray(cc) ? cc : [cc];
                if(jj.next_page_url) mediaRecords.push( {title: '...', logo_30x30: '', description: '...', playlist_url: jj.next_page_url} );
            } catch (e) {
                console.log(e);
            }
        },
        // error: function(jqXHR, textStatus, errorThrown){ console.log( 'medias : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus:'+textStatus+ ' ,errorThrown: '+errorThrown ); },
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

function getMediaArray(murl, callback){
    if(murl === '') murl = 'http://media.af-play.com/'+key+'.xml';
    getMediaArrayXML(murl, callback);
}

var cbTarr = ['HLS', 'MPEGTS'];
function duneAddSettings(ind){
    if(isNaN(parseInt(providerGetItem('sShowArchive')))) providerSetItem('sShowArchive', 1);
    _getParams();
    popupArray.splice(ind, 0, 'Ключ доступа', 'Тип потоков: '+cbTarr[mpeg]);
    popupDetail.splice(ind, 0, 'Ввод ключа доступа для приложений', 'Выберите тип потоков: HLS или MPEGTS' );
    popupActions.splice(ind, 0, doEditKey, doEditType);
}

function doEditKey(){
    editCaption = 'Редактирование ключа доступа для приложений';
    editvar = key;
    setEdit = function(){
        if(key == editvar) return;
        if(editvar.length != 8){
            alert('Для доступа необходимо ввести ключ! (Ключ доступа для приложений - 8 символов)');
            showEditKey([0,1,2]);
            return;
        }
        providerSetItem('key', editvar);
        restart();
    };
    showEditKey([0,1,2]);
}
function doEditType(){
    if(++mpeg==2) mpeg = 0;
    providerSetItem("mpeg", mpeg);
    popupArray[popupActions.indexOf(doEditType)] = 'Тип потоков: '+cbTarr[mpeg];
    // showPage();
    popupList(doEditType);
    if(!playType) playChannel(catIndex, primaryIndex);
    else if(playType>0) playArchive(playType + playTime);
}
