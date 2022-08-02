
$('document').ready(function() {
	document.addEventListener('keydown', onKeyDown);
	//Comentar en simulador, descomentar al desplegar en la tv
	//registerKeys();
	var x = "Total Width: " + screen.width;
	var y = "Total Width: " + screen.height;
	console.log("tamaño " + x + " Heigth " + y);
	var dataStorage = DataStorage();
	var email = dataStorage.readData('email');
	var password = DataStorage().readData('password');
	console.log("correo " + email);
	console.log("pass " + password);
	loginService(email, password, function(data){
		if (data.status === 'error'){
			console.log('Nuevo usuario, formulario de login');
			login(function(userdata){
				main(userdata);
			});
		}
		else {
			if(email!="" && password!=""){
				console.log('Usuario ya loggeado previamente');
				$('#wrapper').load('views/main.html', function() {
					myVideoApp.changeDepth(myVideoApp._DEPTH.INDEX);
					main(data);
				});
			}else{
				console.log('Nuevo usuario, formulario de login');
				login(function(userdata){
					main(userdata);
				});
			}//ojo ese if else 
		}
	}, function(){
		console.log('Algo fue mal');
		return -1;
	});
	
});

//Main function
function main(user){
	myVideoApp.initExitDialog();
	myVideoApp.initVideoPlayer();
	//Ddescarga de canales de la organizacion a la que pertenece el usuario loggeado
	console.log(user);
    myVideoApp.donwnloadChannels(user.contentOrganizationId, function(){
    	var focusHandler = function(event){
    		//var currentItem = dataDownloader.listChannel[$($event.target).data('index')];
    		//myVideoApp.preparePlayer(currentItem);
    		
    	};
        var selectHandler = function(event){
        	//Se coge el canal seleccionado
        	var currentItem = dataDownloader.listChannel[$(event.target).data('index')];
        	myVideoApp.setCurrentChannel(currentItem);
        	myVideoApp.setCurrentIndex($(event.target).data('index'));
        	//Se cambia la vista al player
            myVideoApp.setOverviewDark(false);
            myVideoApp.changeDepth(myVideoApp._DEPTH.PLAYER);
            myVideoApp.preparePlayer(currentItem, function(){
            	myVideoApp.launchPlayer();
            });
        };

        var blurHandler = function(event){
            if(myVideoApp.currentDepth === myVideoApp._DEPTH.INDEX){
                myVideoApp.setOverviewDark(true);
            }
            $(event.currentTarget).css({
    			border: ''
    		});
        };
        
    	$('#category_4').caphList({
            items: dataDownloader.listChannel,
            template: 'channelList',
            containerClass: 'list-container',
            wrapperClass: "list-scroll-wrapper"
        }).on('focused', function(event){
            focusHandler(event);
        }).on('blurred', function(event){
            blurHandler(event);
        }).on('selected', function(event){
            selectHandler(event);
        });
    	
        //myVideoApp.setListContainer(null, myVideoApp._CATEGORY.CHANNELS);
    	var firstItem = $('div[data-index=0]');
    	myVideoApp.changeCaphFocus(firstItem);
    });
	//myVideoApp.initDialogSetting();
	
	//Se define las funciones cunado se utiliza el boton settings
	$('#btnSetting').on('focused', function(){
	    myVideoApp.setOverviewDark(false);
	}).on('selected', function(){
	    myVideoApp.openDialogSetting();
	});

    var relatedPlaylistItems = [];

    var updateRelatedPlaylist = function(listData){
        relatedPlaylistItems = listData;
        //
        //$('#related-play-list')[0].caphList.update();
        //
        $('#related-play-list')[0].caphList.update();
    };

    var mediaControllerTimer;
    var controllerElement = $('#caphPlayer .controls-bar');
    var isShowController = true;
    var showPlayerController = function(val){
        if(val === true){
            isShowController = true;
            controllerElement.css('opacity', 1);
        } else {
            isShowController = false;
            controllerElement.css('opacity', 0);
        }
    };
    var setMediaControllerTimer = function(){
        showPlayerController(true);
        if(mediaControllerTimer){
            clearTimeout(mediaControllerTimer);
        }
        mediaControllerTimer = setTimeout(function(){
            showPlayerController(false);
            mediaControllerTimer = null;
        }, CONSTANT.MEDIA_CONTROLLER_TIMEOUT);
    };
    controllerElement.on('mouseover', function(){
        setMediaControllerTimer();
    });

    $.caph.focus.controllerProvider.addBeforeKeydownHandler(function(context){
        if(myVideoApp.currentDepth === myVideoApp._DEPTH.PLAYER){
            if(!isShowController){
                setMediaControllerTimer();
                return false;
            } else {
                setMediaControllerTimer();
            }
        }
    });    
}

//Solo hay que registrar los numeros del mando para ejecutar la app en el televisor. Si lo ejecutas en el 
//simulador tira un error
/*
function registerKeys(){
	for (var i = 0; i <= 9; i++){
		tizen.tvinputdevice.registerKey(i);
	}
}
*/
//Devuelve el elemento que debe tener el focus al comienzo de la aplicacion
function validate(email, password, callback) {
	var ret = true;
	var errorMsg = '';
	if (!email.val() || !password.val()){
		ret = false;
		if (!email.val() && !password.val()){
			addFieldError(password);
			addFieldError(email);
			errorMsg = 'Los campos email y password son requeridos';
		}
		else{
			if (!email.val()){
				addFieldError(email);
				errorMsg = 'El campo email es requerido';
			}
			if (!password.val()){
				addFieldError(password);
				errorMsg = "El campo password es requerido";
			}
		}
	}
	else{
		if (!validateEmail(email.val())){
			ret = false;
			errorMsg = 'El correo introducido no tiene un formato válido'
			addFieldError(email);
		}
	}
	callback & callback(errorMsg);
	return ret;
}

function addFieldError (field){
	field.css({
		border: '3px solid red'
	});
	//Devolver el focus al campo erroneo
	myVideoApp.changeCaphFocus(field);
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function setErrorText (errorMsg){
	$('.errorMsg').html(errorMsg);
}

 //Funcion para el control-----------------------------------------------------------------------------------------

var lastClickedId = null;
var itemArray = document.getElementsByClassName("item");

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

function onKeyDown (e){
	console.log('KEY PRESSED: ' + e.keyCode);
	switch (e.keyCode) {
		case tvKey.IME_DONE: //Handles OK button on VIrtual Keyboard
			var currItem = myVideoApp.getCurrentFocus();
			currItem.blur();
			break;
		case tvKey.IME_CANCEL:
			var currItem = myVideoApp.getCurrentFocus();
			currItem.blur();
			break;
		case tvKey.CH_DOWN:
			console.log("CHANNEL_DOWN");
			e.preventDefault();
        	if (myVideoApp.currentDepth === myVideoApp._DEPTH.PLAYER)
        		myVideoApp.prevChannel();
    		break;
		case tvKey.LEFT: //LEFT arrow
        	console.log("LEFT");
        	e.preventDefault();
        	if (myVideoApp.currentDepth === myVideoApp._DEPTH.PLAYER)
        		myVideoApp.prevChannel();
    		break;
    	case tvKey.UP: //UP arrow
    		console.log("UP");
    	    console.log("situación de la app : " + myVideoApp.currentDepth);
    		break;
    		
    	case tvKey.CH_UP:
    		console.log("CHANNEL_UP");
    		e.preventDefault();
    		if (myVideoApp.currentDepth === myVideoApp._DEPTH.PLAYER)
    			myVideoApp.nextChannel();
    		break;
    	case tvKey.RIGHT: //RIGHT arrow
    		console.log("RIGHT");
    		e.preventDefault();
    		if (myVideoApp.currentDepth === myVideoApp._DEPTH.PLAYER)
    			myVideoApp.nextChannel();
    		break;
    		
    	case tvKey.DOWN: //DOWN arrow
    		console.log("DOWN");
    		break;
    	case tvKey.RETURN: //RETURN button
    		//return se supone que tiene el codigo de back
    		console.log("RETURN");

    		//para el AVPlayer permite evitar que si se pulsa rapido return se para el audio 
    		try{
    			AVPlayer.stop();
        		myVideoApp.back();
    		}catch(e){
    			console.log(e);
	    		webOS.platformBack();
    		}
    		break;
    	case tvKey.PLAYPAUSE: // PLAYPAUSE button
    		console.log("PLAYPAUSE");
    		if (AVPlayer.state == AVPlayer.STATES.PLAYING) {
    			AVPlayer.pause();
    		} else {
    			AVPlayer.play();
    		}    		
    		break;
    	case tvKey.GREEN: // PLAY button
    		console.log("PLAY");
    		AVPlayer.play();
    		break;
    	case tvKey.RED: // PAUSE button
    		console.log("PAUSE");
    		AVPlayer.pause();
    		break;
    	case tvKey.ENTER: //enter button
    		console.log("Webos enter problem");
    		var email = $('#email');
    		var pass = $('#password');
    		var btn = $('#loginBtn');
    		if (email.val() && pass.val()){
    			console.log("boton");
    			btn.focus();
    			var success = validate(email, pass, function(errorMsg){
    				$('.errorMsg').html(errorMsg);
    			});
    			if (success){
    				 $('#loginBtn').click();
    				 $('#loginBtn').click();
    			}
    			//turn btn;
    		}else{
    			if (!email.val()){ 
    				email.focus();
    				console.log("email");
    				//turn email;
    			}else if (!pass.val()){
    				pass.focus();
    				console.log("pass");
    				//turn pass;
    			}
    			console.log("ninguno");
    		}
    		if (AVPlayer.state == AVPlayer.STATES.PLAYING) {
    			AVPlayer.pause();
    		} else {
    			AVPlayer.play();
    		} 
    		break;
    	case tvKey.N0:
    		myVideoApp.channelSelector(e.keyCode);
    		break;
    	case tvKey.N1:	
    		myVideoApp.channelSelector(e.keyCode);
    		break;
    	case tvKey.N2:
    		myVideoApp.channelSelector(e.keyCode);
    		break;
    	case tvKey.N3:
    		myVideoApp.channelSelector(e.keyCode);
    		break;
    	case tvKey.N4:
    		myVideoApp.channelSelector(e.keyCode);
    		break;
    	case tvKey.N5:
    		myVideoApp.channelSelector(e.keyCode);
    		break;
    	case tvKey.N6:
    		myVideoApp.channelSelector(e.keyCode);
    		break;
    	case tvKey.N7:
    		myVideoApp.channelSelector(e.keyCode);
    		break;
    	case tvKey.N8:
    		myVideoApp.channelSelector(e.keyCode);
    		break;
    	case tvKey.N9:
    		if (myVideoApp.currentDepth === myVideoApp._DEPTH.PLAYER)
    			myVideoApp.channelSelector(e.keyCode);
    		break;
    	default:
    		console.log("Key code : " + e.keyCode);
    		break;
	}
}


