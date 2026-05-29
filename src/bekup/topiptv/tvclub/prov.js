version += ' tvclub-1224';
var login, pass, provName = 'TVClub', _apiurl = 'http://api.iptv.so/0.9/json/', _token;
p_pref = 'tvclub';
parental = /Для взрослых|Adults/;

function _getParams(){
    login = providerGetItem('login') || '';
    pass = providerGetItem('pass') || '';
}

function getChannelPicon(ch_id){ return 'http://api.iptv.so/logo/original/'+ch_id+'.png'; }
function getChannelUrl(ch_id){
    var url='';
    $.ajax({
        url: _apiurl+'live', data: {cors:'', token:_token, cid:ch_id, protected:'0000'},
        dataType: 'json', timeout: 10000, async:false,
        success: function(data){try{
            // console.log(data);
            url = data.live.url;
        }catch(e){}},
        error: function(jqXHR){ console.log( 'channels : jqXHR:'+JSON.stringify(jqXHR)); }
    });
    return url;
}
function getArchiveUrl(ch_id, time, time_to){
    var url='';
    $.ajax({
        url: _apiurl+'rec', data: {cors:'', token:_token, cid:ch_id, time: time, protected:'0000'},
        dataType: 'json', timeout: 10000, async:false,
        success: function(data){try{
            // console.log(data);
            url = data.rec.url;
        }catch(e){}},
        error: function(jqXHR){ console.log( 'channels : jqXHR:'+JSON.stringify(jqXHR)); }
    });
    return url;
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
    var MD5 = function(d){result = M(V(Y(X(d),8*d.length)));return result.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_}
    var gro = {};
    _token = MD5(login+MD5(pass));
    var lang = {'_rus':'ru', '_ukr':'ru', '_bel':'ru'}[stbGetItem("ottplaylang")]||'en';
    $.ajax({
        url: _apiurl+'groups', data: {cors:'',limit:1000,token: _token, lang:lang},
        dataType: 'json', timeout: 10000,
        success: function(data){try{
            // console.log(data);
            data.groups.forEach(function(val){ gro[val.id] = val.name; });
        }catch(e){}},
        error: function(jqXHR){ console.log( 'groups : jqXHR:'+JSON.stringify(jqXHR)); },
        complete: function(){
            $.ajax({
                url: _apiurl+'channels', data: {cors:'',limit:10000,token: _token, gid:'all', epg:'no'},
                dataType: 'json', timeout: 10000, //async:false,
                success: function(data){try{
                    // console.log(data);
                    data.channels.forEach(function(val){
                        // console.log(val);
                        addChan2cat(gro[val.info.groups]||'', val.info.id);
                        cList.push(val.info.id);
                        chanels[val.info.id] = {channel_name: val.info.name, category: {'class': catsArray.indexOf(val.info.groups)+2, 'name': gro[val.info.groups]||''}, rec: val.info.records,
                        // time: val.epg.start, time_to: val.epg.end, name: val.epg.text, descr: val.epg.description,
                        time: 0, time_to: 0
                        };
                    });
                }catch(e){}},
                error: function(jqXHR){ console.log( 'channels : jqXHR:'+JSON.stringify(jqXHR)); },
                complete: function(){
                    if(!cList.length && stbGetItem('noProvParam')!=1) setTimeout(doEditData);
                    callback();
                },
            });
        },
    });
}
if(typeof sNextCount == 'undefined') sNextCount = -1;
function getEPGchanelCur(ch_id, callback){
    var d = [];
    $.ajax({
        url: _apiurl+'epg', data: {cors:'', limit:2000, token: _token, channels:ch_id, c_to:sNextCount+2},
        dataType: 'json', timeout: 10000, cache: false,
        success: function(data){try{
            // console.log(data);
            if(data) data.epg.channels[0].epg.forEach(function(val){ d.push( {time: val.start, time_to: val.end, name: val.text, descr: val.description} ); });
        }catch(e){}},
        // error: function(jqXHR, textStatus, errorThrown){ console.log( 'epg : ' + ch_id + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
        complete: function(){ callback(ch_id, d); },
    });
}
function getEPGchanel(ch_id, callback){
    var d = [];
    $.ajax({
        url: _apiurl+'epg', data: {cors:'', limit:2000, token:_token, channels:ch_id, period:'all'},
        dataType: 'json', timeout: 10000, cache: false,
        success: function(data){try{
            // console.log(data);
            if(data) data.epg.channels[0].epg.forEach(function(val){ d.push( {time: val.start, time_to: val.end, name: val.text, descr: val.description} ); });
        }catch(e){}},
        // error: function(jqXHR, textStatus, errorThrown){ console.log( 'epg : ' + ch_id + ' : jqXHR:'+JSON.stringify(jqXHR)+ '; textStatus: '+textStatus+ ', errorThrown: '+errorThrown ); },
        complete: function(){ callback(ch_id, d); },
    });
}

function duneAddSettings(ind){
    if(isNaN(parseInt(providerGetItem('sShowArchive')))) providerSetItem('sShowArchive', 1);
    // if(isNaN(parseInt(providerGetItem('sShowPikon')))) providerSetItem('sShowPikon', 0);
    delPopup(restart);
    _getParams();
    popupArray.splice(ind, 1, _('Access settings')+' '+provName);
    popupDetail.splice(ind, 1, '');
    popupActions.splice(ind, 1, doEditData);
}
var _account;
function doGetData(){
    $.ajax({
        url: _apiurl+'account', data: {cors:'', limit:2000, token:_token},
        dataType: 'json', timeout: 10000, async:false,
        success: function(data){
            // console.log(data);
            if(data.account){
                _account = data.account;
                $.ajax({
                    url: _apiurl+'servers', data: {cors:'', limit:2000, token:_token},
                    dataType: 'json', timeout: 10000, async:false,
                    success: function(data){
                        // console.log(data);
                        if(data.servers) _account.servers = data.servers;
                        console.log(_account);
                    }
                });
            }
        }
    });
}
function doEditData(){
    var servArr = [];
    doGetData();

    if(_account&&_account.servers) _account.servers.forEach(function(val){ servArr.push(val.name+' ('+val.load+'%)'); });
    selIndex = 0;
    var r = _(' (after changing, load playlist)'),//_(' (after changing, restart player)'),
        aDetail = [
            _('Enter username')+r,
            _('Enter password')+r,
            _('select')+':<br>'+servArr.join('<br>'),
            _('Account info'),
            '', _('Load playlist')//_('Restart player')
        ];
    listArray = [
        _('Username')+': '+login,
        _('Password'),
        _('Server')+': '+(_account&&_account.settings?_account.settings.server_name:''),
        _('Account info'),
        '', (sNoNumbersKeys?'':'<div class="btn">8</div> ')+_('Load playlist')//_('Restart player')
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
            case keys.RIGHT: if(selIndex!=2) return false;
            case keys.ENTER:
                switch (selIndex) {
                    case 0: edit_login(); return true;
                    case 1: edit_pass(); return true;
                    case 2: doEditServ(a); return true;
                    case 3: doAccount(); return true;
                    case 5: loadChannels(); return true; // restart();
                }
                return true;
            case keys.RETURN: popupList(popupActions.indexOf(noProvParam)+1); return true;
            case keys.N8: restart(); return true;
            default: return false;
        }
    };
    listDetail.innerHTML = '';
    listCaption.innerHTML = _('Access settings')+' '+provName;
    $('#listPopUp').hide();

    showPage();
}
function edit_login(){
    editCaption = _('Enter username')+' '+provName;
    editvar = login;
    setEdit = function(){
        login = editvar;
        providerSetItem('login', login);
        listArray[0] = _('Username')+': '+login;
        showPage();
        detailListAction();
    };
    showEditKey();
}
function edit_pass(){
    editCaption = _('Enter password')+' '+provName;
    editvar = pass;
    setEdit = function(){ pass = editvar; providerSetItem('pass', pass); };
    showEditKey();
}
function doEditServ(a){
    if(!_account||!_account.servers) return;
    var servArr = [];
    _account.servers.forEach(function(val){ servArr.push(val.id); });
    var serv = servArr.indexOf(_account.settings.server_id);
    serv+=a;
    if(serv==servArr.length) serv = 0;
    if(serv<0) serv = servArr.length-1;
    $.ajax({
        url: _apiurl+'set', data: {cors:'', limit:2000, token:_token, server: servArr[serv]},
        dataType: 'json', timeout: 10000, async:false,
        // success: function(data){ console.log(data); }
    });
    doGetData();
    listArray[2] = _('Server')+': '+(_account&&_account.settings?_account.settings.server_name:'');
    showPage();
    detailListAction();
    if(!playType) playChannel(catIndex, primaryIndex);
    else if(playType>0) playArchive(playType + playTime);
    // else{ setCurrent(catIndex, -1); playType=-100000000001; playMedia(___med); }
}
function doAccount(){
    function d2(dat){
        function t2(a){return (a.toString().length == 1) ? '0'+a : a;}
        var nw = new Date(dat*1000);
        return t2(nw.getDate()) + '.' + t2(nw.getMonth()+1) + '.' + nw.getFullYear();
    }
    if(!_account||!_account.servers) return;
    aboutKeyHandler = function (code){ $('#listAbout').hide(); return true; };
    $('#listAbout').html(_('Account info')+
        ':<br/><br/>login: ' + _account.info.login+
        '<br/>name: ' + _account.info.name+
        '<br/>balance: ' + _account.info.balance + '<br/>'
    ).show();
    _account.services.forEach(function(val){ $('#listAbout').append('<br/>' + val['type'] +' '+ val.name +' '+ d2(val.expire)); });
}
