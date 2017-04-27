var map, infowindow, bounds, placeService,
    streetViewService, directionsDisplay,
    directionsService, innerHTML;

var requestedMuseum = [{
        "formatted_address": "200 Larkin St, San Francisco, CA 94102, United States",
        "lat": 37.78016369999999,
        "lng": -122.4161985,
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/museum-71.png",
        "name": "Asian Art Museum",
        "rating": 4.4,
        "place_id": "ChIJkQQVTZqAhYARHxPt2iJkm1Q",
    },
    {
        "formatted_address": "151 3rd St, San Francisco, CA 94103, United States",
        "lat": 37.7857182,
        "lng": -122.4010508,
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/museum-71.png",
        "name": "San Francisco Museum of Modern Art",
        "rating": 4.3,
        "place_id": "ChIJ53I1Yn2AhYAR_Vl1vNygfMg",
    },
    {
        "formatted_address": "50 Hagiwara Tea Garden Dr, San Francisco, CA 94118, United States",
        "lat": 37.771516,
        "lng": -122.468647,
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/museum-71.png",
        "name": "Fine Arts Museums of San Francisco",
        "rating": 4.4,
        "place_id": "ChIJVVVVVXKHhYARPWqqMGP79Yk",
    },
    {
        "formatted_address": "104 Montgomery St, San Francisco, CA 94129, United States",
        "lat": 37.8014548,
        "lng": -122.4586558,
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/museum-71.png",
        "name": "The Walt Disney Family Museum",
        "rating": 4.5,
        "place_id": "ChIJ5f7ZKtiGhYAR9WaYFS6bH1U",
    },
    {
        "formatted_address": "540 Broadway, San Francisco, CA 94133, United States",
        "lat": 37.79806490000001,
        "lng": -122.4062256,
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/museum-71.png",
        "name": "Beat Museum",
        "rating": 4.1,
        "place_id": "ChIJY6qvZfSAhYARE-zWxUt9vxE",
    },
    {
        "formatted_address": "736 Mission St, San Francisco, CA 94103, United States",
        "lat": 37.78600849999999,
        "lng": -122.4037009,
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/museum-71.png",
        "name": "Contemporary Jewish Museum",
        "rating": 4,
        "place_id": "ChIJQ4ofxYeAhYARnLQjgdsj76k",
    },
    {
        "formatted_address": "55 Music Concourse Dr, San Francisco, CA 94118, United States",
        "lat": 37.76986459999999,
        "lng": -122.4660947,
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/museum-71.png",
        "name": "California Academy of Sciences",
        "rating": 4.4,
        "place_id": "ChIJIUT7rEOHhYARucp3wM-HhBs",
    },
    {
        "formatted_address": "100 34th Ave, San Francisco, CA 94121, United States",
        "lat": 37.7844661,
        "lng": -122.5008419,
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/museum-71.png",
        "name": "Legion of Honor",
        "rating": 4.3,
        "place_id": "ChIJabri1qyHhYARLE0Vd4zY_7k",
    },
    {
        "formatted_address": "685 Mission St, San Francisco, CA 94105, United States",
        "lat": 37.786562,
        "lng": -122.401361,
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/museum-71.png",
        "name": "Museum of the African Diaspora",
        "rating": 4.1,
        "place_id": "ChIJrV7u94eAhYARVQN3mR8cQGM",
    },
    {
        "formatted_address": "Pier 15, The Embarcadero & Green St., San Francisco, CA 94111, United States",
        "lat": 37.8008433,
        "lng": -122.3986299,
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/museum-71.png",
        "name": "Exploratorium",
        "rating": 4.7,
        "place_id": "ChIJk2vl5NSGhYARwPGvs_ubIws",
    },
    {
        "formatted_address": "1201 Mason St, San Francisco, CA 94108, United States",
        "lat": 37.7947043,
        "lng": -122.4117199,
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/museum-71.png",
        "name": "Cable Car Museum",
        "rating": 4.5,
        "place_id": "ChIJX1oMlvKAhYARNZquwetszd8",
    },
    {
        "formatted_address": "221 4th St, San Francisco, CA 94103, United States",
        "lat": 37.78331719999999,
        "lng": -122.4021201,
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/museum-71.png",
        "name": "Children's Creativity Museum",
        "rating": 4.3,
        "place_id": "ChIJt1SMQ4eAhYAR-8dkWSoHKZI",
    },
    {
        "formatted_address": "655 Presidio Ave, San Francisco, CA 94115, United States",
        "lat": 37.7857943,
        "lng": -122.4466681,
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/museum-71.png",
        "name": "San Francisco Fire Department Museum",
        "rating": 3.8,
        "place_id": "ChIJFe6ALcuAhYARzveAYJBhgwQ",
    },
    {
        "formatted_address": "420 Montgomery St, San Francisco, CA 94104, United States",
        "lat": 37.7933771,
        "lng": -122.4026335,
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/museum-71.png",
        "name": "Wells Fargo History Museum",
        "rating": 4.6,
        "place_id": "ChIJRTx8T4qAhYARrVWrDnGz8Oc",
    },
    {
        "formatted_address": "175 Jefferson St, San Francisco, CA 94133, United States",
        "lat": 37.8081571,
        "lng": -122.415464,
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/museum-71.png",
        "name": "Ripley's Believe It or Not Museum",
        "rating": 3.9,
        "place_id": "ChIJf1rSC-OAhYARTxu37gYw8RU",
    },
    {
        "formatted_address": "45 Pier D7, San Francisco, CA 94133, United States",
        "lat": 37.8093405,
        "lng": -122.4160609,
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/museum-71.png",
        "name": "Musée Mécanique",
        "rating": 4.6,
        "place_id": "ChIJCQAzVOKAhYARuOpiALmomu0",
    },
    {
        "formatted_address": "4127 18th St, San Francisco, CA 94114, United States",
        "lat": 37.7606979,
        "lng": -122.4356494,
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/museum-71.png",
        "name": "GLBT History Museum",
        "rating": 4.3,
        "place_id": "ChIJn8w1go6AhYARdfFGEuY4mIc",
    },
    {
        "formatted_address": "2569 3rd St, San Francisco, CA 94107, United States",
        "lat": 37.7568398,
        "lng": -122.3877999,
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/museum-71.png",
        "name": "The Museum of Craft and Design",
        "rating": 4.2,
        "place_id": "ChIJiaELzAR-j4ARq0FRvpCYv1Q",
    },
    {
        "formatted_address": "77 Steuart St, San Francisco, CA 94105, United States",
        "lat": 37.7938256,
        "lng": -122.3935533,
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/museum-71.png",
        "name": "San Francisco Railway Museum",
        "rating": 3.7,
        "place_id": "ChIJ_f7xMWSAhYARThFhbatwJak",
    },
    {
        "formatted_address": "2 Marina Blvd, San Francisco, CA 94123, United States",
        "lat": 37.80680579999999,
        "lng": -122.4307443,
        "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/museum-71.png",
        "name": "The Mexican Museum",
        "rating": 3.5,
        "place_id": "ChIJzQPIbdiAhYARAuQumH2RZN0",
    }
];

class Museum {
    constructor(museum) {
        this.address = museum.formatted_address;
        this.lat = museum.lat;
        this.lng = museum.lng;
        this.icon = museum.icon;
        this.name = museum.name;
        this.rating = museum.rating;
        this.marker = this.generateMarker(museum);
    }

    generateMarker(museum) {
        let latLng = new google.maps.LatLng(this.lat, this.lng);
        let markerImage = {
            url: museum.icon,
            size: new google.maps.Size(71, 71),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25)
        };
        let marker = new google.maps.Marker({
            map: map,
            icon: markerImage,
            title: this.name,
            position: latLng,
            animation: google.maps.Animation.DROP
        });

        google.maps.event.addListener(marker, 'click', () => {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => {
                marker.setAnimation(null);
            }, 7000);
            showInfo(museum, marker);

        });

        bounds.extend(latLng);
        return marker;
    };

    triggerMarker(museum) {
        google.maps.event.trigger(museum.marker, 'click');
        map.setZoom(14);
    }
};

//helper function
let showInfo = (museum, marker) => {
    placeService = new google.maps.places.PlacesService(map);

    placeService.getDetails({
        placeId: museum.place_id
    }, function(place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            innerHTML = '';
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
                innerHTML += '<br><strong>Hours:</strong><br>' +
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

    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + museum.name + '&format=json&callback=wikiCallback';
    $.get({
        url: wikiUrl,
        dataType: 'jsonp',
    }).then(response => {
        var articleList = response[1];
        if (articleList.length === 0) {
            innerHTML += '<br><div>No results found on wikipedia.</<div></br>';
        }
        for (var i = 0; i < articleList.length; i++) {
            var url = 'https://n.wikipedia.org/wiki/' + articleList[i];
            innerHTML += '<div>Wiki: <a href="' + url + '" target="_blank">' + articleList[i] + '</a></li></<div>';
        }
        innerHTML += '<div></div><div id="panorama"></div>';
        infowindow.setContent(innerHTML);
        populatePanorama(marker);
    }).catch(err => {
        innerHTML += '<br><div>Cannot load wikipedia results due to ' + err.status + " " + err.statusText + ' </<div></br>';
        infowindow.setContent(innerHTML);
        populatePanorama(marker);
    });

} //helper function

//helper function
let populatePanorama = (marker) => {
    streetViewService = new google.maps.StreetViewService();
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
    infowindow.open(map, marker);
} //helper function

class ViewModel {
    constructor() {
        this.name = ko.observable('');
        this.museumList = ko.observableArray();


        requestedMuseum.forEach((museum) => {
            this.museumList.push(new Museum(museum));
        });


        map.fitBounds(bounds);

        this.filteredMuseumList = ko.computed(() => {
            return ko.utils.arrayFilter(this.museumList(), (museum) => {
                museum.marker.setMap(null);
                if (museum.name.toUpperCase().match(this.name().trim().toUpperCase())) {
                    museum.marker.setMap(map);
                    return museum;
                }
            });

        });

        this.visibleAlert = ko.observable(false);

        this.verifyUserInput = () => {
            var listCompare = [];
            for (var i = 0; i < this.museumList().length; i++) {
                if (this.museumList()[i].name.toUpperCase() !== this.name().trim().toUpperCase()) {
                    listCompare.push(this.museumList()[i].name);
                }
            }
            if (listCompare.length == this.museumList().length) {
                this.visibleAlert(!this.visibleAlert());
            }
        };

        this.closeAlert = () => {
            this.visibleAlert(false);
        };

        this.navIsActive = ko.observable(false);

        this.mapIsActive = ko.observable(false);

        this.toggleDisplay = (data, event) => {
            data.navIsActive(!data.navIsActive());
            data.mapIsActive(!data.mapIsActive());
        };

        this.toggleMarkers = () => {
            for (var i = 0; i < this.museumList().length; i++) {
                this.museumList()[i].marker.setMap(map);
                map.setZoom(12);
            }
        };

        //for directionZone
        // this.selectedStartValue=ko.observable('');
        // this.selectedEndValue=ko.observable('');

        // this.startValueChanged=()=>{
        //   this.selectedStartValue(this.selectedStartValue());
        //   action(this.selectedStartValue());
        // };
        // this.endValueChanged=() =>{
        //   this.selectedEndValue(this.selectedEndValue());
        //   action(this.selectedEndValue());
        // };

        // function action (val){
        //   console.log(val);

        // }//for directionzone


    }
};

let initMap = () => {
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
                "visibility": "on"
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

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        mapTypeControlOptions: {
            mapTypeIds: ['styled_map']
        },
        center: {
            lat: 37.77493,
            lng: -122.419416
        },
        disableDefaultUI: true
    });

    map.mapTypes.set('styled_map', styledMapType);
    map.setMapTypeId('styled_map');
    processDirection();
};

let processDirection = () => {
    infowindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsService = new google.maps.DirectionsService();
    directionsDisplay.setMap(map);

    var directions = document.getElementsByClassName('direction');
    var optionValue;
    for (var j = 0; j < requestedMuseum.length; j++) {
        optionValue += '<option>' + requestedMuseum[j].name + '</option>';
    }
    for (var k = 0; k < directions.length; k++) {
        directions[k].innerHTML = optionValue;
    }

    var directionZone = document.getElementById('directionZone');
    var closeDirection = document.getElementById('closeDirection');
    directionsDisplay.setPanel(directionZone);
    var control = document.getElementById('directionPanel');
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);
    var onChangeHandler = () => {
        calculateAndDisplayRoute(directionsService, directionsDisplay, directionZone);
    };
    closeDirection.addEventListener('click', () => {
        directionZone.style.display = 'none';
        directionsDisplay.setMap(null);
    });
    document.getElementById('start').addEventListener('change', onChangeHandler);
    document.getElementById('end').addEventListener('change', onChangeHandler);
    document.getElementById('mode').addEventListener('change', onChangeHandler);

    ko.applyBindings(new ViewModel());
}
//helper function
let calculateAndDisplayRoute = (directionsService, directionsDisplay, directionZone) => {
    let start = document.getElementById('start').value + ', San Francisco';
    let end = document.getElementById('end').value + ', San Francisco';

    directionsDisplay.setMap(map);
    directionZone.style.display = 'block';
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
}; //helper function

let loadError = () => {
    window.alert('Cannot load Map');
};