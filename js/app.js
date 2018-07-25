// global variables in use in the app
var map;
var markers = [];
var activeInfoWindow;

// function to iniate the app
function initMap() {

    // instantiate the map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 48.5820156,//48.5816732,
            lng: 7.751099//7.7523954
        },
        zoom: 15.5,
        styles: style
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
            return self.locationsList();
        } else {
            // TODO: add text when no result is returned
            return self.locationsList().filter(location => location.title().toLowerCase().indexOf(self.filterText().toLowerCase()) > -1);
        }
    });

    // toggle element class
    self.selectedLocation = ko.observable('nothing');

    function triggerClickedLocation(elem) {
        self.clickedLocation(elem);
    }

    self.clickedLocation = function (elem) {
        var thisTitle;
        (typeof (elem.title) === 'function') ? thisTitle = elem.title(): thisTitle = elem.title;
        if (self.selectedLocation() == thisTitle) {
            self.selectedLocation('nothing');
            toggleMarkerBounce(' ');
            activeInfoWindow.close();
        } else {
            self.selectedLocation(thisTitle);
            toggleMarkerBounce(thisTitle);
        }

    };

    // --- make markers ---
    var defaultIcon = makeMarkerIcon('#056284');
    var selectedIcon = makeMarkerIcon('#ce451d');

    // create array of markers on map
    for (var i = 0; i < self.locationsList().length; i++) {
        var marker = new google.maps.Marker({
            position: self.locationsList()[i].location(),
            icon: defaultIcon,
            animation: google.maps.Animation.DROP,
            title: self.locationsList()[i].title(),
            id: self.locationsList()[i].venueID
        });
        // populate markers array
        markers.push(marker);
        // display marker on map
        marker.setMap(map);

        attachMarkerInfo(marker);
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

    function attachMarkerInfo(marker) {
        // foursquare API call
            var clientID = 'HWL1W52CEGDWVX45JXHZG5OTJSFVB3EF1IATQCB2XQ5PE4RV';
            var clientSecret = 'PAHJB25OAAZCXZUN00YCK3VKLYZFUIQWAKJ2U5HH4X531OAI';



        var foursquareUrl = 'https://api.foursquare.com/v2/venues/' + marker.id + '?&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20180724';
        var myHeaders = new Headers();
        var myInit = {
            method: 'get',
            headers: myHeaders,
            mode: 'cors',
            cache: 'default'
        };
        fetch(foursquareUrl, myInit) // Call fetch function passing the API url as parameter
            .then(function (response) {
                // Your code for handling the data you get from the API
                if (response.ok) {
                    return response.json();
                }
            })
            .then(function (result) {
//                console.log(result);
                var canonicalUrl = result.response.venue.canonicalUrl;
                //combine prefix, size, suffix for photo
                var bestphotoSrc = result.response.venue.bestPhoto.prefix + 'width200' + result.response.venue.bestPhoto.suffix;
                var tip = result.response.venue.tips.groups[0].items[0].text;
                var rating = result.response.venue.rating;

                var infowindow = new google.maps.InfoWindow({
                    content: '<div class="infow"><img class="left" src="' + bestphotoSrc + '"><h4>' + marker.title + '</h4><p><strong>User review:</strong> "<span class="comment">' + tip + '</span>"</p><p><strong>Rating:</strong> ' + rating + '</p><a class="right btn btn-primary" href="' + canonicalUrl + '" target="_blank">View on Foursquare</a></div>'
                });


                marker.addListener('click', function () {
                    if (activeInfoWindow) {
                        activeInfoWindow.close();
                    }
                    infowindow.open(marker.get('map'), marker);
                    activeInfoWindow = infowindow;
                    triggerClickedLocation(marker);
                });



            })
            .catch(function () {
                // This is where you run code if the server returns any errors
                alertUser('foursquare');
            });

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

    function clearAnimation(elem) {
        setTimeout((function () {
            elem.setAnimation(null);
        }).bind(this), 2075);
    }

}

function alertUser(errorType) {
    switch (errorType) {
        case 'mapsLoad':
            alert("There was a problem with google maps. Please try and reload the page.");
            break;
        case 'foursquare':
            alert("We have a problem retrieving the data from foursquare.");
        default:
            alert("Oops, something went wrong!");
    }
}
