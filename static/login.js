import { passwordLogin } from "./auth.js";
import { LoggedInUser } from "./models.js";

const form = document.getElementById("login-form");
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username");
    const password = document.getElementById("password");
    
    // catch http error codes from login request
    try {
        const userID = await passwordLogin(username.value, password.value);
        window.loggedInUser = new LoggedInUser(userID, username.value, password.value);
        password.value = username.value = "";
    } catch (error) {
        if (error.status == 401) {
            alert("Incorrect username or password");
        } else {
            throw error; // something else went wrong
        }
    }
});