version += ' shura-1018';
p_pref = 'sh';
parental = /XXX/;
var shserver, shkey, mpeg;

function _getParams(){
    shkey = providerGetItem('key') || '';
    shserver = providerGetItem('server');
    if(!shserver) shserver = '1';
    mpeg = parseInt(providerGetItem('mpeg')) || 0;
}
function getProviderParams(){
    _getParams();
    $("#shserver").val(shserver);
    $("#shkey").val(shkey);
    if(!shkey) alert('Для доступа необходимо ввести ключ!');
    return shkey;
}
function setProviderParams(){
    providerSetItem("server", $("#shserver").val());
    providerSetItem("key", decodeURIComponent($("#shkey").val().trim()));
    _getParams();
    if(shkey.length < 8) alert('Для доступа необходимо ввести ключ!');
    return false;
}

function getChannelPicon(ch_id){
    return 'http://s' + shserver + '.tvshka.net:81/picon/'+ch_id+'.png';
}
function getChannelUrl(ch_id){
    return 'http://s' + shserver + '.tvshka.net/~' + shkey + '/' + ch_id + '/' + (mpeg ? '' : 'hls/pl.m3u8');
}
function getArchiveUrl(ch_id, time, time_to){
    return getChannelUrl(ch_id) + '?archive=' + Math.floor(time);
}

function getChanelsArray(callback){
    function getAttribute(text, attribute){
        var a = text.split(attribute + '=');
        if(a.length==1 || a[1].length==0) return '';
        if(a[1][0]=='"') return a[1].split('"')[1] || '';
        else return a[1].split(/[ ,]+/)[0] || '';
    }
    function aSuccess(data){
        // console.log(data);
        var cats = [], arrEXTINF = data.split('#EXTINF:');
        arrEXTINF.shift();
        arrEXTINF.forEach(function(val){
            // console.log(val);
            var e = val.split('\n'), cat = getAttribute(e[0], 'group-title'),
                // epg = getAttribute(e[0], 'tvg-id'), logo = getAttribute(e[0], 'tvg-logo'), cn = e[0].split(',')[1].trim(),
                ci = null;
            try { var ci = e[1].split('/')[4]; } catch(e){}
            if(chanels[ci]){
                if(cats.indexOf(cat) == -1) cats.push(cat);
                chanels[ci].category = {'class': cats.indexOf(cat)+2, 'name': cat};
                // chanels[ci].epg = epg; chanels[ci].logo = logo;
            }
        });
        // console.log(chanels);
        callback();
    }
    $.ajax({
        url: 'http://pl.tvshka.net', data: {uid: 'shxxxxxxxxxxx', type:'jsonp'},
        dataType: "jsonp", timeout: 10000,
        success: function(data){
            // console.log(data);
            data.forEach(function(val, i, arr){
                cList.push(val.id);
                chanels[val.id] = {channel_name: val.name, category: {'class': 0}, rec: val.archive, time: 0, time_to: 0};//ch_id: val.id,
            });
        },
        error: function(jqXHR, textStatus, errorThrown){ console.log( 'channels : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus:'+textStatus+ ' ,errorThrown: '+errorThrown ); },
        complete: function(jqXHR, textStatus){
            var www = 'http://pl.tvshka.net/?uid=shxxxxxxxxxxx&srv=1&type=halva'; //'http://soveni.leolitz.info/shura/shura_epg_ico.m3u8'
            $.ajax({
                url: www, dataType: 'text', timeout: 10000, success: aSuccess,
                error: function(){
                    $.ajax({
                        url: host+'/m3u/cp.php', data: {url: '@'+www}, method: 'post', dataType: 'text', timeout: 10000, success: aSuccess,
                        error: function(jqXHR, textStatus, errorThrown){
                            console.log( 'channels : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown );
                            // alert( _('Failed to load channel list!') );
                            callback();
                        },
                    });
                },
            });
        },
    });
}

function val2epg(v){
    return {time: v.start_time, time_to: v.start_time+v.duration, duration: v.duration, name: v.name, descr: v.text}
}
function getEPGchanel(ch_id, callback){
    var d = null;
    $.ajax({
        url: 'http://s' + shserver + '.tvshka.net/' + ch_id + '/epg/week.jsonp',
        dataType: "jsonp", timeout: 10000,
        success: function(data){
            if(data !== null){
                d = [];
                data.forEach(function(val, i, arr){ d.push( val2epg(val) ); });
            }
        },
        // error: function(jqXHR, textStatus, errorThrown){ console.log( ch_id+' : '+chanels[ch_id].channel_name+' : week : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus:'+textStatus+ ' ,errorThrown: '+errorThrown ); },
        complete: function(jqXHR, textStatus){
            $.ajax({
                url: 'http://s' + shserver + '.tvshka.net/' + ch_id + '/epg/' + ((chanels[ch_id].rec == '0') ? 'pf.jsonp' : 'archive.jsonp'),
                dataType: "jsonp", timeout: 10000,
                success: function(data){
                    if(data !== null){
                        if(!d) d = [];
                        if(chanels[ch_id].rec == '0') data.pop();
                        data.forEach(function(val, i, arr){ d.unshift( val2epg(val) ); });
                    }
                },
                // error: function(jqXHR, textStatus, errorThrown){ console.log( ch_id+' : '+chanels[ch_id].channel_name+' : archive : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus:'+textStatus+ ' ,errorThrown: '+errorThrown ); },
                complete: function(jqXHR, textStatus){ callback(ch_id, d); },
            });
        },
    });
}
function getEPGchanelCur(ch_id, callback){
    var d = null;
    $.ajax({
        url: 'http://s' + shserver + '.tvshka.net/' + ch_id + '/epg/pf.jsonp',
        dataType: "jsonp", timeout: 10000,
        success: function(data){
            if(data !== null){
                d = [];
                data.forEach(function(val, i, arr){ d.push( val2epg(val) ); });
            }
        },
        // error: function(jqXHR, textStatus, errorThrown){ console.log( ch_id+' : '+chanels[ch_id].channel_name+' : week : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus:'+textStatus+ ' ,errorThrown: '+errorThrown ); },
        complete: function(jqXHR, textStatus){ callback(ch_id, d); },
    });
}
var cbTarr = ['HLS', 'MPEGTS'];
function duneAddSettings(ind){
    if(isNaN(parseInt(providerGetItem('sShowArchive')))) providerSetItem('sShowArchive', 1);
    _getParams();
    popupArray.splice(ind, 0, 'Шура ТВ: номер сервера', 'Шура ТВ: Ключ доступа', 'Шура ТВ: Тип потоков: '+cbTarr[mpeg]);
    popupDetail.splice(ind, 0, 'Ввод номера сервера Шура ТВ', 'Ввод ключа доступа Шура ТВ', 'Выберите тип потоков: HLS или MPEGTS');
    popupActions.splice(ind, 0, edit_shserver, edit_shkey, doEditType);
}

function edit_shserver(){
    editCaption = 'Редактирование номера сервера Шура ТВ<br/>Только 1, 2, 3 или 5 !!!';
    editvar = shserver;
    setEdit = function(){ shserver = editvar; providerSetItem('server', shserver); playChannel(catIndex, primaryIndex); };
    showEditKey([0]);
}
function edit_shkey(){
    editCaption = 'Редактирование ключа доступа Шура ТВ';
    editvar = shkey;
    setEdit = function(){ shkey = editvar; providerSetItem('key', shkey); playChannel(catIndex, primaryIndex); };
    showEditKey([0,1,2]);
}
function doEditType(){
    if(++mpeg==2) mpeg = 0;
    providerSetItem("mpeg", mpeg);
    popupArray[popupActions.indexOf(doEditType)] = 'Шура ТВ: Тип потоков: '+cbTarr[mpeg];
    // showPage();
    popupList(doEditType);
    playChannel(catIndex, primaryIndex);
}
