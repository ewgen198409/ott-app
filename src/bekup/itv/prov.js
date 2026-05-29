version += ' itv.live-1217';
var itvkey, itvmpeg, wwwapi='http://api.01cdn.wf/';//'http://api.itv.live/';
p_pref = 'itv';
parental = /Взрослый/;

function _getParams(){
    itvkey = providerGetItem('key') || '';
    itvmpeg = parseInt(providerGetItem('mpeg')) || 0;
}

function getProviderParams(){
    _getParams();
    $("#itvkey").val(itvkey);
    if((itvkey.length < 10) || (itvkey.length > 12)) alert('Для доступа необходимо ввести ключ! (Ключ для плеера 10-12 символов)');
    return itvkey;
}
function setProviderParams(){
    providerSetItem("key", decodeURIComponent($("#itvkey").val().trim()));
    var changed = itvkey != providerGetItem("key");
    _getParams();
    if((itvkey.length < 10) || (itvkey.length > 12)) alert('Для доступа необходимо ввести ключ! (Ключ для плеера 10-12 символов)');
    return changed;
}

function getChannelPicon(ch_id){ return wwwapi+'/icon/'+ch_id; }
function getChannelUrl(ch_id){
    return 'http://'+chanels[ch_id].server_cdn+'/'+ch_id+'/'+['index.m3u8','mpegts','video.m3u8'][itvmpeg]+'?token='+chanels[ch_id].token;
}
function getArchiveUrl(ch_id, time, time_to){
    if(time_to < time) time_to = Date.now()/1000+600;
    // if((itvmpeg==1)||(time_to > Date.now()/1000)) // мпег или текущая передача
    if((itvmpeg==1)||(time > Date.now()/1000-600)) // мпег или последние 10 минут
        return 'http://'+chanels[ch_id].server_cdn+'/'+ch_id+'/'+['timeshift_abs-', 'timeshift_abs/', 'timeshift_abs_video-'][itvmpeg]+Math.floor(time)+['.m3u8', '', '.m3u8'][itvmpeg]+'?token='+chanels[ch_id].token;
    else {
        if(browserName() == 'dune') time_to = Math.floor(time_to) + 7200;
        return 'http://'+chanels[ch_id].server_cdn+'/'+ch_id+'/'+['index-', '', 'video-'][itvmpeg]+Math.floor(time)+'-'+ Math.floor(time_to-time)+'.m3u8?token='+chanels[ch_id].token;
    }
}

function getChanelsArray(callback){
    $.ajax({
        url: wwwapi+'data/'+itvkey, dataType: 'json', timeout: 30000,
        success: function(data){
            data.channels.forEach(function(val){
                if(cList.indexOf(val.ch_id) == -1){
                    cList.push(val.ch_id);
                    chanels[val.ch_id] = {channel_name: val.channel_name, category: {'class': val.cat_id, 'name': val.cat_name}, rec: val.rec_time, time: 0, time_to: 0, server_cdn: val.server_cdn, token: val.token };
                }
            });
        },
        complete: function(jqXHR, textStatus){ callback(); },
    });
}
if(typeof sNextCount == 'undefined') sNextCount = -1;
function _getEPGchanel(ch_id, callback, all){
    var d = [];
    $.ajax({
        url: wwwapi+'epg/'+ch_id+(all?'':'/'+(sNextCount+2)), dataType: 'json', timeout: 10000,
        success: function(data){ try{ data.res.forEach(function(val){ d.push( {time: val.startTime, time_to: val.stopTime, name: val.title, descr: val.desc} ); }); } catch(e){} },
        complete: function(jqXHR, textStatus){ callback(ch_id, d); },
    });
}
function getEPGchanel(ch_id, callback){ _getEPGchanel(ch_id, callback, true); }
function getEPGchanelCur(ch_id, callback){ _getEPGchanel(ch_id, callback, false); }

var itvTarr = ['HLS(a)', 'MPEGTS', 'HLS(v)'];
function duneAddSettings(ind){
    if(isNaN(parseInt(providerGetItem('mpeg')))&&(navigator.userAgent.indexOf("Tizen")!=-1)) providerSetItem('mpeg', 2);
    _getParams();
    popupArray.splice(ind, 0, 'Ключ доступа iTV.Live', 'Тип потоков: '+itvTarr[itvmpeg], 'Информация о подписке');
    popupDetail.splice(ind, 0, 'Ввод ключа доступа iTV.Live (Ключ для плеера)', 'Выберите тип потоков:<br>'+itvTarr.join(', '),'');
    popupActions.splice(ind, 0, doEditKey, doEditType, doUserInfo);
}

function doEditKey(){
    editCaption = 'Редактирование ключа доступа iTV.Live (Ключ для плеера)';
    editvar = itvkey;
    setEdit = function(){
        if(itvkey == editvar) return;
        if((editvar.length < 10) || (editvar.length > 12)){
            alert('Для доступа необходимо ввести ключ! (Ключ для плеера 10-12 символов)');
            showEditKey([0,1]);
        } else {
            // itvkey = editvar;
            providerSetItem('key', editvar);
            restart();
        }
    };
    showEditKey([0,1]);
}
function doEditType(){
    if(++itvmpeg==itvTarr.length) itvmpeg = 0;
    providerSetItem('mpeg', itvmpeg);
    popupArray[popupActions.indexOf(doEditType)] = 'Тип потоков: '+itvTarr[itvmpeg];
    listArray[selIndex].name = 'Тип потоков: '+itvTarr[itvmpeg];
    showPage();
    if(!playType) playChannel(catIndex, primaryIndex);
    else if(playType>0) playArchive(playType + playTime);
}

function doUserInfo(){
    aboutKeyHandler = function (code){ $('#listAbout').hide(); return true; };
    $('#listAbout').html('Загрузка. Подождите...').show();
    $.ajax({
        url: wwwapi+'data/'+itvkey, dataType: 'json', timeout: 30000,
        success: function(data){
            if(data !== null){
                var pi = [];
                data.package_info.forEach(function(val){ pi.push(val.name); });
                $('#listAbout').html('Информация о подписке:<br/>'+
                    '<br/>Логин: ' + data.user_info.login +
                    '<br/>Баланс,$: ' + data.user_info.cash +
                    '<br/>Система: ' + ['','Предоплата','Постоплата'][data.user_info.pay_system] +
                    '<br/>Пакеты: ' + pi.join(', ')
                );
            }
        },
        error: function(jqXHR, textStatus, errorThrown){ $('#listAbout').html( 'get_user_info failed!<br/><br/>jqXHR:'+JSON.stringify(jqXHR)+ '<br/>textStatus: '+textStatus+ '<br/>errorThrown: '+errorThrown ); }
    });
}
