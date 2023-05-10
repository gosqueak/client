
export class EncryptedMessage {
    constructor(toUserId, b64ciphertext, senderPreKeyId, recipientPreKeyId) {
        this.toUserId = toUserId;
        this.b64ciphertext = b64ciphertext;
        this.senderPreKeyId = senderPreKeyId;
        this.recipientPreKeyId = recipientPreKeyId;
    }

    // this JSON schema is known by the server
    toJSON() {
        return {
            t: this.toUserId,
            b: this.b64ciphertext,
            s: this.senderPreKeyId,
            r: this.recipientPreKeyId
        };
    }

    static fromJsonObject(obj) {
        return new EncryptedMessage(obj.t, obj.b, obj.s, obj.r);
    }

}

export class UnencryptedMessage {
    constructor(toUserId, fromUserId, text) {
        this.toUserId = toUserId;
        this.fromUserId = fromUserId;
        this.text = text;
    }

    static fromJsonObject(obj) {
        return new UnencryptedMessage(obj.t, obj.f, obj.tx)
    }

    toJSON() {
        return {
            t: this.toUserId,
            f: this.fromUserId,
            tx: this.text
        }
    }
}

