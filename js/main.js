var map;
var sanFrancisco;
var geocoder;
var placeService;
var museumMarkerList = [];
var infoWindow;

function googleError() {
    window.alert("Failed to load Google Map");
}

function initialize() {
    initializeMap();
    initializeData();
    if (typeof map === 'undefined' || map === null) {
        window.alert('The map cannot be loaded.');
    } else {
        ko.applyBindings(new ViewModel());
    }

    initializeTransMode();
}

// initialize a Google map and customize the style of the map
function initializeMap() {
    sanFrancisco = new google.maps.LatLng(37.77493, -122.419416);
    var styledMapType = new google.maps.StyledMapType([{
            "featureType": "administrative",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#444444"
            }]
        },
        {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{
                "color": "#f2f2f2"
            }]
        },
        {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "road",
            "elementType": "all",
            "stylers": [{
                "saturation": -100
            }, {
                "lightness": 45
            }]
        },
        {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [{
                "visibility": "simplified"
            }]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [{
                "visibility": "off"
            }]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{
                "color": "#46bcec"
            }, {
                "visibility": "on"
            }]
        }
    ], {
        name: 'Blue world'
    });

    map = new google.maps.Map(document.getElementById("map"), {
        center: sanFrancisco,
        zoom: 13,
        mapTypeControlOptions: {
            mapTypeIds: ['styled_map']
        },
        disableDefaultUI: true
    });
    map.mapTypes.set('styled_map', styledMapType);
    map.setMapTypeId('styled_map');
    infoWindow = new google.maps.InfoWindow();
}

//request the data about the museums in San Francisco
function initializeData() {
    var request = {
        location: sanFrancisco,
        radius: '5000',
        types: ['museum'],
    };

    placeService = new google.maps.places.PlacesService(map);
    placeService.nearbySearch(request, getResults);

    function getResults(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            generateMarker(results);
        } else {
            window.alert('Place service request failed due to ' + status);
        }
    }
}

//Generate the markers on the map with the responded data
function generateMarker(results) {
    var bounds = new google.maps.LatLngBounds();
    // var infoWindow=new google.maps.InfoWindow();
    var directions = document.getElementsByClassName('direction');
    var optionValue;

    for (var i = 0; i < results.length; i++) {
        var result = results[i];
        var markerImage = {
            url: result.icon,
            size: new google.maps.Size(71, 71),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25)
        };
        var marker = new google.maps.Marker({
            map: map,
            icon: markerImage,
            title: result.name,
            position: result.geometry.location,
            id: result.place_id,
            animation: google.maps.Animation.DROP,
        });

        museumMarkerList.push(marker);

        bounds.extend(result.geometry.location);

        marker.addListener('click', function() {
            animateMarker(this);
            populateBizWiki(this);
        });
    }
    google.maps.event.addDomListener(window, 'resize', function() {
        map.fitBounds(bounds);
    });
    map.setCenter(sanFrancisco);
    map.setZoom(13);
    for (var j = 0; j < museumMarkerList.length; j++) {
        optionValue += '<option>' + museumMarkerList[j].title + '</option>';
    }
    for (var k = 0; k < directions.length; k++) {
        directions[k].innerHTML = optionValue;
    }
}

//Populate the business and Wiki info window(if any)
function populateBizWiki(marker) {
    var innerHTML='';
    placeService.getDetails({
        placeId: marker.id
    }, function(place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            innerHTML += '<div>';
            if (place.name) {
                innerHTML += '<strong>' + place.name + '</strong>';
            }
            if (place.website) {
                innerHTML += '<br><a href="' + place.website + '">' + place.website + '</a>';
            }
            if (place.rating) {
                innerHTML += '<br><strong style="color: #DA413D">Rating: ' + place.rating + '</strong>';
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
        } else {
            window.alert('Place service request failed due to ' + status);
        }
    });

    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';

    $.ajax({
        url: wikiUrl,
        dataType: 'jsonp',
        method: 'GET'
    }).done(function(response) {
        var articleList = response[1];
        if (articleList.length === 0) {
            innerHTML += '<br><div>No results found on wikipedia.</<div></br>';
        }
        for (var i = 0; i < articleList.length; i++) {
            var url = 'https://en.wikipedia.org/wiki/' + articleList[i];
            innerHTML += '<div>Wiki: <a href="' + url + '" target="_blank">' + articleList[i] + '</a></li></<div>';
        }
        innerHTML+='<div></div><div id="panorama"></div>';
        infoWindow.setContent(innerHTML);
        populatePanorama(marker);
    }).fail(function(err) {
        innerHTML += '<br><div>Cannot load wikipedia results due to error(s).</<div></br>';
        infoWindow.setContent(innerHTML);
        populatePanorama(marker);
    });
}

//Populate panorama info window
function populatePanorama(marker) {
    var streetViewService = new google.maps.StreetViewService();
    var radius = 50;
    function getStreetView(data) {
        var nearStreetViewLocation = data.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
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

//Animate the marker when it is clicked
function animateMarker(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 7000);
    }
}


//Initialize the "From, To, Travel Mode" function.
function initializeTransMode() {
   directionsDisplay = new google.maps.DirectionsRenderer();
   directionsService = new google.maps.DirectionsService();
    directionsDisplay.setMap(map);
    var detailedDirection = document.getElementById('detailedDirectiron');
    var closeDirection = document.getElementById('closeDirection');
    directionsDisplay.setPanel(detailedDirection);
    var control = document.getElementById('directionPanel');
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);
    var onChangeHandler = function() {
        calculateAndDisplayRoute(directionsService, directionsDisplay, detailedDirection);
    };
    closeDirection.addEventListener('click', function() {
        detailedDirection.style.display = 'none';
        directionsDisplay.setMap(null);
    });
    document.getElementById('start').addEventListener('change', onChangeHandler);
    document.getElementById('end').addEventListener('change', onChangeHandler);
    document.getElementById('mode').addEventListener('change', onChangeHandler);
}

//Calculate and display the route on the map
function calculateAndDisplayRoute(directionsService, directionsDisplay, detailedDirection) {
    start = document.getElementById('start').value + ', San Francisco';
    end = document.getElementById('end').value + ', San Francisco';

    directionsDisplay.setMap(map);
    detailedDirection.style.display = 'block';
    closeDirection.style.display = 'block';
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


var ViewModel = function() {

    var self = this;

    self.museumList = ko.observableArray([]);

    window.onload = function() {
        museumMarkerList.forEach(function(museumEle) {
            self.museumList.push(museumEle);
        });
    };

    self.triggerMarker = function() {
        var address = this.title;
        geoCoding(address);
    };

    self.name = ko.observable('');

    self.filteredMuseumList = ko.computed(function() {
        return ko.utils.arrayFilter(self.museumList(), function(museumMarker) {
            museumMarker.setMap(null);
            if (museumMarker.title.toUpperCase().match(self.name().toUpperCase())) {
                museumMarker.setMap(map);
                return museumMarker;
            }
        });
    });

    self.visibleAlert = ko.observable(false);

    self.verifyUserInput = function() {
        var listCompare = [];
        for (var i = 0; i < museumMarkerList.length; i++) {
            if (museumMarkerList[i].title.toUpperCase() !== self.name().toUpperCase()) {
                listCompare.push(museumMarkerList[i].title);
            }
        }
        if (listCompare.length == museumMarkerList.length) {
            self.visibleAlert(!self.visibleAlert());
        } else {
            geoCoding(self.name());
        }
    };

    function geoCoding(name) {
        geocoder = new google.maps.Geocoder();
        geocoder.geocode({
            'address': name
        }, function(results, status) {
            if (status == 'OK') {
                map.setCenter(results[0].geometry.location);
                map.setZoom(16);
                for (var i = 0; i < museumMarkerList.length; i++) {
                    museumMarkerList[i].setMap(null);
                    if (museumMarkerList[i].title.toUpperCase() == name.toUpperCase()) {
                        museumMarkerList[i].position = results[0].geometry.location;
                        museumMarkerList[i].setMap(map);
                        google.maps.event.trigger(museumMarkerList[i], 'click');
                    }
                }
            } else {
                window.alert('Cannot locate the museum!');
            }
        });
    }

    self.closeAlert = function() {
        self.visibleAlert(false);
    };

    self.navIsActive = ko.observable(false);

    self.mapIsActive = ko.observable(false);

    self.toggleDisplay = function(data, event) {
        data.navIsActive(!data.navIsActive());
        data.mapIsActive(!data.mapIsActive());
    };

    self.toggleMarkers = function() {
        for (var i = 0; i < self.museumList().length; i++) {
            self.museumList()[i].setMap(map);
            map.setZoom(13);
        }
    };
};
