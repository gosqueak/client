import { Partner, Message } from "./models.js";

// Extends EventTarget to emit and listen to events.
class Model extends EventTarget {
    constructor() {
        super();
    }

    EV = {}; // custom event name enum

    // override to show this name instead of 'EventTarget'
    get [Symbol.toStringTag]() {
        return this.constructor.name;
    }
}

export class Conversations extends Model {
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

export class Conversation extends Model {
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