function getYelpScore(route)
{
	var rate = 10;
	var sampling_rate = overview_path.length / rate;
	for(var i = 0;i < rate; i++)
	{
		var point = overview_path[i*sampling_rate];
		var lat = point.lat();
		var lng = point.lng();
		var xmlHttp = new XMLHttpRequest(); 
  		xmlHttp.onreadystatechange = ProcessRequest();
		var theUrl = "http://localhost:8080/Dynamic/YelpAPI?lat="+lat+"&lng="+lng;
		alert(theUrl);
    		xmlHttp.open( "GET", theUrl, true );
    		xmlHttp.send( null );
		alert(xmlHttp.responseText);
		
	}
	return 0;
}
