version += ' tvteam-0108';
var tvteamwww;
p_pref = 'tvteam';
parental = /Для взрослых|Adults/;

function _getParams(){
    tvteamwww = providerGetItem("www") || 'https://tv.team/pl/11/';
}
function getProviderParams(){
    if(browserName() != 'dune') try{
        var _t = '', params = window.location.href.split('?')[1].split('&');
        params.forEach(function(item){
            var p = item.split('=');
            if(p[0]=='token'){ _t = p[1]; throw {}; }
        });
    }catch(e){}
    // console.log('pin',_pin);
    if(_t){
        tvteamwww = 'https://tv.team/pl/11/'+_t+'/playlist.m3u8';
        providerSetItem('www', tvteamwww);
        window.location.href = window.location.href.split('?')[0];
    }

    _getParams();
    $("#tvteamwww").val(tvteamwww);
    if(!tvteamwww) alert('Для доступа необходимо ввести адрес плейлиста!');
    return tvteamwww;
}
function setProviderParams(){
    providerSetItem("www", decodeURIComponent($("#tvteamwww").val().trim()));
    var wwwchanged = tvteamwww != providerGetItem("www");
    _getParams();
    if(tvteamwww.length < 8) alert('Для доступа необходимо ввести адрес плейлиста!');
    return wwwchanged;
}

function getChannelPicon(ch_id){ return chanels[ch_id].logo; }
function getChannelUrl(ch_id){ return chanels[ch_id].url; }
function getArchiveUrl(ch_id, time, time_to){
    var u = chanels[ch_id].url, c = (u.indexOf('?') == -1) ? '?' : '&';
    return u + c + 'utc=' + Math.floor(time) + '&lutc=' + Math.floor(Date.now()/1000);
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
            var arrEXTINF = data.split('#EXTINF:');
            arrEXTINF.shift();
            arrEXTINF.forEach(function(val){
                // console.log(val);
                var e = val.split(','),
                    cat = getAttribute(e[0], 'group-title'),
                    logo = getAttribute(e[0], 'tvg-logo'),
                    ci = getAttribute(e[0], 'tvg-name'),
                    rec = parseInt(getAttribute(e[0], 'timeshift'))*7*24 || 0,
                    e1 = e[1].split("\n"),
                    cn = e1[0].trim(),
                    url = e1[1].trim();
                if(url.indexOf('#EXTGRP:') != -1) {
                    url = e1[2].trim();
                    if(!cat) cat = e1[1].split('#EXTGRP:')[1].trim();
                }
                addChan2cat(cat, ci);
                cList.push(ci);
                chanels[ci] = {channel_name: cn, category: {'class': catsArray.indexOf(cat)+2, 'name': cat}, rec: rec, time: 0, time_to: 0, url: url, logo: logo};
            });
        } catch(e) {
            console.log( "Exception: name " + e.name + ", message " + e.message + ", typeof " + typeof e );
            alert( _('Failed to load channel list!') );
        }
        callback();
    }
    loadPlaylist(tvteamwww, aSuccess, callback);
}
function getEPGchanel(ch_id, callback){
    var d = null;
    $.ajax({
        url: 'http://tvteam.eu/'+ch_id+'.json',
//        url: 'http://epg.drm-play.com/tvteam/epg/'+ch_id+'.json',
        dataType: 'json', timeout: 10000,
        success: function(data){ if(data !== null) d = data.epg_data; },
        // error: function(jqXHR, textStatus, errorThrown){ console.log( 'epg : ' + ch_id + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
        complete: function(){ callback(ch_id, d); },
    });
}

function duneAddSettings(ind){
    _getParams();
    popupArray.splice(ind, 1, 'tv.team : Адрес плейлиста');
    popupDetail.splice(ind, 1, 'Ввод адреса плейлиста tv.team</b>Тип плейлиста: <b>OTTPlayer</b><br/><br/>Вы можете не вводить окончание адреса плейлиста "/playlist.m3u8" - оно будет добавлено автоматически');
    popupActions.splice(ind, 1, tvteamUrl);
}

function tvteamUrl(){
    editCaption = 'Редактирование адреса плейлиста tv.team';
    editvar = tvteamwww;
    setEdit = function(){
        tvteamwww = editvar;
        if(tvteamwww.indexOf('/playlist.m3u8') == -1) tvteamwww += '/playlist.m3u8';
        providerSetItem('www', tvteamwww);
    };
    showEditKey();
}
