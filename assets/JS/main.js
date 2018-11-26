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

const txtEmail = document.getElementById('txtEmail');
const txtPassword = document.getElementById('txtPassword');
const btnLogin = document.getElementById('btnLogin');
const btnSignUp = document.getElementById('btnSignUp');
const btnLogout = document.getElementById('btnLogout');

$("#btnLogin").on("click", function(event) {
    event.preventDefault();
    //Get Email and pass
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();
    //Sign In
    const promise = auth.signInWithEmailAndPassword(
        email,pass);
    promise.catch(e => console.log(e.message));
});

$("#btnSignUp").on("click", function(event) {
    event.preventDefault();
    //CHECK FOR REAL EMAIL
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();
    //Sign In
    const promise = auth.createUserWithEmailAndPassword(
        email,pass);
    promise.catch(e => console.log(e.message));
});

$("#btnLogout").on("click", function(event) {
    event.preventDefault();
    firebase.auth().signOut();
})

firebase.auth().onAuthStateChanged(firebaseUser => {
    if(firebaseUser) {
        console.log(firebaseUser)
        btnLogout.classList.remove('hide');
        btnLogin.classList.add('hide');
        btnSignUp.classList.add('hide');

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
        
            map.on('load', function () {
                map.loadImage('https://avatars0.githubusercontent.com/u/39680460?s=400&v=4', function (error, image) {
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
        btnLogin.classList.remove('hide');
        btnSignUp.classList.remove('hide');
        btnLogout.classList.add('hide');
    }
});





