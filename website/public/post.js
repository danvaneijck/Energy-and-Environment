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

    const btnLogout = document.getElementById('btnLogout');

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
        }
        else{
            window.location.href = 'index.html';
        }
    });

    var id = window.location.hash.substring(1);
    console.log(id);

    showPost(id);
}());

async function showPost(id) {
    let postInfo = null;

    await firebase.database().ref('posts/').child(id).once('value').then(function(snap) {
            postInfo = snap.val();
    });

    console.log(postInfo);
    let currentDiv = document.getElementById("postContent");
    currentDiv.innerHTML =
        "<div  class=\"postExpand\">" +
        "<h2>"+postInfo.title+"</h2>" +
        "<h3>Author: "+postInfo.author+"</h3>" +
        "<span style=\"white-space: pre-line\">"+postInfo.content+"</span>" +
        "</br>" +
        "<a href="+postInfo.fileURL+" download>Download full article</a>" +
        "</div>"
}