version += ' edem-0218';
var edkey, edlist, vpurl, edurl, edsp, provName = 'Edem.tv / iLook.tv';
p_pref = 'ed';
parental = /взрослые|XXX/i;

function _getParams(){
    edkey = providerGetItem("key") || '';
    edlist = parseInt(providerGetItem("list")) || 0;
    vpurl = providerGetItem("vpurl") || '';
    edurl = providerGetItem("edurl") || '';
    edsp = parseInt(providerGetItem("edsp")) || 0;
}
function getProviderParams(){
    _getParams();
    $("#edkey").val(edkey);
    $("#edlist").val(edlist);
    if(!edkey) alert('Для доступа необходимо ввести ключ!');
    return edkey;
}
function setProviderParams(){
    providerSetItem("key", decodeURIComponent($("#edkey").val().trim()));
    providerSetItem("list", $("#edlist").val().trim());
    var changed = edlist != providerGetItem("list");
    _getParams();
    if(edkey.length < 8) alert('Для доступа необходимо ввести ключ!');
    return changed;
}

function getChannelPicon(ch_id){ return chanels[ch_id].logo; }
function getChannelUrl(ch_id){
    if (edsp==1) {return chanels[ch_id].url;}
    else {return 'http://drmplay.rostelekom.xyz/iptv/'+(edkey?edkey:'1')+'/'+ch_id+'/index.m3u8';}
//    else {return 'http://hyqzethr.megatv.fun/iptv/'+(edkey?edkey:'1')+'/'+ch_id+'/index.m3u8';}
 
}
function getArchiveUrl(ch_id, time, time_to){ return getChannelUrl(ch_id)+'?utc='+Math.floor(time)+'&lutc='+Math.floor(Date.now()/1000); }

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

        remainder = key.length & 3; // key.length % 4
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
                                                //console.log( 'channels : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown );
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
                                if(data) //for (var val in data) { chanels[val].epg_url = data[val]; };
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
            if(data) //for (var val in data) { chanels[val].epg_url = data[val]; };
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
                g_utvg = getAttribute(l1, 'url-tvg') || getAttribute(l1, 'x-tvg-url'),
                gRec = l1.indexOf('catchup-days')>-1 ? getAint(l1, 'catchup-days')*24 : l1.indexOf('timeshift')>-1 ? getAint(l1, 'timeshift')*24 : l1.indexOf('tvg-rec')>-1 ? getAint(l1, 'tvg-rec')*24:'0',
                gC = getAttribute(l1, 'catchup') || getAttribute(l1, 'catchup-type'), gCS = getAttribute(l1, 'catchup-source');
            arrEXTINF.shift();
            arrEXTINF.forEach(function(val, i, arr){
                var e = val.split('\n'), lutvg ='edem',
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
               if(edsp==1){ var ci = murmurhash3_32_gc(url, 10);}
               else{var ci = e[1].split('/')[5];}
               addChan2cat(cat, ci);
                if(url && (cList.indexOf(ci) == -1)){
                    cList.push(ci);
                    chanels[ci] = {channel_name: cn, category: {'class': catsArray.indexOf(cat)+2, 'name': cat}, rec: rec, time: 0, time_to: 0, url: url, logo: logo, epg: epg, tn: tn, ca: ca, caso: caso, utvg: utvg};
                    cepg[ci] = (epg && utvg) ? {n: tn || cn, e: epg, u: utvg} : (utvg) ? {n: cn, u: utvg || cn, u: utvg}:{n: tn || cn};
                    if(!logo){
                        if(!clogo) clogo = {}; var tn_l=tn+"|"+lutvg,cn_l=cn+"|"+lutvg
                        clogo[ci] = (lutvg) ? cn_l||tn_l : tn || cn ;
                    }
                }
            });
                    if(edsp==0&&!edkey){
                    doEditData();
                    infoBox('<br>Необходимо ввести ключ доступа!<br><br>'+btnDiv(keys.ENTER, strENTER, 'Close'));
                } else if (edsp==1&&!edurl){
                                        doEditData();
                                        infoBox('<br>Необходимо ввести ссылку на плейлист!<br><br>'+btnDiv(keys.ENTER, strENTER, 'Close'));
                                }   
        } catch(e) {
            console.log( "Exception: name " + e.name + ", message " + e.message + ", typeof " + typeof e );
            alert( _('Failed to load channel list!') );
        }
        callback();
        if(edsp==1) {
        getEpgList(cepg, function(){ chanels[curList[primaryIndex]].time_request = 0; updateChanelInfo(curList[primaryIndex]); });
        if(clogo) getLogoList(clogo, function(){ updateChanelInfo(curList[primaryIndex]); });
        }
    }
    if(edsp==1) {var u = edurl;} 
    else {var u = scheme+'epg.drm-play.com/edem/edem_epg_ico'+(edlist?edlist:'')+'.m3u8';}
    
    loadPlaylist(u, aSuccess, callback);
}
function getEPGurl(ch_id){ 
   if (edsp==1){return chanels[ch_id].epg_url}
   else {return (edlist==1?'iptv-e2-soveni':'edem') + '/epg/' + chanels[ch_id].epg}
 }
_epgDomen = scheme+'epg.drm-play.com/';
function getEPGchanel(ch_id, callback){
    var d = null, epg_url = getEPGurl(ch_id);
    if(!epg_url){ callback(ch_id, d); return; }
    $.ajax({ url: _epgDomen+encodeURIComponent(epg_url)+'.json', dataType: 'json', timeout: 10000,
//        headers: { 'DRM' : epg_url },  
        success: function(data){ if(data !== null) d = data.epg_data; },
        complete: function(){ callback(ch_id, d); },
    });
}
function item2descr(item, parent){
    function it(val, title){ return val ? '<b>'+_(title)+': </b>'+val+'<br>' : ''; }
    function im(val){ return val ? '<img height="285" width="210" src="'+val+'" style="float: left; margin-right: 5px; margin-bottom: 5px; border-width: 0px; border-style: solid;" onerror="this.width=0;this.height=0;">' : ''; }
    function id(val){ return val ? '<p><hr><b>'+_('Description')+': </b>'+val+'</p>' : ''; }
console.log(parent);
    if(parent){
        if(parent.title) item.title = parent.title+' - '+item.title;
        if(!item.img&&!item.imglr) item.img = parent.img||parent.imglr;
        if(!item.year) item.year = parent.year;
        if(!item.duration) item.duration = parent.duration;
        if(!item.agelimit) item.agelimit = parent.agelimit;
        if(!item.description) item.description = parent.description;
    }
    return '<table><center><b><span style="font-size: 140%;">'+item.title+'</span></b></center><p>'
        + im(item.img||item.imglr)
        + it(item.year, 'Release date')
        + (item.duration?it(Math.round(item.duration)+' '+_('min'), 'Duration'):'')
        + it(item.agelimit, 'Age')
        + id(item.description)+'</table>';
}
var __curKey = 0;
function _selV(sh){
    event.stopPropagation();
    if(__curKey==sh) dialogBoxKeyHandler(keys.ENTER);
    $('#k'+__curKey).css({"background-color": '', "color": ''});
    __curKey = sh;
    $('#k'+__curKey).css({"background-color": curColorB, "color": curColor});
}
function selectVariant(z, variants, callback){
    var sk = '';
    function setKey(sh){
        $('#k'+__curKey).css({"background-color": '', "color": ''});
        __curKey = sh;
        if(__curKey<0) __curKey = variants.length-1; else if(__curKey>variants.length-1) __curKey = 0;
        $('#k'+__curKey).css({"background-color": curColorB, "color": curColor});
    }
    variants.forEach(function(item, i){
        sk += '<div id="k'+i+'" style="display:inline-block;padding:6px 16px;" onclick="_selV('+i+');">'+item+'</div>&nbsp;&nbsp;';
    });
    $('#dialogbox').html(_('Quality')+':<br/><br/>'+sk).show();
    setKey(z);
    dialogBoxKeyHandler = function (code){
        switch (code) {
            case keys.EXIT:
            case keys.RETURN: $('#dialogbox').hide(); callback(-1); return;
            case keys.LEFT: setKey(__curKey-1); return;
            case keys.RIGHT: setKey(__curKey+1); return;
            case keys.UP: setKey(1); return;
            case keys.DOWN: setKey(0); return;
            case keys.ENTER: $('#dialogbox').hide(); callback(__curKey); return;
        }
    }
}

playMedia = edem_playMedia;
function edem_playMedia(med){
    var imed = medHistory.findIndex(function(val){ return (val.title == med.title); });
    if(imed==0 && playType==-100000000000) return;

    showPage();
    $('#dialogbox').html('<img src="'+host+'/stbPlayer/buffering.gif" height="40"> '+_('Download! Wait ...')).show();
    var z = 0, av=[], i=0, variants;
    var params = {key:_vpkey,app:"ott-play"};
    for (key in med.request) { params[key] = med.request[key]; }
    $.ajax({
        url: _vpurl, type: 'post', //contentType: 'application/json',
        data: JSON.stringify(params),
        success: function(data){
            if(data !== null)
                if(data.type == 'error') alert(data.description);
                else{
                    med.stream_url = data.url;
                    variants = data.variants;
                }
        },
        error: function(jqXHR){ alert('Error: '+JSON.stringify(jqXHR)); },
        async: false
    });
    $('#dialogbox').hide();
    if(variants) for (key in variants) {
        // console.log(key, variants[key]);
        av.push(key);
        if(variants[key]==med.stream_url) z=i;
        i++;
    };
    function _play(){ closeList(); if(imed!=-1) medHistory[imed].stream_url = med.stream_url; _playMedia(med); };
    if(av.length<2) _play()
    else selectVariant(z, av, function(val){
        if(val==-1) return;
        med.stream_url = variants[av[val]];
        _play();
    });
}
function createMedia(val, parent){
    switch (val.type) {
        case 'stream':
            return {title: val.title, logo_30x30: val.imglr||val.img, description: item2descr(val, parent), stream_url: val.url, request: val.request};
        case 'category':
        case 'multistream':
            return {title: val.title, logo_30x30: val.imglr||val.img, description: item2descr(val, parent), playlist_url: {mediaName: val.title, request: val.request}};
    }
}
function addMedias2(params){
    params.offset = Math.floor(selIndex/params.limit)*params.limit;
    $('#dialogbox').html('<img src="'+host+'/stbPlayer/buffering.gif" height="40"> '+_('Download! Wait ...')).show();
    $.ajax({
        url: _vpurl, type: 'post', //contentType: 'application/json',
        data: JSON.stringify(params),
        success: function(data){
            try{
                if(data !== null)
                    if(data.type == 'error') alert(data.description);
                    else
                        data.items.forEach(function(val, i){ if(val.type!='next') mediaRecords[params.offset+i] = createMedia(val, data); });
            } catch (e) {}
        },
        complete: function(){
            while(typeof(mediaRecords[selIndex].description) === "function"){
                mediaRecords.length = selIndex;
                selIndex--;
            }
            showPage();
            $('#dialogbox').hide();
        },
    });

    return _('Download! Wait ...');
}

var parentMedia = null, _vpurl, _vpkey;
if(typeof sPageSize == 'undefined') sPageSize = 30;
if(browserName() == 'dune'){
var _getMediaArray = function(murl, callback){
    if(murl === ''){
        murl = { mediaName: 'Media from '+provName, request: {}};
        _vpurl =  vpurl.split(']')[1];
        _vpkey =  vpurl.split('portal::[key:')[1].split(']')[0];
    } else
    if(typeof(murl)==='string' && murl.indexOf('search')==0){
        var ss = murl.split('=')[1];
        murl = { mediaName: '['+ss+']', request: {cmd: "search", query: ss}};
    } else
    if (murl.a=='filters'){
        mediaRecords = [];
        murl.filters.forEach(function(val){
            mediaRecords.push( {title: val.title, logo_30x30: '', description: val.title, playlist_url: {a:'filter', mediaName: val.title, items: val.items}} );
        });
        callback();
        return;
    } else
    if (murl.a=='filter'){
        mediaRecords = [];
        murl.items.forEach(function(val){
            mediaRecords.push( {title: val.title, logo_30x30: '', description: val.title, playlist_url: {mediaName: val.title, request: val.request}} );
        });
        callback();
        return;
    }
    var params = {key:_vpkey,app:"ott-play"};
    for (key in murl.request) { params[key] = murl.request[key]; }
    params['limit']=sPageSize*10;

    $('#dialogbox').html('<img src="'+host+'/stbPlayer/buffering.gif" height="40"> '+_('Download! Wait ...')).show();
    $.ajax({
        url: _vpurl, type: 'post', //contentType: 'application/json',
        data: JSON.stringify(params),
        success: function(data){
            try{
                mediaRecords = [];
                if(data !== null)
                    switch (data.type) {
                        case 'error':
                            alert(data.description);
                            break;
                        case 'videoportal':
                        case 'category':
                        case 'multistream':
                            mediaName = murl.mediaName;
                            if(data.items)
                            data.items.forEach(function(val){
                                if(val.type!='next') mediaRecords.push(createMedia(val, data));
                                else for (var i = mediaRecords.length; i < data.count; i++) {
                                    mediaRecords.push( {title: (i+1)+' '+_('Download! Wait ...'), logo_30x30: '', description: function(){ return addMedias2(params);}, stream_url: ''} );
                                }
                            });
                            if(data.controls){
                                if(data.controls.search)
                                    mediaRecords.push( {title: _('Search'), description: _('Search'), playlist_url: 'search', search_on:1} );
                                if(data.controls.filters)
                                    mediaRecords.push( {title: _('Filters'), description: _('Filters'), playlist_url: {a:'filters', filters: data.controls.filters}} );
                            }
                            break;
                    }
                    return;
            } catch (e) { alert(e); }
        },
        error: function(jqXHR){ alert('medias : jqXHR:'+JSON.stringify(jqXHR)); },
        complete: function(){
            $('#dialogbox').hide();
            callback();
        },
    });
}
}
var edTlist = ['epg.one (Стандартный)', 'soveni', 'epg.one (Тематический)', 'epg.one (Упорядоченный)'];
function duneAddSettings(ind){
    delPopup(restart);
    _getParams();
    popupArray.splice(ind, 1, _('Access settings')+' '+provName);
    popupDetail.splice(ind, 1, '');
    popupActions.splice(ind, 1, doEditData);
    getMediaArray = vpurl?_getMediaArray:null;
}
var vpAlert = 'Введите ссылку VPortal так как она выглядит кабинете:<br><b>portal::[key:...';
var edsp_v=[' Ключ доступа',' Ссылка на плейлист']; 
function doEditData(){
    selIndex = 0;
    function editListPC(){
        var _break = false, _code;
        function _close(){ clearTimeout(_timeout); _break = true;editKey = editKey1;$('#listEdit').hide()}
        var _timeout = setTimeout( _close, 600000);
        function get_settings(){
            if(_break) return;
            $.ajax({
                url: host+'/swop/a.php',
                data: {c:'get_ed', d: _code}, type: 'POST', timeout: 10000, cache: false,
                success: function(json){
                    if(_break) return;
                    if(json.status === 'forbidden') setTimeout(get_settings, 5000)
                    else if (json.status === 'success') {
                    edurl = json.edurl;
                providerSetItem('edurl', edurl);
            edkey = json.edkey;
                providerSetItem('key', edkey);
                playChannel(catIndex, primaryIndex);
            vpurl = json.vpurl;
                vpurl=vpurl.replace('%5B','[').replace('%5D',']'); 
                providerSetItem('vpurl', vpurl);
                getMediaArray = vpurl?_getMediaArray:null;
                mediaUrls = null;
                mediaNames = [];
                mediaSelects = [0];
            editKey = editKey1; 
            _close();
                    }
                },
                error: function(jqXHR){
                    $('#listEdit').html('<div style="text-align:center;font-size:larger;color:red"><br/><br/>ERROR:<br/>'+jqXHR.responseText+'</div>');
                },
            })
        }
        listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close');
        $('#listEdit').html('<div style="text-align:center;font-size:larger;"><br/><br/>'+_('Send request')+'...</div>').show();
        editKey = function(code){ if(code==keys.RETURN||code==keys.EXIT){ _close(); } return true; }
        $.ajax({
            url: host+'/swop/a.php', data: {c:'get_cod_ed'}, type: 'POST', timeout: 10000, cache: false,
            success: function(json){
                _code = json.code;
                $('#listEdit').html(
                    '<div style="text-align:center;font-size:larger;"><br/>'+_('Request sended!')+'<br/><br/>'+
                    'Для ввода ключа доступа, ссылок на плейлист iLook и VPortal откройте'+'<br/><span style="font-size:larger;color:'+curColor+'">'+scheme+__test+'drm-play.com/swop</span> '+_('and enter code')+' <span style="font-size:larger;color:'+curColor+'">'+_code+'</span><br/><br/>'+
                    _('or scan')+':<br/><br/>'+
                    '<div><img src="https://chart.googleapis.com/chart?cht=qr&chs=300x300&chld=|1&chl='+scheme+__test+'drm-play.com/swop/?'+_code+'" style="height:30%;"/></div>'+
                    '</div>'
                );
                setTimeout(get_settings, 10000);
            },
            error: function(jqXHR){
                $('#listEdit').html('<div style="text-align:center;font-size:larger;color:red"><br/><br/>ERROR:<br/>'+jqXHR.responseText+'</div>');
            },
        });
    }

     var r = _(' (after changing, load playlist)'),
        aDetail = [
            'Выбор входа в '+provName+' по ключу доступа или по ссылке на плейлист из личного кабинета <br><br> После изменения, перезагрузите плейлист.<br>Выбор "Ссылка на плейлист" доступен после ввода ссылки в разделе "Ссылка плейлист"'+strNew,
            'Ввод ключа доступа '+provName,
            'Выберите источник шаблона плейлиста, епг и логотипов:<br>'+edTlist.join(', ')+'<br><br>'+r,
            vpAlert,
            'Введите ссылку на плейлист iLook из личного кабинета',
            '','Ввод ключа доступа, ссылки на плейлист iLook и ссылки VPortal на компьютере или телефоне через сайт drm-play',
            '', _('Load playlist')
        ];  
    listArray = [
        'Вход по: <span style="color:red;font-size:100%;"> '+edsp_v[edsp]+'</span>',
        'Ключ доступа',
        'Тип листа: '+edTlist[edlist],
        'Ссылка VPortal',
        'Ссылка плейлист'+strNew,
    '', 'Ввод ключа доступа и ссылок на компьютере или телефоне',
        '', (sNoNumbersKeys?'':'<div class="btn">8</div> ')+_('Load playlist')
    ];
    getListItem = function(item, i){ return '&nbsp;&nbsp;'+item; };
    detailListAction = function(){
        listDetail.innerHTML = aDetail[selIndex];
        listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close')
            +([0,2].indexOf(selIndex)==-1?'':btnDiv(keys.ENTER, strENTER, 'Change value'))
            +((selIndex!=1)?'':btnDiv(keys.ENTER, strENTER, 'Change value', strLEFT, strRIGHT));
    };
    listKeyHandler = function(code){
        a = 1;
        switch (code) {
            case keys.LEFT: a = -1;
            case keys.RIGHT: if(selIndex!=1) return false;
            case keys.ENTER:
                switch (selIndex) {
                    case 0: doEditEdsp(a); return true;
                    case 1: edemKey(); return true;
                    case 2: doEditList(a); return true;
                    case 3: vportal(); return true;
                    case 4: edplaylist(); return true;
                    case 6: editListPC(); return true;
                    case 8: loadChannels(); return true;
                }
                return true;
            case keys.RETURN: popupList(popupActions.indexOf(noProvParam)+1); return true;
            case keys.N8: loadChannels(); return true;
            default: return false;
        }
    };
    listDetail.innerHTML = '';
    listCaption.innerHTML = _('Access settings')+' '+provName;
    $('#listPopUp').hide();

    showPage();
}

function edemKey(){
    editCaption = 'Редактирование ключа доступа';
    editvar = edkey;
    setEdit = function(){
        if(edkey == editvar) return;
        edkey = editvar;
        providerSetItem('key', edkey);
        playChannel(catIndex, primaryIndex);
        showPage();
    };
    showEditKey();
}
function doEditList(a){
    edlist+=a;
    if(edlist==edTlist.length) edlist = 0;
    if(edlist<0) edlist = edTlist.length-1;
    providerSetItem('list', edlist);
    listArray[2] = 'Тип листа: '+edTlist[edlist];
    showPage();
}
function doEditEdsp(a){
    edsp+=a;
    if(edsp==edsp_v.length) edsp = 0;
    if(edsp<0) edsp = edsp_v.length-1;
    if(edurl == "") {edsp=0;}
    providerSetItem('edsp', edsp);
    listArray[0] = 'Вход по: <span style="color:red;font-size:100%;"> '+edsp_v[edsp]+'</span>';
    showPage();
}
function vportal(){
    editCaption = 'Редактирование ссылки VPortal';
    editvar = vpurl;
    setEdit = function(){
        if(vpurl == editvar) return;
        editvar = editvar.replace('%5B','[').replace('%5D',']'); // mob safari?
        if(editvar&&editvar.indexOf('portal::[key:')!=0){
            alert(vpAlert);
            showEditKey();
            return;
        }
        vpurl = editvar;
        providerSetItem('vpurl', vpurl);
        getMediaArray = vpurl?_getMediaArray:null;
        mediaUrls = null;
        mediaNames = [];
        mediaSelects = [0];
    };
    showEditKey();
}
function edplaylist(){
    editCaption = 'Редактирование ссылки плейлиста из личного кабинета iLook';
    editvar = edurl;
    setEdit = function(){
        if(edurl == editvar) return;
        edurl = editvar;
        providerSetItem('edurl', edurl);        
        if(edurl == ""||edurl == 0||edurl ===-1) {edsp=0;providerSetItem('edsp', edsp);} 
    };    
    showEditKey();
}
