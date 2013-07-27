var directionDisplay;
var directionsRenderer;
var directionsService = new google.maps.DirectionsService();
var map;

function validateForm(form)
{
  drawMap("0, 0");
  var to=document.forms["myForm"]["to"].value;
  var from=document.forms["myForm"]["from"].value;
  var preference=document.forms["myForm"]["preference"].value;
  requestDirections(from, to, 0, true, preference);
  }
function drawMap(midpoint) {
	var mid = midpoint.split(",");
	var start = new google.maps.LatLng(mid[0], mid[1]);
	var myOptions = {
		zoom:7,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		center: start,
   	mapTypeControl: false
	}
	map = new google.maps.Map(document.getElementById("map_canvas"));
}

function getRendererOptions(main_route)
{
	if(main_route)
	{
		var _colour = '#00458E';
		var _strokeWeight = 4;
		var _strokeOpacity = 1.0;
		var _suppressMarkers = false;
	}
	else
	{
		var _colour = '#ED1C24';
		var _strokeWeight = 2;
		var _strokeOpacity = 0.7;
		var _suppressMarkers = false;
	}

	var polylineOptions ={ 
		strokeColor: _colour, 
		strokeWeight: _strokeWeight, 
		strokeOpacity: _strokeOpacity 
	 };

	var rendererOptions = {
		draggable: false, 
		suppressMarkers: _suppressMarkers, 
		polylineOptions: polylineOptions
	};

	return rendererOptions;
}

function renderDirections(result, rendererOptions, routeToDisplay)
{

	if(routeToDisplay==0)
	{
		var _colour = '#00458E';
		var _strokeWeight = 4;
		var _strokeOpacity = 1.0;
		var _suppressMarkers = false;
	}
	else if(routeToDisplay==1)
	{
		var _colour = '#ED1C24';
		var _strokeWeight = 4;
		var _strokeOpacity = 0.7;
		var _suppressMarkers = false;
	}
	else
	{
		var _colour = '#6CF206';
		var _stokeWeight = 5;
		var _strokeOpacity = 1.0;
		var _suppressMarkers = false;
	}

		// create new renderer object
		var directionsRenderer = new google.maps.DirectionsRenderer({
			draggable: false, 
			suppressMarkers: _suppressMarkers, 
			polylineOptions: { 
				strokeColor: _colour, 
				strokeWeight: _strokeWeight, 
				strokeOpacity: _strokeOpacity  
				}
			});
		directionsRenderer.setMap(map);
		directionsRenderer.setDirections(result);
		directionsRenderer.setRouteIndex(routeToDisplay);
}

function requestDirections(start, end, routeToDisplay, all_route, preference) {
	//var map = new google.maps.Map(document.getElementById("map_canvas"));
  var request = {
		origin: start,
		destination: end,
		travelMode: google.maps.DirectionsTravelMode.DRIVING,
		provideRouteAlternatives: all_route
  };
  directionsService.route(request, function(result, status) {
		document.getElementById("updateArea").innerHTML = "";

  if (status == google.maps.DirectionsStatus.OK)
  {
		if(all_route)
		{
			var rendererOptions = getRendererOptions(true);
			var rate = 5;
			document.getElementById("photoArea").innerHTML= "";
			switch(preference)
			{
			
			case 'all':
				for (var i = 0; i < result.routes.length; i++)
				{
					renderDirections(result, rendererOptions, i);
				}
				break;
				case 'safety':
					var best = 0;
					var min = 10000;
					var bestRoute;
					for (var i = 0; i < result.routes.length; i++)
					{
						var rep = getCrimeScore(result.routes[i], rate);
						var sum = 0;
						for(var j = 0; j< rep.length; j++){
							var record = JSON.parse(rep[j]);
							sum += record.crimes.length;
							//alert(record.crimes.length);
						}
						sum = Math.round(sum / rate);
						var msg = "Route " + i + " has " + sum + " crimes on average; ";
						
						document.getElementById("updateArea").innerHTML =  document.getElementById("updateArea").innerHTML + msg ;
						
						if(sum < min){
							min = sum;
							best = i;
							bestRoute = rep;
						} 
					}
					renderDirections(result, rendererOptions, best);
					var rep = bestRoute;
					for(var j = 0; j< rep.length; j++){
						var record = JSON.parse(rep[j]);
						//sum += record.crimes.length;
						var msg ;
						for(var k = 0; k< record.crimes.length && k < 5; k++)
						{ 
							msg += record.crimes[0].address;
						}
						document.getElementById("photoArea").innerHTML +=  "<p>" + msg + "</p>";
					}
					break;
				case 'weather':
					var best = 0;
					var min = 100000;
					var bestRoute ;
					for (var i = 0; i < result.routes.length; i++)
					{
						var rep = getWeatherScore(result.routes[i], rate);
						var sum = 0;
						for(var j = 0; j< rep.length; j++){
							var record = JSON.parse(rep[j]);
							sum += record.main.temp_max;
						}
						sum = Math.round(sum / rate *10)/100;
						var msg = "The max temp of route " + i + " is " + sum + "  C on average; ";
						
						document.getElementById("updateArea").innerHTML +=  msg ;
						
						if(sum < min){
							min = sum;
							best = i;
							bestRoute = rep;
						} 
					}
					renderDirections(result, rendererOptions, best);
					var rep = bestRoute;
					for(var j = 0; j< rep.length; j++){
						var record = JSON.parse(rep[j]);
						var icon =  record.weather[0].icon;
						var image_url = "http://openweathermap.org/img/w/" + icon + ".png";
						var msg = '<a href="' + image_url + '">' + '<img alt="' + 'Beauty' + '"src="' + image_url + '"/>' + '</a>';
						document.getElementById("photoArea").innerHTML += msg;
						var myLatlng = new google.maps.LatLng(record.coord.lat,record.coord.lon);
						  var marker = new google.maps.Marker({
						      position: myLatlng,
						      map: map,
						      title: 'Hello World!',
						      icon: image_url
						  });
					}
					break;
				case 'restaurant':
					var best = 0;
					var max = 0;
					var bestRoute ;
					for (var i = 0; i < result.routes.length; i++)
					{
						var rep = getYelpScore(result.routes[i], rate);
						var sum = 0;
						for(var j = 0; j< rep.length; j++){
							var record = JSON.parse(rep[j]);
							sum += record.total;
						}
						sum = Math.round(sum / rate);
						var msg = "Route " + i + " has " + sum + " restaurants on average; ";
						
						document.getElementById("updateArea").innerHTML += msg ;
						
						if(sum > max){
							max = sum;
							best = i;
							bestRoute = rep;
						} 
					}
					renderDirections(result, rendererOptions, best);
					var rep = bestRoute;
					for(var j = 0; j < rep.length; j++){ // points
						var record = JSON.parse(rep[j]);
						for (var k = 0; k < 2; k++){
							shops = record.businesses;
							if(shops.length > 2){
								var image_url=JSON.parse(getYelpPhoto(shops[k].id)).image_url;
							
							var msg = '<a href="' + image_url + '">' + '<img alt="' + 'Beauty' + '"src="' + image_url + '"/>' + '</a>';
							document.getElementById("photoArea").innerHTML += msg;
							var address = shops[k].location.address + "," + shops[k].location.city +","+
							+shops[k].location.state_code +","+ shops[k].location.postal_code;
							
							geocoder.geocode( { 'address': address}, function(results, status) {
							      if (status == google.maps.GeocoderStatus.OK) {
							        var marker = new google.maps.Marker({
							            map: map,
							            position: results[0].geometry.location
							        });
							      } else {
							        alert("Geocode was not successful for the following reason: " + status);
							      }
							    });
							}
						}
					}
					break;
				case 'beauty':
					var best = 0;
					var max = 0;
					var bestRoute ;
					for (var i = 0; i < result.routes.length; i++)
					{
						var rep = getFlickrScore(result.routes[i], rate);
						var sum = 0;
						for(var j = 0; j< rep.length; j++){
							var record = JSON.parse(rep[j]);							
							sum += Number(record.photos.total);
						}
						sum = Math.round(sum / rate);
						var msg = "Route " + i + " has " + sum + " photos on average; ";
						
						document.getElementById("updateArea").innerHTML =  document.getElementById("updateArea").innerHTML + msg ;
						
						if(sum > max){
							max = sum;
							best = i;
							bestRoute = rep;
						} 
					}
					renderDirections(result, rendererOptions, best);
					var rep = bestRoute;
					for(var j = 0; j < rep.length; j++){ // points
						
						var idx = result.routes[best].overview_path.length / rate * j;
						
							console.log(idx);
							var point = result.routes[best].overview_path[idx];
							console.log(point);
							var lat = point.lat();
							var lng = point.lng();
							var myLatlng = new google.maps.LatLng(lat,lng);
							  var marker = new google.maps.Marker({
							      position: myLatlng,
							      map: map,
							      title: 'Hello World!',
							      //icon: image_url
							  });
							  var record = JSON.parse(rep[j]);
						for (var k = 0; k < 2; k++){
							photo = record.photos.photo[k];
							t_url = "http://farm" + photo.farm + ".static.flickr.com/" +
								photo.server + "/" + photo.id + "_" + photo.secret + "_t.jpg";
							p_url = "http://www.flickr.com/photos/" + photo.owner + "/" + photo.id;
							var msg = '<a href="' + p_url + '">' + '<img alt="' + photo.title + '"src="' + t_url + '"/>' + '</a>';
							document.getElementById("photoArea").innerHTML += msg;
						}
					}
					
					break;
				default:
					renderDirections(result, rendererOptions, 0);
			}
		}
		else
		{
			var rendererOptions = getRendererOptions(false);
			renderDirections(result, rendererOptions, routeToDisplay);
		}
  }
  });
}

