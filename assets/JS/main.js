let longitude;
let latitude;

var config = {
    apiKey: "AIzaSyAmqTyfDNVyzz6VG-WlM51ffi7jpB4hqH4",
    authDomain: "jd-c-project.firebaseapp.com",
    databaseURL: "https://jd-c-project.firebaseio.com",
    projectId: "jd-c-project",
    storageBucket: "jd-c-project.appspot.com",
    messagingSenderId: "761811179231"
};
firebase.initializeApp(config);
const database = firebase.database();

const txtEmail = document.getElementById('txtEmail');
const txtPassword = document.getElementById('txtPassword');
const btnLogin = document.getElementById('btnLogin');
const btnSignUp = document.getElementById('btnSignUp');
const btnLogout = document.getElementById('btnLogout');

$("#btnLogin").on("click", function (event) {
    event.preventDefault();
    //Get Email and pass
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();
    //Sign In
    const promise = auth.signInWithEmailAndPassword(
        email, pass);
    promise.catch(e => console.log(e.message));
});

$("#btnSignUp").on("click", function (event) {
    event.preventDefault();
    //CHECK FOR REAL EMAIL
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();
    //Sign In
    const promise = auth.createUserWithEmailAndPassword(
        email, pass);
    promise.then(function () {
        firebase.database().ref('users/' + uid).push({
            username: name,
            email: email,
        });
    });
});

$("#btnLogout").on("click", function (event) {
    event.preventDefault();
    firebase.auth().signOut();
    document.location.href = 'index.html';
})

firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
        console.log(firebaseUser)
        btnLogout.classList.remove('hide');

        //Changed to watchPosition for improved Accuracy
        navigator.geolocation.watchPosition(function (position) {
            console.log(position.coords.longitude, position.coords.latitude);
            longitude = parseFloat(position.coords.longitude);
            latitude = parseFloat(position.coords.latitude);

            var user = firebase.auth().currentUser;
            let name, email, uid;

            if (user != null) {
                name = user.displayName;
                email = user.email;
                uid = user.uid;
            }
            console.log(uid);
            console.log(email);
            console.log(name)

            database.ref('users/' + uid).set({
                name: name,
                email: email,
                uid: uid,
                longitude: longitude,
                latitude: latitude
            });

            mapboxgl.accessToken = 'pk.eyJ1IjoidGhlbm9vZGxlbW9vc2UiLCJhIjoiY2pvdXM4c3ZrMWZnYTNrbW9ic2hmdjV6ZyJ9.-A735y9fU1TdsJ993uIKLA';
            var map = new mapboxgl.Map({
                container: 'map', // container id
                style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
                center: [longitude, latitude], // starting position [lng, lat]
                zoom: 13,
            })
            database.ref('users/' + uid).on("value", function (snapshot) {
                var userLocationLongitude = snapshot.val().longitude;
                var userLocationLatitude = snapshot.val().latitude;
                var userName = snapshot.val().name;
                console.log(userName + " Has Changed Their Location: " + userLocationLongitude + " " + userLocationLatitude);
            });

            let updateUserLocation =
                database.ref('users/').on("value", function (snapshot) {
                    snapshot.forEach(function (childsnap) {
                        childsnap.val().name
                        console.log(childsnap.val().name)
                        console.log(snapshot)
                        console.log(childsnap)

                        var popup = new mapboxgl.Popup({ closeOnClick: false })
                            .setLngLat([childsnap.val().longitude, childsnap.val().latitude])
                            .setHTML('<p>' + childsnap.val().name + '</p>')
                            .addTo(map);    


                            // only change since last push
                        var marker = new mapboxgl.Marker()
                            .setLngLat([childsnap.val().longitude, childsnap.val().latitude])
                            .addTo(map)

                    })
                })

        //  Users popup box with their user name

            var popup = new mapboxgl.Popup({ closeOnClick: false })
                .setLngLat([longitude, latitude])
                .setHTML("")
                .setHTML('<p>' + name + '</p>')
                .addTo(map);

        // zoom in and out buttons

            map.addControl(new mapboxgl.NavigationControl());

        // recenters camera on users icon

            map.on('click', 'points', function (e) {
                map.flyTo({center: e.features[0].geometry.coordinates, zoom: 13});
            });

        // changes mouse cursor to when its on top a clickable element

            map.on('mouseenter', 'points', function () {
                map.getCanvas().style.cursor = 'pointer';
            });
        
        // chages mouse cursor back to defualt when it leaves clickable elements area

            map.on('mouseleave', 'points', function () {
                map.getCanvas().style.cursor = '';
             });

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





