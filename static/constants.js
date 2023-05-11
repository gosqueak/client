
export const {
    STATIC_SERV,
    AUTH_SERV,
    MSG_SERV,
    ECDH_SERV,
    EVENT
} = {
    STATIC_SERV: {
        url: "http://0.0.0.0:8080",
        endpoints: {
            app: "/app.html",
            login: "/login.html",
            register: "/register.html",
        },
        jwtAudStr: "WEBSERVICE"
    },
    AUTH_SERV: {
        url: "http://0.0.0.0:8081",
        endpoints: {
            apitokens: "/apitokens",
            accesstokens: "/accesstokens",
            login: "/login",
            register: "/register",
            logout: "/logout",
        },
        jwtAudStr: "AUTHSERVICE"
    },
    MSG_SERV: {
        url: "http://0.0.0.0:8082",
        endpoints: {
            ws: "/ws"
        },
        jwtAudStr: "MSGSERVICE"
    },
    ECDH_SERV: {
        url: "http://0.0.0.0:8083",
        jwtAudStr: "ECDHSERVICE"
    },
    EVENT: {
        ecdhNotification: "en",
    },
};