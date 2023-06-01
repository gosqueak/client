
import { STEELIX } from "./constants.js";

export async function requestApiToken(audienceNameStr) {
    // TODO clean input
    const url = STEELIX.protocol + STEELIX.url + STEELIX.endpoints.apitokens + `?aud=${audienceNameStr}`;

    const response = await fetch(url, { method: "GET", credentials: "include"});

    if (!response.ok) {
        throw { status: response.status }
    }
}

export async function passwordLogin(username, password) {
    const url = STEELIX.protocol + STEELIX.url + STEELIX.endpoints.login;

    const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(
            { username: username, password: password }
        )
    });

    if (!response.ok) {
        throw { status: response.status };
    }

    return (await response.json()).userID;
}

export async function logout() {
    const url = STEELIX.protocol + STEELIX.url + STEELIX.endpoints.logout;

    const response = await fetch(url, { method: "POST", credentials: "include" });

    if (!response.ok) {
        throw { status: response.status };
    }
}

export async function register(username, password) {
    const url = STEELIX.protocol + STEELIX.url + STEELIX.endpoints.register;

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