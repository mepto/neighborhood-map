// global variables in use in the app
var map;
var markers = [];
var latLng;
var defaultLatLng = {
    lat: 48.5820156,
    lng: 7.751099
};
var infowindow = null;

// function to iniate the app
function initMap() {
    if (!latLng) {
        latLng = defaultLatLng;
    }
    // instantiate the map
    map = new google.maps.Map(document.getElementById('map'), {
        center: latLng,
        zoom: 15.5,
        styles: style
    });

    //if user clicks on map when infowindow is activated, close it
    google.maps.event.addListener(map, 'click', function () {
        infowindow.close();
    });

    infowindow = new google.maps.InfoWindow({
        content: "awaiting content"
    });
    ko.applyBindings(new ViewModel);
}

// class to create locations
var Location = function (data) {
    //object observables
    this.title = ko.observable(data.title);
    this.location = ko.observable(data.location);
    this.venueID = data.venueID;
};

// -------- ViewModel -------- //
function ViewModel() {
    var self = this; // keeps the scope of 'this' where it should be
    // ---- button and sidebar ----
    // toggle btn text, sidebar menu class
    var btnOpen = 'Show list';
    var btnClosed = 'Hide list';
    btnText = ko.observable(btnOpen);
    openClass = ko.observable(false);
    self.changeNavClass = function () {
        if (btnText() == btnClosed) {
            btnText(btnOpen);
            openClass(false);
        } else {
            btnText(btnClosed);
            openClass(true);
        }
    };

    // create list of locations
    self.locationsList = ko.observableArray([]);
    locations.forEach(function (loc) {
        self.locationsList().push(new Location(loc));
    });

    // filter list through user input or return all
    self.filterText = ko.observable('');
    self.filteredLocations = ko.computed(function () {
        if (!self.filterText()) {
            setMarkerVisibility(self.locationsList())
            return self.locationsList();
        } else {
            var filteredList = self.locationsList().filter(location => location.title().toLowerCase().indexOf(self.filterText().toLowerCase()) > -1);
            setMarkerVisibility(filteredList)
            return filteredList;
        }
    });

    // toggle element class
    self.selectedLocation = ko.observable('nothing');

    // when clicking on the list, modify selection
    self.clickedLocation = function (elem) {
        for (var i = 0; i < markers.length; i++) {
            if (elem.title() == markers[i].title) {
                google.maps.event.trigger(markers[i], 'click');
            }
        }
    };

    // --- make markers ---
    makeMarkers();
    var defaultIcon = makeMarkerIcon('#056284');
    var selectedIcon = makeMarkerIcon('#ce451d');

    function makeMarkers() {

        // create array of markers on map
        for (var i = 0; i < self.locationsList().length; i++) {
            var marker = new google.maps.Marker({
                position: self.locationsList()[i].location(),
                lat: self.locationsList()[i].location().lat,
                lng: self.locationsList()[i].location().lng,
                icon: makeMarkerIcon('#056284'),
                animation: google.maps.Animation.DROP,
                map: map,
                title: self.locationsList()[i].title(),
                id: self.locationsList()[i].venueID
            });

            // populate markers array
            markers.push(marker);
            // get foursquare infos
            retrieveFoursquareData(marker);
            // set marker with infowindow
            manageMarker(marker);
        }
    }

    function setMarkerVisibility(filteredList) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setVisible(false);
        }
        for (var i = 0; i < filteredList.length; i++) {
            for (var j = 0; j < markers.length; j++) {
                console.log(filteredList[i].venueID);
                console.log(markers[j].id);
                if (filteredList[i].venueID == markers[j].id) {
                    markers[j].setVisible(true);
                }
            }
        }
    }

    // add the eventlistener, and closes/open infowindow, adds/remove styles on marker and list
    function manageMarker(marker) {
        google.maps.event.addListener(marker, 'click', function () {
            if (self.selectedLocation() == marker.title) {
                // removes styles and infos
                self.selectedLocation('nothing');
                toggleMarkerBounce(' ');
                infowindow.close();
                infowindow.setContent(' ');
                // reset map display
                map.panTo(defaultLatLng);
                map.setZoom(15.5);
            } else {
                // adds styles and infos
                self.selectedLocation(marker.title);
                toggleMarkerBounce(self.selectedLocation());
                infowindow.setContent(marker.infoContent);
                infowindow.open(map, marker);
                // centers map on marker
                latLng = new google.maps.LatLng(marker.lat, marker.lng);
                map.panTo(latLng);
            }
        });
    }

    function retrieveFoursquareData(marker) {
        // foursquare API call
        var clientID = 'HWL1W52CEGDWVX45JXHZG5OTJSFVB3EF1IATQCB2XQ5PE4RV';
        var clientSecret = 'PAHJB25OAAZCXZUN00YCK3VKLYZFUIQWAKJ2U5HH4X531OAI';
        // alternate client info
        //        var clientID = 'PZHZXA2TPWS54DET2Y2OBO1F1NWGULDIALYXGEJF4G43OCKG';
        //        var clientSecret = '0AGFZSURTJRGO0DNVMV4OIRXM2CI54TJMSCCGMNBUTFWGCYX';
        var foursquareUrl = 'https://api.foursquare.com/v2/venues/' + marker.id + '?&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20180726';
        var myHeaders = new Headers();
        var myInit = {
            method: 'get',
            headers: myHeaders,
            mode: 'cors',
            cache: 'default'
        };

        // Call fetch function passing the API url as parameter to retrieve the data
        fetch(foursquareUrl, myInit)
            .then(function (response) {
                // if a response is given, transforms it to json
                if (response.ok) {
                    return response.json();
                }
            })
            .then(function (result) {
                // uses the foursquare json info to populate variables
                var canonicalUrl = result.response.venue.canonicalUrl;
                //combine prefix, size, suffix for photo
                var bestphotoSrc = result.response.venue.bestPhoto.prefix + 'width200' + result.response.venue.bestPhoto.suffix;
                var tip = result.response.venue.tips.groups[0].items[0].text;
                var rating = result.response.venue.rating;
                marker.infoContent = '<div class="infow"><img class="left" src="' + bestphotoSrc + '"><h4>' + marker.title + '</h4><p><strong>User review:</strong> "<span class="comment">' + tip + '</span>"</p><p><strong>Average rating:</strong> ' + rating + '</p><a class="right btn btn-primary" href="' + canonicalUrl + '" target="_blank">View on Foursquare</a></div>';
            })
            .catch(function () {
                infowindow.setContent('Data from Foursquare is unavailable. Please try again later.');
                alertUser('foursquare');
            });
    }

    // marker icon svg path and info
    function makeMarkerIcon(markerColor) {
        var markerIcon = {
            path: 'M288 0c-69.59 0-126 56.41-126 126 0 56.26 82.35 158.8 113.9 196.02 6.39 7.54 17.82 7.54 24.2 0C331.65 284.8 414 182.26 414 126 414 56.41 357.59 0 288 0zm0 168c-23.2 0-42-18.8-42-42s18.8-42 42-42 42 18.8 42 42-18.8 42-42 42zM20.12 215.95A32.006 32.006 0 0 0 0 245.66v250.32c0 11.32 11.43 19.06 21.94 14.86L160 448V214.92c-8.84-15.98-16.07-31.54-21.25-46.42L20.12 215.95zM288 359.67c-14.07 0-27.38-6.18-36.51-16.96-19.66-23.2-40.57-49.62-59.49-76.72v182l192 64V266c-18.92 27.09-39.82 53.52-59.49 76.72-9.13 10.77-22.44 16.95-36.51 16.95zm266.06-198.51L416 224v288l139.88-55.95A31.996 31.996 0 0 0 576 426.34V176.02c0-11.32-11.43-19.06-21.94-14.86z',
            fillColor: markerColor,
            fillOpacity: 1,
            scale: 0.06,
            strokeColor: 'white',
            strokeWeight: 1
        };
        return markerIcon;
    }

    // changes the marker's color
    function toggleMarkerBounce(m) {
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].title == m) {
                markers[i].setAnimation(google.maps.Animation.BOUNCE);
                markers[i].setIcon(selectedIcon);
                clearAnimation(markers[i]);
            } else {
                markers[i].setAnimation(null);
                markers[i].setIcon(defaultIcon);
            }
        }
    }
    // ends marker bounce after a few iterations
    function clearAnimation(elem) {
        setTimeout((function () {
            elem.setAnimation(null);
        }).bind(this), 2075);
    }

}

// gives information to the user when API data can't be accessed
function alertUser(errorType) {
    switch (errorType) {
        case 'mapsLoad':
            alert("There was a problem with google maps. Please try and reload the page.");
            break;
        case 'foursquare':
            alert("We have a problem retrieving the data from foursquare.");
            break;
    }
}
