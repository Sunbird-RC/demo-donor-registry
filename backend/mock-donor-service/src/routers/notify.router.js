const express = require('express');
const notifyRouter = express.Router();

notifyRouter.post('/notification-service/v1/notification', (req, res) => {
    res.sendStatus(200);
});

module.exports = {
    notifyRouter
}