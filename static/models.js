import { encrypter, decrypter } from "./serial.js";


export class Envelope{
    constructor(json) {
        json = cleanJSON(json, Envelope.expectedProperties)
        Object.assign(this, json);
    }

    static expectedProperties = {
        typeName: "string",
        toUserID: "string",
        fromUserID: "string",
        isEncrypted: "boolean",
        body: "string",
    };

    encrypt(secret) {
        this.body = encrypter(secret)(this.body);
        this.isEncrypted = true;
    }

    decrypt(secret) {
        this.body = decrypter(secret)(this.body);
        this.isEncrypted = false;
    }
}

export class Partner {
    constructor(json) {
        json = cleanJSON(json, Partner.expectedProperties);
        Object.assign(this, json);
    }

    static expectedProperties = {
        id: "string",
        username: "string",
    };
}

export class LoggedInUser {
    constructor(json) {
        json = cleanJSON(json, LoggedInUser.expectedProperties);
        Object.assign(this, json);
    }

    static expectedProperties = {
        id: "string",
        username: "string",
        password: "string",
    };
}

export class Message {
    constructor(json) {
        json = cleanJSON(json, Message.expectedProperties);
        Object.assign(this, json);
    }
    
    static expectedProperties = {
        id: "string",
        toUserID: "string",
        fromUserID: "string",
        text: "string",
        timestamp: "string",
    };
}

export class EcdhNotification {
    constructor(json) {
        json = cleanJSON(json, EcdhNotification.expectedProperties);
        Object.assign(this, json);
    }

    static expectedProperties = {
        exchangeID: "string",
    };
}

export class EcdhStart extends EcdhNotification {}
export class EcdhEnd extends EcdhNotification {}

function cleanJSON(json, expectedProperties) {
    const validKeys = Object.keys(expectedProperties);
    
    const cleaned = Object.create(null);
    validKeys.forEach(key => {
        const val = json[key];
        const expectedType = expectedProperties[key];

        if (val === null || val === undefined) {
            throw new Error(`missing property / malformed data: (${key}: ${val})`);
        }
        if (typeof val !== expectedType) {
            throw new Error(`non-allowed property type in data: ${key}: ${val} (got '${typeof val}', expected '${expectedType}')`);
        }

        cleaned[key] = val;
    });
    
    return cleaned;
}