let baseUrl = {
    WS: "ws://localhost:3001/",
    API: "http://localhost:3000"
};
switch (process.env.NODE_ENV) {
    case 'development':
        baseUrl = {
            WS: "ws://localhost:3001/",
            API: "http://localhost:3000"
        }
        break
    case 'production':
        baseUrl = {
            WS: "ws://69.171.69.13:3002/",
            API: "http://69.171.69.13:3003"
        }
        break
}

export default baseUrl;