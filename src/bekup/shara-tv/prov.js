version += ' sharatv-191219';
var login, pass;
p_pref = 'shtv';
parental = /Взрослые/;

function _getParams(){
    login = providerGetItem('login') || '';
    pass = providerGetItem('pass') || '';
}
function getProviderParams(){
    _getParams();
    $("#login").val(login);
    $("#pass").val(pass);
    if((login.length != 8) || (pass.length != 8)) alert('Для доступа необходимо ввести Логин и пароль!');
    return (login.length == 8) && (pass.length == 8);
}
function setProviderParams(){
    providerSetItem("login", decodeURIComponent($("#login").val().trim()));
    var changed = login != providerGetItem("login");
    providerSetItem("pass", decodeURIComponent($("#pass").val().trim()));
    changed = changed || (pass != providerGetItem("pass"));
    _getParams();
    if((login.length != 8) || (pass.length != 8)) alert('Для доступа необходимо ввести Логин и пароль!');
    return changed;
}

function getChannelPicon(ch_id){ return chanels[ch_id].logo || ''; }
function getChannelUrl(ch_id){ return chanels[ch_id].url || ''; }
function getArchiveUrl(ch_id, time, time_to){ return getChannelUrl(ch_id) + '?utc=' + Math.floor(time); }

function getChanelsArray(callback){
    function getAttribute(text, attribute){
        var i = text.indexOf(attribute + '="');
        if(i == -1) return '';
        var i1 = text.indexOf('"', i + attribute.length + 2);
        if(i1 == -1) return '';
        return text.substring(i + attribute.length + 2, i1);
    }
    if(!login || !pass){ alert('Логин или пароль отсутсвуют!'); callback(); return; }
    $.ajax({
        url: 'http://tvfor.pro/g/'+login+':'+pass+'/1/playlist.m3u',
        dataType: "text", timeout: 10000,
        success: function(data){
            try{
                // console.log(data);
                var cats = [],
                    arrEXTINF = data.split('#EXTINF:');
                arrEXTINF.shift();
                arrEXTINF.forEach(function(val){
                    // console.log(val);
                    var e = val.split('\n'),
                        cat = getAttribute(e[0], 'group-title'),
                        epg = getAttribute(e[0], 'tvg-id'),
                        logo = getAttribute(e[0], 'tvg-logo'),
                        rec = parseInt(getAttribute(e[0], 'catchup-days'))*24 || 0,
                        aurl = getAttribute(e[0], 'catchup-source'),
                        cn = '??? Нет названия канала',
                        url = '';
                    try { cn = e[0].split(',')[1].trim(); } catch(e) {}
                    try { url = e[2].trim(); } catch(e) {}
                    var ci = url.split('/')[3];
                    if(url && (cList.indexOf(ci) == -1)){
                        if(cats.indexOf(cat) == -1) cats.push(cat);
                        cList.push(ci);
                        chanels[ci] = {ch_id: ci, channel_name: cn, category: {'class': cats.indexOf(cat)+2, 'name': cat}, rec: rec, time: 0, time_to: 0, url: url, logo: logo, epg: epg, aurl: aurl};
                    }
                });
            } catch(e) {
                console.log( "Exception: name " + e.name + ", message " + e.message + ", typeof " + typeof e );
                alert( "Ошибка обработки списка каналов! Проверьте правильность данных!!" );
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log( 'channels : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown );
            alert( "Не удалось загрузить список каналов! Проверьте правильность данных!!" );
        },
        complete: function(jqXHR, textStatus){ callback(); },
    });
}
function getEPGchanel(ch_id, callback){
    var d = null;
    if(!chanels[ch_id].epg){ callback(ch_id, d); return; }
    $.ajax({
        // url: 'http://epg.ott-play.com/shara-tv/getepg.php', data: {'epg': chanels[ch_id].epg},
        // method: "post",
//        url: 'http://epg.ott-play.com/shara-tv/epg/'+chanels[ch_id].epg+'.json',//?_=' + Date.now(),
        url: 'http://epg.drm-play.com/shara-tv/epg/'+chanels[ch_id].epg+'.json',//?_=' + Date.now(),
        timeout: 10000, dataType: "json",
        success: function(data){ if(data !== null) d = data.epg_data; },
        // error: function(jqXHR, textStatus, errorThrown){ console.log( 'epg : ' + ch_id + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
        complete: function(jqXHR, textStatus){ callback(ch_id, d); },
    });
}
var provName = 'shara-tv'
function duneAddSettings(ind){
    if(isNaN(parseInt(providerGetItem('sShowArchive')))) providerSetItem('sShowArchive', 1);
    _getParams();
    popupArray.splice(ind, 0, provName+': Логин', provName+': Пароль');
    popupDetail.splice(ind, 0, 'Ввод логина '+provName+' (после изменения нужно перезапустить плеер)', 'Ввод пароля '+provName+' (после изменения нужно перезапустить плеер)');
    popupActions.splice(ind, 0, edit_login, edit_pass);
}

function edit_login(){
    editCaption = 'Редактирование логина '+provName;
    editvar = login;
    setEdit = function(){
        if(editvar.length != 8){
            alert('Для доступа необходимо ввести Логин (8 символов)!');
            showEditKey([0,2]);
            return;
        }
        login = editvar;
        providerSetItem('login', login);
    };
    showEditKey([0,2]);
}
function edit_pass(){
    editCaption = 'Редактирование пароля '+provName;
    editvar = pass;
    setEdit = function(){
        if(editvar.length != 8){
            alert('Для доступа необходимо ввести Пароль (8 символов)!');
            showEditKey([0,2]);
            return;
        }
        pass = editvar;
        providerSetItem('pass', pass);
    };
    showEditKey([0,2]);
}
