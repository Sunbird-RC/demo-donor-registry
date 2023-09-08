const { default: axios } = require('axios');
const config = require('../configs/config');
const op = require('object-path');
const kafkaClient =require('../services/kafka.producer');


const topicName = `${config.METRICS_TOPIC}`; 

async function migrateDataToCH (entityName, entityId, accessToken) {

  try {
    let searchURL= `${config.REGISTRY_URL}/api/v1/${entityName}/${entityId}`;
    console.log(searchURL);
    let getTheDataFromRegistry = await axios.get(searchURL, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        }
    });
    if (getTheDataFromRegistry.data && getTheDataFromRegistry.data != '') {
      let transformedData = transformTheData(getTheDataFromRegistry.data, entityName);
      let telemertryObject = getTelemtryObject( entityName , entityId,transformedData);
      await kafkaClient.emitEventToKafka(topicName, telemertryObject) 
      console.log("Migration was successfull!");
    }
  } catch (error) {
    console.log(error);
    console.log(error?.response?.data);
    throw new Error("Error While DB Migration : ", error);
  }
}


function transformTheData (data, entityName) {
  let transformedData = data
  let getInternalFeilds = require(`../schemas/${entityName}.json`);
  if (getInternalFeilds?._osConfig?.internalFields) getInternalFeilds = getInternalFeilds?._osConfig?.internalFields 
  else throw new Error("Couldnt fetch the schema / internal feilds - check the schema directory!");
  for (let i=0 ; i < getInternalFeilds.length; i++) {
      let attribute = getInternalFeilds[i].split('$.')[1];
      op.del(transformedData, attribute);
  }
  return transformedData;
}

function getTelemtryObject (entityName , entityId , filteredData) {
  return {
      "eid" : "ADD",
      "ets" : Date.now(),
      "ver" : "3.1",
      "mid" : "22e83ab6-f8c5-47af-a84b-c7113e1feb76",
      "actor" : {
        "id" : "",
        "type" : "USER"
      },
      "object" : {
        "id" : entityId,
        "type" : entityName
      },
      "edata" : filteredData
  }
}
  
module.exports ={
    migrateDataToCH,
}