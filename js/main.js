 //(function () {

 var Location = function (data) {
     this.title = ko.observable(data.title);
     this.lat = ko.observable(data.lat);
     this.lng = ko.observable(data.lng);
 };

 function AppVM() {
     var self = this;

     // ---- VM for button and sidebar ----
     var btnOpen = 'Show places';
     var btnClosed = 'Hide Places';
     var sidebarClass = 'active';
     btnText = ko.observable(btnOpen);
     classActive = ko.observable("");
     toggleButtonText = function () {
         btnText() == btnClosed ? btnText(btnOpen) : btnText(btnClosed)
     };
     toggleButtonClass = ko.computed(function () {
         return btnText() == btnClosed ? "open" : " ";
     });
     toggleMenuClass = ko.computed(function () {
         return btnText() == btnClosed ? "active" : " ";
     });


     // ---- VM for locations generation and filter ----
     self.thisSelection = ko.observable('');
     self.locationsList = ko.observableArray([]);
     self.filterText = ko.observable('');
     self.currentSelection = ko.observable('');
     locations.forEach(function (placeLocation) {
         self.locationsList.push(new Location(placeLocation));
     });
     //returns the list of locations or all if no filter is added
     self.filteredLocations = ko.computed(function () {
         if (!self.filterText()) {
             return self.locationsList();
         } else {
             return self.locationsList().filter(location => location.title().toLowerCase().indexOf(self.filterText().toLowerCase()) > -1);
         }
     });
     self.selectLocation = function (elem) {
         //toggles selection class between clickable elements
         //if a selected element is clicked again, it's unselected.
         if (self.thisSelection() == this.title()) {
             self.thisSelection("");
             self.currentSelection("");
         } else {
             self.currentSelection(elem.title);
             self.thisSelection(this.title());
         };


     }
 }

 ko.applyBindings(new AppVM());


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
