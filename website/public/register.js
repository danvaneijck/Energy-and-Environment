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
    var database = firebase.database();

    const txtEmail = document.getElementById('txtEmail');
    const txtPassword = document.getElementById('txtPassword');
    const btnRegister = document.getElementById('btnRegister');

    btnRegister.addEventListener('click', e => {
        var email = txtEmail.value;
        var password = txtPassword.value;
        firebase.auth().createUserWithEmailAndPassword(email, password).then(function(){
            console.log(firebase.auth().currentUser.email);
            database.ref().child("members").child(firebase.auth().currentUser.uid).set({
                email: firebase.auth().currentUser.email
            });
            window.alert("Account sucessfully created");
            window.location = 'index.html';
        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            console.log(error.message);
            window.alert(error.message);
        });
    });

}());
