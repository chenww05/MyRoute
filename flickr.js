var req;
var api_key = "68568a9e4695f65e42c60d28a3e93fea";
function getFlickrScore(route,rate) {
	var overview_path = route.overview_path;
	var sampling_rate = Math.round(overview_path.length / rate);
	var myres = new Array();
	for ( var i = 0; i < rate; i++) {
		var point = overview_path[i * sampling_rate];
		var lat = point.lat();
		var lng = point.lng();
		var theUrl = "http://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=" 
			+ api_key + "&lat=" + lat	+ "&lon=" + lng + "&format=json&nojsoncallback=1&radius=32";
		var responseText = synchronous_ajax(theUrl);
		
		myres[i] = responseText;
	}
	return myres;
}
function synchronous_ajax(url, passData) {
	if (window.XMLHttpRequest) {
		AJAX = new XMLHttpRequest();
	} else {
		AJAX = new ActiveXObject("Microsoft.XMLHTTP");
	}
	if (AJAX) {
		AJAX.open("GET", url, false);
		AJAX.setRequestHeader("Content-type",
				"application/x-www-form-urlencoded");
		AJAX.send(null);
		return AJAX.responseText;
	} else {
		return false;
	}
}
