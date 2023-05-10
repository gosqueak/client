import { MSG_SERV } from "./constants.js";
import * as auth from "./auth.js";

const eventHandlers = {};

// add a function to handle a certain socket event type name
// the handler function should be a void function of SocketEvent body object
export function setHandler(typeName, handler) {
    eventHandlers[typeName] = handler;
}

export async function getSock() {
    // status code errors should be handled by callers
    await auth.requestApiToken(MSG_SERV.jwtAudStr);

    const url = "ws://" + MSG_SERV.url + MSG_SERV.endpoints.ws;

    const ws = new WebSocket(url, jwtStr);

    ws.onmessage(e => {
        const socketEvent = SocketEvent.fromJSON(JSON.parse(e.data));
        const bodyJSON = JSON.parse(socketEvent.body);
        eventHandlers[socketEvent.typeName](bodyJSON);
    });

    ws.onclose(e => {
        `server sent close event ${e}`
    });

    return ws;
}

export function sendEvent(ws, eventTypeName, bodyObj) {
    const event = new SocketEvent(eventTypeName, JSON.stringify(bodyObj));
    ws.send(JSON.stringify(event))
}

class SocketEvent {
    constructor(typeName, bodyStr) {
        this.typeName = typeName;
        this.bodyStr = bodyStr;
    }

    // used by JSON module to serialize
    toJSON() {
        return {
            t: this.typeName,
            b: this.bodyStr
        };
    }

    static fromJSON(json) {
        return new SocketEvent(json.t, json.b);
    }
}

