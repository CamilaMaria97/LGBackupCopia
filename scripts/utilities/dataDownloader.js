'use strict';
var dataDownloader = {
	//Atributos
	endpoint: 'http://154.62.74.38/api/channels?organizationId=1001&action=getChannels&userId=635181&orderBy=logicalChannelNumber&version=03',
	params: {
		organizationId: '',
		action:'getChannels',
		orderBy: 'logicalChannelNumber',
		version: '03',
	},
	headers: [{
		'Accept': 'text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8'
	}],
	//Lista de canales descargados
	listChannel: [],
	//Login state
	loginStatus: false,
	//Peticion REST al servidor
	downloadChannel: function (id, callback) {
		console.log("Channels load failed " + this.endpoint);
		this.params.organizationId = id;
		console.log(this.endpoint+this.headers+this.params);
		console.log(this.headers);
		console.log(this.params);
		console.log(this.organizationId);
		rest.get(
			this.endpoint,
			this.headers,
			this.params,
			function(data, xhr) { //Success callback
				data.channels.forEach(function (item) {
					//Solucion temporal al fallo de reproduccion de Cuatro y T5. Se ha publicado una url en otro
					//equipo (para cada canal) y se consume desde ahi.
					if (item.serviceId === 4) //CUATRO
				    	item.urls[0].url = 'http://91.126.141.13:1935/live/61/playlist.m3u8';
					if (item.serviceId === 5) //TELECINCO
						item.urls[0].url = 'http://91.126.141.13:1935/live/51/playlist.m3u8';

				    dataDownloader.listChannel.push(item);

				});
				callback && callback(); // if(callback) callback();
			},
			function(data, xhr) { //Error callback
				console.log("Channels load failed " + xhr);
			}
		);
	},
};
