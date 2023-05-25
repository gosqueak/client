import { ECDH_SERV } from "./constants";

async function request(method, body) {
    ECDH_SERV.protocol + ECDH_SERV.url + "/"
    
    const options = {
        credentials: "include", // needed for cookies to be sent
        method: method,
        body: JSON.stringify(body),
    }
    const resp = await fetch(endpointURL, options);
    return await resp.json();
}

// see go_wasm/main.go for available functions
export function callGo(goFunc, ...args) {
    const { res, error } = goFunc(...args)
    checkAndThrowGoError(error)
    return res
}

function checkAndThrowGoError(errorString) {
    if (error !== "") {
        throw new Error("Error in go wasm:" + error)
    }
}

class ExchangeExecutor {
    constructor(b64privateKey) {
        this.b64privateKey = b64privateKey;
        this.exchangeID = "";
        this.b64PublicKeyUserA = "";
        this.b64PublicKeyUserB = "";
    }
}

class InitiatingExecutor extends ExchangeExecutor {
    constructor(b64PrivateKeyUserA) {
        super(b64PrivateKeyUserA)
        this.b64PublicKeyUserA = callGo(wasm.ecdh.publicKey, b64PrivateKeyUserA);
    }

    async initiateExchange() {
        const body = { k: this.b64PublicKeyUserA };
        const resp = await request("POST", body);

        this.exchangeID = resp.e;
    }

    async completeExchange() {
        const body = { u: this.exchangeID };
        const resp = await request("DELETE", body)
        this.b64PublicKeyUserB = resp.b;
    }
}

class RespondingExecutor extends ExchangeExecutor {
    constructor(exchangeID, b64PrivateKeyUserB) {
        super(b64PrivateKeyUserB)
        this.exchangeID = exchangeID;
        this.b64PublicKeyUserB = callGo(wasm.ecdh.publicKey, b64PrivateKeyUserB);
    }

    async swapExchangeKeys(keyExchangeID, b64PublicKeyUserB) {
        const body = { e: keyExchangeID, b: b64PublicKeyUserB };
        const resp = await request("PATCH", body)
        
        this.b64PublicKeyUserA = resp.a;
    }
}

class ExchangeExecutorManager {
    constructor() {
        
    }
}

class KeyManager {
    constructor() {
        
    }
}