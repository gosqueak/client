import { ALAKAZAM } from "./constants.js";
import { SecretStorage, decrypter, encrypter } from "./storage.js";
import { SocketWrapper } from "./websocket.js";
import { Message, EcdhStart, EcdhEnd, Conversations } from "./models.js";
import { requestApiToken } from "./auth.js";


async function getSock(keyStorage) {
    const ws = SocketWrapper("ws://" + ALAKAZAM.url + ALAKAZAM.endpoints.ws, keyStorage);

    ws.addEventListener(EcdhStart.name, envelope => {
        
    });
    ws.addEventListener(EcdhEnd.name, envelope => {
        
    });
    ws.addEventListener(Message.name, envelope => {
        console.log(envelope.body);
    });

    // Alakzam requires an API token cookie to get a ws connection.
    await requestApiToken(ALAKAZAM.jwtAudStr);
    await ws.connect();

    return ws;
}

async function main() {
    const user = window.loggedInUser;
    const [encrypt, decrypt] = [encrypter(user.password), decrypter(user.password)];

    const EcdhExecutors = new SecretStorage("gosqueak_ecdh_executors", encrypt, decrypt); // for uncompleted exchanges
    const keysetStorage = new SecretStorage("gosqueak_ecdh_keysets", encrypt, decrypt); // keysets from complete exchanges
    const ws = await getSock(keysetStorage);
    const conversations = new Conversations();

    await new Promise(() => {})
}

main();