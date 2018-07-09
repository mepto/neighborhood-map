//(function () {
// sidebar toggle
//var sidebarButton = document.getElementById('sidebarToggle');
//sidebarButton.addEventListener('click', toggleSidebar, false);
//
//function toggleSidebar() {
//    var sidebar = document.getElementById('sidebar');
//    var sidebarButtonText = document.getElementById('sidebarButtonText');
//    sidebar.classList.toggle('active');
//    sidebarButton.classList.toggle('open');
//    if (sidebarButton.classList.contains('open')) {
//        sidebarButtonText.innerHTML = 'Hide list';
//    } else {
//        sidebarButtonText.innerHTML = 'Show list';
//    }
//}
// -- end sidebar toggle


function AppVMButton () {
    var btnOpen = 'Show places';
    var btnClosed = 'Hide Places';
    btnText = ko.observable(btnOpen);
    toggleClasses = function() {
        if (btnText() == btnOpen) {
            btnText(btnClosed);
        } else {
            btnText(btnOpen);
        }
//        btnText(btnText(btnClosed) ? btnOpen : btnClosed);
    };

}

ko.applyBindings(new AppVMButton());

// global variables
var locations = [
    {
        title: 'Le Moulin du Diable restaurant',
        location: {
            lat: 48.579517,
            lng: 7.744626
        }
    },
    {
        title: 'Notre Dame de Strasbourg Cathedral',
        location: {
            lat: 48.581125,
            lng: 7.749384
        }
    },
    {
        title: 'Star Saint Exupéry Cinema',
        location: {
            lat: 48.583585,
            lng: 7.743543
        }
    },
    {
        title: 'Botanical garden',
        location: {
            lat: 48.583577,
            lng: 7.766685
        }
    },
    {
        title: 'Barrage Vauban Petite France',
        location: {
            lat: 48.580791,
            lng: 7.741422
        }
    },
    {
        title: 'Chez Christian coffee shop',
        location: {
            lat: 48.583571,
            lng: 7.745855
        }
    }
]
var map;
var markers = [];
var placeMarkers = [];


function initMap() {
    // Create a styles array to use with the map.
    var styles = [
    {
        "featureType": "all",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f5e4c1"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "gamma": 0.01
            },
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "saturation": -31
            },
            {
                "lightness": -33
            },
            {
                "weight": 2
            },
            {
                "gamma": 0.8
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
            {
                "lightness": 30
            },
            {
                "saturation": 30
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "saturation": "0"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "hue": "#ffa300"
            },
            {
                "saturation": "-32"
            },
            {
                "lightness": "20"
            },
            {
                "gamma": "1.00"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "hue": "#ffaa00"
            },
            {
                "saturation": "-26"
            },
            {
                "lightness": "0"
            },
            {
                "gamma": "1"
            },
            {
                "weight": "0.39"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "saturation": 20
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "saturation": "51"
            },
            {
                "lightness": "-6"
            },
            {
                "weight": "0.01"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            {
                "lightness": 20
            },
            {
                "saturation": -20
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "hue": "#ffc000"
            },
            {
                "saturation": "-100"
            },
            {
                "lightness": "-46"
            },
            {
                "gamma": "1.62"
            },
            {
                "weight": "0.84"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "lightness": 10
            },
            {
                "saturation": -30
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "saturation": 25
            },
            {
                "lightness": 25
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "hue": "#fff400"
            },
            {
                "saturation": "-100"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "lightness": -20
            },
            {
                "visibility": "on"
            }
        ]
    }
];
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 48.5816732,
            lng: 7.7523954
        },
        zoom: 16,
        styles: styles
    });

    //add list of locations


} // fin initMap

function alertUser(errorType) {
    switch (errorType) {
    case 'mapsLoad':
        console.log("There was a problem with google maps");
        break;
    }
}

//})();
