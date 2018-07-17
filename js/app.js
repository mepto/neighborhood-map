// global variables in use in the app
var map;


// function to iniate the app
function initMap() {
    ko.applyBindings(new ViewModel);
}

// class to create locations
var Location = function (data) {
    this.title = ko.observable(data.title);
    this.location = ko.observable(data.location);
}

// ViewModel
function ViewModel() {
    var self = this; // keeps
    // instantiate the map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 48.5816732,
            lng: 7.7523954
        },
        zoom: 16,
        styles: style
    });

    // ---- VM for button and sidebar ----
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
//        var filterText = self.filterText();
        if(!self.filterText()) {
            return self.locationsList();
        } else {
            // TODO: add text when no result is returned
            return self.locationsList().filter(location => location.title().toLowerCase().indexOf(self.filterText().toLowerCase()) > -1);
        }
    });

    // toggle element class







}

function alertUser(errorType) {
    switch (errorType) {
        case 'mapsLoad':
            alert("There was a problem with google maps. Please try and reload the page.");
            break;
        default:
            alert("Oops, something went wrong!");
    }



}
