version += ' ip-0211';
var __id, __pin;
parental = /XXX/;

function _getParams(){
    __id = providerGetItem('id') || '';
    __pin = providerGetItem('pin') || '';
}
function getProviderParams(){
    _getParams();
    $("#__id").val(__id);
    $("#__pin").val(__pin);
    if(!__id || !__pin) alert('Для доступа необходимо ввести ID и PIN!');
    return __id && __pin;
}
function setProviderParams(){
    providerSetItem("id", decodeURIComponent($("#__id").val().trim()));
    var changed = __id != providerGetItem("id");
    providerSetItem("pin", decodeURIComponent($("#__pin").val().trim()));
    changed = changed || (__pin != providerGetItem("pin"));
    _getParams();
    if(!__id || !__pin) alert('Для доступа необходимо ввести ID и PIN!');
    return changed;
}

function getChannelPicon(ch_id){ return chanels[ch_id].logo; }
function getChannelUrl(ch_id){ return chanels[ch_id].url; }
function getArchiveUrl(ch_id, time, time_to){ return chanels[ch_id].url + '?utc=' + Math.floor(time); }
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
    if(!__id || !__pin){
        alert('ID или PIN отсутсвуют!');
        callback();
        return;
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
            var arrEXTINF = data.split('#EXTINF:');//, gRec = getAint(arrEXTINF[0], 'catchup-days')*24;
            arrEXTINF.shift();
            arrEXTINF.forEach(function(val, i, arr){
                var e = val.split('\n'),
                    cat = getAttribute(e[0], 'group-title'),
                    epg = getAttribute(e[0], 'tvg-id'),
                    logo = getAttribute(e[0], 'tvg-logo'),
                    // rec = getAint(e[0], 'tvg-rec')*gRec,
                    rec = getAint(e[0], 'catchup-days')*24,
                    cn = _('??? No channel name'),
                    url = '';
                try { cn = e[0].split(',')[1].trim(); } catch(e) {}
                try { url = e[1].trim(); } catch(e) {}
                var ci = url.split('/')[4] || epg;
                addChan2cat(cat, ci);
                if(url && (cList.indexOf(ci) == -1)){
                    cList.push(ci);
                    chanels[ci] = {channel_name: cn, category: {'class': catsArray.indexOf(cat)+2, 'name': cat}, rec: rec, time: 0, time_to: 0, url: url, logo: logo, epg: epg};
                }
            });
        } catch(e) {
            console.log( "Exception: name " + e.name + ", message " + e.message + ", typeof " + typeof e );
            alert( _('Failed to load channel list!') );
        }
        callback();
    }
    loadPlaylist(url_srv+'/PinApi/'+__id+'/'+__pin, function(data){
        try {
            loadPlaylist(url_srv+'/api/'+JSON.parse(data).token+'/high/ottnav.m3u8', aSuccess, callback);
        } catch(e) {
            alert( _('Failed to load channel list!') );
            callback();
        }
    }, callback);
}

function getEPGurl(ch_id){ return 'propg.net/epg/' + chanels[ch_id].epg }
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
    $.ajax({ url: _epgDomen+encodeURIComponent(epg_url)+'.json', dataType: 'json', timeout: 10000,
        success: function(data){ if(data !== null) d = data.epg_data; },
        // error: function(jqXHR, textStatus, errorThrown){ console.log( 'epg : ' + ch_id + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
        complete: function(){ callback(ch_id, d); },
    });
}


function duneAddSettings(ind){
    if(isNaN(parseInt(providerGetItem('sShowArchive')))) providerSetItem('sShowArchive', 1);
    delPopup(restart);
    _getParams();
    popupArray.splice(ind, 1, _('Settings')+' '+_pName);
    popupDetail.splice(ind, 1, '');
    popupActions.splice(ind, 1, __Settings);
}
function __Settings(){
    var r = _(' (after changing, restart player)');
    listArray = [
        {action: edit_login, name: _('ID'), desc:_('Редактирование ID')+r},
        {action: edit_pass, name: _('PIN'), desc:_('Редактирование PIN')+r},
        {},
        {action: restart, name: (sNoNumbersKeys?'':'<div class="btn">8</div> ')+_('Restart player'), desc:_('Restart player')},
    ];
    selIndex = 0;
    getListItem = function(item, i){ return '&nbsp;&nbsp;'+(item.name || ''); };
    detailListAction = function(){ listDetail.innerHTML = _(listArray[selIndex].desc || listArray[selIndex].name || ''); };
    listKeyHandler = function(code){
        switch(code){
                case keys.RETURN: popupList(__Settings); return true;
            case keys.ENTER: if(listArray[selIndex].action) listArray[selIndex].action(); return true;
            case keys.N8: restart();
        }
        return false;
    };
    listCaption.innerHTML = _('Settings')+' '+_pName;
    listPodval.innerHTML = btnDiv(keys.RETURN, strRETURN, 'Close');
    $('#listPopUp').hide();
    showPage();
};

function edit_login(){
    editCaption = _('Редактирование ID')+' '+_pName;
    editvar = __id;
    setEdit = function(){
        __id = editvar;
        providerSetItem('id', __id);
    };
    showEditKey([0]);
}
function edit_pass(){
    editCaption = _('Редактирование PIN')+' '+_pName;
    editvar = __pin;
    setEdit = function(){
        __pin = editvar;
        providerSetItem('pin', __pin);
    };
    showEditKey([0]);
}


version += ' 1ott-0530';
p_pref = '1ott';
var _pName = '1OTT.NET', url_srv = 'http://list.1ott.net';
