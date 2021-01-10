require("dotenv").config();

const DEV_CONFIG = {
    FRONTEND_URL: "http://localhost:3000",
    BACKEND_URL: "http://localhost:8888",
    DATABASE_URI: "mongodb://localhost:27017/Playlists",
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET
}

const PROD_CONFIG = {
    BACKEND_ADDRESS: process.env.BACKEND_ADDRESS,
    FRONTEND_ADDRESS: process.env.FRONTEND_ADDRESS,
    DATABASE_URI: process.env.DATABASE_URI,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
}

module.exports = process.env.NODE_ENV === 'development' ? DEV_CONFIG : PROD_CONFIG