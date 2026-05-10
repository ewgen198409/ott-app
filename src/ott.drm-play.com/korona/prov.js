var login, pass, serv, quol;
parental = /EROTIK/;

function _getParams(){
    login = providerGetItem('login') || '';
    pass = providerGetItem('pass') || '';
    serv = parseInt(providerGetItem('serv')) || 1;
    quol = providerGetItem('quol') || 'hi';
}
function getProviderParams(){
    _getParams();
    $("#login").val(login);
    $("#pass").val(pass);
    $("#serv").val(serv);
    $("#quol").val(quol);
    if((login.length != 8) || (pass.length != 8)) alert('Для доступа необходимо ввести Логин и пароль!');
    return (login.length == 8) && (pass.length == 8);
}
function setProviderParams(){
    providerSetItem("login", decodeURIComponent($("#login").val().trim()));
    var changed = login != providerGetItem("login");
    providerSetItem("pass", decodeURIComponent($("#pass").val().trim()));
    changed = changed || (pass != providerGetItem("pass"));
    providerSetItem("serv", $("#serv").val());
    changed = changed || (serv != providerGetItem("serv"));
    providerSetItem("quol", $("#quol").val());
    changed = changed || (quol != providerGetItem("quol"));
    _getParams();
    if((login.length != 8) || (pass.length != 8)) alert('Для доступа необходимо ввести Логин и пароль!');
    return changed;
}

function getChannelPicon(ch_id){ return chanels[ch_id].logo; }
function getChannelUrl(ch_id){ return chanels[ch_id].url; }
function getArchiveUrl(ch_id, time, time_to){
    return chanels[ch_id].url + '?utc=' + Math.floor(time) + '&lutc=' + Math.floor(Date.now()/1000);
}
/**
 * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
 *
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 *
 * @param {string} key ASCII only
 * @param {number} seed Positive integer only
 * @return {number} 32-bit positive integer hash
 */

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

if(typeof catsArray == 'undefined') var catsArray = [];
function addChan2cat(cat, ci){
    if(!cat || !ci) return;
    if(!cats[cat]){
        catsArray.push(cat);
        cats[cat] = [];
    }
    cats[cat].push(ci);
}

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

function getChanelsArray(callback){
    function aSuccess(data){
        try{
            // console.log(data);
            var arrEXTINF = data.split('#EXTINF:');
            arrEXTINF.shift();
            arrEXTINF.forEach(function(val, i, arr){
                // console.log(val);
                var e = val.split('\n');
                var cat = getAttribute(e[0], 'group-title');
                var epg = getAttribute(e[0], 'tvg-id');
                var logo = getAttribute(e[0], 'tvg-logo');
                var ci = getAttribute(e[0], 'CUID');
                var rec = parseInt(getAttribute(e[0], 'arc-time')) || 0;
                var cn = _('??? No channel name');
                try { cn = e[0].split(',')[1].trim(); } catch(e) {}
                var url = '';
                try { url = e[1].trim(); } catch(e) {}
                var n = 1;
                while (url.indexOf('#') === 0) {
                    if(url.indexOf('#EXTGRP:') != -1)
                        if(!cat) cat = url.split('#EXTGRP:')[1].trim();
                    try { url = e[++n].trim(); } catch(e) { url = ''; }
                }
                if(!ci) ci = murmurhash3_32_gc(url, 10);
                addChan2cat(cat, ci);
                if(url && (cList.indexOf(ci) == -1)){
                    cList.push(ci);
                    chanels[ci] = {channel_name: cn, category: {'class': catsArray.indexOf(cat)+2, 'name': cat}, rec: rec, time: 0, time_to: 0, url: url, logo: logo, epg_id: epg};
                }
            });
        } catch(e) {
            console.log( "Exception: name " + e.name + ", message " + e.message + ", typeof " + typeof e );
            alert( _('Failed to load channel list!') );
        }
        callback();
    }
    var u = 'http://pl.korona-tv.top/'+serv+'/'+quol+'/'+login+'/'+pass+'/tv.m3u';
    loadPlaylist(u, aSuccess, callback);
}
function getEPGurl(ch_id){ return 'korona/epg/' + chanels[ch_id].epg_id }
// _epgDomen = '';
//_epgDomen = 'http://epg.ott-play.com/';
_epgDomen = scheme+'epg.drm-play.com/';
function getEPGchanel(ch_id, callback){
    // if(!_epgDomen){
    //     _epgDomen = 'http://epgf.ott-play.com/';
    //     $.ajax({ url: _epgDomen+'test.json', dataType: 'json', timeout: 5000,
    //         error: function(){ _epgDomen = 'http://epg.ott-play.com/'; },
    //         complete: function(){ getEPGchanel(ch_id, callback); },
    //     });
    //     return;
    // }
    var d = null, epg_url = getEPGurl(ch_id);
    if(!epg_url){ callback(ch_id, d); return; }
    $.ajax({ url: _epgDomen+epg_url+'.json', dataType: 'json', timeout: 10000,
        success: function(data){ if(data !== null) d = data.epg_data; },
        // error: function(jqXHR, textStatus, errorThrown){ console.log( 'epg : ' + ch_id + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
        complete: function(){ callback(ch_id, d); },
    });
}

//$.ajax({url:'http://dev.korona-tv.top/api/auth/',dataType:'text',timeout: 10000,type:'post',data:{username:'5e1c092f',password:'e733403e'},success:success,
//    success: function(data){if(data){console.log("dataKorona:",data);}},  
//    });

//http://dev.korona-tv.top/api/xapi10/
//http://dev.korona-tv.top/api/auth/?username=5e1c092f&password=e733403e

var mcats = [], mvods = {};
function getKingsMediaArray(callback){
    function it(val, title){ return val ? '<b>'+title+': </b>'+val+'<br>' : ''; }
    function item2descr(n, i){
        return '<table>'
            + '<h2><center>'+n+'</center></h2>'
            + '<img id="detal" height="285" src="'+i+'" style="float: left; margin-right: 5px; margin-bottom: 5px; border-width: 0px; border-style: solid;" width="210">'
            + '</table>';
    }
    $('#dialogbox').html('<img src="'+host+'/stbPlayer/buffering.gif" height="40"> Загрузка списка! Подождите ...').show();
    $.ajax({
        url: 'http://pl.korona-tv.top/'+login+'/'+pass+'/vodall.m3u',//vodall.m3u
        dataType: "text",
        success: function(data){
            try{
                // console.log(data);
                mcats.push({title: 'DE-All', logo_30x30: '', description: '', playlist_url: 1});
                mvods[1] = [];
                var cats = ['DE-All'];
                var arrEXTINF = data.split('#EXTINF:');
                arrEXTINF.shift();
                arrEXTINF.forEach(function(val, i, arr){
                    // console.log(val);
                    var e = val.split('\n');
                    var cat = getAttribute(e[0], 'group-title') || 'Без категории';
                    var logo = getAttribute(e[0], 'tvg-logo');
                    var cn = '??? Нет названия';
                    try { cn = e[0].split(',')[1].trim(); } catch(e) {}
                    var url = '';
                    try { url = e[1].trim(); } catch(e) {}
                    if(url){
                        if(cats.indexOf(cat) == -1){
                            cats.push(cat);
                            mcats.push( {title: cat, logo_30x30: '', description: '', playlist_url: cats.indexOf(cat)+1} );
                            mvods[cats.indexOf(cat)+1] = [];
                        }
                        mvods[cats.indexOf(cat)+1].push({title: cn, logo_30x30: logo, description: item2descr(cn, logo), stream_url: url});
                        mvods[1].push({title: cn, logo_30x30: logo, description: item2descr(cn, logo), stream_url: url});
                    }
                });
            } catch(e) {
                console.log( "Exception: name " + e.name + ", message " + e.message + ", typeof " + typeof e );
                alert( "Ошибка обработки списка! Проверьте правильность данных!!" );
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log( 'vod : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown );
            alert( "Не удалось загрузить список! Проверьте правильность данных!!" );
        },
        complete: function(jqXHR, textStatus){
            $('#dialogbox').hide();
            mediaRecords = mcats;
            // console.log(mvods);
            callback();
        },
    });
}

function getMediaArray(murl, callback){
    if(murl === ''){
        mediaName = 'Медиатека '+provName;
        if(mcats.length) {
            mediaRecords = mcats;
            callback();
        } else
            getKingsMediaArray(callback);
    }else{
        mediaName = mcats[murl-1].title;
        mediaRecords = mvods[murl];
        callback();
    }
}

// function _duneAddSettings(ind){
//     if(isNaN(parseInt(providerGetItem('sShowArchive')))) providerSetItem('sShowArchive', 1);
//     _getParams();
//     popupArray.splice(ind, 0, 'korona tv: Логин', 'korona tv: Пароль', 'korona tv: Сервер: '+serv, 'korona tv: Качество: '+quol);
//     popupDetail.splice(ind, 0, 'Ввод логина korona tv (после изменения нужно перезапустить плеер)', 'Ввод пароля korona tv (после изменения нужно перезапустить плеер)',
//         'Выберите сервер korona tv (после изменения нужно перезапустить плеер)', 'Выберите качество потоков korona tv (после изменения нужно перезапустить плеер)');
//     popupActions.splice(ind, 0, edit_login, edit_pass, edit_serv, edit_quol);
// }
function duneAddSettings(ind){
    if(isNaN(parseInt(providerGetItem('sShowArchive')))) providerSetItem('sShowArchive', 1);
    delPopup(restart);
    _getParams();
    popupArray.splice(ind, 1, _('Settings')+' '+provName);
    popupDetail.splice(ind, 1, '');
    popupActions.splice(ind, 1, doEditData);
}
function doEditData(){
    selIndex = 0;
    var r = _(' (after changing, load playlist)'),
        aDetail = [
            _('Enter username')+' '+r,
            _('Enter password')+' '+r,
            'Выберите сервер '+r,
            'Выберите качество потоков '+r,
            '', _('Load playlist')
        ];
    listArray = [
        _('Username'),
        _('Password'),
        'Сервер: '+serv,
        'Качество: '+quol,
        '', (sNoNumbersKeys?'':'<div class="btn">8</div> ')+_('Load playlist')
    ];
    getListItem = function(item, i){ return '&nbsp;&nbsp;'+item; };
    detailListAction = function(){
        listDetail.innerHTML = aDetail[selIndex];
        listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close')
            +(([0,1].indexOf(selIndex)==-1)?'':btnDiv(keys.ENTER, strENTER, 'Change value'))
            +((selIndex!=2)?'':btnDiv(keys.ENTER, strENTER, 'Change value', '&#9664;', '&#9654;'));
    };
    listKeyHandler = function(code){
        a = 1;
        switch (code) {
            case keys.LEFT: a = -1;
            case keys.RIGHT: if(selIndex!=2&&selIndex!=3) return false;
            case keys.ENTER:
                switch (selIndex) {
                    case 0: edit_login(); return true;
                    case 1: edit_pass(); return true;
                    case 2: edit_serv(a); return true;
                    case 3: edit_quol(a); return true;
                    case 5: loadChannels(); return true;//restart();
                }
                return true;
            case keys.RETURN: popupList(popupActions.indexOf(noProvParam)+1); return true;
            case keys.N8: loadChannels(); return true;//restart();
            default: return false;
        }
    };
    listDetail.innerHTML = '';
    listCaption.innerHTML = _('Settings')+' '+provName;
    $('#listPopUp').hide();

    showPage();
}

function edit_login(){
    editCaption = _('Enter username');
    editvar = login;
    setEdit = function(){
        if(editvar.length != 8){
            alert('Для доступа необходимо ввести Логин! (8 символов)');
            showEditKey([0,2]);
            return;
        }
        login = editvar;
        providerSetItem('login', login);
    };
    showEditKey([0,2]);
}
function edit_pass(){
    editCaption = _('Enter password');
    editvar = pass;
    setEdit = function(){
        if(editvar.length != 8){
            alert('Для доступа необходимо ввести Пароль! (8 символов)');
            showEditKey([0,2]);
            return;
        }
        pass = editvar;
        providerSetItem('pass', pass);
    };
    showEditKey([0,2]);
}
function edit_serv(a){
    serv += a;
    if(serv>4) serv = 1;
    if(serv<1) serv = 4;
    providerSetItem("serv", serv);
    listArray[2] = 'Сервер: '+serv;
    showPage();
    detailListAction();
}
function edit_quol(){
    quol = (quol==='hi') ? 'lo' : 'hi';
    providerSetItem("quol", quol);
    listArray[3] = 'Качество: '+quol;
    showPage();
    detailListAction();
}


version += ' korona-0526';
p_pref = 'km';
provName = 'KORONA TV';
