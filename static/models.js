import { encrypter, decrypter } from "./storage.js";


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

/////////////////////////////////////////////////

// Extends EventTarget to emit and listen to events.
class EventModel extends EventTarget {
    constructor() {
        super();
    }

    EV = {}; // custom event name enum

    // override to show this name instead of 'EventTarget'
    get [Symbol.toStringTag]() {
        return this.constructor.name;
    }
}

export class Conversations extends EventModel {
    constructor(storage, ...conversations) {
        super();
        this.conversations = new Map();
        this.activeConversation = null;
        this.addConversations(...conversations)
    }

    EV = {
        addConversation: "addconvo",
        removeConversation: "remconvo",
    }

    toJSON() {
        return {
            conversations: [...this.conversations.values()], 
        };
    }

    static fromJSON(json) {
        return new Conversations(...json.conversations.map(c => Conversation.fromJSON(c)));
    }

    addConversations(...conversations) {
        for (let convo of conversations) {
            this.conversations.set(convo.id, convo);
            this.dispatchEvent(
                new CustomEvent(this.EV.addConversation, {conversation: convo})
            );
        }
    }

    deleteConversations(...ids) {
        let convo, existed;
        for (let id of ids) {
            convo = this.conversations.get(id)
            existed = this.conversations.delete(id);

            if (!existed) {
                continue;
            }

            this.dispatchEvent(
                new CustomEvent(this.EV.removeConversation, {conversation: convo})
            );
        }
    }

    setActiveConversation(id) {
        const convo = this.conversations.get(id);

        if (convo === undefined) {
            console.warn("the given conversation id is not in the conversations map: " + id);
            return;
        }

        this.activeConversation = convo;
        this.dispatchEvent(new CustomEvent(this.EV.setActiveConversation, {conversation: convo}));
    }
}

export class Conversation extends EventModel {
    constructor(id, partner, ...messages) {
        super();
        this.id = id;
        this.partner = partner;
        this.messages = new Map();
        this.addMessages(...messages);
    }

    EV = {
        addMessage: "addmessage",
        removeMessage: "remmessage",
    }

    toJSON() {
        return {
            ...this,
            messages: [...this.messages.values()], 
        };
    }

    static fromJSON(json) {
        return new Conversation(
            Partner.fromJSON(json.partner), 
            ...json.messages.map(m => Message.fromJSON(m))
        );
    }

    addMessages(...messages) {
        for (let m of messages) {
            this.messages.set(m.id, m);
            this.dispatchEvent(
                new CustomEvent(this.EV.addMessage, {conversation: this, message: m})
            )
        }
    }

    deleteMessages(...ids) {
        for (let id of ids) {
            const m = this.messages.get(id);
            const messageExisted = this.messages.delete(id);

            if (!messageExisted) {
                continue;
            }
            
            this.dispatchEvent(
                new CustomEvent(this.EV.removeMessage, {conversation: this, message: m})
            );
        }
    }
}