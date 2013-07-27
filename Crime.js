function getCrimeScore(route,rate) {
	var overview_path = route.overview_path;
	var sampling_rate = Math.round(overview_path.length / rate);
	var myres = new Array();
	for ( var i = 0; i < rate; i++) {
		var point = overview_path[i * sampling_rate];
		var lat = point.lat();
		var lng = point.lng();
		var theUrl = "http://10.87.52.172:8080/Dynamic/Crime?lat=" + lat + "&lon=" + lng + "&radius=0.01";
		var responseText = synchronous_ajax_crime(theUrl);
		myres[i] = responseText;
	}
	return myres;
}
function synchronous_ajax_crime(url, passData) {
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
