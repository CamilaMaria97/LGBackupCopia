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

function login(callback) {
	$('#wrapper').load('views/main.html', function() {
		initForm(callback);
		myVideoApp.changeCaphFocus(selectFirstField());
	});
}

function initForm (global_callback){
	function onFocused (event,originalEvent){
		 $(event.currentTarget).css({
		     'border' : '1px solid white',
		     'background-color':'rgb(214, 214, 214)'
		 });
	}
	function onBlurred (event,originalEvent){
        $(event.currentTarget).css({
            'border' : '',
            'background-color':''
        });
    }
    function onChanged (event,value){
    	console.log("value", value);
    }
    
	 $('#email').caphInput({
		 onFocused : function(event, originalEvent){
			 onFocused(event, originalEvent);
		 },
		 onBlurred : function(event, originalEvent){
			 onBlurred(event, originalEvent);
		 },
		 onChanged : function(event, value){
			 onChanged(event, value)
		 },
		 type : 'text',
			maxLength : 64,
			placeHolder : 'Introduce tu email...',
			value:''
     });
	 $('#password').caphInput({
		 onFocused : function(event, originalEvent){
			 onFocused(event, originalEvent);
			 $(event.currentTarget).css({
				 'background-color':'rgb(214, 214, 214, 0.7)'
			 });
		 },
		 onBlurred : function(event, originalEvent){
			 onBlurred(event, originalEvent);
			 $(event.currentTarget).css({
				 'background-color':'rgb(214, 214, 214, 0.7)'
			 });
		 },
		 onChanged : function(event, value){
			 onChanged(event, value)
		 },
		 type : 'password',
			maxLength : 64,
			placeHolder : 'Su contraseña...',
			value:''
     });
	 $('#loginBtn').caphButton({
			 onFocused : function(event, originalEvent){
				 onFocused(event, originalEvent);
				 $(event.currentTarget).css({
					 'color': 'white',
				     'background-color': '#1C1CD8'
				 });
			 },
			 onBlurred : function(event, originalEvent){
				 onBlurred(event, originalEvent);
				 $(event.currentTarget).css({
					 'color': 'black',
				     'background-color': 'white'
				 });
			 },
		   	focusOption: {
		   		disabled : false,
		   		initialFocus: false
		   		},
		   	toggle : false,
		   	onSelected :function(event,originalEvent,selected){
		   		onButtonClick(global_callback);
		   	}
	 });
}

function onButtonClick(global_callback){
	var email = $('#email');
	var pass = $('#password');
	var success = validate(email, pass, function(errorMsg){
		setErrorText(errorMsg);
	});
	if (success){
		loginHandle(email, pass, global_callback);
	}
}

//Devuelve el elemento que debe tener el focus al comienzo de la aplicacion
function selectFirstField(){
	var email = $('#email');
	var pass = $('#password');
	var btn = $('#loginBtn');
	if (email.val() && pass.val())
		return btn;
	else{
		if (!email.val()) return email;
		else if (!pass.val()) return pass;
	}
}

function setErrorText (errorMsg){
	$('.errorMsg').html(errorMsg);
}

function addFieldError (field){
	field.css({
		border: '3px solid red'
	});
	//Devolver el focus al campo erroneo
	myVideoApp.changeCaphFocus(field);
}

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

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}


function loginHandle (email, password, callback){
	loginService(email.val(), password.val(), function(response, xhr){
		console.log('login handler enntra en accion ');
		//On Success
		if (response['status'] === 'error'){
			console.log('Invalid login: ' + response['message']);
			addFieldError(email);
			setErrorText('Credenciales de usuario inválidas');
		}else if(response['status'] === 'ok'){
			//Access Applicationvalidate
			//guardar los datos 
			console.log('login handler guarda los datos ');
			var dataStorage = DataStorage();
			dataStorage.writeData('email', email.val());
			dataStorage.writeData('password', password.val());
			myVideoApp.changeDepth(myVideoApp._DEPTH.INDEX);
			callback & callback(response);
		}
	}, function(data, xhr){
		//On Error
		console.log('Invalid request: ' + data);
		setErrorText('Ha habido un problema interno. Por favor, vuelva a intentarlo mas tarde.');
	});
}
function loginHandle2 (email, password){
	loginService(email.val(), password.val(), function(response, xhr){
		console.log('login handler enntra en accion ');
		//On Success
		if (response['status'] === 'error'){
			console.log('Invalid login: ' + response['message']);
			addFieldError(email);
			setErrorText('Credenciales de usuario inválidas');
		}else if(response['status'] === 'ok'){
			//Access Applicationvalidate
			//guardar los datos 
			console.log('login handler guarda los datos ');
			var dataStorage = DataStorage();
			dataStorage.writeData('email', email.val());
			dataStorage.writeData('password', password.val());
			myVideoApp.changeDepth(myVideoApp._DEPTH.INDEX);
		}
	}, function(data, xhr){
		//On Error
		console.log('Invalid request: ' + data);
		setErrorText('Ha habido un problema interno. Por favor, vuelva a intentarlo mas tarde.');
	});
}

