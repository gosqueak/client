import { MSG_SERV } from "./constants.js";
import * as auth from "./auth.js";

const eventHandlers = {};

export function setHandler(typeName, handler) {
    // add a function to handle a certain socket event type name
    // the handler function should be a void function of SocketEvent body object
    eventHandlers[typeName] = handler;
}


export async function getSock() {
    // status code errors should be handled by callers
    await auth.requestApiToken(MSG_SERV.jwtAudStr);

    const url = "ws://" + MSG_SERV.url + MSG_SERV.endpoints.ws;

    return new WebSocket(url, jwtStr);
}


// export function sendEvent(ws, eventTypeName, bodyObj) {
//     const event = new SocketEvent(eventTypeName, JSON.stringify(bodyObj));
//     ws.send(JSON.stringify(event))
// }


class SocketEvent {
    constructor(typeName, toUserId, fromUserId, body) {
        this.typeName = typeName;
        this.toUserId = toUserId;
        this.fromUserId = fromUserId;
        this.body = body;
    }

    // used by JSON module to serialize
    toJSON() {
        return {
            t: this.typeName,
            tu: this.toUserId,
            fu: this.fromUserId,
            b: this.body
        };
    }

    static fromJSON(json) {
        return new SocketEvent(json.t, json.tu, json.fu, json.b);
    }
}


class ECDHNotification {
    constructor(exchangeUUID) {
        this.exchangeUUID = exchangeUUID;
    }

    toJSON() {
        return {
          e: this.exchangeUUID  
        };
    }

    static fromJSON(json) {
        return new ECDHNotification(json.e)
    }
}
