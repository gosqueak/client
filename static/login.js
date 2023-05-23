import { passwordLogin } from "./auth.js";
import { STATIC_SERV } from "./constants.js";

const form = document.getElementById("login-form");
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username");
    const password = document.getElementById("password");

    const user = username.value;
    const pass = password.value;

    password.value = username.value = "";

    // catch http error codes from login request
    try {
        await passwordLogin(user, pass);
    } catch (error) {
        if (error.status == 401) {
            alert("Incorrect username or password");
        } else {
            throw error; // something else went wrong
        }
    }
});