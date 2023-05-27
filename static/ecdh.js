import { KLEFKI } from "./constants";

class ExchangeExecutor {
    constructor() {
        this.isComplete = false;

        this.privB64 = "";
        this.pubKeyB64 = "";

        this.exchangeID = "";
        this.pubKeyOtherB64 = "";
        this.sharedSecret = "";
    }

    toJSON() {
        if (this.isComplete) {  // no situation where a complete executor should be serialized to JSON
            throw new Error("attempt to serialize a complete exchange executor");
        }

        return this;
    }

    static fromJSON(object) {
        const executor = new this();
        return Object.assign(executor, object);
    }

    _generateKeys() {
        this.privB64 = callGo(wasm.ecdh.newPrivateKey);
        this.pubKeyB64 = callGo(wasm.ecdh.publicKey, this.privB64);

        return this;
    }

    _mixECDH() {
        if (this.pubKeyOtherB64 == "") {
            throw new Error("the executor is missing an external public key");
        }
        if (this.privB64 == "") {
            throw new Error("the executor is missing a private key");
        }

        this.sharedSecret = callGo(wasm.ecdh.mixKeys, this.privB64, this.pubKeyOtherB64);

        return this;
    }
}

// Should be instantiated by User A when initiating a ECDH key exchange
export class UserA extends ExchangeExecutor {
    constructor() {
        super();
    }

    async startExchange() {
        this._generateKeys()
        await this._initiateExchange()

        return this;
    }

    async finishExchange() {
        await this._finalizeExchange();
        this._mixECDH();

        this.isComplete = true;
        return this;
    }

    async _initiateExchange() {
        const body = { k: this.pubKeyB64 };
        const resp = await API("POST", body);

        this.exchangeID = resp.e;
    }

    // deletes the exchange in database after returning an external public key  for user B.
    async _finalizeExchange() {
        const body = { u: this.exchangeID };
        const resp = await API("DELETE", body);
        this.pubKeyOtherB64 = resp.b;
    }
}

// Should be instantiated by User B after being notified of an existing exchange
export class UserB extends ExchangeExecutor {
    constructor(exchangeID) {
        super();
        this.exchangeID = exchangeID;
    }

    // because UserB doesnt need to wait, all steps can be done at once.
    async executeExchange() {
        this._generateKeys();
        await this._keyForKey();
        this._mixECDH();

        this.isComplete = true;
        return this;
    }

    async _keyForKey() {
        const body = { e: this.exchangeID, b: this.pubKeyB64 };
        const resp = await API("PATCH", body);

        this.pubKeyOtherB64 = resp.a;
    }
}

export class SecretManager {
    constructor(password, storageKey) {
        // Map of id to secret object
        this._secretWrappers = new Map();
        this._password = password;
        this._storageKey = storageKey;
    }

    // add a secret json object. Set the isSessionOnly flag to ensure
    //  the secret is treated as session-only. The secret should never be persisted on disk if
    //  the isSessionOnly flag is set.
    putSecret(id, secretObject, isSessionOnly) {
        const secretWrapper = { isSessionOnly, secretObject }
        this._secretWrappers.set(id, secretWrapper)
    }

    getSecret(id) {
        const secretWrapper = this._secretWrappers.get(id);

        if (secretWrapper === undefined) {
            throw new Error(`no secret item with id in map: '${id}'`);
        }

        return secretWrapper.secretObject;
    }

    deleteSecret(id) {
        delete this._secretWrappers[id]
    }

    saveLS() {
        const entries = [...this._secretWrappers.entries()]
                        .filter( ([ id, wrapper ]) => !wrapper.isSessionOnly );
        const ciphertext = encryptObject(this._password, entries)
        localStorage.setItem(this._storageKey, ciphertext);
    }

    deleteLS() {
        localStorage.removeItem(this._storageKey);
    }

    static fromLocalStorage(password, storageKey) {
        const mngr = new SecretManager(password, storageKey);

        const ciphertext = localStorage.getItem(mngr._storageKey);
        if (ciphertext === null) {
            return mngr;  // there is no localstorage, so return fresh manager
        };

        const decryptedEntries = decryptObject(this.password, ciphertext);
        
        for (let [ id, wrapper ] of decryptedEntries ) {
            mngr.putSecret(id, wrapper.secret, false)
        };
    }
}

async function API(method, body) {
    const endpointURL = KLEFKI.protocol + KLEFKI.url + "/";

    const options = {
        credentials: "include", // needed for cookies to be sent
        method: method,
        body: JSON.stringify(body),
    };
    const resp = await fetch(endpointURL, options);
    return await resp.json();
}

// see go_wasm/main.go for available functions
export function callGo(goFunc, ...args) {
    const { res, error } = goFunc(...args);
    checkAndThrowGoError(error);
    return res;
}

function checkAndThrowGoError(errorString) {
    if (error !== "") {
        throw new Error("Error in go wasm: " + error)
    };
}
