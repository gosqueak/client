import { register } from "./auth.js";
import { STATIC_SERV } from "./constants.js";

const form = document.getElementById("registration-form");
form.addEventListener("submit", async function(event) {
    event.preventDefault(); // prevent the default form submission behavior

    const username = document.getElementById("username");
    const password = document.getElementById("password");

    
    try {
        await register(username.value, password.value);
        username.value = password.value = "";
        location.replace(STATIC_SERV.protocol + STATIC_SERV.url + STATIC_SERV.endpoints.login);
    } catch (error) {
        if (error.status == 409) {
            alert("That username got snagged already!");
        } else {
            throw error; // something else went wrong
        }
    }
});