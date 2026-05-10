version += ' si-1218';
var login, pass, ts_hls;
parental = /18+/;
var shTarr = ['MPEGTS', 'HLS'];
mp4 = false; // for dunehd

function _getParams(){
    login = providerGetItem('login') || '';
    pass = providerGetItem('pass') || '';
    ts_hls = parseInt(providerGetItem('ts_hls')) || 0;
    if(browserName() != 'dune') try{
        var _pin = '', params = window.location.href.split('?')[1].split('&');
        params.forEach(function(item){
            var p = item.split('=');
            if(p[0]=='pin'){ _pin = p[1]; throw {}; }
        });
    }catch(e){}
    // console.log('pin',_pin);
    if(_pin){
        restart = function(){};
        showShift = function(){};
        getDataByPIN(_pin);
        window.location.href = window.location.href.split('?')[0];
    }
}

function getChannelPicon(ch_id){ return chanels[ch_id].logo; }
function getChannelUrl(ch_id){ return chanels[ch_id].url.split(ch_id)[0]+ch_id+['.mpegts', '/video.m3u8'][ts_hls]; }
function getArchiveUrl(ch_id, time, time_to){ return getChannelUrl(ch_id) + '?utc=' + Math.floor(time); }

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

    if(!login || !pass){
        alert('Логин или пароль отсутсвуют!');
        callback();
        return;
    }
    function aSuccess(data){
        try{
            // console.log(data);
            var ccat = '';
            var arrEXTINF = data.split('#EXTINF:');
            var aler_id = getAttribute(arrEXTINF[0], 'aler-id'),
                aler_msg = getAttribute(arrEXTINF[0], 'aler-msg');
            arrEXTINF.shift();
            arrEXTINF.forEach(function(val, i, arr){
                // console.log(val);
                var e = val.split('\n'),
                    cat = getAttribute(e[0], 'group-title'),
                    epg = getAttribute(e[0], 'tvg-id'),
                    logo = getAttribute(e[0], 'tvg-logo'),
                    rec = getAint(e[0], 'catchup-days')*24,
                    cn = _('??? No channel name'),
                    url = '',
                    n = 1;
                try { cn = e[0].split(',')[1].trim(); } catch(e) {}
                try { url = e[1].trim(); } catch(e) {}
                while (url.indexOf('#') === 0) {
                    if(url.indexOf('#EXTGRP:') != -1)
                        if(!cat) cat = url.split('#EXTGRP:')[1].trim();
                    try { url = e[++n].trim(); } catch(e) { url = ''; }
                }
                if((cat!='Сериалы')&&(cat!='Video on Demand')){
                    if(cat == '') cat = ccat;
                    else ccat = cat;
                    var ci = url.split('/')[5].split('.')[0];
                    addChan2cat(cat, ci);
                    if(url && (cList.indexOf(ci) == -1)){
                        cList.push(ci);
                        chanels[ci] = {ch_id: ci, channel_name: cn, category: {'class': catsArray.indexOf(cat)+2, 'name': cat}, rec: rec, time: 0, time_to: 0, url: url, logo: logo, epg: epg};
                    }
                }
            });
            if(aler_id&&aler_msg&&aler_id!=providerGetItem('aler_id')){
                providerSetItem('aler_id', aler_id);
                infoBox(aler_msg);
            }
        } catch(e) {
            console.log( "Exception: name " + e.name + ", message " + e.message + ", typeof " + typeof e );
            alert( _('Failed to load channel list!') );
        }
        callback();
    }
    loadPlaylist(url_list+login+'-'+pass, aSuccess, callback);
}

function getEPGchanel(ch_id, callback){
    var d = [];
    $.ajax({
        url: url_epg+'/get/?type=epg&ch='+chanels[ch_id].epg, dataType: 'json', timeout: 30000,
        success: function(data){ if(data) d = data; },
        // error: function(jqXHR, textStatus, errorThrown){ console.log( 'epg : ' + ch_id + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
        complete: function(){ callback(ch_id, d); },
    });
}

var _medias = [];
function _getMediaArray(callback){
    function it(val, title){ return val ? '<b>'+title+': </b>'+(Array.isArray(val)?val.join(', '):val)+'<br>' : ''; }
    function item2descr(name, info){
        return '<table>'
            + '<h2><center>'+name+'</center></h2>'
            + '<img id="detal" height="285" src="'+info.poster+'" style="float: left; margin-right: 5px; margin-bottom: 5px; border-width: 0px; border-style: solid;" width="210">'
            + it(info.year, 'Год')
            + it(info.genre, 'Жанр')
            + it(info.country, 'Страна')
            + it(info.rating, 'Рейтинг')
            // + it(item.info.actors, 'В ролях')
            + '<p><hr>'+it(info.plot, 'Описание')+'</p>'
            + '</table>';
    }
    $('#dialogbox').html('<img src="'+host+'/stbPlayer/buffering.gif" height="40"> Загрузка списка! Подождите ...').show();
    $.ajax({
        url: url_media+login+'-'+pass,
        dataType: 'json', timeout: 30000,
        success: function(data){
            try{
                // console.log(data);
                var cats = ['Все'], mcats = [], mvods = {'Все':[]};
                data.forEach(function(val){
                    if(val.video){
                        // console.log(val);
                        var cat = val.category || 'Без категории';
                        if(cats.indexOf(cat) == -1){
                            cats.push(cat);
                            mvods[cat] = [];
                        }
                        mvods['Все'].push({title: val.name, logo_30x30: val.info.poster, description: item2descr(val.name, val.info), stream_url: val.video});
                        mvods[cat].push({title: val.name, logo_30x30: val.info.poster, description: item2descr(val.name, val.info), stream_url: val.video});
                    }
                });
                cats.forEach(function(val){
                    mcats.push( {title: val, logo_30x30: '', description: '', playlist_url: {title: val, records: mvods[val]}} );
                });
                _medias.push( {title: 'Фильмы', logo_30x30: '', description: '', playlist_url: {title: 'Фильмы', records: mcats}} );

                cats = ['Все'], mcats = [], mvods = {'Все':[]};
                data.forEach(function(val){
                    if(val.seasons){
                        // console.log(val);
                        var cat = val.category || 'Без категории';
                        if(cats.indexOf(cat) == -1){
                            cats.push(cat);
                            mvods[cat] = [];
                        }
                        var s = [];
                        val.seasons.forEach(function(season){
                            var t = 'Сезон '+season.season,
                                si = season.info || val.info || {};
                            var e = [];
                            season.episodes.forEach(function(episode){
                                var t = 'Эпизод '+episode.episode,
                                    ei = episode.info || season.info || val.info || {};
                                e.push({title: t, logo_30x30: ei.poster, description: item2descr(t, ei), stream_url: episode.video});
                            });
                            s.push({title: t, logo_30x30: si.poster, description: item2descr(t, si), playlist_url: {title: t, records: e}});
                        });
                        mvods[cat].push({title: val.name, logo_30x30: val.info.poster, description: item2descr(val.name, val.info), playlist_url: {title: val.name, records: s}});
                        mvods['Все'].push({title: val.name, logo_30x30: val.info.poster, description: item2descr(val.name, val.info), playlist_url: {title: val.name, records: s}});
                    }
                });
                cats.forEach(function(val){
                    mcats.push( {title: val, logo_30x30: '', description: '', playlist_url: {title: val, records: mvods[val]}} );
                });
                _medias.push( {title: 'Сериалы', logo_30x30: '', description: '', playlist_url: {title: 'Сериалы', records: mcats}} );
                _medias.push( {title: _('Search'), description: _('Search'), playlist_url: 'search', search_on:1} );
            } catch(e) {
                console.log( "Exception: name " + e.name + ", message " + e.message + ", typeof " + typeof e );
                alert( "Ошибка обработки списка!!!" );
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log( 'vod : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown );
            alert( "Не удалось загрузить список! Проверьте правильность данных!!" );
        },
        complete: function(){
            $('#dialogbox').hide();
            mediaRecords = [].concat(_medias);
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
    if(murl === ''){
        mediaName = 'Медиатека';
        if(_medias.length) {
            mediaRecords = [].concat(_medias);
            callback();
        } else
            _getMediaArray(callback);
    }else{
        if(typeof(murl)==='string' && murl.indexOf('search')==0){
            var ss = murl.split('=')[1].toLowerCase();
            // console.log(_medias);
            mediaRecords = _medias[0].playlist_url.records[0].playlist_url.records.filter(function(val){ return val.title.toLowerCase().indexOf(ss)!=-1; });
            mediaRecords = mediaRecords.concat(_medias[1].playlist_url.records[0].playlist_url.records.filter(function(val){ return val.title.toLowerCase().indexOf(ss)!=-1; }));
            mediaName = _('Search')+':"'+ss+'"('+mediaRecords.length+')';
        } else {
            mediaName = murl.title;
            mediaRecords = murl.records;
        }
        callback();
    }
}

function doEditType(){
    if(++ts_hls>1) ts_hls = 0;
    providerSetItem('ts_hls', ts_hls);
    popupArray[popupActions.indexOf(doEditType)] = provName+': Тип потоков: '+shTarr[ts_hls];
    // showPage();
    // detailListAction();
    popupList(doEditType);
    if(!playType) playChannel(catIndex, primaryIndex);
    else if(playType>0) playArchive(playType + playTime);
}
function getDataByPIN(pin){
    $.ajax({
        url: url_pin, data: {k: pin},
        dataType: 'json', timeout: 20000,
        success: function(data){
            // console.log(data);
            if(data !== null)
                if(data.status != 1) showShift(data.status);
                else {
                    providerSetItem('login', data.user);
                    providerSetItem('pass', data.password);
                    showShift('Получены данные пользователя! Плеер будет перезапущен!');
                    restart();
                }
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log( 'get_user_data : : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown );
            alert( "get_user_data failed!" +'login : : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown);
        },
        async: false
    });
}
function doPIN(){
    editCaption = 'Введите ПИНкод из кабинета '+provName;
    editvar = '';
    setEdit = function(){
        if(editvar.length != 6){
            alert('Длина ПИНкода 6 символов!!!');
            showEditKey([0]);
            return;
        }
        getDataByPIN(editvar);
    };
    showEditKey([0]);
}
function doUserInfo(){
    aboutKeyHandler = function (code){ $('#listAbout').hide(); return true; };
    $('#listAbout').html('Загрузка. Подождите...').show();
    $.ajax({
        // url: 'https://conf.playtv.pro/api/ott-play-apiF4r.php?subscr='+login+'-'+pass,
        url: url_pin+'?subscr='+login+'-'+pass,
        dataType: 'json', timeout: 30000,
        success: function(data){
            // console.log(data);
            if(data !== null){
                if(data.status=='ok') $('#listAbout').html(data.html_msg);
                else $('#listAbout').html(data.status);
            } else $('#listAbout').html('Empty Answer');
        },
        error: function(jqXHR, textStatus, errorThrown){ $('#listAbout').html( 'ОШИБКА!<br/><br/>jqXHR:'+JSON.stringify(jqXHR)+ '<br/>textStatus: '+textStatus+ '<br/>errorThrown: '+errorThrown ); }
    });
}


version += ' shara.club-1118';
var provName = 'shara.club';
p_pref = 'shcl';
var uapi = 'http://conf.gazoni1.com',
    url_epg = 'http://api.gazoni1.com',
    url_list = uapi+'/tv_live-m3u_alex/',
    url_media = uapi+'/kino-ottn/',
    url_pin = uapi+'/api/ott-play-apiF4r.php';

function getProviderParams(){
    _getParams();
    ts_hls = 1;
    $("#login").val(login);
    $("#pass").val(pass);
    if((login.length < 4) || (pass.length < 6)) alert('Для доступа необходимо ввести Логин и пароль!');
    return (login.length >= 4) && (pass.length >= 6);
}
function setProviderParams(){
    providerSetItem("login", decodeURIComponent($("#login").val().trim()));
    var changed = login != providerGetItem("login");
    providerSetItem("pass", decodeURIComponent($("#pass").val().trim()));
    changed = changed || (pass != providerGetItem("pass"));
    _getParams();
    if((login.length < 4) || (pass.length < 6)) alert('Для доступа необходимо ввести Логин и пароль!');
    return changed;
}

function duneAddSettings(ind){
    if(isNaN(parseInt(providerGetItem('ts_hls')))) providerSetItem('ts_hls', 1);
    if(isNaN(parseInt(providerGetItem('sShowArchive')))) providerSetItem('sShowArchive', 1);
    _getParams();
    popupArray.splice(ind, 0, provName+': PIN', provName+': Логин', provName+': Пароль', provName+': Тип потоков: '+shTarr[ts_hls], provName+': Информация о подписке');
    popupDetail.splice(ind, 0, 'Получение данных по ПИНкоду из кабинета на сайте', 'Ввод логина '+provName+' (после изменения нужно перезапустить плеер)', 'Ввод пароля '+provName+' (после изменения нужно перезапустить плеер)', 'Выберите тип потоков', '');
    popupActions.splice(ind, 0, doPIN, edit_login, edit_pass, doEditType, doUserInfo);
}
function edit_login(){
    editCaption = 'Редактирование логина '+provName;
    editvar = login;
    setEdit = function(){
        if(editvar.length < 4){
            alert('Для доступа необходимо ввести Логин!');
            showEditKey([0,1,2]);
            return;
        }
        login = editvar;
        providerSetItem('login', login);
    };
    showEditKey([0,1,2]);
}
function edit_pass(){
    editCaption = 'Редактирование пароля '+provName;
    editvar = pass;
    setEdit = function(){
        if(editvar.length < 6){
            alert('Для доступа необходимо ввести Пароль!');
            showEditKey([0,1,2]);
            return;
        }
        pass = editvar;
        providerSetItem('pass', pass);
    };
    showEditKey([0,1,2]);
}
