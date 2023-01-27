require('dotenv').config();
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const BASE_URL = process.env.BASE_URL;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:8081';
const EXPIRE_PROFILE = process.env.EXPIRE_PROFILE || 30 * 60;
module.exports = {
    REDIS_URL,
    BASE_URL,
    CLIENT_ID,
    CLIENT_SECRET,
    REGISTRY_URL,
    EXPIRE_PROFILE
}