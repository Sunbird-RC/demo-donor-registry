const axios = require('axios');
const {NOTIFICATION_SERVICE_URL} = require("../configs/config");


const sendNotification = (to, message, templateId) => {
    const data = JSON.stringify({
        "recipient": `tel:${to}`,
        "message": `{\n  \"message\": \"${message}\",\n  \"templateId\": \"${templateId}\"\n}`
    });

    const config = {
        method: 'post',
        url: NOTIFICATION_SERVICE_URL,
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    return axios(config)
        .then(function (response) {
            console.log("Successfully sent the SMS")
            console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.error("Failed sending SMS")
            console.log(error);
        });
}

module.exports = {
    sendNotification
}
