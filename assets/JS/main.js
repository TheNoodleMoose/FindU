// The initializes longitude and latitude as global variables
let longitude;
let latitude;

// This is to initialize firebase
var config = {
    apiKey: "AIzaSyAmqTyfDNVyzz6VG-WlM51ffi7jpB4hqH4",
    authDomain: "jd-c-project.firebaseapp.com",
    databaseURL: "https://jd-c-project.firebaseio.com",
    projectId: "jd-c-project",
    storageBucket: "jd-c-project.appspot.com",
    messagingSenderId: "761811179231"
};
firebase.initializeApp(config);

// This var holds the firebase database 
const database = firebase.database();

// This logs the user out when the click the logout button
$("#btnLogout").on("click", function (event) {
    event.preventDefault();
    var user = firebase.auth().currentUser;
    let uid = user.uid;

    // If the user actually exist than do something

    database.ref('usersOnline/' + uid).remove();
    firebase.auth().signOut();
    document.location.href = 'index.html';


})

// When a user signs in, if they are actually a user than grab their location
firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
        console.log(firebaseUser)
        btnLogout.classList.remove('hide');

        //Changed to watchPosition for improved Accuracy
        // This is continually watching the signed in users position and updating
        navigator.geolocation.watchPosition(function (position) {
            console.log(position.coords.longitude, position.coords.latitude);
            longitude = parseFloat(position.coords.longitude);
            latitude = parseFloat(position.coords.latitude);

            // This var holds the information for the current user signed
            var user = firebase.auth().currentUser;
            let name, email, uid;

            // If the user actually exist than do something
            if (user != null) {
                name = user.displayName;
                email = user.email;
                uid = user.uid;
            }
            console.log(uid);
            console.log(email);
            console.log(name)
            // When they sign in, set their information in the databse to their name,email,uid,
            // longitude, and latitude. The only thing updated after the first sign in is their location
            database.ref('users/' + uid).set({
                name: name,
                email: email,
                uid: uid,
                longitude: longitude,
                latitude: latitude
            });
            // This is what generates the map and it is centered on the users longitude and latitude
            mapboxgl.accessToken = 'pk.eyJ1IjoidGhlbm9vZGxlbW9vc2UiLCJhIjoiY2pvdXM4c3ZrMWZnYTNrbW9ic2hmdjV6ZyJ9.-A735y9fU1TdsJ993uIKLA';
            var map = new mapboxgl.Map({
                container: 'map', // container id
                style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
                center: [longitude, latitude], // starting position [lng, lat]
                zoom: 13,
            })
            // This grabs a snapshot of the current users location and when they move it updates
            // The firebase information with the new information
            database.ref('users/' + uid).on("value", function (snapshot) {
                var userLocationLongitude = snapshot.val().longitude;
                var userLocationLatitude = snapshot.val().latitude;
                var userName = snapshot.val().name;
                console.log(userName + " Has Changed Their Location: " + userLocationLongitude + " " + userLocationLatitude);
            });

            database.ref('usersOnline/' + uid).set(name)
            let updateOnlineUsers =
                database.ref('usersOnline/').on("value", function (snapshot) {
                    snapshot.forEach(function (childsnap) {
                        childsnap.val().name
                        console.log(childsnap.val().name)
                    })
                })
            // This function is how we grab the information from firebase to mark other users on
            // the map and make popups with their names
            let updateUserLocation =
                // This goes into the database and looks at the the users object and grabs a snapshot
                database.ref('users/').on("value", function (snapshot) {
                    // Then for each child in snapshot(each user) grab a snapshot of those users
                    snapshot.forEach(function (childsnap) {
                        childsnap.val().name
                        // For each child in users, create a popup with their name
                        var popup = new mapboxgl.Popup({ closeOnClick: false })
                            .setLngLat([childsnap.val().longitude, childsnap.val().latitude])
                            .setHTML('<p>' + childsnap.val().name + '</p>')
                            .addTo(map);
                        // For each child in users, create a marker at their location
                        var marker = new mapboxgl.Marker()
                            .setLngLat([childsnap.val().longitude, childsnap.val().latitude])
                            .addTo(map)

                    })
                })
            
            // This creates a popup specifically for the user logged in
            var popup = new mapboxgl.Popup({ closeOnClick: false, closeButton: false })
                .setLngLat([longitude, latitude])
                .setHTML("")
                .setHTML('<p>' + name + '</p>')
                .addTo(map);

            // zoom in and out buttons
            map.addControl(new mapboxgl.NavigationControl());

            // recenters camera on users icon
            map.on('click', 'points', function (e) {
                map.flyTo({ center: e.features[0].geometry.coordinates, zoom: 13 });
            });

            // changes mouse cursor to when its on top a clickable element
            map.on('mouseenter', 'points', function () {
                map.getCanvas().style.cursor = 'pointer';
            });

            // chages mouse cursor back to defualt when it leaves clickable elements area
            map.on('mouseleave', 'points', function () {
                map.getCanvas().style.cursor = '';
            });

            // This function runs when the map loads and generates the red marker at the users location
            map.on('load', function () {
                map.loadImage('https://cdn1.iconfinder.com/data/icons/social-messaging-ui-color/254000/67-512.png', function (error, image) {
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
        });
    } else {
        console.log('not logged in');
        btnLogout.classList.add('hide');
    }
});

let checkIfOnline =
    database.ref('users/').on("value", function (snapshot) {
        var uid = firebase.auth().currentUser.uid;
        var userName = firebase.auth().currentUser.displayName
        snapshot.forEach(function (childsnap) {
            var userStatusDatabaseRef = firebase.database().ref('/status/' + uid);

            var isOfflineForDatabase = {
                state: 'offline',
                last_changed: firebase.database.ServerValue.TIMESTAMP,
            };

            var isOnlineForDatabase = {
                state: 'online',
                last_changed: firebase.database.ServerValue.TIMESTAMP,
            };

            firebase.database().ref('.info/connected').on('value', function (snapshot) {
                // If we're not currently connected, don't do anything.
                if (snapshot.val() == false) {
                    return;
                }

                // If we are currently connected, then use the 'onDisconnect()' 
                // method to add a set which will only trigger once this 
                // client has disconnected by closing the app, 
                // losing internet, or any other means.
                userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function () {

                    userStatusDatabaseRef.set(isOnlineForDatabase);
                });
            })
        })
    })




