const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const {abhaRouter} = require('./src/routers/abha.router');
const {esignRouter} = require('./src/routers/esign.router');
const {notifyRouter} = require('./src/routers/notify.router');
const { initRedis } = require('./src/services/redis.service');
const { PORT } = require('./config/constants');

(async() => {
    await initRedis({REDIS_URL: 'redis://localhost:6379'})
})();
app.use((bodyParser.json()));
app.use('', abhaRouter);
app.use('', esignRouter);
app.use('', notifyRouter);
// app.use(express.json())
app.listen(PORT);