const { default: axios } = require('axios');
const config = require('../configs/config');
const op = require('object-path');
const kafkaClient =require('../services/kafka.producer');
const { Kafka, Partitioners } = require('kafkajs');


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
    let transformedData = transformTheData(getTheDataFromRegistry.data);
    let telemertryObject = getTelemtryObject( entityName , entityId,transformedData);
    await kafkaClient.produceEventToKafka(topicName, telemertryObject) 
    console.log("Migration was successfull!");

  } catch (error) {
    console.log(error)
    throw new Error("Error While DB Migration : ", error);
  }
}

let internalFields = [
  "$.personalDetails.firstName",
  "$.personalDetails.middleName",
  "$.personalDetails.lastName",
  "$.personalDetails.fatherName",
  "$.personalDetails.motherName",
  "$.personalDetails.dob",
  "$.personalDetails.gender",
  "$.personalDetails.bloodGroup",
  "$.personalDetails.emailId",
  "$.personalDetails.mobileNumber",
  "$.personalDetails.photo",
  "$.identificationDetails.abha",
  "$.addressDetails.addressLine1",
  "$.addressDetails.addressLine2",
  "$.addressDetails.state",
  "$.addressDetails.country",
  "$.addressDetails.district",
  "$.addressDetails.pincode",
  "$.notificationDetails.name",
  "$.notificationDetails.relation",
  "$.notificationDetails.mobileNumber",
  "$.emergencyDetails.name",
  "$.emergencyDetails.relation",
  "$.emergencyDetails.mobileNumber",
  "$.pledgeDetails",
  "$.aadhaar",
  "$._osSignedData"
]


function transformTheData (data) {
  let transformedData = data
  let getInternalFeilds = internalFields;
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