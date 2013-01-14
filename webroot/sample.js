

var SODABOX_window = {
    
    rootDivName     : '',
    imageServer     : '',
    textareaHeight  : -1,

    isLogined       : false,
    
    blinkTimeout : '',
    
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
    
    initWin : function(rootDivName, imageServer){
        
        this.rootDivName = rootDivName;
        this.imageServer = imageServer;
        
        var div_root = document.getElementById(rootDivName);

        if(div_root === null){
            div_root = document.createElement('div');
            div_root.id = rootDivName;
            this.addClass(div_root, "sodabox");
            document.getElementsByTagName('body')[0].appendChild(div_root);
        }

        div_root.innerHTML = 
            '<div id="'+rootDivName+'_head" class="sodabox_head" onclick="javascript:return SODABOX_window.toggleChatBoxGrowth();" >'+
                '<div id="'+rootDivName+'_title" class="sodabox_title"></div>'+
                //'<div id="'+rootDivName+'_options" class="sodabox_options"><img src="'+this.imageServer+'/images/new-icon.png" ></div>'+
                //'<div id="'+rootDivName+'_options" class="sodabox_options"><a href="javascript:void(0)" onclick="javascript:return SODABOX_window.toggleChatBoxGrowth()">��/a></div>'+
                //'<br clear="all"/>'+
            '</div>'+
            '<div id="'+rootDivName+'_content" class="sodabox_content"></div>'+
            '<div id="'+rootDivName+'_login" class="sodabox_input"><center><b>CONNECT WITH</b></center>'+
                '<a href="#" onclick="return !window.open(SODABOX.getOauthUrl(\'facebook\'),\'SODABOX_OAUTH\',\'menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes,width=800,height=450\')" target="_blank"><img src="'+this.imageServer+'/images/32/facebook.png"  alt="If you would like to chat, sign in with Facebook or Twitter" style="cursor:pointer;" /></a>&nbsp;'+
                '<a href="#" onclick="return !window.open(SODABOX.getOauthUrl(\'twitter\'),\'SODABOX_OAUTH\',\'menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes,width=800,height=450\')" target="_blank"><img src="'+this.imageServer+'/images/32/twitter.png"  alt="If you would like to chat, sign in with Facebook or Twitter" style="cursor:pointer;" /></a>&nbsp;'+
                '<a href="#" onclick="return !window.open(SODABOX.getOauthUrl(\'linkedin\'),\'SODABOX_OAUTH\',\'menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes,width=800,height=450\')" target="_blank"><img src="'+this.imageServer+'/images/32/linkedin.png"  alt="If you would like to chat, sign in with Facebook or Twitter" style="cursor:pointer;" /></a>&nbsp;'+
                '<a href="#" onclick="return !window.open(SODABOX.getOauthUrl(\'google\'),\'SODABOX_OAUTH\',\'menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes,width=800,height=450\')" target="_blank"><img src="'+this.imageServer+'/images/32/google.png"  alt="If you would like to chat, sign in with Facebook or Twitter" style="cursor:pointer;" /></a>&nbsp;'+
            '</div>' +
            '<div id="'+rootDivName+'_input" class="sodabox_input"><textarea id="'+rootDivName+'_textarea" class="sodabox_textarea" onkeydown="javascript:return SODABOX_window.inputChatMessage(event,this);" ></textarea></div>';
        div_root.style.bottom = '0px';
        div_root.style.right = '20px';

        //textareaHeight = document.getElementById(rootDivName+'_textarea').style.height
        //var div_head = document.getElementById(rootDivName+'_head');
        var div_content = document.getElementById(rootDivName+'_content');
        var div_login = document.getElementById(rootDivName+'_login');
        var div_input = document.getElementById(rootDivName+'_input');
        
        div_content.style.display = 'none';
        div_login.style.display = 'none';
        div_input.style.display = 'none';
        
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
	    			console.log(SODABOX_window.hasClass(titleDivForBlick, 'sodabox_blink'));
	    			if(SODABOX_window.hasClass(titleDivForBlick, 'sodabox_blink')){
	    				SODABOX_window.removeClass(titleDivForBlick, 'sodabox_blink');
	    			}else{
	    				SODABOX_window.addClass(titleDivForBlick, 'sodabox_blink');
	    			}
	    		},1000);
    	}
    },
    
    inputChatMessage : function(event,chatboxtextarea) {
     
        if(event.keyCode == 13 && !event.shiftKey) {
            
            if(event.preventDefault) {
                event.preventDefault();   
            }else{
                event.returnValue = false;
            }

            var message = chatboxtextarea.value;
            message = message.replace(/^\s+|\s+$/g,"");
            
            if(message.length > 0){
                if(message == '#logout' || message == '/logout'){
                    SODABOX.logout();
                }else{
                    SODABOX.sendMessage(encodeURIComponent(message));
                }
                    
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
        chatDiv.innerHTML = '<span class="sodabox_messagefrom"><a target="_blank" href="'+user.link+'" class="sodabox_userlink" alt="GO TO User Page!">'+user.name+'</a>:&nbsp;&nbsp;</span><span class="sodabox_messagecontent">'+message+'</span>&nbsp;&nbsp;&nbsp;<span class="sodabox_messagetime">'+this.getNowStr()+'</span>';
        
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

        var div_content = document.getElementById(this.rootDivName+'_content');

        if (div_content.style.display == 'none') {  

            div_content.style.display = 'block';
            if(this.isLogined){

                document.getElementById(this.rootDivName+'_login').style.display = 'none';
                document.getElementById(this.rootDivName+'_input').style.display = 'block';
            }else{

                document.getElementById(this.rootDivName+'_login').style.display = 'block';
                document.getElementById(this.rootDivName+'_input').style.display = 'none';
            }

        } else {

            div_content.style.display = 'none';
            document.getElementById(this.rootDivName+'_login').style.display = 'none';
            document.getElementById(this.rootDivName+'_input').style.display = 'none';
        }

        this.setTitleMessage();
       
    },

    setTitleSysMessage : function(message){

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
        
        this.isLogined = true;

        this.setSysMessage('You are just logined. Type "#logout" to logout');

    },

    logout : function(){
        
        var div_login = document.getElementById(this.rootDivName+'_login');
        var div_input = document.getElementById(this.rootDivName+'_input');
        
        if(document.getElementById(this.rootDivName+'_content').style.display == 'block'){
            div_login.style.display = 'block';
            div_input.style.display = 'none';
        }else{
            div_login.style.display = 'none';
            div_input.style.display = 'none';    
        }

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
