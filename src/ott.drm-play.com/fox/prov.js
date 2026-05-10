version += ' fox-0312';
var login, pass;
p_pref = 'fox';
parental = /18+/;

function _getParams(){
    login = providerGetItem('login') || '';
    pass = providerGetItem('pass') || '';
}
function getProviderParams(){
    _getParams();
    $("#login").val(login);
    $("#pass").val(pass);
    if(!login || !pass) alert('Для доступа необходимо ввести Логин и пароль!');
    return login && pass;
}
function setProviderParams(){
    providerSetItem("login", decodeURIComponent($("#login").val().trim()));
    var changed = login != providerGetItem("login");
    providerSetItem("pass", decodeURIComponent($("#pass").val().trim()));
    changed = changed || (pass != providerGetItem("pass"));
    _getParams();
    if(!login || !pass) alert('Для доступа необходимо ввести Логин и пароль!');
    return changed;
}

function getChannelPicon(ch_id){ return chanels[ch_id].logo; }
function getChannelUrl(ch_id){ return chanels[ch_id].url; }
function getArchiveUrl(ch_id, time, time_to){
    return chanels[ch_id].url + '?utc=' + Math.floor(time) + '&lutc=' + Math.floor(Date.now()/1000);
}
function getAttribute(text, attribute){
    var a = text.split(attribute + '=');
    if(a.length==1 || a[1].length==0) return '';
    if(a[1][0]=='"') return a[1].split('"')[1] || '';
    else return a[1].split(/[ ,]+/)[0] || '';
}

function getChanelsArray(callback){
    if(!login || !pass){
        alert('Логин или пароль отсутсвуют!');
        callback();
        return;
    }
    $.ajax({
        url: 'http://pl.fox-tv.fun/'+login+'/'+pass+'/tv.m3u',
        dataType: 'text', timeout: 30000,
        success: function(data){
            try{
                // console.log(data);
                var cats = [], arrEXTINF = data.split('#EXTINF:');
                arrEXTINF.shift();
                arrEXTINF.forEach(function(val, i, arr){
                    // console.log(val);
                    var e = val.split('\n'),
                        cat = getAttribute(e[0], 'group-title'),
                        epg = getAttribute(e[0], 'tvg-id'),
                        logo = getAttribute(e[0], 'tvg-logo'),
                        ci = getAttribute(e[0], 'CUID'),
                        rec = parseInt(getAttribute(e[0], 'arc-time')) || 0,
                        cn = _('??? No channel name'),
                        url = '';
                    try { cn = e[0].split(',')[1].trim(); } catch(e) {}
                    try { url = e[1].trim(); } catch(e) {}
                    if(url && (cList.indexOf(ci) == -1)){
                        if(cats.indexOf(cat) == -1) cats.push(cat);
                        cList.push(ci);
                        chanels[ci] = {channel_name: cn, category: {'class': cats.indexOf(cat)+2, 'name': cat}, rec: rec, time: 0, time_to: 0, url: url, logo: logo, epg: epg};
                    }
                });
            } catch(e) {
                console.log( "Exception: name " + e.name + ", message " + e.message + ", typeof " + typeof e );
                alert(_('Failed to load channel list!'));
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log( 'channels : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown );
            alert(_('Failed to load channel list!'));
        },
        complete: function(jqXHR, textStatus){ callback(); },
    });
}
function getEPGurl(ch_id){ return 'fox-tv/epg/' + chanels[ch_id].epg }
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


var mcats = [], mvods = {};
function getFoxMediaArray(callback){
    function item2descr(n, i){
        return '<table>'
            + '<h2><center>'+n+'</center></h2>'
            + '<img id="detal" height="285" src="'+i+'" style="float: left; margin-right: 5px; margin-bottom: 5px; border-width: 0px; border-style: solid;" width="210">'
            + '</table>';
    }
    $('#dialogbox').html('<img src="'+host+'/stbPlayer/buffering.gif" height="40"> '+_('Download! Wait ...')).show();
    $.ajax({
        url: 'http://pl.fox-tv.fun/'+login+'/'+pass+'/vodall.m3u',
        dataType: 'text', timeout: 30000,
        success: function(data){
            try{
                // console.log(data);
                mcats.push({title: _('All'), logo_30x30: '', description: '', playlist_url: 1});
                mvods[1] = [];
                var cats = [_('All')];
                var arrEXTINF = data.split('#EXTINF:');
                arrEXTINF.shift();
                arrEXTINF.forEach(function(val, i, arr){
                    // console.log(val);
                    var e = val.split('\n'),
                        cat = getAttribute(e[0], 'group-title') || '??? no group',
                        logo = getAttribute(e[0], 'tvg-logo'),
                        cn = _('??? No name'),
                        url = '';
                    try { cn = e[0].split(',')[1].trim(); } catch(e) {}
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
            mediaRecords = [].concat(mcats);
            // console.log(mvods);
            callback();
        },
    });
}

function getMediaArray(murl, callback){
    if(!login || !pass){
        alert('Логин или пароль отсутсвуют!');
        callback();
        return;
    }
    if(murl===''){
        mediaName = 'Медиатека от '+_pName;
        if(mcats.length) {
            mediaRecords = [].concat(mcats);
            callback();
        } else
            getFoxMediaArray(callback);
    }else{
        mediaName = mcats[murl-1].title;
        mediaRecords = mvods[murl];
        callback();
    }
}

var _pName = 'Fox-TV';
function duneAddSettings(ind){
    if(isNaN(parseInt(providerGetItem('sShowArchive')))) providerSetItem('sShowArchive', 1);
    _getParams();
    popupArray.splice(ind, 1, _('Settings')+' '+_pName);
    popupDetail.splice(ind, 1, '');
    popupActions.splice(ind, 1, foxSettings);
}
function foxSettings(){
    var r = _(' (after changing, restart player)');
    listArray = [
        {action: edit_login, name: _('Username'), desc:_('Enter username')+r},
        {action: edit_pass, name: _('Password'), desc:_('Enter password')+r},
        {},
        {action: restart, name: _('Restart player')},
    ];
    if(!sNoNumbersKeys) listArray[3].name = '<div class="btn">8</div> ' + listArray[3].name;
    selIndex = 0;
    getListItem = function(item, i){ return '&nbsp;&nbsp;'+(item.name || ''); };
    detailListAction = function(){ listDetail.innerHTML = _(listArray[selIndex].desc || listArray[selIndex].name || ''); };
    listKeyHandler = function(code){
        switch(code){
                case keys.RETURN: popupList(foxSettings); return true;
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
    editCaption = _('Enter username')+' '+_pName;
    editvar = login;
    setEdit = function(){
        login = editvar;
        providerSetItem('login', login);
    };
    showEditKey([0,1,2]);
}
function edit_pass(){
    editCaption = _('Enter password')+' '+_pName;
    editvar = pass;
    setEdit = function(){
        pass = editvar;
        providerSetItem('pass', pass);
    };
    showEditKey([0,1,2]);
}
