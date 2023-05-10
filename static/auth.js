
import { AUTH_SERV } from "./constants.js";

export async function requestApiToken(audienceNameStr) {
    // TODO clean input
    const url = AUTH_SERV.url + AUTH_SERV.endpoints.apitokens + `?aud=${audienceNameStr}`;

    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
        throw { status: response.status }
    }
}

export async function passwordLogin(username, password) {
    const url = AUTH_SERV.url + AUTH_SERV.endpoints.login;

    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(
            { username: username, password: password }
        )
    });

    if (!response.ok) {
        throw { status: response.status };
    }
}

export async function logout() {
    const url = AUTH_SERV.url + AUTH_SERV.endpoints.logout;

    const response = await fetch(url, { method: "POST" });

    if (!response.ok) {
        throw { status: response.status };
    }
}

export async function register(username, password) {
    const url = AUTH_SERV.url + AUTH_SERV.endpoints.register;

    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(
            { username: username, password: password }
        )
    });

    if (!response.ok) {
        throw { status: response.status };
    };
}