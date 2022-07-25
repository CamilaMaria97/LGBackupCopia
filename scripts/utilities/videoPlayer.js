var options = {};
options.mediaTransportType = "URI";
options.option = {};
options.option.transmission = {};
options.option.transmission.playTime = {};
options.option.drm = {};
options.option.drm.type = 'URI';

var urlYoutube;
//var source = document.createElement("source");
//var mediaOption = encodeURI(JSON.stringify(options));
function youtubeHandle (url){
	var params=url.split("&&");
    var tk=params[1].split("=");
    console.log("Item url name "+tk[1]); 
	youtube(tk[1], function(response, xhr){
   		console.log('youtube');
   		console.log(response);
   		//On Success
       		if (response['status'] === 'error'){
       			console.log('Invalid request: ' + data);
       		}else if(response['status'] === 'ok'){
       			//Access Applicationvalidate
       			//guardar los datos 
       			this.urlYoutube= response.assets[0].pageUrl; 
       		}
       }, function(data, xhr){
   		//On Error
   		console.log('Invalid request: ' + data);
   	});	
}

'use strict';
var AVPlayer = {
	videoObj: null,	// tag video
	STATES: {
        STOPPED: 0,
        PLAYING: 1,
        PAUSED: 2, 
        PREPARED: 4
    },
    source:null,
    mediaOption:null,
    state: 0,		// initial state: STOPPED
    errorC:false,
    tpingm:2250,
    enableMediaKeys: function () {	
    	console.log("Main.enableMediaKeys()");
    },
    
    //INIT
   	//Se encarga de la inicializacion del player
	init: function (id) {	
		console.log("Player.init("+id+")");		
		this.state = this.STATES.STOPPED;
		//videoObj es el objeto sobre el que introduciremos el video
		if (!this.videoObj && id) {
			//le asignamos el id que nos pasan por parametro en appController
			this.videoObj = document.getElementById(id);
			this.source = document.createElement("source");
			this.mediaOption = encodeURI(JSON.stringify(options));
		}
	},
	
	//PREPARE
	//Se encarga de preparar la url a reproducir
	//onSuccess,onError -> Callbacks en caso de acierto o fallo
	prepare: function (url, onSuccess, onError) {
		
		console.log("Player.prepare("+url+")");
		console.log("Player: " + this.state);
		//mirar caso para youtube
		if(url.slice(-2)=="&&"){
	           //video de youtube
	           console.log("video de youtube");
	           youtubeHandle (url);
	           url = this.urlYoutube;
	           console.log("url");
	           console.log(url);
	    }
		//--
		if (this.state > this.STATES.STOPPED) {
			if (this.state === this.STATES.PREPARED)
				this.videoObj.pause();
			else
				return;
		}
		//--
		if (!this.videoObj) {
			return 0;
		}
		try {
			// webapis.avplay.open(url);
			//this.source = document.createElement("source");
			this.source.setAttribute('src', url);
			  
		} catch (e) {
		  console.log("Error on open stream resource " + e);
		}
		//Ajuste de pantalla
		this.setFullScreen();
		//this.setupEventListeners();
		var _this = this;
		_this.state = _this.STATES.PREPARED;
	
		//si hay url se cambia
		if (url) {
			//this.videoObj.src = url;
			//this.source = document.createElement("source");
			this.source.setAttribute('src', url);
		}
		console.log("source : "+this.source);		
		//source.setAttribute('src', url);	
		try{
			this.videoObj.appendChild(this.source);
			this.videoObj.load();
			this.videoObj.play();
			//control del tiempo de inicio		
		}catch (e){
			console.log("Error en el Play: "+e);
			this.videoObj.pause();
			this.errorcanal();
		}		
	},
	
	//Se encarga de reproducir el video
	//PLAY
	/**
	 * 
	 */
	play: function (url) {
		console.log("Player.play("+url+")");
		
		if (this.state < this.STATES.PAUSED) {
			return;
		}
		//
		this.state = this.STATES.PLAYING;		
		//añade la dir a videoObj
		if (url) {
			//this.videoObj.src = url;
			this.source.setAttribute('src', url);
			//console.log("source : "+this.source);
			//this.videoObj.appendChild(this.source);
		}
		this.videoObj.appendChild(this.source);
		try{		
			//this.videoObj.load();	
			this.videoObj.play();
		}catch (e){
			console.log("Error en el Play");
			this.videoObj.pause();
			this.errorcanal();
		}
		//console.log("source : "+source);
	},
	
	//Se encarga de pausar el video
	pause: function () {
		console.log("Player.pause()");
		//controla el cambio de estado 
		if (this.state != this.STATES.PLAYING) {
			return;
		}
		this.state = this.STATES.PAUSED;
		//fin de cambio de estado
		//webapis.avplay.pause();
		//Se Pausa 
		this.videoObj.pause();	
	},
	
	//Se encarga de parar el video
	stop: function () {	
		console.log("Player.stop()");
		this.state = this.STATES.STOPPED;		
		//webapis.avplay.stop();
		//webapis.avplay.close();
		this.videoObj.pause();
	},
	//Reset Player instance
	reset: function(id){
		try{
			//webapis.avplay.close();
			this.videoObj.pause();
		}catch (e) {
			console.log("Exception on close(): " + e);
		}
		this.init(id);
		
	},
	
	// Set position and dimension of video area 
	setDisplayArea: function (x, y, width, height) {		
		webapis.avplay.setDisplayRect(x,y,width,height);
	},
	
	// format time in seconds to hh:mm:ss
	formatTime: function (seconds) {
				
		var hh = Math.floor(seconds / 3600),
		    mm = Math.floor(seconds / 60) % 60,
		    ss = Math.floor(seconds) % 60;
		  
		return (hh ? (hh < 10 ? "0" : "") + hh + ":" : "") + 
			   ((mm < 10) ? "0" : "") + mm + ":" + 
			   ((ss < 10) ? "0" : "") + ss;			
	},
	
	// Setup Listeners for video player events
	setupEventListeners: function () {
	
		var that = this;
		
		var listener = {
			onbufferingstart: function() {
				console.log("Buffering...");
			},
			onbufferingprogress: function(percent) {
				console.log("Buffering progress: " + percent);
			},
			onbufferingcomplete: function() {
				console.log('Buffering Complete, Can play now!');
				//AVPlayer.play();
			},
			onstreamcompleted: function() {
				console.log('video has ended.');
				//webapis.avplay.stop();
				that.state = that.STATES.STOPPED;
				document.getElementById('progress-amount').style.width = "100%";
			},
			oncurrentplaytime: function(currentTime) {				
//				var duration =  webapis.avplay.getDuration();				
//			    if (duration > 0) {			    	
//			    	var percent = ((currentTime / duration)*100);		    	
//			    	document.getElementById('progress-amount').style.width = percent + "%";
//			    	document.getElementById("current-time").innerHTML = that.formatTime(currentTime/1000);
//			    }		    
			},
			ondrmevent: function(drmEvent, drmData) {
				console.log("DRM callback: " + drmEvent + ", data: " + drmData);
			},			
			onerror : function(type, data) {
				console.log("OnError: " + data);
			}
	    }
		
		//webapis.avplay.setListener(listener);
	},
	
	setFullScreen: function(){
		//webapis.avplay.setDisplayRect(0,0,1920,1080);
		//this.option.adaptiveStreaming.maxWidth =1920;
		//this.option.adaptiveStreaming.maxHeight = 1080 ;
		//videoObj.width = "1920x1080";
	},
	errorcanal: function(){
		console.log(this.errorC);
		setTimer(this.tpingm,this.errorC);
		//var rthis = this;
		console.log("Error canal control");
		console.log($("#av-player").get(0).paused);
		//console.log(rthis.state);
		var showNum = $('.channelNumberSelection');
		
		function setTimer(expireMili,errorC){
    		return setTimeout(function(errorC){
    			//var _this = this;
    			//console.log(errorC);
    			//console.log(_this.state);
    			if($("#av-player").get(0).paused){
    				this.errorC=true;
        			console.log(" Fin del tiempo ");
            		showNum.find('h1').html('Error in channel');
            		showNum.find('h2').html('press Back to go to menu or go to next channel');
            		//showNum.hide();
            		showNum.show();
            		
            		setTimer2(5000);
            		function setTimer2(expireMili){
                		return setTimeout(function(){
                			//var _this = this;
                			var showNum = $('.channelNumberSelection');
                			//console.log(errorC);
                			//console.log(_this.state);
                    		showNum.find('h1').html('');
                    		showNum.find('h2').html('');
            				showNum.hide();
                    	}, expireMili);
                	}	
    			}else{

    			}
        	}, expireMili);
    	}	
		//----fin----
		//var videoElement = $("#av-player").get(0);
		//console.log(videoElement);
	}
};