var file;
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

    let elem = document.getElementById("new-post");
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
            elem.parentNode.removeChild(elem);
        }
        else{
            elem.style.visibility = "visible";
        }
    });
    document.querySelector('.file-select').addEventListener('change', handleFileUploadChange);

}());

function spanText(textStr, textClasses) {
    var classNames = textClasses.map(c => 'text-'+c).join(' ');
    return '<span class="'+classNames+'">'+ textStr + '</span>';
}

function handleFileUploadChange(e) {
    file = e.target.files[0];
    console.log(file);
}

const btnAddNewPost = document.getElementById('btnAddNewPost');
btnAddNewPost.addEventListener('click', uploadPost);

async function uploadPost(){
    let title = postTitle.value;
    let author = postAuthor.value;
    let abstract = postAbstract.value;
    let date = postDate.value;
    let timestamp = new Date().getTime();

    //upload image
    await firebase.storage().ref().child('posts/'+file.name).put(file)
        .then(snapshot => snapshot.ref.getDownloadURL())
        .then((url) => {
            const dbPostsRef = firebase.database().ref('posts').child(date).child(timestamp);
            dbPostsRef.set({
                title : title,
                author : author,
                abstract : abstract,
                date: date,
                fileURL : url
            });
        })
        .catch(console.error);

    document.getElementById('postTitle').value = '';
    document.getElementById('postAuthor').value = '';
    document.getElementById('postAbstract').value = '';

    window.alert('Successful post created!');
    location = location;
}

function getPostsFromDB(){
    const dbPostsRef = firebase.database().ref('posts/');
    this.postsList = [];
    dbPostsRef.orderByValue().limitToLast(3).once('value').then(function(snap) {
        snap.forEach(function(date) {
            date.forEach(function (post){
                postsList.push({
                    id: post.key,
                    title : post.val().title,
                    author : post.val().author,
                    abstract : post.val().abstract,
                    fileURL : post.val().fileURL,
                    date : post.val().date
                })
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
        html += ' <p> Title: ' + postsList[x].title + ' </p>';
        html += ' <p> Author: ' + postsList[x].author + ' </p>';
        html += ' <p> Date: ' + postsList[x].date + ' </p>';
        html += ' <span style=\"white-space: pre-line\">Abstract: '+postsList[x].abstract+'</span>';
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