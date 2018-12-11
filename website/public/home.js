var file;
postsList = [];
var user = null;
var userInfo;
var secondaryApp;

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

    let config2 = {
        apiKey: "AIzaSyCuDUyO849H6_NCnoWwiw-f1fWg5M-Rjn8",
        authDomain: "energy-and-environment.firebaseapp.com",
        databaseURL: "https://energy-and-environment.firebaseio.com"
    };
    secondaryApp = firebase.initializeApp(config2, "Secondary");

    //Add log out events
    const btnLogout = document.getElementById('btnLogout');
    const btnLogin = document.getElementById('btnLogin');

    const searchBtn = document.getElementById('searchBtn');
    searchBtn.addEventListener('click', e => {
        window.location.href = 'search.html?search=' + searchInput.value;
    });

    let nav = document.getElementById("navigationBar");

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
            });

            nav.innerHTML = "<nav>\n" +
                "                <ul>\n" +
                "                    <li><a href=\"home.html\">Home</a></li>\n" +
                "                    <li><a href=\"archives.html\">Archives</a></li>\n" +
                "                    <li><a href=\"about.html\">About</a></li>\n" +
                "                    <li><a href=\"contact.html\">Contact</a></li>\n" +
                "                    <li><a href=\"membership.html\">Membership Info</a></li>\n" +
                "                </ul>\n" +
                "            </nav>";
        }
        else{
            console.log('not logged in');
            btnLogout.parentNode.removeChild(btnLogout);
            btnLogin.style.visibility = "visible";
            btnLogin.addEventListener('click', e => {
                window.location.href = 'index.html';
            });

            nav.innerHTML = "<nav>\n" +
                "                <ul>\n" +
                "                    <li><a href=\"home.html\">Home</a></li>\n" +
                "                    <li><a href=\"archives.html\">Archives</a></li>\n" +
                "                    <li><a href=\"about.html\">About</a></li>\n" +
                "                    <li><a href=\"contact.html\">Contact</a></li>\n" +
                "                    <li style='background-color: red'><a style='color: white' href=\"subscribe.html\">Subscribe</a></li>\n" +
                "                </ul>\n" +
                "            </nav>";
        }
    });

    getPostsFromDB();

    let postDiv = document.getElementById("adminTools");
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
            postDiv.parentNode.removeChild(postDiv);
        }
        else{
            postDiv.style.visibility = "visible";
        }
    });
    document.querySelector('.file-select').addEventListener('change', handleFileUploadChange);

    var checkList = document.getElementById('list1');
    var items = document.getElementById('items');
    checkList.getElementsByClassName('anchor')[0].onclick = function (evt) {
        if (items.classList.contains('visible')){
            items.classList.remove('visible');
            items.style.display = "none";
        }

        else{
            items.classList.add('visible');
            items.style.display = "block";
        }


    };

    items.onblur = function(evt) {
        items.classList.remove('visible');
    };



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
    let elements = document.querySelectorAll('.items input:checked');

    let title = postTitle.value;
    let author = postAuthor.value;
    let abstract = postAbstract.value;
    let content = postContent.value;
    let tags = Array.prototype.map.call(elements, function(el, i) {
        return el.name;
    });
    let date = postDate.value;
    let timestamp = new Date().getTime();

    //upload file
    await firebase.storage().ref().child('posts/'+file.name).put(file)
        .then(snapshot => snapshot.ref.getDownloadURL())
        .then((url) => {
            const dbPostsRef = firebase.database().ref('posts').child(date).child(timestamp);
            dbPostsRef.set({
                title : title,
                author : author,
                abstract : abstract,
                content: content,
                tags: tags.toString(),
                date: date,
                fileURL : url
            });
        })
        .catch(console.error);

    window.alert('Successful post created!');
    location = location;
}

function getPostsFromDB(){
    const dbPostsRef = firebase.database().ref('posts/');
    this.postsList = [];
    dbPostsRef.orderByValue().limitToLast(5).once('value').then(function(snap) {
        snap.forEach(function(date) {
            date.forEach(function (post){
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
        html += ' <h3>' + postsList[x].title + ' </h3>';
        html += ' <h4> Date: ' + postsList[x].date + ' </h4>';
        html += ' <span style=\"white-space: pre-line\">'+postsList[x].abstract+'\n\n</span>';
        html += ' <p><b>Tags:</b> ' + postsList[x].tags +'</p>';
        html += ' <button id=btnSeeMore'+postsList[x].date+"/"+postsList[x].id+' class="btn btn-action" onclick="readMore(this.id)">Read more</button>';
        html += ' </div>';

        newDiv.style.paddingBottom = "20px";
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
        let validDate = new Date(userInfo.validDate);
        let currentDate = new Date();
        if(currentDate.getTime() > validDate.getTime()){
            window.alert("Your subscription has expired! Please renew");
            window.location = "membership.html";
        }
        else{
            window.location.href = "post.html" + queryString;
        }
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
                    $('#messageModalLabel').html(spanText('Success!', ['center', 'success']));
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

const btnAddNewUser = document.getElementById('btnAddNewUser');
btnAddNewUser.addEventListener('click', createUser);

function createUser(){
    let username = userName.value;
    let password = userPassword.value;
    let sub = new Date(subDate.value);
    let userAll = userAllocation.value;

    secondaryApp.auth().createUserWithEmailAndPassword(username, password).catch(function(error) {
        var errorMessage = error.message;
        window.alert(errorMessage);
    }).then((x) => {
        console.log(x.user.uid);
        firebase.database().ref('members').child(x.user.uid).set({
            email: username,
            validDate : sub.toLocaleString(),
            users: userAll
        });
        if ($('#isAdmin').is(":checked")) {
            firebase.database().ref('admins').child(x.user.uid).set(true);
        }
    });
}