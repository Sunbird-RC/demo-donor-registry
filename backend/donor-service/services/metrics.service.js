const { default: axios } = require('axios');
const config = require('../configs/config');
const consants = require('../configs/constants');
const redis = require('../services/redis.service');
const abhaProfile = require('./abhaProfile.service');
const { ConfigSource } = require('kafkajs');
const utils =require('../utils/utils');

const lengthOfKey = 15; 
async function getMetrics(req, res) {  
    try {
        let schemaType = req.params.schemaType;
        if (!schemaType) schemaType = "Pledge";
        let metricsURL = `${config.METRICS_URL}/v1/metrics`;
        const key =  abhaProfile.getKeyBasedOnEntityName(schemaType);
        let dataFromMetricsSerice = ((await axios.get(metricsURL)).data);
        let keys =  await redis.getAllKeys(key);
        keys = keys.filter((i) => i.length === lengthOfKey);
        if (Object.keys(dataFromMetricsSerice).length > 0 ) {
            dataFromMetricsSerice[schemaType.toString().toLowerCase()]["UNPLEDGED"] = await getUnpledgedCount( keys);
        } else {
            dataFromMetricsSerice[schemaType.toString().toLowerCase()] = {};
            dataFromMetricsSerice[schemaType.toString().toLowerCase()]["UNPLEDGED"] = await getUnpledgedCount( keys);
        }
        res.json(dataFromMetricsSerice);
    } catch (err) {
        const error = utils.getErrorObject(err)
        res.status(error.status).send(error)
    }
}

async function getUnpledgedCount (keys) {
    let count = 0 ;
    for (let i=0 ; i< keys.length; i++) {
        let value = await redis.getKey(keys[i]);
        if ( value === consants.PLEDGE_STATUS.UNPLEDGED) count++;
    }
    return count;
}

module.exports ={
    getMetrics,
}