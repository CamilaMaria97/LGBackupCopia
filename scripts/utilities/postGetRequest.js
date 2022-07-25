'use strict';
//sCallback -> Success Callback, called when request went OK
//fCallback -> Failed Callback, called when something went WRONG
function loginService(user, pass, sCallback, fCallback) {
	rest.post(
		'http://154.62.74.38/api2/login?eMail=' + user + "&password=" + pass, 
		null, // TODO make header data with json.
		null, // TODO make body contents data with json.
		function(data, xhr) { 
			// TODO success callback
			sCallback & sCallback (data);
			console.log(data);
		},
		function(data, xhr) { 
			// TODO error callback
			fCallback & fCallback(data);
		}
	);
}

function VODService(sCallback, fCallback) {
	rest.post(	
		'http://154.62.74.38/api/archive?organizationId=14925', 
		null, // TODO make header data with json.
		null, // TODO make body contents data with json.
		function(data, xhr) { 
			// TODO success callback
			sCallback & sCallback (data);
			console.log(data);
		},
		function(data, xhr) { 
			// TODO error callback
			fCallback & fCallback(data);
		}
	);
}

function VODServicecat(user,id, sCallback, fCallback) {
	rest.post(	
		'http://154.62.74.38/api/publishing?version=02&action=getAssets&organizationId='+user+'&language=en_US&groupItemId='+id, 
		null, // TODO make header data with json.
		null, // TODO make body contents data with json.
		function(data, xhr) { 
			// TODO success callback
			sCallback & sCallback (data);
			console.log(data);
		},
		function(data, xhr) { 
			// TODO error callback
			fCallback & fCallback(data);
		}
	);
}

function youtube(cad, sCallback, fCallback) {
	rest.post(	
		'http://154.62.74.34:8080/nntv/api/v1/playlist?id='+cad, 
		null, // TODO make header data with json.
		null, // TODO make body contents data with json.
		function(data, xhr) { 
			// TODO success callback
			sCallback & sCallback (data);
			//console.log(data);
			///mandar a reproducir
			//hay que investigar con la api the youtube
			myVideoApp.nextChannel();
			
		},
		function(data, xhr) { 
			// TODO error callback
			fCallback & fCallback(data);
		}
	);
}


