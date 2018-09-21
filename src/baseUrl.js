let baseUrl = "ws://localhost:3001/"; 
switch (process.env.NODE_ENV) {
    case 'development':
        baseUrl = "ws://localhost:3001/" 
        break
    case 'production':
        baseUrl = "ws://localhost:3001/"   
        break
}

export default baseUrl;