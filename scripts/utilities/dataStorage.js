function DataStorage(){
	var dataStorageInterface = {
		readData: function(key){
			return localStorage.getItem(key);
		},
		
		writeData: function(key, value){
			if (typeof(Storage) !== "undefined") {
				localStorage.setItem(key, value);
			} else {
				console.log('Sorry! No Web Storage support..');
			}
		}, 
		
		removeData: function(key){
			localStorage.removeItem(key);
		}
	};
	
	return dataStorageInterface;
}

