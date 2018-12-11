(function() {
    $('input[type="checkbox"]').on('change', function() {
        $(this).siblings('input[type="checkbox"]').prop('checked', false);
    });
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

    const searchBtn = document.getElementById('searchBtn');
    searchBtn.addEventListener('click', e => {
        window.location.href = 'search.html?search=' + searchInput.value;
    });

}());

const btnAddNewUser = document.getElementById('btnAddNewUser');
btnAddNewUser.addEventListener('click', createUser);

function createUser(){
    let username = userName.value;
    let password = userPassword.value;

    firebase.auth().createUserWithEmailAndPassword(username, password).catch(function(error) {
        var errorMessage = error.message;
        window.alert(errorMessage);
    }).then((x) => {
        console.log(x.user.uid);
        firebase.database().ref('members').child(x.user.uid).set({
            email: username,
            users: 0,
            validDate : new Date().toLocaleString()
        }).then(() =>{
            window.location.href = "membership.html";
        });
    });
}