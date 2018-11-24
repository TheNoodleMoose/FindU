let longitude;
let latitude;

navigator.geolocation.getCurrentPosition(function (position) {
    console.log(position.coords.longitude, position.coords.latitude);
    longitude = parseFloat(position.coords.longitude);
    latitude = parseFloat(position.coords.latitude);

    mapboxgl.accessToken = 'pk.eyJ1IjoidGhlbm9vZGxlbW9vc2UiLCJhIjoiY2pvdXM4c3ZrMWZnYTNrbW9ic2hmdjV6ZyJ9.-A735y9fU1TdsJ993uIKLA';
    var map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
        center: [longitude, latitude], // starting position [lng, lat]
        zoom: 13,
    })

    map.on('load', function() {
        map.loadImage('https://avatars0.githubusercontent.com/u/39680460?s=400&v=4', function(error, image) {
            if (error) throw error;
            map.addImage('me', image);
            map.addLayer({
                "id": "points",
                "type": "symbol",
                "source": {
                    "type": "geojson",
                    "data": {
                        "type": "FeatureCollection",
                        "features": [{
                            "type": "Feature",
                            "geometry": {
                                "type": "Point",
                                "coordinates": [longitude, latitude]
                            }
                        }]
                    }
                },
                "layout": {
                    "icon-image": "me",
                    "icon-size": 0.10
                }
            });
        });
    });
})
    


