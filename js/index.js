var map; 
var markers = [];
var infoWindow;
var startPos = {};

window.onload = function() {
    var geoOptions = {
        maximumAge: 5 * 60 * 1000
    }

    var geoSuccess = function(position) {
        startPos["latitude"]  = position.coords.latitude;
        startPos["longitude"] = position.coords.longitude;
    };
    var geoError = function(error) {
    console.log('Error occurred. Error code: ' + error.code);
    // error.code can be:
    //   0: unknown error
    //   1: permission denied
    //   2: position unavailable (error response from location provider)
    //   3: timed out
    };

    startPos["latitude"]  = -26.920672;
    startPos["longitude"]  = -49.066953;

    navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);

    var input = document.getElementById("zip-code-input");
    input.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            document.getElementById("icon-search").click();
        }
    });
};

function initMap() {
    var losAngeles = {  
        lat: 34.063380, 
        lng: -118.358080
    };

    map = new google.maps.Map(document.getElementById('map'), {
        center: losAngeles,
        zoom: 11,
        mapTypeId: 'roadmap'
    });
    infoWindow = new google.maps.InfoWindow();
    searchStores();
}

function searchStores(){
    var foundStores = [];
    var zipCode = document.getElementById('zip-code-input').value;

    if (zipCode){
        for(var store of stores){
            var postal = store['address']['postalCode'].substring(0, 5);
            
            if (postal == zipCode){
                foundStores.push(store)
            }
        } 
    } else {
        foundStores = stores;
    }
    
    clearLocations();
    displayStores(foundStores);
    showStoresMarkers(foundStores);
    setOnClickListener(foundStores);

}

function clearLocations(){
    infoWindow.close();
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers.length = 0;
}

function displayStores(stores){
    var storesHtml = '';
    for (var [index, store] of stores.entries()){

        var address = store['addressLines'];
        var phone = store['phoneNumber'];

        storesHtml += `
            <div class="store-container">
                <div class="store-container-background">
                    <div class="store-info-container">
                        <div class="store-address">
                            <span>${address[0]}</span>
                            <span>${address[1]}</span>
                        </div>
                        <div class="store-phone-number">${phone}</div>
                    </div>
                    <div class="store-number-container">
                        <div class="store-number">
                            ${++index}
                        </div>
                    </div>
                </div>
            </div>
        `
        document.querySelector('.stores-list').innerHTML = storesHtml;
    }
}

function showStoresMarkers(stores) {
    var bounds = new google.maps.LatLngBounds();
    for (var [index, store] of stores.entries()){
        var latlng = new google.maps.LatLng(
            store["coordinates"]["latitude"],
            store["coordinates"]["longitude"]
        )
        var name = store["name"];
        var address = store["addressLines"][0];
        var phoneNumber = store["phoneNumber"];
        var openStatus = store["openStatusText"];
        bounds.extend(latlng);
        createMarker(latlng, name, address, phoneNumber, openStatus, index+1);
    }
    map.fitBounds(bounds);
}

function buildHtml(name, address, phoneNumber, openStatus, latLng){
    var html = `
        <div class="store-info-window"> 
            <div class="store-info-name">
                ${name}
            </div>
            <div class="store-info-status">
                ${openStatus}
            </div>
            <div class="store-info-address">
                <div class="circle">
                    <i class="fas fa-location-arrow"></i> 
                </div>
                <a title="Get directions"
                href='https://www.google.com/maps/dir/?api=1&origin=${startPos["latitude"]},${startPos["longitude"]}&destination=${latLng.lat()},${latLng.lng()}' target="_blank">${address}</a>
            </div> 
            <div class="store-info-phone">
                <div class="circle">
                    <i class="fas fa-phone-alt"></i>
                </div>    
                ${phoneNumber}
            </div>
        </div>
    `;
    return html;
}

function createMarker(latlng, name, address, phoneNumber, openStatus, index){
    var html = "<b>" + name + "</b><br/>" + openStatus + "<br/>" + phoneNumber + "<br/>" + address;
    var marker = new google.maps.Marker({
        map: map,
        position: latlng,
        label: index.toString()
    });

    google.maps.event.addListener(marker, 'click', function() { 
        map.panTo(marker.getPosition());
        infoWindow.setContent(buildHtml(name, address, phoneNumber, openStatus, latlng));
        infoWindow.open(map, marker);
    });
    
    markers.push(marker);
}

function setOnClickListener(){
    var storeElements = document.querySelectorAll('.store-container');
    storeElements.forEach(function(elem, index){
        elem.addEventListener('click', function(){
            new google.maps.event.trigger(markers[index], 'click')
        })
    })
}