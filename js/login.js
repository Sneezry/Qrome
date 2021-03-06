$(function(){
    showBackground();
    resizeWindow();
    autocompleteForAccount();
    
    // 虚拟键盘
    s_showKeyboard = false;
    $('#password').keyboard({
        openOn   : null,
        stayOpen : true,
        layout   : 'international',
        usePreview : false,
        autoAccept : true,
        position : {
            of : $('body'),
            my : 'center bottom',
            at : 'center bottom',
        },
        layout: 'custom',
        customLayout: {
            'default': [
                '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
                'q w e r t y u i o p [ ] \\',
                '{shift} a s d f g h j k l ; \'',
                'z x c v {space} b n m , . /'
            ],
            'shift': [
                '~ ! @ # $ % ^ & * ( ) _ + {bksp}',
                'Q W E R T Y U I O P { } |',
                '{shift} A S D F G H J K L : "',
                'Z X C V {space} B N M < > ?',
            ]
        },
        display: {
            'bksp' : '←:Backspace'
        },
        visible: function() {
            s_showKeyboard = true;
        },
        hidden: function() {
            s_showKeyboard = false;
        }
    });
    $('#toggleKeyboard').click(function(e){
        e.preventDefault();
        if(!s_showKeyboard) {
            $('#password').getkeyboard().reveal();
        }
        else {
            $('#password').getkeyboard().accept();
        }
    });
    
    // 选择登录状态
    $('#stateList li').each(function(){
        $(this).click(function(){
            $('#state').attr('state', $(this).attr('state'));
            $('#stateList').hide();
            return false;
        });
    });
    
    $('#fit').click(function(){
        resizeWindow();
    });
    
    $('#settings').click(function(){
        window.open('settings.html', '_blank');
    });
    
    // 下拉选择账号
    s_showAccountList = false;
    $('#chooseAccount').click(function(){
        if(s_showAccountList) {
            hideAccountList();
        }
        else {
            showAccountList();
        }
    });
});

function showAccountList() {
    $('#chooseAccount').children('span').removeClass('icon-down').addClass('icon-up');
    $('#account').autocomplete( "search", "" );
    
    s_showAccountList = true;
}
function hideAccountList() {
    $('#chooseAccount').children('span').removeClass('icon-up').addClass('icon-down');
    $('#account').autocomplete( "close" );
    
    s_showAccountList = false;
}

/**
 * 根据时间段显示不同登录背景
 */
function showBackground(){
    var timeClass = '';
    
    var time = new Date();
    var hours = time.getHours();
    if (0 <= hours && hours < 4) {
        timeClass = 'night';
    }
    else if (4 <= hours && hours < 5) {
        timeClass = 'beforedawn';
    }
    else if (5 <= hours && hours < 7) {
        timeClass = 'dawn';
    }
    else if (7 <= hours && hours < 10) {
        timeClass = 'morning';
    }
    else if (10 <= hours && hours < 14) {
        timeClass = 'noon';
    }
    else if (14 <= hours && hours < 17) {
        timeClass = 'afternoon';
    }
    else if (17 <= hours && hours < 19) {
        timeClass = 'dusk';
    }
    else if (19 <= hours && hours < 22) {
        timeClass = 'evening';
    }
    else if (22 <= hours && hours < 24) {
        timeClass = 'night';
    }
    
    $('body').addClass(timeClass);
}

/**
 * 重新计算登录窗口大小
 */
function resizeWindow(){
    chrome.windows.getCurrent(function(w) {
        var width = window.innerWidth;
        var height = window.innerHeight;
        var fwidth = w.width;
        var fheight = w.height;
        console.log(fwidth);
        console.log(fheight);
        
        if(width != 380){
            var fullWidth = fwidth + 380 - width;
            console.log(fullWidth);
        }
        if(height != 292){
            var fullHeight = fheight + 292 - height;
            console.log(fullHeight);
        }
        
        chrome.windows.update(chrome.windows.WINDOW_ID_CURRENT, {
            width: fullWidth,
            height: fullHeight
        });
    });
}

/**
 * 号码自动提示
 */
function autocompleteForAccount(){
    var historyAccounts = [];
    var loginHistory = localStorage.loginHistory;
    if (typeof(loginHistory) == 'undefined') {
        var arrLoginHistory = [];
    }
    else {
        var arrLoginHistory = JSON.parse(loginHistory);
    }
    for(var i = arrLoginHistory.length; i > 0; i --) {
        historyAccounts.push({value:arrLoginHistory[i-1], data:arrLoginHistory[i-1]});
    }
    $('#account').autocomplete({
        source: historyAccounts,
        delay: 0,
        minLength: 0
    });
    
    $('#account').focus();
    if(typeof(historyAccounts[0])!='undefined') {
        $('#account').val(historyAccounts[0].value);
        $('#password').focus();
    }
}

var login = false;
var stateListHover = false;

window.onunload = function(){
	chrome.extension.sendMessage('clogin');
}

document.getElementById('regacc').onclick = function(){
	window.open('http://ptlogin2.qq.com/qq_signup', '_blank');
}

document.getElementById('fgtpwd').onclick = function(){
	window.open('http://ptlogin2.qq.com/forget_pwd', '_blank');
}

chrome.extension.onMessage.addListener(function(request, sender) {
	if(request == 'finish'){
		self.close();
	}
	else if(request == 'cancel'){
		if(!localStorage.logout && localStorage.autoLogin && localStorage.account && localStorage.password){
			localStorage.autoShow = 'true';
		}
		login = false;
		document.getElementById('loginButtonInner').innerHTML = '登&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;录';
		document.getElementById('beforeLogin').style.display = 'block';
		document.getElementById('afterLogin').style.display = 'none';
	}
});

var logining = location.search.substr(1);
if(logining == '101'){
	login = true;
	document.getElementById('loginButtonInner').innerHTML = '取&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;消';
	document.getElementById('beforeLogin').style.display = 'none';
	document.getElementById('afterLogin').style.display = 'block';
}

if(localStorage.rememberPwd){
	document.getElementById('rememberPwd').checked = 'checked';
}

if(localStorage.autoLogin){
	document.getElementById('autoLogin').checked = 'checked';
}

if(localStorage.account){
	document.getElementById('account').value = localStorage.account;
}

if(localStorage.password){
	document.getElementById('password').value = encodeURIComponent(localStorage.password);
}

if(localStorage.state){
	document.getElementById('state').setAttribute('state', localStorage.state);
}

document.getElementById('loginButtonInner').onclick = doLogin;

document.getElementById('state').onclick = function(){
	document.getElementById('stateList').style.display = 'block';
}

document.getElementById('state').onmouseover = function(){
	stateListHover = true;
}

document.getElementById('state').onmouseout = function(){
	stateListHover = false;
}

document.getElementById('account').onkeydown = function(){
	if(event.keyCode==13){
		doLogin();
		return false;
	}
}

document.getElementById('password').onkeydown = function(){
	if(event.keyCode==13){
		doLogin();
		return false;
	}
}

document.getElementById('rememberPwd').onclick = function(){
	if(this.checked){
		localStorage.rememberPwd = 'true';
	}
	else{
		localStorage.rememberPwd = '';
		localStorage.account = '';
		localStorage.password = '';
		localStorage.state = '';
		localStorage.autoLogin = '';
		document.getElementById('autoLogin').checked = '';
	}
}

document.getElementById('autoLogin').onclick = function(){
	if(this.checked){
		localStorage.autoLogin = 'true';
		document.getElementById('rememberPwd').checked = 'checked';
	}
	else{
		localStorage.autoLogin = '';
	}
}

window.onclick = function(){
	if(!stateListHover){
		document.getElementById('stateList').style.display = 'none';
	}
}

function doLogin(){
	if(login){
		chrome.extension.sendMessage('cancel');
		return;
	}
	var account = document.getElementById('account').value;
	var password;
	try{
		password = decodeURIComponent(document.getElementById('password').value);
	}
	catch(e){
		password = document.getElementById('password').value;
	}
	var state = document.getElementById('state').getAttribute('state');
	if(!account) {
	    $('#account').focus();
	    return;
	}
	if(!password) {
	    $('#password').focus();
	    return;
	}
	if(account && password){
		if(document.getElementById('rememberPwd').checked){
			localStorage.account = account;
			localStorage.password = password;
			localStorage.state = state;
		}
		login = true;
		document.getElementById('loginButtonInner').innerHTML = '取&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;消';
		document.getElementById('beforeLogin').style.display = 'none';
		$('#currentAccount').html('（'+account+'）');
		document.getElementById('afterLogin').style.display = 'block';
		chrome.extension.sendMessage('login;'+encodeURIComponent(account)+';'+encodeURIComponent(password)+';'+encodeURIComponent(state));
	}
}