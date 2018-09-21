let baseUrl = "ws://localhost:3001/"; 
switch (process.env.NODE_ENV) {
    case 'development':
        baseUrl = "ws://localhost:3001/" 
        break
    case 'production':
        baseUrl = "ws://69.171.69.13:3002/"   
        break
}

export default baseUrl;