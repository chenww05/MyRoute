var req;

function getWeatherScore(route,rate) {
	var overview_path = route.overview_path;
	var sampling_rate = Math.round(overview_path.length / rate);
	var myres = new Array();
	
	for ( var i = 0; i < rate; i++) {
		var point = overview_path[i * sampling_rate];
		var lat = point.lat();
		var lng = point.lng();
		var theUrl = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lng;
alert(theUrl);
		var responseText = synchronous_ajax(theUrl);
alert(responseText);

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
