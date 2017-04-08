var map;
var geocoder;
var placeService;
var museumMarkerList=[];

function initialize(){
    var sanFrancisco=new google.maps.LatLng(37.77493, -122.419416);
    var styledMapType=new google.maps.StyledMapType(
                [
                         {
                    "featureType": "administrative",
                    "elementType": "labels.text.fill",
                    "stylers": [
                        {
                            "color": "#444444"
                        }
                    ]
                },
                {
                    "featureType": "landscape",
                    "elementType": "all",
                    "stylers": [
                        {
                            "color": "#f2f2f2"
                        }
                    ]
                },
                {
                    "featureType": "poi",
                    "elementType": "all",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "all",
                    "stylers": [
                        {
                            "saturation": -100
                        },
                        {
                            "lightness": 45
                        }
                    ]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "all",
                    "stylers": [
                        {
                            "visibility": "simplified"
                        }
                    ]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "labels.icon",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "transit",
                    "elementType": "all",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "all",
                    "stylers": [
                        {
                            "color": "#46bcec"
                        },
                        {
                            "visibility": "on"
                        }
                    ]
               }
          ],{name: 'Blue world'});
    map = new google.maps.Map(document.getElementById("map"), {
        center: sanFrancisco,
        zoom: 13,
        mapTypeControlOptions: {
                    mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain',
                            'styled_map']
        }
    });
    map.mapTypes.set('styled_map', styledMapType);
    map.setMapTypeId('roadmap');

    var request ={
        location:sanFrancisco,
        radius:'1800',
        types:['museum'],
    };

    placeService=new google.maps.places.PlacesService(map);
    placeService.nearbySearch(request,getResults);

    function getResults(results,status){
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            generateMarker(results);
        }
    }

    function generateMarker(results) {

        var bounds = new google.maps.LatLngBounds();
        var infoWindow=new google.maps.InfoWindow();
        var li = document.getElementById('li');


        for (var i = 0; i<results.length; i++) {
            var result=results[i];
            var markerImage={
                url:result.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };
            var marker = new google.maps.Marker({
                map: map,
                icon: markerImage,
                title: result.name,
                position: result.geometry.location,
                id:result.place_id
            });

            museumMarkerList.push(marker);
            li.innerHTML += '<li>' + result.name + '</li>';

            bounds.extend(result.geometry.location);

            marker.addListener('click', function(){
                   populateInfoWindow(this,infoWindow);

                   showPanel(this);
            });
       }
          map.fitBounds(bounds);
    }

    function populateInfoWindow(marker,infoWindow){

           var streetViewService=new google.maps.StreetViewService();
           var radius=50;

           function getStreetView(data){
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
                infoWindow.setContent('<div>' + marker.title + '</div><div id="panoroma"></div>');

                var panoramaOptions = {
                      position: nearStreetViewLocation,
                      pov: {
                        heading: heading,
                        pitch: 30
                      }
               };
                var panorama = new google.maps.StreetViewPanorama(
                  document.getElementById('panoroma'), panoramaOptions);
        }
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
           infoWindow.open(map, marker);
    }

    function showPanel(marker){
        document.querySelector('#panel').style.display='block';
        var info=$('.info');
        var description =$('.description');
        var value=marker.title;

         var service = new google.maps.places.PlacesService(map);
          service.getDetails({
            placeId: marker.id
          }, function(place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          // Set the marker property on this infowindow so it isn't created again.
          console.log(place);
          var innerHTML = '<div>';
          if (place.name) {
            innerHTML += '<strong>' + place.name + '</strong>';
          }
          if (place.website) {
            innerHTML += '<br><a href="'+place.website+'">'+ place.website+'</a>';
          }
          if (place.rating) {
            innerHTML += '<br><strong style="color: #DA413D">Rating: '+ place.rating+'</strong>';
          }
          if (place.formatted_address) {
            innerHTML += '<br>' + place.formatted_address;
          }
          if (place.formatted_phone_number) {
            innerHTML += '<br>' + place.formatted_phone_number;
          }
          if (place.opening_hours) {
            innerHTML += '<br><br><strong>Hours:</strong><br>' +
                place.opening_hours.weekday_text[0] + '<br>' +
                place.opening_hours.weekday_text[1] + '<br>' +
                place.opening_hours.weekday_text[2] + '<br>' +
                place.opening_hours.weekday_text[3] + '<br>' +
                place.opening_hours.weekday_text[4] + '<br>' +
                place.opening_hours.weekday_text[5] + '<br>' +
                place.opening_hours.weekday_text[6];
          }
          if (place.photos) {
            innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
                {maxHeight: 100, maxWidth: 200}) + '">';
          }
          innerHTML += '</div>';
          info.html(innerHTML);

       }
   });
        var wikiUrl='https://en.wikipedia.org/w/api.php?action=opensearch&search='+value+'&format=json&callback=wikiCallback';
        // console.log('value: '+value);
        var timer=setTimeout(function(){
         description.text('No info from wikipedia').css('color','#006E51');
        },3000);

        $.ajax({
            url: wikiUrl,
            dataType:'jsonp',
            success:function(response){
                console.log('response: '+response.length);
                var articleList=response[1];
                if(articleList.length===0){
                    description.html('');
                    return;
                   }
                for(var i=0;i<articleList.length;i++){
                   description.html('');
                   var url='https://en.wikipedia.org/wiki/'+articleList[i];
                   description.append('<li>Wiki: <a href="'+url+'">'+articleList[i]+'</a></li>');
                }

                clearTimeout(timer);
            }
        });

        $('.close').on('click',function(){
            $('#panel').css('display','none');
        });

    }

}

var viewModel=function(address){

    this.processMarker1=function(){
      for(var i=0;i<museumMarkerList.length;i++){
        museumMarkerList[i].setMap(null);
      }
      geocoder = new google.maps.Geocoder();
      var address = document.getElementById('name').value;
      geocoder.geocode( { 'address': address}, function(results, status) {
          if (status == 'OK') {
            map.setCenter(results[0].geometry.location);
            map.setZoom(16);
            for(var i=0;i<museumMarkerList.length;i++){
                  if(museumMarkerList[i].title==address){
                    museumMarkerList[i].position=results[0].geometry.location;
                    museumMarkerList[i].setMap(map);
                  }
            }

          }else {
            window.alert('cannot locate the museum!');
          }
      });
  };

  this.processMarker2=function(){
      for(var i=0;i<museumMarkerList.length;i++){
        museumMarkerList[i].setMap(null);
      }
      geocoder = new google.maps.Geocoder();
      var address = document.getElementById('li');
      console.log("address:"+address);
      geocoder.geocode( { 'address': address}, function(results, status) {
          if (status == 'OK') {
            map.setCenter(results[0].geometry.location);
            map.setZoom(16);
            for(var i=0;i<museumMarkerList.length;i++){
                  if(museumMarkerList[i].title==address){
                    museumMarkerList[i].position=results[0].geometry.location;
                    museumMarkerList[i].setMap(map);
                  }

            }

          }else {
            window.alert('cannot locate the museum!');
          }
      });
  };

};
ko.applyBindings(new viewModel());

