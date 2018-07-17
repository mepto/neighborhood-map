 // global variables

 var map;
 var markers = [];
 var placeMarkers = [];


 function initMap() {
     ko.applyBindings(new AppVM());
 }

 var Location = function (data) {
     this.title = ko.observable(data.title);
     this.lat = ko.observable(data.lat);
     this.lng = ko.observable(data.lng);
 };

 function AppVM() {
     var self = this;

     // Constructor creates a new map - only center and zoom are required.
     map = new google.maps.Map(document.getElementById('map'), {
         center: {
             lat: 48.5816732,
             lng: 7.7523954
         },
         zoom: 16,
         styles: style
     });

     // ---- VM for button and sidebar ----
     var btnOpen = 'Show list';
     var btnClosed = 'Hide list';
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
     self.currentSelection = ko.observable('');
     self.locationsList = ko.observableArray([]);
     self.filterText = ko.observable('');
     locations.forEach(function (placeLocation) {
         self.locationsList.push(new Location(placeLocation));
     });
     // returns the list of locations or all if no filter is added
     self.filteredLocations = ko.computed(function () {
         if (!self.filterText()) {
             return self.locationsList();
         } else {
             return self.locationsList().filter(location => location.title().toLowerCase().indexOf(self.filterText().toLowerCase()) > -1);
         }
     });
     self.selectLocation = function (elem) {
         // toggles selection class between clickable elements
         // if a selected element is clicked again, it's unselected
         if (self.currentSelection() == elem.title()) {
             console.log('yes');
             self.currentSelection(" ");
         } else {
             self.currentSelection(elem.title());
             for (var i = 0; i < self.locationsList().length; i++) {
                 if (elem.title() == markers[i].title) {
                     markers[i].setIcon(highlightedIcon);
                     toggleMarkerBounce(markers[i]);
                 } else {
                     markers[i].setIcon(defaultIcon);
                 }
             }
         }
     };
     self.toggleClass = ko.computed(function(){
         return this.text == self.currentSelection() ? 'selectedLocation' : '';
     })
     // ---- markers ---- //

     var defaultIcon = makeMarkerIcon('0d93c4');
     var highlightedIcon = makeMarkerIcon('ce451d');
     // create array of markers on the map
     for (var i = 0; i < locations.length; i++) {
         // Get the position from the location array.
         var position = locations[i].location;
         var title = locations[i].title;
         // Create a marker per location
         var marker = new google.maps.Marker({
             position: position,
             title: title,
             animation: google.maps.Animation.DROP,
             icon: defaultIcon,
             id: i
         });
         // Push the marker to our array of markers.
         markers.push(marker);
         //display marker
         marker.setMap(map);
         // Create an onclick event to open the infowindow at each marker.
         marker.addListener('click', function () {
             var loc = new Location(this['title'], this['location']);
             toggleMarkerBounce(this);
         });
     }


//     console.log(self.locationsList());
//     console.log(markers);



     // changes the marker's color
     function makeMarkerIcon(markerColor) {
         var markerImage = new google.maps.MarkerImage(
             'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
             '|40|_|%E2%80%A2',
             new google.maps.Size(21, 34),
             new google.maps.Point(0, 0),
             new google.maps.Point(10, 34),
             new google.maps.Size(21, 34));
         return markerImage;
     }

     function toggleMarkerBounce(m) {
         for (var i = 0; i < markers.length; i++) {
             if (markers[i] == m) {
                 m.setAnimation(google.maps.Animation.BOUNCE);
                 m.setIcon(highlightedIcon);
                 setTimeout((function () {
                     m.setAnimation(null);
                 }).bind(this), 2075);
             } else {
                 markers[i].setAnimation(null);
                 markers[i].setIcon(defaultIcon);
             }

         }
     }
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
