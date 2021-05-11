function signin(){
    var email = document.getElementById("username").value;
    var pas = document.getElementById("passlabelword").value;
    firebase.auth().signInWithEmailAndPassword(email, pas)
    .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        // ...
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        window.alert("Error Signing in: " + errorMessage);
    });
}
