var user = null;
var userInfo;
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

    firebase.auth().onAuthStateChanged(u => {
        if(u != null) {
            console.log('logged in');
            user = u;
            const dbUserRef = firebase.database().ref('members').child(user.uid);

            dbUserRef.once('value').then(function(snap) {
                userInfo = snap.val();
            }).then(() => {
                let div = document.getElementById('paymentComplete');

                div.innerHTML = "Your subscription is valid until:<br><br><b>" + userInfo.validDate + "</b><br><br>" +
                    "You may share articles from Energy and Environment with up to <b>" + userInfo.users + " users.</b><br><br>" +
                    "<span style=\"white-space: pre-line\">An electronic multi-User subscription from NZ Energy & Environment Business Alert is the perfect solution for those organisations which want  to encourage their work associates and employees to stay abreast of the latest news, trends and forecasts and good advice.  \n" +
                    " \n" +
                    "Each week, receive quick, immediate access that saves your organisation money by reducing the cost of individual memberships. \n" +
                    " \n" +
                    "It assures you are providing legal access to the weekly information in compliance with all applicable copyright laws (Please be aware that unauthorised electronic forwarding, photocopying, faxing or scanning of our newsletters constitutes copyright infringement and is illegal and subject to fines up to $100,000).</span>  " +
                    "<br><br>\n" +
                    "<button id=\"btnConfirm\" class=\"btn btn-action\">OK - take me back to front page</button>";
                const btnConfirm = document.getElementById('btnConfirm');

                btnConfirm.addEventListener('click', e => {
                    window.location = "home.html";
                });
            });
        }
        else{
            console.log('not logged in');
            window.location = "index.html";
        }
    });


}());



