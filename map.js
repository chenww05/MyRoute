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
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
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
		var _colour = '#FF0000';
		var _stokeWeight = 5;
		var _strokeOpacity = 0.2;
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

  var request = {
		origin: start,
		destination: end,
		travelMode: google.maps.DirectionsTravelMode.DRIVING,
		provideRouteAlternatives: all_route
  };
  directionsService.route(request, function(result, status) {

  if (status == google.maps.DirectionsStatus.OK)
  {
		if(all_route)
		{
			var rendererOptions = getRendererOptions(true);
			var rate = 5;
			document.getElementById("updateArea").innerHTML = "";
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
						var msg = "<p>Route " + i + " has " + sum + " crimes on average</p>";
						
						document.getElementById("updateArea").innerHTML =  document.getElementById("updateArea").innerHTML + msg ;
						
						if(sum < min){
							min = sum;
							best = i;
						} 
					}
					renderDirections(result, rendererOptions, best);
					break;
				case 'weather':
					var best = 0;
					var min = 100000;
					for (var i = 0; i < result.routes.length; i++)
					{
						var rep = getWeatherScore(result.routes[i], rate);
						var sum = 0;
						for(var j = 0; j< rep.length; j++){
							var record = JSON.parse(rep[j]);
							sum += record.main.temp_max;
						}
						sum = sum / rate /10;
						var msg = "<p>The max temp of route " + i + " is " + sum + "  C on average</p>";
						
						document.getElementById("updateArea").innerHTML +=  msg ;
						
						if(sum < min){
							min = sum;
							best = i;
						} 
					}
					renderDirections(result, rendererOptions, best);
					break;
				case 'restaurant':
					var best = 0;
					var max = 0;
					for (var i = 0; i < result.routes.length; i++)
					{
						var rep = getYelpScore(result.routes[i], rate);
						var sum = 0;
						for(var j = 0; j< rep.length; j++){
							var record = JSON.parse(rep[j]);
							sum += record.total;
						}
						sum = Math.round(sum / rate);
						var msg = "<p>Route " + i + " has " + sum + " restaurants on average</p>";
						
						document.getElementById("updateArea").innerHTML += msg ;
						
						if(sum > max){
							max = sum;
							best = i;
						} 
					}
					renderDirections(result, rendererOptions, best);
					break;
				case 'beauty':
					var best = 0;
					var max = 0;
					var bestRoute ;
					for (var i = 0; i < result.routes.length; i++)
					{
						var rep = getFlickrScore(result.routes[i], rate);
						//alert(rep.length);
						var sum = 0;
						for(var j = 0; j< rep.length; j++){
							var record = JSON.parse(rep[j]);							
							sum += Number(record.photos.total);
						}
						sum = Math.round(sum / rate);
						var msg = "<p>Route " + i + " has " + sum + " photos on average</p>";
						
						document.getElementById("updateArea").innerHTML =  document.getElementById("updateArea").innerHTML + msg ;
						
						if(sum > max){
							max = sum;
							best = i;
							bestRoute = rep;
						} 
					}
					var rep = bestRoute;
					for(var j = 0; j < rep.length; j++){ // points
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
					renderDirections(result, rendererOptions, best);
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

