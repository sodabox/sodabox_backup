var SODABOX_conf = {
	httpUrl 	: "http://www.sodabox.io",
	serverInfo 	: {},
	divName 	: "SODABOX_SCREEN",
	refer 		: "",
	user 		: {},
	isLogined 	: false,
	sock 		: {},
	socketId 	: "",
	currentUserCnt : 0
}

var SODABOX_utils = {

     getHashCode : function(s){
        var hash = 0;
        if (s.length === 0) return hash;
        for (var i = 0; i < s.length; i++) {
                var char1 = s.charCodeAt(i);
                hash = ((hash<<5)-hash)+char1;
                hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    },

    loadScript :  function(url, callback){
        var script = document.createElement("script");
        script.type = "text/javascript";
        if (script.readyState){  //IE
            script.onreadystatechange = function(){
                if (script.readyState == "loaded" ||
                        script.readyState == "complete"){
                    //script.onreadystatechange = null;
                    callback();
                }
            };
        } else {  //Others
            script.onload = function(){
                callback();
            };
        }
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    },
	
	loadCss : function (url) {
		var link = document.createElement('link');
		link.type = 'text/css';
		link.rel = 'stylesheet';
		link.href = url;
		document.getElementsByTagName('head')[0].appendChild(link);
		return link;
	},
	
    loadJson : function(url, callbackStr){

        var script = document.createElement("script");
        // Add script object attributes
        script.type     = "text/javascript";
        script.charset  = "utf-8";
        script.id       = this.getHashCode(url);

        if (script.readyState){  //IE
            script.onreadystatechange = function(){
                if (script.readyState == "loaded" ||
                        script.readyState == "complete"){
                    //script.onreadystatechange = null;
                    // DO Something?
                }
            };
        } else {  //Others
            script.onload = function(){
               // DO Something?
            };
        }
        script.src = url + '&callback='+callbackStr+'&_noCacheIE=' + (new Date()).getTime();
        console.log(script.src);
        //document.getElementsByTagName("head").item(0).removeChild(script);
        document.getElementsByTagName("head")[0].appendChild(script);

    },
    
    setUserInfo : function(userInfo)
	{
		var date = new Date();
		date.setDate(date.getDate() + 10);
		document.cookie = 'SODABOX=' + escape(JSON.stringify(userInfo)) + 
		';expires=' + date.toGMTString()+';path=/';
	},
	
	delUserInfo : function() {
		var date = new Date(); 
		var validity = -1;
		date.setDate(date.getDate() + validity);
		document.cookie = "SODABOX=;expires=" + date.toGMTString()+';path=/';
	},
	getUserInfo : function() {
		var allcookies = document.cookie;
		var cookies = allcookies.split("; ");
		for ( var i = 0; i < cookies.length; i++) {
			var keyValues = cookies[i].split("=");
			if (keyValues[0] == "SODABOX") {
				console.log(keyValues[1]);
				return JSON.parse(unescape(keyValues[1]));
			}
		}
		return {};
	},
	userLog : function() {
		var allcookies = document.cookie;
		var cookies = allcookies.split("; ");
		for ( var i = 0; i < cookies.length; i++) {
			var keyValues = cookies[i].split("=");
			if (keyValues[0] == "SODABOX") {
				console.log(unescape(keyValues[1]));
			}
		}
		return {};
	}
};




var SODABOX_window = {
    
    rootDivName     : '',
    imageServer     : '',
    textareaHeight  : -1,
	
	divCloseWidth	: '100px',
	divOpenWidth	: '300px',

    isLogined       : false,
    
    blinkTimeout : '',
    eventType : '',
    
    hasClass : function(el, val) {
       var pattern = new RegExp("(^|\\s)" + val + "(\\s|$)");
    	 return pattern.test(el.className);
    },
    addClass : function(ele, cls) {
        if (!this.hasClass(ele, cls)) ele.className += " " + cls;
    },
    removeClass : function(ele, cls) {
        if (this.hasClass(ele, cls)) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            ele.className = ele.className.replace(reg, ' ');
        }
    },
    getStyle : function(el, cssprop){
		if (el.currentStyle) //IE
			return el.currentStyle[cssprop];
		else if (document.defaultView && document.defaultView.getComputedStyle) //Firefox
			return document.defaultView.getComputedStyle(el, "")[cssprop];
		else //try and get inline style
			return el.style[cssprop];
	},
    initWin : function(rootDivName, imageServer){
        
        this.rootDivName = rootDivName;
        this.imageServer = imageServer;
		
		SODABOX_utils.loadCss(this.imageServer+'/sodabox.css');
		
        var div_root = document.getElementById(rootDivName);

		
        if(div_root === null){
            div_root = document.createElement('div');
            div_root.id = rootDivName;
			div_root.style.bottom = '0px';
			div_root.style.right = '100px';
			div_root.style.width = this.divOpenWidth;
            this.addClass(div_root, "sodabox");
            document.getElementsByTagName('body')[0].appendChild(div_root);
        }
		
		this.divOpenWidth = this.getStyle(div_root, 'width');
		
        div_root.innerHTML = 
		'<div id="'+rootDivName+'_head" onclick="javascript:return SODABOX_window.toggleChatBoxGrowth();" class="sodabox_head" ><div id="'+rootDivName+'_title" class="sodabox_title"></div><div id="'+rootDivName+'_options" class="sodabox_options"></div><br clear="all"></div>'+
		'<div id="'+rootDivName+'_content" class="sodabox_content"></div>'+
		'<div id="'+rootDivName+'_input" class="sodabox_input"><textarea id="'+rootDivName+'_textarea" class="sodabox_textarea" onkeydown="javascript:return SODABOX_window.inputChatMessage(event,this);" ></textarea></div>'+
        '<div id="'+rootDivName+'_login" class="sodabox_login"><span>Connect with</span> '+
        '<a href="#" onclick="return !window.open(SODABOX.getOauthUrl(\'facebook\'),\'SODABOX_OAUTH\',\'menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes,width=800,height=450\')" target="_blank"><img src="'+this.imageServer+'/img/facebook.png" style="cursor:pointer;" /></a>&nbsp;'+
        '<a href="#" onclick="return !window.open(SODABOX.getOauthUrl(\'twitter\'),\'SODABOX_OAUTH\',\'menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes,width=800,height=450\')" target="_blank"><img src="'+this.imageServer+'/img/twitter.png" style="cursor:pointer;" /></a>&nbsp;'+
        '</div>'

        var div_content = document.getElementById(rootDivName+'_content');
        var div_login = document.getElementById(rootDivName+'_login');
        var div_input = document.getElementById(rootDivName+'_input');
        
        
        div_root.onclick = function(){
            
            if(div_content.style.display != 'none'){
                
                if(div_input.style.display  != 'none'){
                    var div_textarea = document.getElementById(rootDivName+'_textarea');
                    div_textarea.focus();
                    div_textarea.value = div_textarea.value;
                }
            }
        }; 
        
        //div_root.style.display = 'block';
        div_root.style.display = 'none';
        this.toggleChatBoxGrowth();
        

    },

    showRootDiv : function(isShow) {
        var div_root = document.getElementById(this.rootDivName);
        if(isShow){
            div_root.style.display = 'block';
        }else{
            div_root.style.display = 'none';
        }
    },
    
    blinkHeader : function(isDone){
    	if(isDone){
    		clearInterval(this.blinkTimeout);
			var titleDivForBlick = document.getElementById(this.rootDivName+'_head')
    		this.removeClass(titleDivForBlick, 'sodabox_blink');
    	}else{
    		clearInterval(this.blinkTimeout);
    		this.blinkTimeout = 
	    		setInterval(function(){ 
	    			var titleDivForBlick = document.getElementById(SODABOX_window.rootDivName+'_head')
	    			if(SODABOX_window.hasClass(titleDivForBlick, 'sodabox_blink')){
	    				SODABOX_window.removeClass(titleDivForBlick, 'sodabox_blink');
	    			}else{
	    				SODABOX_window.addClass(titleDivForBlick, 'sodabox_blink');
	    			}
	    		},1000);
    	}
    },
    
    inputChatMessage : function(event,chatboxtextarea) {
    	
    	this.blinkHeader(true);
    	
        if(event.keyCode == 13 && !event.shiftKey) {
            
            if(event.preventDefault) {
                event.preventDefault();   
            }else{
                event.returnValue = false;
            }

            var message = chatboxtextarea.value;
            message = message.replace(/^\s+|\s+$/g,"");
            
            if(message.length > 0){
                
            	SODABOX.sendMessage(encodeURIComponent(message));
                    
                chatboxtextarea.value = '';
                //chatboxtextarea.focus();
                chatboxtextarea.style.height = '30px';                    

	            return false;
        	}
        }
        
        var adjustedHeight = chatboxtextarea.clientHeight;
        var maxHeight = 94;
        
        if (maxHeight > adjustedHeight) {
        adjustedHeight = Math.max(chatboxtextarea.scrollHeight, adjustedHeight);
        if (maxHeight)
            adjustedHeight = Math.min(maxHeight, adjustedHeight);
        if (adjustedHeight > chatboxtextarea.clientHeight)
            chatboxtextarea.style.height = adjustedHeight+8 +'px';
        } else {
            chatboxtextarea.style.overflow = 'auto';
        }
    },


    
    setChatMessage : function(user, message){
        var div_content = document.getElementById(this.rootDivName+'_content');
        
        var chatDiv = document.createElement("div");
        this.addClass(chatDiv, 'sodabox_message');
        chatDiv.innerHTML = 
        	'<span class="sodabox_messagefrom"><a target="_blank" href="'+user.link+'" class="sodabox_userlink" alt="GO TO User Page!">'+user.name+'</a>:&nbsp;&nbsp;</span><span class="sodabox_messagecontent">'+
        	decodeURIComponent(message)+'</span>&nbsp;&nbsp;&nbsp;<span class="sodabox_messagetime">'+this.getNowStr()+'</span>';
        
        div_content.appendChild(chatDiv);
        div_content.scrollTop = div_content.scrollHeight;

        if(document.getElementById(this.rootDivName+'_content').style.display != 'block'){
        	this.blinkHeader();
        }

    },
    
    setSysMessage : function(message){
        
        var div_content = document.getElementById(this.rootDivName+'_content');
        
        var chatDiv = document.createElement("div");
        this.addClass(chatDiv, 'sodabox_message');
        chatDiv.innerHTML = '<span class="sodabox_systemcontent">'+message+'</span>';
        
        div_content.appendChild(chatDiv);
        div_content.scrollTop = div_content.scrollHeight;
        
    },
    
    toggleChatBoxGrowth : function() {
    	
    	if("LOGOUT" == this.eventType){
    		this.eventType = "";
    		return false;
    	}
    	
    	this.blinkHeader(true);
        var div_content = document.getElementById(this.rootDivName+'_content');
		var div_root 	= document.getElementById(this.rootDivName);
        if (div_content.style.display == 'none') {  

			document.getElementById(this.rootDivName).style.width = this.divOpenWidth;
            document.getElementById(this.rootDivName+'_options').style.display = 'block';
			document.getElementById(this.rootDivName+'_title').style["float"] = 'left';
			document.getElementById(this.rootDivName+'_title').style.textAlign = '';
			document.getElementById(this.rootDivName+'_title').style.width = '';
			
            div_content.style.display = 'block';
            if(this.isLogined){

                document.getElementById(this.rootDivName+'_login').style.display = 'none';
                document.getElementById(this.rootDivName+'_input').style.display = 'block';
            }else{

                document.getElementById(this.rootDivName+'_login').style.display = 'block';
                document.getElementById(this.rootDivName+'_input').style.display = 'none';
            }

        } else {

			document.getElementById(this.rootDivName).style.width = this.divCloseWidth;
			document.getElementById(this.rootDivName+'_title').style["float"] = '';
			document.getElementById(this.rootDivName+'_title').style.textAlign = 'center';
			document.getElementById(this.rootDivName+'_title').style.width = '100%';
            div_content.style.display = 'none';
            document.getElementById(this.rootDivName+'_login').style.display = 'none';
            document.getElementById(this.rootDivName+'_input').style.display = 'none';
            document.getElementById(this.rootDivName+'_options').style.display = 'none';
            document.getElementById(this.rootDivName+'_input').style.display = 'none';
			
        }
       
    },

    setTitleMessage : function(message){

        var div_title = document.getElementById(this.rootDivName+'_title');
        div_title.innerHTML = message;
    },
    
    logined : function(){
        
        var div_login = document.getElementById(this.rootDivName+'_login');
        var div_input = document.getElementById(this.rootDivName+'_input');
        
        if(document.getElementById(this.rootDivName+'_content').style.display == 'block'){
            div_login.style.display = 'none';
            div_input.style.display = 'block';
        }else{
            div_login.style.display = 'none';
            div_input.style.display = 'none';    
        }
        
        document.getElementById(this.rootDivName+'_options').innerHTML = '<a href="javascript:void(0)" onclick="javascript:return SODABOX.logout();"><img src="'+this.imageServer+'/img/logout.png"></a>';

        var div_textarea = document.getElementById(this.rootDivName+'_textarea');
        div_textarea.focus();
        div_textarea.value = div_textarea.value;
        
        this.isLogined = true;

    },

    logout : function(){
        
    	this.eventType = "LOGOUT";
    		
        var div_login = document.getElementById(this.rootDivName+'_login');
        var div_input = document.getElementById(this.rootDivName+'_input');
        
        if(document.getElementById(this.rootDivName+'_content').style.display == 'block'){
            div_login.style.display = 'block';
            div_input.style.display = 'none';
        }else{
            div_login.style.display = 'none';
            div_input.style.display = 'none';    
        }

        SODABOX_utils.delUserInfo();
        document.getElementById(this.rootDivName+'_options').innerHTML = "";
        
        this.isLogined = false;
        

    },

    getNowStr : function(){
        var currentTime = new Date();
        var hours = currentTime.getHours();
        var minutes = currentTime.getMinutes();

        if (minutes < 10){
            minutes = "0" + minutes;
        }
        var rtn = hours + ":" + minutes + " ";
        if(hours > 11){
            rtn = rtn + "PM";
        } else {
            rtn = rtn + "AM";
        }

        return rtn;
    }
    
};


////////////////////////////////////////////////////////////////////////////////
/////////////////// SODABOX Module /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var SODABOX = (function(CONF, UTILS, WIN) {

    /*** PRIAVTE AREA ***/

    // ########################## Private functions

    var fn_tryOAuthProcess = function(strategy){
        UTILS.loadJson(_d.urlWeb+'/user', 'SODABOX.callbackOAuth&_tryTarget='+strategy+'&SC='+_socketid+'&CN='+_d.channel);
    };

    var fn_callbackOAuth = function(data){

        if(data.isAuth){
            
            _auth.user = data.user;
            
            WIN.logined(data.user.target);
            
            _socket.emit('join', {
                UR : _auth.user,
                AU : _d.authkey,
                CN : _d.channel,
                MG : 'JOIN',
                r  : _d.range
            });

        }else{
            //window.open(_d.urlApp+'/auth/' + data.tryTarget,'SODABOX_OAUTH','menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes,width=800,height=450');
            window.open(_d.urlWeb+'/popupauth?_tryTarget='+data.tryTarget+'&SC='+_socketid+'&CN='+_d.channel,'SODABOX_OAUTH','menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes,width=800,height=450');

        }

    };


    /*
     * " Init " Processing
     */
    var fn_init = function(){
    	console.log(" # 1. fn_init \n\t"+JSON.stringify(CONF));
        UTILS.loadJson(CONF.httpUrl+'/node?refer='+CONF.refer, 'SODABOX.callbackInit');
    };
    var fn_reInit = function(){
    	console.log(" # 1. fn_init \n\t"+JSON.stringify(CONF));
        UTILS.loadJson(CONF.httpUrl+'/node?refer='+CONF.refer, 'SODABOX.callbackSocketCallback');
    };

    var fn_callbackInit = function(data){

    	console.log(" # 2. callbackInit \n\t"+JSON.stringify(data));
    	
    	if(data.status != "ok"){
			console.log("ERROR");
    		return;
    	}
    	
        CONF.serverInfo = data;

        WIN.initWin(CONF.divName, CONF.httpUrl);
        
        CONF.user = SODABOX_utils.getUserInfo();
        //console.log("USER : "+JSON.stringify(user));
        if ( typeof CONF.user.name == "undefined") {
        	CONF.isLogined = false;
        }else{
        	CONF.isLogined = true;
        	WIN.logined();
        }
        
        UTILS.loadScript("http://cdn.sockjs.org/sockjs-0.3.min.js", fn_callbackSocketCallback);
        
    };
    var dummy = function(){
    	
    };
    var fn_callbackSocketCallback = function(data){
    	
    	if(data){ // re connect !!

        	console.log(" # 2(2). callbackSocketCallback \n\t"+JSON.stringify(data));
    		if(data.status != "ok"){
    			console.log("ERROR");
        		return;
        	}
    		CONF.serverInfo = data;
    	}

        WIN.showRootDiv(true);
        
        CONF.sock = new SockJS('http://'+CONF.serverInfo.host+':'+CONF.serverInfo.port+'/message');
        
        CONF.sock.onopen = function(e) {
            
            var reqJson = {
            	action 	: "JOIN",
            	refer 	: CONF.refer,
            	user 	: CONF.user
            };
            CONF.sock.send(JSON.stringify(reqJson));
        };
        CONF.sock.onmessage = function(e) {
        	
            console.log(' ---- message : '+e);
            
            var resJson = JSON.parse(e.data);
            if(resJson.action == "JOIN"){
            	CONF.socketId = resJson.socketId;
            	CONF.currentUserCnt = resJson.count;
            	WIN.setTitleMessage("ONLINE : "+CONF.currentUserCnt);
            }else if(resJson.action == "IN"){
            	CONF.currentUserCnt = resJson.count;
            	WIN.setTitleMessage("ONLINE : "+CONF.currentUserCnt);
            }else if(resJson.action == "LOGIN"){
            	UTILS.setUserInfo(resJson.user);
            	CONF.isLogined = true;
            	CONF.user = resJson.user;
            	WIN.logined();

                var reqJson = {
                	action 	: "JOIN",
                	refer 	: CONF.refer,
                	user 	: CONF.user
                };
                CONF.sock.send(JSON.stringify(reqJson));
                
            }else if(resJson.action == "LOGOUT"){
            	CONF.currentUserCnt = resJson.count;
            	WIN.setTitleMessage("ONLINE : "+CONF.currentUserCnt);
            }else if(resJson.action == "OUT"){
            	CONF.currentUserCnt = resJson.count;
            	WIN.setTitleMessage("ONLINE : "+CONF.currentUserCnt);
            }else if(resJson.action == "MESSAGE"){
            	WIN.setChatMessage(resJson.user, resJson.message);
            }else {
            	
            }
            
        };
        CONF.sock.onclose = function() {
            console.log('close');
            fn_reInit();
        };
    };


    var fn_sendMessage = function(message){
        var reqJson = {
        	action 	: "MESSAGE",
        	refer 	: CONF.refer,
        	user 	: CONF.user,
        	message : message
        };
        CONF.sock.send(JSON.stringify(reqJson));        
    };

    var fn_logout = function(){
    	var reqJson = {
        	action 	: "LOGOUT",
        	refer 	: CONF.refer,
        	user 	: CONF.user
    	};
    	CONF.sock.send(JSON.stringify(reqJson));
    	
    	WIN.logout();
    	CONF.isLogined = false;
    };

    /*** PUBLIC AREA (func) ***/
    return {

        // ## INIT ## //
        init: function(data) {
            if(CONF.isReady) return false; 
            CONF.isReady = true;
            CONF.refer = location.host + location.pathname;
            if(data){
                if(data.divName)    CONF.divName      = data.divName;
                if(data.refer)     	CONF.refer        = data.refer;
            }
            if(CONF.refer){}else{ 
            	return;
            }
            fn_init();
        },

        callbackInit : function(data){
            fn_callbackInit(data);
        },
        callbackSocketCallback : function(data){
        	fn_callbackSocketCallback(data);
        },
        tryOAuth : function(target) {
            fn_tryOAuthProcess(target);
        },
        callbackOAuth : function(data){
            fn_callbackOAuth(data);
        },
        sendMessage : function(message){
            fn_sendMessage(message);
        },
        callbackSendMessage : function(data){
            
        },
        logout : function() {
            fn_logout();
        },
        getOauthUrl : function(targetName){
        	
            return CONF.httpUrl + '/auth?target='+targetName+'&channel='+CONF.serverInfo.channel+'&socketId='+CONF.socketId+'&refer='+CONF.refer;
        }

    };

})(SODABOX_conf, SODABOX_utils, SODABOX_window); // 익명 함수를 바로 실행


