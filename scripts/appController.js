//'use strict';
var lastClickedId = null;
var itemArray = document.getElementsByClassName("item");

var myVideoApp = {
    _CATEGORY : CONSTANT.CATEGORY,
    _DEPTH : {
    	LOGIN: 1,
        INDEX: 2,
        EXIT_CONFIRM: 3,
        PLAYER: 4,
        SETTING: 5,
    },
    _dataCategory: [],
    relatedPlaylistItems: [],
    currentCategory: undefined,
    currentDepth: undefined,
    lastDepth: undefined,
    dialogSetting: undefined,
    playSetting: {
        chkAutoPlay: true,
        chkSubTitle: false
    },
    videoControls: undefined,
  
    //Info about current channel
    currentChannel: undefined,
    setCurrentChannel: function(ch){
    	this.currentChannel = ch;
    },
    
    numChannel: 0,
    setCurrentIndex: function(i){
    	this.numChannel = i;
    },
    deviceId: undefined,
    //Dialogo de confirmacion para salir de la aplicacion al pulsar RETURN en el index
    //se inicializa más abajo
    exitDialog: undefined,
  
    channelNumb: '',
    timer: null,
    //Funcion para el control-----------------------------------------------------------------------------------------
	function addEventListeners () {
		for (var i = 0; i < itemArray.length; i++){
			itemArray[i].addEventListener("mouseover", _onMouseOverEvent);
			itemArray[i].addEventListener("click", _onClickEvent);
			itemArray[i].addEventListener("keydown", function(e) {
				if (e.keyCode === 13) {
					_onClickEvent(e);
				}
			})
		}
	}
	
	function _onClickEvent (e) {
		if (lastClickedId) {
			document.getElementById(lastClickedId).classList.remove("clicked");
		}
		document.getElementById(e.target.id).classList.add("clicked");
		lastClickedId = e.target.id;
		console.log(lastClickedId + " is clicked!")
	}
	
	function _onMouseOverEvent (e) {
		for (var i = 0; i < itemArray.length; i++){
			itemArray[i].blur();
		 }
		document.getElementById(e.target.id).focus();
	}

//-------------------------------------------------------------------------------------------------------------
    //Funcion encargada de actualizar la lista categorias
    updateCategoryListData: function(response, category, reload){
        this._dataCategory[category] = response;
    },
    
    setOverviewDark: function(dark){
        var container = $('#move-container');
        if(dark){
            container.addClass('opacity-dark');
            container.removeClass('opacity-light');
        } else {
            container.addClass('opacity-light');
            container.removeClass('opacity-dark');
        }
    },
    //Funcion que inicializa la navegacion con el framework caph. Se le pasa la funcion de 
    //validacion de campos, el manejador del login y el callback en caso de exito
    initCaphNavigation: function(){
    },
    
    //Esta funcion se encarga de cambiar el estado en el que se encuentra la app INDEX, DETAILS, PLAYER...
    changeDepth: function(depth){
        for(var dth in this._DEPTH){
            if(this._DEPTH[dth] !== depth){
                $('.depth' + this._DEPTH[dth]).hide();
            }
        }
        $('.depth' + depth).show();
        this.lastDepth = this.currentDepth;
        this.currentDepth = depth;
        $.caph.focus.controllerProvider.getInstance().setDepth(depth);
    },
    //Esta funcion cambia el focus
    changeCaphFocus: function(item, /*opt*/orginalEvent){
    	$.caph.focus.controllerProvider.getInstance().focus(item, orginalEvent);
    },
    //Esta funcion devuelve el focus actual
    getCaphFocus : function (){
    	return $.caph.focus.controllerProvider.getInstance().getCurrentFocusItem();
    },
    
    //Esta funcion se encarga de poner el foco en la lista seleccionada
    setListContainer: function($event, category){
        if(myVideoApp.currentDepth === myVideoApp._DEPTH.INDEX){
            $('#list-category > .list-area').addClass('list-fadeout'); // fade-out for each list
            $('#category_' + category).parent().removeClass('list-fadeout');

            // Move Container
            if(category === myVideoApp.currentCategory){
                return;
            }

            /*$('#list-category').css({
                transform: 'translate3d(0, ' + (-CONSTANT.SCROLL_HEIGHT_OF_INDEX * category) + 'px, 0)'
            });*/
            myVideoApp.currentCategory = category;
        }
    },
    
    //Se encarga de cambiar el color dependiendo de donde estemos
    updateOverview: function(item){
        $('.overview > .font-header').html(item.name).css('color', item.color);
        $('.desc').html(item.description);
        $('#wrapper').css('borderColor', item.color);
    },
    
    updateRelatedPlaylist: function(listData){
        this.relatedPlaylistItems = listData;
        $('#related-play-list')[0].caphList.update();
    },
    
    //Esta funcion se encarga del inicializar el dialogo de settings
    initDialogSetting: function(){ // Initialize the setting dialog box.
        var _this = this;
        if(!this.dialogSetting){
            this.dialogSetting = $('#dialogSetting').caphDialog({
                position: {x:551, y:287},
                focusOption: {
                    depth: myVideoApp._DEPTH.SETTING
                },
                onSelectButton: function(buttonIndex, event){
                    _this.dialogSetting.caphDialog('close');
                }
            });
            $('#chkAutoPlay').caphCheckbox({
                focusOption: {
                    depth: myVideoApp._DEPTH.SETTING
                },
                checked: _this.playSetting.chkAutoPlay,
                onSelected :function(){
                    _this.playSetting.chkAutoPlay = !_this.playSetting.chkAutoPlay;
                }
            });
            $('#chkSubTitle').caphCheckbox({
                focusOption: {
                    depth: myVideoApp._DEPTH.SETTING
                },
                checked: _this.playSetting.chkSubTitle,
                onSelected :function(){
                    _this.playSetting.chkSubTitle = !_this.playSetting.chkSubTitle;
                }
            });
        }
    },
    
    openDialogSetting: function(){
        if(!this.dialogSetting){
            this.initDialogSetting();
        }
        this.dialogSetting.caphDialog('open');
    },
    //Esta funcion inicializa el dialogo de confirmacion de salida
    initExitDialog: function (){
    	this.exitDialog = $('#exitDialog').caphDialog({
    		center: true,
    		ret: false,
    		focusOption: {
    			//depth: this._DEPTH.EXIT_CONFIRM
    		},
    		onOpen: function(){
    			myVideoApp.changeDepth(myVideoApp._DEPTH.EXIT_CONFIRM);
    			//Change dialog confirmation language -- Default Yes
    			var yesBtn = $('.caph-dialog-buttons')[0].children[0];
    			var noBtn  = $('.caph-dialog-buttons')[0].children[1];
    			yesBtn.innerHTML = 'Sí'
    			myVideoApp.changeCaphFocus(noBtn);
    		}, 
    		onClose: function(){
    			myVideoApp.changeDepth(myVideoApp._DEPTH.INDEX);
    	    },
    	    onSelectButton: function(buttonIndex, event){
    	         console.log('dialog1 buttonCallback ' + buttonIndex, event);
    	         if (buttonIndex === 0){
    	        	///yes en exit
    	        	 //webapis.avplay.close();
    	        	 AVPlayer.stop();	 
    	        	 try{
    	        		 DataStorage().removeData('email');
    	        		 DataStorage().removeData('password');
    	        	 }catch (e) {
    	     			console.log("Exception al borrar la memoria (): " + e);
    	     		 }
 	        		location.reload();
	        		//myVideoApp.changeDepth(myVideoApp._DEPTH.LOGIN);
    	        	 try{
    	        		 //window.close();
    	        		 //webOs.close();
    	        		var localStorage = DataStorage();
    	        		localStorage.clear();

    	        		
    	        		//var email = dataStorage.readData('email');
    	        		//var password = DataStorage().readData('password');
    	        	 }catch (e) {
     	     			console.log("Exception al cerrar (): " + e);
     	     		}
    	        	//webOS.platformBack();
    	        	 //tizen.application.getCurrentApplication().exit(); 
    	         }
    	         else
    	        	myVideoApp.changeDepth(myVideoApp._DEPTH.INDEX);
    	         	//webOS.platformBack();
    	    }
    	});
    },
    
    //Esta funcion se encarga de la gestion del inicio del player
    initVideoPlayer: function(){ // Initialize video plugin using caphMedia.
        var btnPlay = $('#btnPlayerPlay .btn-icon-player');
        this.player = $('#caphPlayer').caphMedia({
            controller: { // Button's ID for controlling.
                restart: 'btnPlayerRestart',
                rewind: 'btnPlayerRewind',
                togglePlay: 'btnPlayerPlay',
                forward: 'btnPlayerForward',
                next: 'btnPlayerNext'
            },
            onPlay: function(){ // The event handler when the video starts playing.
                btnPlay.removeClass('icon-caph-play').addClass('icon-caph-pause');
            },
            onPause: function(){ // The event handler when the video stops playing.
                btnPlay.addClass('icon-caph-play').removeClass('icon-caph-pause');
            },
            onEnded: function(){ // The event handler when the video ends playing.
                if(_this.currentDepth === _this._DEPTH.PLAYER){
                    this.back();
                }
            },
            onError: function(){ // The event handler when the error occurs during playing.
                if(_this.currentDepth === _this._DEPTH.PLAYER){
                    _
                    this.back();
                }
            },
        });
        AVPlayer.init("av-player");
        this.videoControls = {
            play: function(){
                $('#btnPlayerPlay').trigger('selected');
            },
            pause: function(){
                $('#btnPlayerPlay').trigger('selected');
            },
            restart: function(){
                $('#btnPlayerRestart').trigger('selected');
            },
            rewind: function(){
                $('#btnPlayerRewind').trigger('selected');
            },
            forward: function(){
                $('#btnPlayerForward').trigger('selected');
            },
            next: function(){
                $('#btnPlayerNext').trigger('selected');
            }
        };
    },
    
    launchPlayer: function(){
    	AVPlayer.play();    	
    },
    
    //Esta funcion se encarga de hacer el prebuffer del canal
    preparePlayer: function(itemSelected, callback){
    	//AVPlayer.enableMediaKeys();
    	// setup video player
    	//inicializa el reproductor
    	var url = itemSelected.urls[0].url;
    	var _this = this;
    	
    	AVPlayer.prepare(url, function onSuccess(){
    		var title = itemSelected.title;
        	_this.showTitleBox(title);
        	callback & callback();
    	}, function onError(error){
    		AVPlayer.reset('av-player');
    		_this.changeDepth(_this._DEPTH.INDEX);
    	});
    	
    	//comentado en samsung--------------
    	//this.player.prepare(url);
    },
    
    setFullScreen: function(){
    	AVPlayer.setDisplayArea(0, 0, 1920, 1080);
    },
    
    //Esta funicon se encarga de gestionar el boton return del mando
    back: function(){
	    var targetDepth;
	    console.log("situación de la app : " + this.currentDepth);
	    switch(this.currentDepth){
	    	case this._DEPTH.LOGIN:
	    		webOS.platformBack();
	    	case this._DEPTH.INDEX:
	    		targetDepth = this._DEPTH.EXIT_CONFIRM;
	    		this.exitDialog.caphDialog('open');
//	    		tizen.application.getCurrentApplication().exit();
	    		return;
	    	case this._DEPTH.EXIT_CONFIRM:
	    		this.exitDialog.caphDialog('close');
	    		//webOS.platformBack();
	    		
	        case this._DEPTH.PLAYER:
	        	console.log(this.currentDepth);
	        	if(AVPlayer.state === AVPlayer.STATES.PLAYING){
	        		AVPlayer.stop();
	        	}
	        	//Recobrar focus en el elemento correcto de la lista (usar myVideoApp.currentChannel)      	
	            targetDepth = this._DEPTH.INDEX;
	            break;
	        default:
	        	//tizen.application.getCurrentApplication().exit();
	    }
	    this.changeDepth(targetDepth);	    
    },
    /**
     * Cambio de canal
     */
    nextChannel: function(){
    	console.log(" ID " +  this.currentChannel.serviceId);
    	//incrementar channel id 
    	if((dataDownloader.listChannel.length-1) == this.numChannel ){
    		//ponemos a 0
    		this.numChannel = 0;
    	}else if((dataDownloader.listChannel.length-11) == this.numChannel){
    		this.numChannel = 0;
    	}else{
    		//aumentamos el canal 
    		this.numChannel = this.numChannel+1;
    	}
    	//ant
    	//var newChannel = dataDownloader.listChannel[this.currentChannel.serviceId];
    	var newChannel = dataDownloader.listChannel[this.numChannel];
    	console.log(" channel: ");
    	console.log(newChannel);
    	if (newChannel){
    		//para el player
    		AVPlayer.stop();
    		//Cambiamos al canal actual
    		this.setCurrentChannel(newChannel);
    		
    		var _this = this;
    		//Llamamos a prepare 
    		AVPlayer.prepare(newChannel.urls[0].url, function onSucces(){
    			var title = newChannel.title;
            	_this.showTitleBox(title);
            	_this.launchPlayer();
            	//console.log("Se ha cambiado el canal " + error);
    		}, function onError(error){
    			console.log("Error Changing channel " + error);
    		});
    		
    		var showNum = $('.channelNumberSelection');
        	showNum.find('h1').html(this.currentChannel.serviceId);
        	//se podria poner para el 2 canal 
        	//showNum.find('h2').html("select: " + this.timer);
        	try{
            	console.log(newChannel);
            	console.log("Title");
            	console.log(newChannel.title);
            	showNum.find('h2').html(newChannel.title);
            	showNum.show();
        	}catch(e){
        		console.log("Title: "+e);
        	}

        	
        	if (this.timer != null){
        		clearTimeout(this.timer);
        		this.timer = setTimer(5000);
        	}
        	else{
        		this.timer = setTimer(1500);
        	}
        	
        	function setTimer(expireMili){
        		return setTimeout(function(){
        			console.log(" Fin del tiempo ");
            		showNum.find('h1').html('');
            		showNum.find('h2').html('');
            		showNum.hide();
            		myVideoApp.timer = null;
            	}, expireMili);
        	}
    	}
    },
    
    prevChannel: function(){
    	console.log(" ID " +  this.currentChannel.serviceId);
    	//ant
    	//var newChannel = dataDownloader.listChannel[this.currentChannel.serviceId];
    	var newChannel = dataDownloader.listChannel[this.numChannel];
    	var newChannel;
    	var length=dataDownloader.listChannel.length;
    	if(this.numChannel  == 0 ){
    		//ponemos a 0
    		this.numChannel = length-11;
    	}else{
    		//aumentamos el canal 
    		this.numChannel = this.numChannel-1;
    	}
    	newChannel = dataDownloader.listChannel[this.numChannel];
    	
    	//var newChannel = dataDownloader.listChannel[this.currentChannel.serviceId-2];
    
    	console.log(" long array " +  dataDownloader.listChannel.length);
    	//hay 10 canales de youtube
    	console.log(" channel: ");
    	console.log(newChannel);
    	
    	if (newChannel){
    		AVPlayer.stop();
    		this.setCurrentChannel(newChannel);
    		var _this = this;
    		AVPlayer.prepare(newChannel.urls[0].url, function onSucces(){
    			var title = newChannel.title;
            	_this.showTitleBox(title);
            	_this.launchPlayer();
            	console.log("Channel ID" + this.currentChannel.serviceId);
    		}, function onError(error){
    			console.log("Error Changing channel " + error);
    		});	
    	}
    	
    	var showNum = $('.channelNumberSelection');
    	showNum.find('h1').html(this.currentChannel.serviceId);
    	//se podria poner para el 2 canal 
    	//showNum.find('h2').html("select: " + this.timer);
    	try{
        	console.log(newChannel);
        	console.log("Title");
        	console.log(newChannel.title);
        	showNum.find('h2').html(newChannel.title);
        	showNum.show();
    	}catch(e){
    		console.log("Title"+e);
    	}

    	if (this.timer != null){
    		clearTimeout(this.timer);
    		this.timer = setTimer(5000);
    	}
    	else{
    		this.timer = setTimer(1500);
    	}
    	
    	function setTimer(expireMili){
    		return setTimeout(function(){
    			console.log(" Fin del tiempo ");
        		showNum.find('h1').html('');
        		showNum.find('h2').html('');
        		showNum.hide();
        		myVideoApp.timer = null;
        	}, expireMili);
    	}
    	
    },
    
    //Funcion que se encarga de la descarga de canales
    donwnloadChannels: function(organizationId, retorno){
    	//Se realiza la descarga de los canales de television
    	dataDownloader.downloadChannel(organizationId, function(){
            //Se oculta el elemento welcome que en este caso es ÑÑ TV para mostrar la pantalla inicial
    		if(dataDownloader.listChannel.length > 0){
    			var welcomeElement = $('.welcome');
    			welcomeElement.addClass('fade-out');
    		}
    		else {
				console.log("NO HAY CANALES");
			}
            
    		retorno && retorno();
    	});
    },
    
    //Funcion que comprueba usuario y contraseña
    checkLogin: function(email, password, retorno){
    	dataDownloader.loginService(email, password, function(){
    		//En caso que no este registrado se muestra por pantalla
    		if(!dataDownloader.loginStatus){
				var msg = 'Credenciales de usuario inválidas';
				$('.errorMsg').text(msg);
    		}
    		else
    			retorno && retorno();
    	});
    },
    
    showTitleBox: function(channelTitle){
    	var titleBox = $('.titlebox');
    	titleBox.find('h1').html(channelTitle);
    	titleBox.show();
    	setTimeout(function(){
			titleBox.fadeOut(500);
		}, 1500);
    },
    

    channelSelector: function(keycode){
    	console.log("numb selection");
    	if (this.channelNumb.length >= 3){
    		this.channelNumb = '';
    		console.log("channel Numb" + this.channelNumb);
    	}
    	this.channelNumb += (keycode - 48).toString();
    	console.log("channel Numb post keycode " + this.channelNumb);
    	//Muestra el numero actual por pantalla
    	var showNum = $('.channelNumberSelection');
    	showNum.find('h1').html(this.channelNumb);
    	//se podria poner para el 2 canal 
    	//showNum.find('h2').html("select: " + this.timer);
    	showNum.find('h2').html('');
    	showNum.show();
    	
    	if (this.timer != null){
    		clearTimeout(this.timer);
    		this.timer = setTimer(2000);
    	}
    	else{
    		this.timer = setTimer(1500);
    	}
    	
    	function setTimer(expireMili){
    		return setTimeout(function(){
    			console.log(" Fin del tiempo ");
        		changeChannel(myVideoApp.channelNumb);
        		myVideoApp.channelNumb = '';
        		showNum.find('h1').html('');
        		showNum.find('h2').html('');
        		showNum.hide();
        		myVideoApp.timer = null;
        	}, expireMili);
    	}
    	
		function changeChannel (newChannel) {
			//index
			
			var index = arrayObjectIndexOf(dataDownloader.listChannel, 'logicalChannel', newChannel);
			console.log('Changing channel -> ', index);
			this.numChannel = index;
			// control
			if (index != -1 && dataDownloader.listChannel[index] != myVideoApp.currentChannel){
				myVideoApp.currentChannel = dataDownloader.listChannel[index];
				AVPlayer.stop();
				//nnoooo se ve el reproductor 
				myVideoApp.changeDepth(myVideoApp._DEPTH.PLAYER);
				var firstItem = $('div[data-index='+ index +']');
				myVideoApp.changeCaphFocus(firstItem);
				AVPlayer.prepare(myVideoApp.currentChannel.urls[0].url, function onSuccess(){
		    		var title = itemSelected.title;
		        	_this.showTitleBox(title);
		        	callback & callback();
		    	}, function onError(error){
		    		AVPlayer.reset('av-player');
		    		_this.changeDepth(_this._DEPTH.INDEX);
		    	});
			}
    	}
		
		function arrayObjectIndexOf (array, propertie, value){
			for (var i = 0; i < array.length; i++){
				if (array[i][propertie] == value)
					return i;
			}
			return -1;
		}

    }
};

Element.prototype.show = function() {
    this.style.display = '';
}