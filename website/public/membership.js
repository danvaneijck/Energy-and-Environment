var user = null;
var userInfo;
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

    //Add log out events
    const btnLogout = document.getElementById('btnLogout');
    const btnLogin = document.getElementById('btnLogin');

    const searchBtn = document.getElementById('searchBtn');
    searchBtn.addEventListener('click', e => {
        window.location.href = 'search.html?search=' + searchInput.value;
    });

    firebase.auth().onAuthStateChanged(u => {
        if(u != null) {
            console.log('logged in');
            btnLogin.parentNode.removeChild(btnLogin);
            user = u;
            btnLogout.style.visibility = "visible";
            btnLogout.addEventListener('click', e => {
                firebase.auth().signOut().then(function() {
                    console.log('Signed Out');
                    window.location = 'index.html';
                }, function(error) {
                    console.error('Sign Out Error', error);
                });

            });
            const dbUserRef = firebase.database().ref('members').child(user.uid);

            dbUserRef.once('value').then(function(snap) {
                userInfo = snap.val();
            }).then(() => {
                let div = document.getElementById('memberInfo');
                let validDate = new Date(userInfo.validDate);
                let currentDate = new Date();

                div.innerHTML = "<h3>Email: "+userInfo.email+"</h3>" +
                    "<h4>Your membership is valid until: "+userInfo.validDate+"</h4>" +
                "<h4>You may share documents with up to " + userInfo.users + " users!</h4><br> ";
                if(currentDate.getTime() > validDate.getTime()){
                    div.innerHTML += "<p style='color: red'><b>Your subscription has expired! Please renew your account below.</b></p>";
                }
                else{
                    div.innerHTML += "<p style='color: green'><b>Your subscription is currently valid!</b></p>";
                }
            });
        }
        else{
            window.location = 'index.html';
        }
    });

    let cost = document.querySelector('.cost:checked').value;
    let time = document.querySelector('.time:checked').value;
    var amount = cost * time;
    console.log(amount.toString())
    // Render the PayPal button
    paypal.Button.render({
        // Set your environment
        env: 'sandbox', // sandbox | production

        // Specify the style of the button
        style: {
            layout: 'vertical',  // horizontal | vertical
            size:   'medium',    // medium | large | responsive
            shape:  'rect',      // pill | rect
            color:  'gold'       // gold | blue | silver | white | black
        },

        // Specify allowed and disallowed funding sources
        //
        // Options:
        // - paypal.FUNDING.CARD
        // - paypal.FUNDING.CREDIT
        // - paypal.FUNDING.ELV
        funding: {
            allowed: [
                paypal.FUNDING.CARD,
                paypal.FUNDING.CREDIT
            ],
            disallowed: []
        },

        // Enable Pay Now checkout flow (optional)
        commit: true,

        // PayPal Client IDs - replace with your own
        // Create a PayPal app: https://developer.paypal.com/developer/applications/create
        client: {
            sandbox: 'AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eYXlewfBP4-8aqX3PiV8e1GWU6liB2CUXlkA59kJXE7M6R',
            production: '<insert production client id>'
        },

        payment: function (data, actions) {
            return actions.payment.create({
                payment: {
                    transactions: [
                        {
                            amount: {
                                total: amount.toString(),
                                currency: 'NZD'
                            }
                        }
                    ]
                }
            });
        },

        onAuthorize: function (data, actions) {
            return actions.payment.execute()
                .then(function () {
                    window.alert('Payment Complete!');
                    let users = 1;
                    if(amount == 1095) users = 5;
                    if(amount == 2095) users = 10;
                    if(amount == 3095) users = 20;
                    if(amount == 3095) users = 50;
                    updateUserDetails(users);
                    window.location.href = 'paymentComplete.html?users=' + users;
                });
        }
    }, '#paypal-button-container');


}());

function updateUserDetails(users){
    var validDate = new Date();
    validDate.setFullYear(new Date().getFullYear() + 1);

    const dbUserRef = firebase.database().ref('members').child(user.uid);
    dbUserRef.update({
        validDate : validDate.toLocaleString(),
        users: users
    });
}
