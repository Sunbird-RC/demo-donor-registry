const redis = require("redis");
const {promisify} = require('util');
let client;
let getAsync;

async function initRedis(config) {
  console.log(config.REDIS_URL)
  client = redis.createClient({url: config.REDIS_URL});
  client.on("error", function (error) {
    console.error(error);
  });
  getAsync = promisify(client.get).bind(client);
  await client.connect();
}

async function storeKeyWithExpiry(key, value, expiry) {
  await client.set(key, value, {
    'EX': expiry,
    'NX': false
  });
}

async function storeKey(key, value) {
  await client.set(key, value);
}

async function getKey(key) {
  return await client.get(key);
}

async function increment(key) {
  return await client.incr(key);
}

function deleteKey(key) {
    client.del(key);
}

module.exports = {
  storeKeyWithExpiry,
  initRedis,
  getKey,
  deleteKey,
  increment,
  storeKey
};
