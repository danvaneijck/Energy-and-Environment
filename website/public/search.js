let postsList = [];
let user = null;
let userInfo;


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
                "                    <li style='background-color: #fa4e3d'><a style='color: white' href=\"subscribe.html\">Subscribe</a></li>\n" +
                "                </ul>\n" +
                "            </nav>";
        }
    });

    getPostsFromDB();
}());

function spanText(textStr, textClasses) {
    var classNames = textClasses.map(c => 'text-'+c).join(' ');
    return '<span class="'+classNames+'">'+ textStr + '</span>';
}

function getPostsFromDB(){
    let myStr = parent.document.URL.substring(parent.document.URL.indexOf('?')+8, parent.document.URL.length).toString();
    myStr = myStr.replace(/%20/g," ");

    this.postsList = [];
    this.matchPostTitle(myStr).then(() => {
        if(this.postsList.length === 0){
            this.matchKeyWords(myStr).then(() => {
                this.selectChanged();
            });
        }
        else{
            this.selectChanged();
        }
    });
}

async function matchPostTitle(searchString) {
    searchString = searchString.toLowerCase();
    const dbPostsRef = firebase.database().ref('posts/');
    await dbPostsRef.once('value').then(function(snap) {
        snap.forEach(function(date) {
            date.forEach(function (post){
                let title = post.val().title.toString().toLowerCase();
                if(String(searchString.trim()).valueOf() === String(title.trim()).valueOf()){
                    this.postsList.push({
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
    });
}

async function matchKeyWords(searchString){
    searchString = this.removeStopWords(searchString).toLowerCase();
    let searchTerms = searchString.split(" ").filter(Boolean);
    const dbPostsRef = firebase.database().ref('posts/');
    await dbPostsRef.once('value').then(function(snap) {
        snap.forEach(function(date) {
            date.forEach(function (post){
                let tags = post.val().tags.toString().split(",").toString();
                tags = tags.replace(/,/g, ' ').split(" ").filter(Boolean);
                let title = post.val().title.toString().split(",").toString();
                title = title.replace(/,/g, ' ').split(" ").filter(Boolean);
                if(tags.some(r=> searchTerms.includes(r.toLowerCase())) || title.some(r=> searchTerms.includes(r.toLowerCase()))){
                    this.postsList.push({
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
    });
}

function removeStopWords(str) {
    let stopWords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now'];
    let res = [];
    let words = str.split(' ');
    for(let i = 0; i < words.length; i++) {
        let word_clean = words[i].split(".").join("");
        if(!stopWords.includes(word_clean)) {
            res.push(word_clean);
        }
    }
    return(res.join(' '))
}

function selectChanged() {
    this.postsList.reverse();
    var currentDiv = document.getElementById("posts");
    currentDiv.innerHTML = "";
    for(let x in this.postsList){
        var newDiv = document.createElement("div");
        var html = ' <div  class="post"> ';
        html += ' <h3>' + this.postsList[x].title + ' </h3>';
        html += ' <h4> Date: ' + this.postsList[x].date + ' </h4>';
        html += ' <span style=\"white-space: pre-line\">'+this.postsList[x].abstract+'\n\n</span>';
        html += ' <p><b>Tags:</b> ' + this.postsList[x].tags +'</p>';
        html += ' <button id=btnSeeMore'+this.postsList[x].date+"/"+this.postsList[x].id+' class="btn btn-action" onclick="readMore(this.id)">Read more</button>';
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