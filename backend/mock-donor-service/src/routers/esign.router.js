const express = require('express');
const {v4: uuidv4} = require('uuid');
const redis = require('../services/redis.service');
const { PROTOCOL, HOST, PORT, DOMAIN_URL } = require('../../config/constants');

const esignRouter = express.Router();
esignRouter.post('/digiSign/genEspRequest', (req, res) => {
    const transactionId = uuidv4();
    res.send({
        espUrl: `${DOMAIN_URL}/mock/esign/${transactionId}`,
        aspTxnId: transactionId
    });
    return;
});

esignRouter.post('/mock/esign/:transactionId', (req, res) => {
    const html = `<html><head><title>Mock ESign</title></head><body><h3>This is Mock ESIGN Portal</h3><a href="${DOMAIN_URL}/mock/esign/submit/${req.params.transactionId}">Submit</a></body></html>`
    res.send(html);
})

esignRouter.get('/mock/esign/:transactionId', (req, res) => {
    const html = `<html><head><title>Mock ESign</title></head><body><h3>This is Mock ESIGN Portal</h3><a href="${DOMAIN_URL}/mock/esign/submit/${req.params.transactionId}">Submit</a></body></html>`
    res.send(html);
})

esignRouter.get('/mock/esign/submit/:transactionId', async(req, res) => {
    await redis.storeKeyWithExpiry(req.params.transactionId, "true", 1800);
    res.sendStatus(200);
});

esignRouter.get('/digiSign/pdf/:transactionId', async(req, res) => {
    // const isSigned = await redis.getKey(req.params.transactionId) === "true";
    res.status(200).json({});
    return;
});

esignRouter.post('/api/v1/Pledge/:pledgeOsid/esign/documents', (req, res) => {
    console.log('I AM HERE')
    res.status(200).send({})
})
module.exports = {
    esignRouter
}
