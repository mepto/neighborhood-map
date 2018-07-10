 //(function () {


function AppVMButton () {
    var btnOpen = 'Show places';
    var btnClosed = 'Hide Places';
    var sidebarClass = 'active';
    btnText = ko.observable(btnOpen);
    classActive = ko.observable("");
    toggleButtonText = function() {
        btnText() == btnClosed ? btnText(btnOpen) : btnText(btnClosed)
    };
    toggleButtonClass = ko.computed(function(){
        return btnText() == btnClosed ? "open" : " ";
    });
    toggleMenuClass = ko.computed(function() {
        return btnText() == btnClosed ? "active" : " ";
    });
}

//var Location = function(location){
//    this.title = location.title;
//    this.lat = location.lat;
//    this.lng = location.lng;
//}

//https://www.strathweb.com/2012/07/knockout-js-pro-tips-working-with-observable-arrays/
//https://stackoverflow.com/questions/47741328/filtering-list-with-knockout
function AppVMLocations () {
    var self = this;
    self.filterText = ko.observable('');
    self.allLocations = ko.observableArray(locations);
    self.filteredLocations = ko.computed(function(){
        if (self.filterText().length > 0) {
            var locationsArray = self.allLocations();
            return ko.utils.arrayFilter(teamsArray, function(allLocations){
                return ko.utils.stringStartsWith(allLocations.locations.toLowerCase(), self.filterText());
            });
        }
    }).extend({ throttle: 750 });

//    locations.forEach(function(loc){
//        self.allLocations.push(new Location(loc));
//    });

//    console.log(filteredLocations);

}

ko.applyBindings(AppVMButton());
ko.applyBindings(new AppVMLocations());

// global variables

var map;
var markers = [];
var placeMarkers = [];


function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 48.5816732,
            lng: 7.7523954
        },
        zoom: 16,
        styles: style
    });

} // fin initMap

function alertUser(errorType) {
    switch (errorType) {
    case 'mapsLoad':
        console.log("There was a problem with google maps");
        break;
    }
}

//})();
