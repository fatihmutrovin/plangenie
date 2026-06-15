function showLogoutModal(){

    document.getElementById(
        "logoutModal"
    ).style.display = "flex";

}

function closeLogoutModal(){

    document.getElementById(
        "logoutModal"
    ).style.display = "none";

}

function logout(){

    localStorage.removeItem(
        "isLoggedIn"
    );

    localStorage.removeItem(
        "userEmail"
    );

    window.location.href =
    "login.html";

}