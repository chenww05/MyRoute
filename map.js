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
			switch(preference)
			//for (var i = 0; i < result.routes.length; i++)
			{
				case 'safety':
					renderDirections(result, rendererOptions, 0);
					break;
				case 'weather':
					renderDirections(result, rendererOptions, 1);
					break;
				case 'restaurant':
					var score = getYelpScore(result.routes[0]);
					renderDirections(result, rendererOptions, 2);
					break;
				default:
					renderDirections(result, rendererOptions, result.routes.length);
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

