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

   //request the museum list in San Francisco
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
        // var li = document.getElementById('li');


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
       $('#panel').css('display','block');
        var info=$('.info');
        var description =$('.description');
        var value=marker.title;

         var service = new google.maps.places.PlacesService(map);
          service.getDetails({
            placeId: marker.id
          }, function(place, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
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
            method:'GET'}).done(function(response){
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
            });

          $('.close').on('click',function(){
          console.log('ho');
          $('#panel').css('display','none');
        });
    }
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
        geoCoding(address);
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
                  }else{
                    window.alert('Sorry,we cannot locate your museum. Please check your type.');
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
               li[i].style.display='block';
            }
        }
   };

  this.translatePanel=function(){
         var nav=document.getElementById('nav');
         if(nav.style.width=='50%'){
            nav.style.width='0';
         }
         else{
         nav.style.width='50%';
       }
  };

};
ko.applyBindings(new viewModel());

