import { KLEFKI } from "./constants";
import { callGo } from "./wasm_exec";

class ExchangeExecutor {
    constructor() {
        this.isComplete = false;

        this.privB64 = "";
        this.pubKeyB64 = "";

        this.exchangeID = "";
        this.pubKeyOtherB64 = "";
        this.sharedSecretB64 = "";
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

    keySet() {
        // returns the current keyset, some values may be unset (if the exhcange isnt complete)
        return { secret: this.privB64, public: this.pubKeyB64, shared: this.sharedSecretB64 };
    }

    _generateKeys() {
        this.privB64 = callGo(window.wasm.ecdh.newPrivateKey);
        this.pubKeyB64 = callGo(window.wasm.ecdh.publicKey, this.privB64);

        return this;
    }

    _mixECDH() {
        if (this.pubKeyOtherB64 == "") {
            throw new Error("the executor is missing an external public key");
        }
        if (this.privB64 == "") {
            throw new Error("the executor is missing a private key");
        }

        this.sharedSecretB64 = callGo(window.wasm.ecdh.mixKeys, this.privB64, this.pubKeyOtherB64);

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
        return this.keySet();
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
        return this.keySet();
    }

    async _keyForKey() {
        const body = { e: this.exchangeID, b: this.pubKeyB64 };
        const resp = await API("PATCH", body);

        this.pubKeyOtherB64 = resp.a;
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