var map;
var sanFrancisco;
var geocoder;
var placeService;
var museumMarkerList=[];

function initialize(){
    initializeMap();
    initializeData();
    ko.applyBindings(new viewModel());
    initializeTransMode();
}
// initialize a Google map and customize the style of the map
function initializeMap(){
    sanFrancisco=new google.maps.LatLng(37.77493, -122.419416);
    var styledMapType=new google.maps.StyledMapType([
                {
                  "featureType": "administrative",
                  "elementType": "labels.text.fill",
                    "stylers": [{"color": "#444444"}]
                },
                {
                    "featureType": "landscape",
                    "elementType": "all",
                    "stylers": [{"color": "#f2f2f2"}]
                },
                {
                    "featureType": "poi",
                    "elementType": "all",
                    "stylers": [{"visibility": "off"}]
                },
                {
                    "featureType": "road",
                    "elementType": "all",
                    "stylers": [{"saturation": -100},{"lightness": 45}]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "all",
                    "stylers": [{"visibility": "simplified"}]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "labels.icon",
                    "stylers": [{"visibility": "off"}]
                },
                {
                    "featureType": "transit",
                    "elementType": "all",
                    "stylers": [{"visibility": "off"}]
                },
                {
                    "featureType": "water",
                    "elementType": "all",
                    "stylers": [{"color": "#46bcec"},{"visibility": "on"}]
                }],{name: 'Blue world'});

    map = new google.maps.Map(document.getElementById("map"), {
        center: sanFrancisco,
        zoom: 13,
        mapTypeControlOptions: {
                    mapTypeIds: [
                            'styled_map']
        },
        disableDefaultUI: true
    });
    map.mapTypes.set('styled_map', styledMapType);
    map.setMapTypeId('styled_map');
}

//request the data about the museums in San Francisco
function initializeData(){
    var request ={
          location:sanFrancisco,
          radius:'1800',
          types:['museum'],
      };

    placeService=new google.maps.places.PlacesService(map);
    placeService.nearbySearch(request,getResults);

    function getResults(results,status){
          if (status == google.maps.places.PlacesServiceStatus.OK){
              generateMarker(results);
          }
    }
}

//Generate the markers on the map with the responded data
function generateMarker(results) {
    var bounds = new google.maps.LatLngBounds();
    var infoWindow=new google.maps.InfoWindow();
    var directions=document.getElementsByClassName('direction');
    var optionValue;

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

        bounds.extend(result.geometry.location);

        marker.addListener('click', function(){
                 populatePanorama(this,infoWindow);
                 populateBizWiki(this,infoWindow);
          });
       }
      map.fitBounds(bounds);
      map.setCenter(sanFrancisco);
      map.setZoom(13);
      for(var j=0;j<museumMarkerList.length;j++){
              optionValue+='<option>'+museumMarkerList[j].title+'</option>';
      }
      for(var k=0;k<directions.length;k++){
              directions[k].innerHTML=optionValue;
      }
}

//Populate panorama info window
function populatePanorama(marker,infoWindow){
     var streetViewService=new google.maps.StreetViewService();
     var radius=50;
     function getStreetView(data){
        var nearStreetViewLocation = data.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
        infoWindow.setContent('<div>' + marker.title + '</div><div id="panorama"></div>');
        var panoramaOptions = {
                position: nearStreetViewLocation,
                pov: {
                  heading: heading,
                  pitch: 30
                }
         };
        var panorama = new google.maps.StreetViewPanorama(document.getElementById('panorama'), panoramaOptions);
    }
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
    infoWindow.open(map, marker);
}

//Populate the business and Wiki info window(if any)
function populateBizWiki(marker){
     var service = new google.maps.places.PlacesService(map);
     var infoWindow=new google.maps.InfoWindow();
     var innerHTML;
    service.getDetails({
      placeId: marker.id
    }, function(place, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
          innerHTML= '<div>';
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
        innerHTML += '</div>';
         }
       }
    );
    var wikiUrl='https://en.wikipedia.org/w/api.php?action=opensearch&search='+marker.title+'&format=json&callback=wikiCallback';
    $.ajax({
        url: wikiUrl,
        dataType:'jsonp',
        method:'GET'}).done(function(response){
          var articleList=response[1];
            if(articleList.length===0){
                innerHTML+='<br><div>No results found in wikipedia.</<div></br>';
                 infoWindow.setContent(innerHTML);
                 infoWindow.open(map, marker);
                  return;
               }
            for(var i=0;i<articleList.length;i++){
               var url='https://en.wikipedia.org/wiki/'+articleList[i];
               innerHTML +='<div>Wiki: <a href="'+url+'" target="_blank">'+articleList[i]+'</a></li>';
            }

            infoWindow.setContent(innerHTML);
            infoWindow.open(map, marker);

    });
}


//Initialize the "From, To, Travel Mode" function
function initializeTransMode(){
    var directionsDisplay = new google.maps.DirectionsRenderer;
    var directionsService = new google.maps.DirectionsService;
    directionsDisplay.setMap(map);
    var detailedDirection=document.getElementById('detailedDirectiron');
    var closeDirection=document.getElementById('closeDirection');
    directionsDisplay.setPanel(detailedDirection);
    var control = document.getElementById('directionPanel');
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);
    var onChangeHandler = function() {
          calculateAndDisplayRoute(directionsService, directionsDisplay,detailedDirection);
    };
    closeDirection.addEventListener('click',function(){detailedDirection.style.display='none';directionsDisplay.setMap(null);});
    document.getElementById('start').addEventListener('change', onChangeHandler);
    document.getElementById('end').addEventListener('change', onChangeHandler);
    document.getElementById('mode').addEventListener('change', onChangeHandler);
}

//Calculate and display the route on the map
function calculateAndDisplayRoute(directionsService, directionsDisplay,detailedDirection) {
    var start = document.getElementById('start').value+', San Francisco';
    var end = document.getElementById('end').value+', San Francisco';

    directionsDisplay.setMap(map);
    detailedDirection.style.display='block';
    closeDirection.style.display='block';
    directionsService.route({
      origin: start,
      destination: end,
      travelMode: document.getElementById('mode').value,
    }, function(response, status) {
      if (status === 'OK') {
        directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
}

var viewModel=function(){
    var self=this;

    // Concern1: to be honest, I feel using ko's array is a worse choice compared
    //to using DOM to put those markers into HTML tags in the map function above right after the marker was generated one after
    //another:
    //var marker = new google.maps.Marker({
            //     map: map,
            //     icon: markerImage,
            //     title: result.name,
            //     position: result.geometry.location,
            //     id:result.place_id
            // });
    //innerHTML+='<li>marker.title</li'>...
    //ul.append(innerHTML)...

    //By doing as above, I don't have to use window.onload to wait for the google map to be loaded so that I can
    //get a stuffed museumMarkerList.If I don't use window.onload, the size of museumMarkerList will be 0 at the following point.
    //What do you think?
    this.museumList=ko.observableArray([]);
     window.onload=function(){
        museumMarkerList.forEach(function(museumEle){
        self.museumList.push(museumEle);
     });};

    this.passMarker=function(){
        var address=this.title;
        geoCoding(address);
    };

    this.processMarker=function(){
      // Concern2: I tried to use data-bind:textInput to get the value from input,
      //but the documentation said it won't work with valueUpdate,which I had to use on
      //input element. What do you think?
        var address = $('#name').val();
        var listCompare=[];
        for(var i=0;i<museumMarkerList.length;i++){
          if(museumMarkerList[i].title.toUpperCase()!==name.toUpperCase()){
              listCompare.push(museumMarkerList[i].title);
          }
        }
        if(listCompare.length==museumMarkerList.length){
          $('#alert').css('display','block');
          $('#alertClose').on('click',function(){$('#alert').css('display','none');});
        }else{geoCoding(address);}
    };

  function geoCoding(name){
    geocoder = new google.maps.Geocoder();
      geocoder.geocode( { 'address': name}, function(results, status) {
          if (status == 'OK') {
            map.setCenter(results[0].geometry.location);
            map.setZoom(16);
            for(var i=0;i<museumMarkerList.length;i++){
                  museumMarkerList[i].setMap(null);
                  if(museumMarkerList[i].title.toUpperCase()==name.toUpperCase()){
                        museumMarkerList[i].position=results[0].geometry.location;
                        museumMarkerList[i].setMap(map);
                  }
            }
          }else {
            window.alert('Cannot locate the museum!');
          }
      });
  }

  self.check=function(){
// Concern3: In the for loop, at the beginning, instead of using DOM, I used
//self.museumList.remove(self.museumList()[i]) to remove the li items that do not
//contain the string that the user type in. However, if the user deletes what he typed
//and retype again, then the remaining li items still won't show up because they were already removed
//when the user typed first time, which is really bad experience, so here I would rather
//use DOM just to show/hide the li items rather than delete them. I tried to use data-bind:'css: function'
//on the li item in html, but the function had to be related to this self.check function
//since what li items should be shown depends on what the user types in. The situiation became
//complicated so I gave up using data-bind:'css: function' here. What do you think?
       var value = $('#name').val().toUpperCase();
       var li=$(".li");
        for(var i=0;i<self.museumList().length;i++){
            if(self.museumList()[i].title.toUpperCase().indexOf(value)<0){
               li[i].style.display='none';
            }else{
               li[i].style.display='inline-block';
            }
        }
   };

  this.toggleDisplay=function(){
     $('.nav').toggleClass('showNav');
     $('.map').toggleClass('shrinkMap');
  };

  this.translatePanel=function(){
       $('.nav').toggleClass('navDisplay');
  };

  this.toggleMarkers=function(){
      for(var i=0;i<self.museumList().length;i++){
            self.museumList()[i].setMap(map);
            map.setZoom(13);
      }

  };
};


