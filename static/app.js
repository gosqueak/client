import { STATIC_SERV } from "./constants.js";
import * as websocket from "./websocket.js";

class UIWidget {
    constructor(domElem) {
        this.domElem = domElem;
        // array of UIWidget
        this.children = [];
    }

    updateDOM() {
        for (const child of this.children) {
            child.updateDOM();
        };
    }
}

class UIConversationList extends UIWidget {
    constructor(domElem, app) {
        super(domElem)
        this.app = app;
        this.conversations = {};
    }

    updateDOM() {
        super.updateDOM()
    }
}

class UIMessagePanel extends UIWidget {
    constructor(domElem, app) {
        super(domElem)
        this.app = app;
        this.conversations = [];
    }

    setCurrentConversation(conversation) {
        this._currentConversation = conversation;
    }

    getCurrentConversation() {
        return this._currentConversation;
    }

    updateDOM() {
        super.updateDOM()
    }
}

// used by conversation list and message panel
export class Conversation {
    constructor(id) {
        this.messages = [];
    }
}

class App extends UIWidget {
    constructor(ws) {
        super(document.documentElement);
        this.ws = ws;

        this.conversations = {}; // convoId: Conversation

        this.children.push(new UIConversationList(
            document.querySelector("conversation-list"), this
        ))

        this.children.push(new UIMessagePanel(
            document.querySelector("message-panel"), this
        ))
    }
    keepUpdatingDOM() {
        this.updateDOM();
        requestAnimationFrame(this.keepUpdatingDOM.bind(this))
    }
}

// // used in main
var ws, app, sendButton, messageInput

async function main() {
    // try connecting to the ws server or return to login page
    try {
        ws = await websocket.getSock();
    } catch (err) {
        if (err.status == 401) {
            location.replace(STATIC_SERV.url + STATIC_SERV.endpoints.login);
        } else {
            throw err;
        }
    }

    app = new App(ws);

    sendButton = document.querySelector('.send-button');
    messageInput = document.querySelector('.message-input');

    sendButton.addEventListener('click', async function (evt) {
        messageInput.value = "";
    })

    app.keepUpdatingDOM()
}

main();