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

    const searchBtn = document.getElementById('searchBtn');
    searchBtn.addEventListener('click', e => {
        window.location.href = 'search.html?search=' + searchInput.value;
    });

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
            const dbUserRef = firebase.database().ref('members').child(user.uid);
            dbUserRef.once('value').then(function(snap) {
                userInfo = snap.val();
            }).then(() =>{
                let validDate = new Date(userInfo.validDate);
                let currentDate = new Date();
                if(currentDate.getTime() > validDate.getTime()){
                    window.alert("Your subscription has expired! Please renew");
                    window.location = "membership.html";
                }
                else{
                    let id = window.location.hash.substring(1);
                    showPost(id);
                }
            });
            let editDiv = document.getElementById("editPost");
            let admin = false;
            firebase.database().ref().child('admins').once("value", function(snapshot) {
                snapshot.forEach(function(child) {
                    if(user == null){
                        admin = false;
                    }
                    else if(child.key === user.uid){
                        admin = true;
                    }
                });
                if(!admin){
                    editDiv.parentNode.removeChild(editDiv);
                }
                else{
                    editDiv.style.visibility = "visible";
                }
            });
        }
        else{
            window.location.href = 'index.html';
        }
    });



}());

function enableEditing(){
    document.getElementById("content").disabled = false;
}

async function showPost(id) {
    let postInfo = null;

    await firebase.database().ref('posts/').child(id).once('value').then(function(snap) {
            postInfo = snap.val();
    });

    console.log(postInfo);

    if(postInfo.fileURL == "null"){
        let currentDiv = document.getElementById("postContent");
        currentDiv.innerHTML =
            "<div  class=\"postExpand\">" +
            "<h2>"+postInfo.title+"</h2>" +
            "<h5>Author: "+postInfo.author+"</h5>" +
            "<h5> Date: " + postInfo.date + " </h5>"+
            "<span style=\"white-space: pre-line\">"+postInfo.content+"</span>" +
            "<br><br>" +
            ' <p><b>Tags:</b> ' + postInfo.tags +'</p>' +
            "</div>";
    }
    else{
        let ref = firebase.storage().ref("posts/"+postInfo.fileURL);
        ref.getDownloadURL().then(function(url) {
            let currentDiv = document.getElementById("postContent");
            currentDiv.innerHTML =
                "<div  class=\"postExpand\">" +
                "<h2>"+postInfo.title+"</h2>" +
                "<h5>Author: "+postInfo.author+"</h5>" +
                "<h5> Date: " + postInfo.date + " </h5>"+
                "<span id='content' style=\"white-space: pre-line\">"+postInfo.content+"</span>" +
                "<br><br>" +
                ' <p><b>Tags:</b> ' + postInfo.tags +'</p>' +
                "<a href="+url+" download>Download full bulletin</a>" +
                "</div>";
        });
    }

}