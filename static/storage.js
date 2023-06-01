import { callGo } from "./wasm_exec";

export function encrypter(password) {
    return object => {
        const ciphertextB64 = callGo(wasm.ecdh.passwordEncrypt, btoa(JSON.stringify(object)), btoa(password));
        return ciphertextB64;
    }
}

export function decrypter(password) {
    return ciphertextB64 => {
        const plaintextB64 = callGo(wasm.ecdh.passwordDecrypt, ciphertextB64, btoa(password));
        return JSON.parse(atob(plaintextB64));
    }
}

export class LocalStorage {
    constructor(namespace) {
        this.namespace = namespace;
        this._manifest = null;
        this._loadManifest();
    }

    put(storageID, str) {
        this._putStr(storageID, str)
        this._manifest.add(storageID);
        this._saveManifest();
    }

    get(storageID) {
        const str = localStorage.getItem(this.keyFor(storageID));

        if (str === null) {
            throw new Error(`no item with id in localStorage: '${storageID}'`);
        }

        return str;
    }

    delete(storageID) {
        this._delStr(storageID);
        this._manifest.delete(storageID);
        this._saveManifest();
    }

    keyFor(storageID) {
        return `${this.namespace}_${storageID}`
    }

    wipeStorage() {
        for (let storageID of this._manifest) {
            this._delStr(storageID);
        }

        this._delStr("_manifest");
        this._loadManifest();
    }

    _delStr(storageID) {
        localStorage.removeItem(this._keyFor(storageID))
    }

    _putStr(storageID, s) {
        localStorage.setItem(this.keyFor(storageID), s);
    }

    _saveManifest() {
        this._putStr("_manifest", JSON.stringify([...this._manifest]));
    }

    _loadManifest() {
        let data = localStorage.getItem(this.keyFor("_manifest"));

        if (data === null) {
            data = "[]";
            this._putStr("_manifest", data);
        };

        this._manifest = new Set(JSON.parse(data));
    }
}

export class SecretStorage extends LocalStorage {
    constructor(namespace, encrypterFunc, decrypterFunc) {
        super(namespace);

        this.encrypt = encrypterFunc;
        this.decrypt = decrypterFunc;
    }

    put(storageID, secretObject) {
        super.put(storageID, this.encrypt(secretObject));
    }

    get(storageID) {
        return this.decrypt(super.get(storageID));
    }

    delete(storageID) {
        super.delete(storageID);
    }
}