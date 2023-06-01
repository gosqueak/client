
export const {
    STATIC_SERV,
    STEELIX,
    ALAKAZAM,
    KLEFKI,
} = {
    STATIC_SERV: {
        protocol: "http://",
        url: "localhost:8080",
        endpoints: {
            app: "/app",
            login: "/login",
            register: "/register",
        },
    },
    STEELIX: {
        protocol: "http://",
        url: "localhost:8081",
        endpoints: {
            apitokens: "/apitokens",
            accesstokens: "/accesstokens",
            login: "/login",
            register: "/register",
            logout: "/logout",
        },
        jwtAudStr: "steelix"
    },
    ALAKAZAM: {
        protocol: "http://",
        url: "localhost:8083",
        endpoints: {
            ws: "/ws"
        },
        jwtAudStr: "alakazam"
    },
    KLEFKI: {
        protocol: "http://",
        url: "localhost:8082",
        jwtAudStr: "klefki",
        endpoints: {
            "/": "/ws"
        },
    },
};