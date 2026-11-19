import 'dotenv/config';
export const env = {
    port: process.env.PORT || 4000,
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiration: process.env.JWT_EXPIRATION,
    clientUrl: process.env.CLIENT_URL,
}

if(!env.databaseUrl || !env.jwtSecret){
    throw new Error('Missing required environment variables. Please check your .env');
}