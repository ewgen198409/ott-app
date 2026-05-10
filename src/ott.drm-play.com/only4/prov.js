version += ' only4-1222';
var token, ts_hls, provName = 'Only4.tv';
p_pref = 'o4';
parental = /ХХХ/;

function _getParams(){
    token = providerGetItem('token') || '';
    ts_hls = parseInt(providerGetItem('ts_hls')) || 0;
}
function getProviderParams(){
    _getParams();
    ts_hls = 1;
    if(browserName() == 'Safari') ts_hls = 2;
    $("#token").val(token);
    if(token.length != 10) alert('Для доступа необходимо ввести IPTV токен! (10 символов)');
    return (token.length);
}
function setProviderParams(){
    providerSetItem("token", decodeURIComponent($("#token").val().trim()));
    var changed = token != providerGetItem("token");
    _getParams();
    if(token.length != 10) alert('Для доступа необходимо ввести IPTV токен! (10 символов)');
    return changed;
}

function getChannelPicon(ch_id){ return chanels[ch_id].logo; }
function getChannelUrl(ch_id){
    var u = chanels[ch_id].url.split('index.m3u8');
    return u[0] + ['mpegts', 'video.m3u8', 'index.m3u8'][ts_hls] + u[1];
}
// function getArchiveUrl(ch_id, time, time_to){
//     var u = chanels[ch_id].url.split('index.m3u8');
//     return u[0] + ['timeshift_abs/', 'timeshift_abs_video-', 'timeshift_abs-'][ts_hls] + Math.floor(time) + ['', '.m3u8', '.m3u8'][ts_hls] + u[1];
// }
function getArchiveUrl(ch_id, time, time_to){
    var u = chanels[ch_id].url.split('index.m3u8');
    if(time_to < time) time_to = Date.now()/1000+600;
    // if(!ts_hls || time_to > Date.now()/1000) // мпег или текущая передача
    if(!ts_hls ||(time > Date.now()/1000-600)) // мпег или последние 10 минут
        return u[0] + ['timeshift_abs/', 'timeshift_abs_video-', 'timeshift_abs-'][ts_hls] + Math.floor(time) + ['', '.m3u8', '.m3u8'][ts_hls] + u[1];
    else {
        if(browserName() == 'dune') time_to = Math.floor(time_to) + 7200;
        return u[0] + ['', 'video-', 'index-'][ts_hls] + Math.floor(time) + '-' + Math.floor(time_to-time) + '.m3u8' + u[1];
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
                    console.log( 'channels : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown );
                    alert( _('Failed to load channel list!') );
                    callback();
                },
            });
        },
    });
}

    function aSuccess(data){
        // console.log(data);
        try{
            var arrEXTINF = data.split('#EXTINF:');
            arrEXTINF.shift();
            arrEXTINF.forEach(function(val, i, arr){
                var e = val.split('\n'),
                    cat = getAttribute(e[0], 'group-title'),
                    epg = getAttribute(e[0], 'tvg-id'),
                    logo = getAttribute(e[0], 'tvg-logo'),
                    rec = getAint(e[0], 'catchup-days')*24,
                    cn = '??? Нет названия канала',
                    url = '';
                try { cn = e[0].split(',').splice(1, 100).join(',').trim(); } catch(e) {}
                try { url = e[1].trim(); } catch(e) {}
                var ci = url.split('/')[3] || '';
                addChan2cat(cat, ci);
                if(url && ci && (cList.indexOf(ci) == -1)){
                    cList.push(ci);
                    chanels[ci] = {channel_name: cn, category: {'class': catsArray.indexOf(cat)+2, 'name': cat}, rec: rec, time: 0, time_to: 0, url: url, logo: logo, epg: epg};
                }
            });
        } catch(e) {
            console.log( "Exception: name " + e.name + ", message " + e.message + ", typeof " + typeof e );
            alert( "Ошибка обработки списка каналов! Проверьте правильность данных!!" );
        }
        callback();
    }
    if(token) loadPlaylist('http://only4.tv/pl/'+token+'/102/only4tv.m3u8', aSuccess, callback);
    else callback();
}
function getEPGurl(ch_id){ return 'only4/epg/' + chanels[ch_id].epg }
// _epgDomen = '';
//_epgDomen = 'http://epg.ott-play.com/';
_epgDomen = 'http://epg.drm-play.com/';
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


var shTarr = ['MPEGTS', 'HLS(v)', 'HLS(a)'];
function duneAddSettings(ind){
    if(isNaN(parseInt(providerGetItem('sShowArchive')))) providerSetItem('sShowArchive', 1);
    if(isNaN(parseInt(providerGetItem('sShowPikon')))) providerSetItem('sShowPikon', 0);
    if(isNaN(parseInt(providerGetItem('ts_hls')))) providerSetItem('ts_hls', 1);
    // if(isNaN(parseInt(providerGetItem('ts_hls')))&&(navigator.userAgent.indexOf("Tizen")!=-1)) providerSetItem('ts_hls', 2);
    delPopup(restart);
    _getParams();
    popupArray.splice(ind, 1, 'Настройки провайдера '+provName);
    popupDetail.splice(ind, 1, '');
    popupActions.splice(ind, 1, doEditData);
}
function doEditData(){
    selIndex = 0;
    var r = _(' (after changing, load playlist)'),
        aDetail = [
            'Ввод IPTV токена '+provName+r,
            'Выберите тип потоков:<br>'+shTarr.join(', '),
            '', _('Load playlist')
        ];
    listArray = [
        'IPTV токен',
        'Тип потоков: '+shTarr[ts_hls],
        '', (sNoNumbersKeys?'':'<div class="btn">8</div> ')+_('Load playlist')
    ];
    getListItem = function(item, i){ return '&nbsp;&nbsp;'+item; };
    detailListAction = function(){
        listDetail.innerHTML = aDetail[selIndex];
        listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close')
            +(([0,1].indexOf(selIndex)==-1)?'':btnDiv(keys.ENTER, strENTER, 'Change value'))
            +((selIndex!=1)?'':btnDiv(keys.ENTER, strENTER, 'Change value', '&#9664;', '&#9654;'));
    };
    listKeyHandler = function(code){
        a = 1;
        switch (code) {
            case keys.LEFT: a = -1;
            case keys.RIGHT: if(selIndex!=1) return false;
            case keys.ENTER:
                switch (selIndex) {
                    case 0: edit_token(); return true;
                    case 1: doEditType(a); return true;
                    case 3: loadChannels(); return true;//restart();
                }
                return true;
            case keys.RETURN: popupList(popupActions.indexOf(noProvParam)+1); return true;
            case keys.N8: loadChannels(); return true;//restart();
            default: return false;
        }
    };
    listDetail.innerHTML = '';
    listCaption.innerHTML = 'Настройки провайдера '+provName;
    $('#listPopUp').hide();

    showPage();
}
function edit_token(){
    editCaption = 'Редактирование IPTV токена (10 символов)';
    editvar = token;
    setEdit = function(){
        if(editvar && editvar.length != 10){
            alert('Для доступа необходимо ввести IPTV токен! (10 символов)');
            setTimeout( function(){ showEditKey([0,1,2]); } );
            return;
        }
        token = editvar;
        providerSetItem('token', token);
    };
    showEditKey([0,1,2]);
}
function doEditType(a){
    ts_hls+=a;
    if(ts_hls==shTarr.length) ts_hls = 0;
    if(ts_hls<0) ts_hls = shTarr.length-1;
    providerSetItem("ts_hls", ts_hls);
    listArray[1] = 'Тип потоков: '+shTarr[ts_hls];
    showPage();
    detailListAction();
    if(!playType) playChannel(catIndex, primaryIndex);
    else if(playType>0) playArchive(playType + playTime);
}
