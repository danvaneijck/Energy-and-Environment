dates = [];
user = null;
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

    //Add log out events
    const btnLogout = document.getElementById('btnLogout');
    const btnLogin = document.getElementById('btnLogin');

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
            console.log('not logged in');
            btnLogout.parentNode.removeChild(btnLogout);
            btnLogin.style.visibility = "visible";
            btnLogin.addEventListener('click', e => {
                window.location.href = 'index.html';
            });
        }
    });

    getDates();
}());

function spanText(textStr, textClasses) {
    var classNames = textClasses.map(c => 'text-'+c).join(' ');
    return '<span class="'+classNames+'">'+ textStr + '</span>';
}

function getDates(){
    const dbPostsRef = firebase.database().ref('posts/');
    this.dates = [];
    dbPostsRef.once('value').then(function(snap) {
        snap.forEach(function(date) {
            let postsOnDate = [];
            date.forEach(function (post){
                postsOnDate.push({
                    id: post.key,
                    title : post.val().title,
                    author : post.val().author,
                    abstract : post.val().abstract,
                    fileURL : post.val().fileURL,
                    date : post.val().date
                })
            });
            this.dates.push(postsOnDate);
        });
        this.dates.reverse();
        selectChanged();
    });
}

function selectChanged(){
    var currentDiv = document.getElementById("archiveDates");
    currentDiv.innerHTML = "";
    for(i in this.dates){
        var dateDiv = document.createElement("div");
        var dateHTML = '<button class="collapsible">' + dates[i][0].date + '</button>';
        dateHTML += ' <div  class="content"> ';
        for(j in this.dates[i]){
            dateHTML += ' <p> Title: ' + dates[i][j].title + ' </p>';
            dateHTML += ' <p> Author: ' + dates[i][j].author + ' </p>';
            dateHTML += ' <p> Date: ' + dates[i][j].date + ' </p>';
            dateHTML += ' <p> Abstract: ' + dates[i][j].abstract + ' </p>';
            dateHTML += ' <button id=btnSeeMore'+dates[i][j].date+"/"+dates[i][j].id+' class="btn btn-action" onclick="readMore(this.id)">Read more</button>';

        }
        dateHTML += ' </div>';

        dateDiv.innerHTML = dateHTML;
        currentDiv.appendChild(dateDiv);
    }
    addEventListenersToCollapsible();
}


function addEventListenersToCollapsible(){
    var coll = document.getElementsByClassName("collapsible");
    var i;
    //Loads hidden text fields when collapsible clicked by user
    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            console.log(content.className);
            if (content.style.maxHeight){
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    }
}

function readMore(id){
    let postID = id.substring(10);
    var queryString = "#" + postID;
    if(user == null){
        $('#loginModal').modal('show');
    }
    else{
        window.location.href = "post.html" + queryString;
    }
    $('#loginForm').on('submit', function (e) {
        e.preventDefault();
        $('#messageModalLabel').html(spanText('<i class="fa fa-cog fa-spin"></i>', ['center', 'info']));

        if( $('#loginEmail').val() != '' && $('#loginPassword').val() != '' ){
            //login the user
            var data = {
                email: $('#loginEmail').val(),
                password: $('#loginPassword').val()
            };
            firebase.auth().signInWithEmailAndPassword(data.email, data.password)
                .then(function(authData) {
                    auth = authData;
                    $('#messageModalLabel').html(spanText('Success!', ['center', 'success']))
                    $('#loginModal').modal('hide');
                    window.location.href = "post.html" + queryString;
                })
                .catch(function(error) {
                    console.log("Login Failed!", error);
                    $('#messageModalLabel').html(spanText('ERROR: '+error.code, ['danger']))
                });
        }
    });
}
