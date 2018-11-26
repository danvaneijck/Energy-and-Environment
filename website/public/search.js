postsList = [];
var user = null;

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

    getPostsFromDB();

}());

function spanText(textStr, textClasses) {
    var classNames = textClasses.map(c => 'text-'+c).join(' ');
    return '<span class="'+classNames+'">'+ textStr + '</span>';
}

function getPostsFromDB(){
    let myStr = parent.document.URL.substring(parent.document.URL.indexOf('?')+8, parent.document.URL.length).split("%20").toString();
    let terms = myStr.replace(/,/g, ' ').split(" ").filter(Boolean);
    let searchTerms = terms.join('|').toLowerCase().split('|');
    console.log(searchTerms);

    const dbPostsRef = firebase.database().ref('posts/');
    this.postsList = [];
    dbPostsRef.orderByValue().limitToLast(3).once('value').then(function(snap) {
        snap.forEach(function(date) {
            date.forEach(function (post){
                let tags = post.val().tags.toString().split(",").toString();
                tags = tags.replace(/,/g, ' ').split(" ").filter(Boolean);
                console.log(tags)
                if(tags.some(r=> searchTerms.includes(r.toLowerCase()))){
                    postsList.push({
                        id: post.key,
                        title : post.val().title,
                        author : post.val().author,
                        abstract : post.val().abstract,
                        content: post.val().content,
                        tags: post.val().tags,
                        fileURL : post.val().fileURL,
                        date : post.val().date
                    })
                }
            });
        });
        this.postsList.reverse();
        selectChanged();
    });
}

function selectChanged() {
    var currentDiv = document.getElementById("posts");
    currentDiv.innerHTML = "";
    for(x in this.postsList){
        var newDiv = document.createElement("div");
        var html = ' <div  class="post"> ';
        html += ' <h2>' + postsList[x].title + ' </h2>';
        html += ' <h3> Author: ' + postsList[x].author + ' </h3>';
        html += ' <h4> Date: ' + postsList[x].date + ' </h4>';
        html += ' <span style=\"white-space: pre-line\"><b>Abstract:</b> '+postsList[x].abstract+'\n\n</span>';
        html += ' <p><b>Tags:</b> ' + postsList[x].tags +'</p>';
        html += ' <button id=btnSeeMore'+postsList[x].date+"/"+postsList[x].id+' class="btn btn-action" onclick="readMore(this.id)">Read more</button>';
        html += ' </div>';

        newDiv.style.paddingBottom = "45px";
        newDiv.innerHTML = html;
        currentDiv.appendChild(newDiv);
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