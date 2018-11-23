(function() {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyCuDUyO849H6_NCnoWwiw-f1fWg5M-Rjn8",
        authDomain: "energy-and-environment.firebaseapp.com",
        databaseURL: "https://energy-and-environment.firebaseio.com",
        projectId: "energy-and-environment",
        storageBucket: "energy-and-environment.appspot.com",
        messagingSenderId: "444827010701"
    };
    firebase.initializeApp(config);

    firebase.auth().onAuthStateChanged(user => {
        if(user != null) {
            console.log('logged in');
            window.location = 'home.html';
        }
        else{
            console.log('not logged in');
        }
    });

    const txtEmail = document.getElementById('txtEmail');
    const txtPassword = document.getElementById('txtPassword');
    const btnLogin = document.getElementById('btnLogin');
    const btnRegister = document.getElementById('btnRegister');

    //User presses button to begin login event
    btnRegister.addEventListener('click', e => {
        window.location = 'register.html';
    });

    btnLogin.addEventListener('click', e => {
        login();
    });

}());

function login(){
    //Get email and password
    var email = txtEmail.value;
    var pass = txtPassword.value;
    //Sign in
    firebase.auth().signInWithEmailAndPassword(email, pass).then(function(){
        window.alert("login successful");
        window.location = 'home.html';
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        console.log(error.message);
        window.alert(error.message);

    });
}

