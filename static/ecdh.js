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