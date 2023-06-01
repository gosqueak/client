import { Envelope } from "./models.js"

export class SocketWrapper extends EventTarget {
    constructor(url, keySets) {
        super();
        this.url = url;
        this._ws = null;
        this.keySets = keySets;
    }

    // override to show this name instead of 'EventTarget'
    get [Symbol.toStringTag]() {
        return this.constructor.name;
    }

    async connect() {
        const ws = new WebSocket(this.url);

        ws.onopen(() => {
            console.log("ws connection opened");
        });
        ws.onclose(() => {
            console.log("ws connection closed");
        });
        ws.onerror(ev => console.log(`ws error: ${ev.data}`));

        ws.onmessage(ev => {
            let json;
            try {
                json = JSON.parse(ev.data);
            } catch (e) {
                console.warn("error parsing JSON string: " + e.message);
                return;
            }

            let envelope;
            try {
                envelope = Envelope(json);
            } catch (e) {
                console.warn("error creating Envelope: " + e.message);
                return;
            }

            if (envelope.isEncrypted) {
                try {
                    envelope.decrypt(this.keySets.get(envelope.fromUserID).shared);
                } catch (e) {
                    console.warn("failed to decrypt envelope due to an error: " + e.message);
                    return;
                }
            }

            const event = new CustomEvent(envelope.typeName, {envelope: envelope});
            this.dispatchEvent(event);
        });

        this._ws = ws;
    }

    async send(envelope, encryptEnvelope) {
        if (encryptEnvelope ?? false) {
            try {
                envelope.encrypt(this.keySets.get(envelope.toUserID).shared);
            } catch (e) {
                console.warn("could not encrypt envelope due to an error: " + e.message);
                return;
            }
        }

        this._ws.send(JSON.stringify(envelope));
    }
}
