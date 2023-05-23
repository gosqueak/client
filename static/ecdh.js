import { ECDH_SERV } from "./constants";


export class KeyPairLocker extends KeyLocker {
    constructor(name) {
        super("KeyPairLocker")
    }

    add(id, privateKey, publicKey) {
        this.keys[id] = {private: privateKey, public: publicKey}
        this._save()
    }
}


class KeyLocker {
    constructor(name) {
        this.name = name;
        this.keys = {};
        this._localStorageKey = `KeyLockerKeys(${this.name})`
        this._load()
    }

    add() {
        throw new SyntaxError("not implemented")
    }

    get(id) {
        return this.keys[id]
    }

    delete(id) {
        delete this.keys[id]
        this._save()
    }

    _save() {
        localStorage.setItem(this._localStorageKey, JSON.stringify(this.keys))
    }

    _load() {
        const keys = JSON.parse(localStorage.getItem(this._localStorageKey))

        if (keys === null) {
            return
        }

        this.keys = keys
    }
}


async function initiateExchange(b64KeyUserA) {
    const reqJSON = {k: b64KeyUserA};
    const options = {method: "POST", credentials: "include", body: JSON.stringify(reqJSON)};
    const respJSON = await request(options);
    const exchangeUUID = respJSON.e;
    return exchangeUUID;
}


async function swapExchangeKeys(exchangeUUID, keyUserB) {
    const reqJSON = {e: exchangeUUID, b: keyUserB};
    const options = {method: "PATCH", credentials: "include", body: JSON.stringify(reqJSON)};
    const respJSON = await request(options)
    const b64KeyUserA = respJSON.a
    return b64KeyUserA;
}

async function completeExchange(exchangeUUID) {
    const reqJSON = {u: exchangeUUID};
    const options = {method: "DELETE", credentials: "include", body: JSON.stringify(reqJSON)};
    const respJSON = await request(options)
    const b64KeyUserB = respJSON.b;
    return b64KeyUserB;
}

async function request(options) {
    const resp = await fetch(ECDH_SERV.url + "/", options);
    return await resp.json();
}

function newPrivateKey() {
	return wasm.ecdh.newPrivateKey()
}

function publicKey(privateKey) {
	return wasm.ecdh.publicKey(privateKey)
}

function mixKeys(privateKey, publicKey) {
	return wasm.ecdh.mixKeys(privateKey, publicKey)
}

function encryptString(s, secretKey) {
	return wasm.ecdh.encryptString(s, secretKey)
}

function decryptString(s , secretKey) {
	return wasm.ecdh.decryptString(s, secretKey)
}