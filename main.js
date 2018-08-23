const expressapp = require('express');
const bodyParser = require("body-parser");
const request = require("request");
const express = expressapp();
const http = require('http').Server(express);
const uuidv4 = require('uuid/v4');

const port = 1234;
var userId;
var cekAPIAddress;
var applicationId;
var sessionId;
var sessionAttributes;

express.use(bodyParser.json({ limit: '50mb' }));
express.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
// Return all static files such as css and js in dist folder.
express.use(expressapp.static('public'));
express.get('/', function (req, res) {
    res.sendFile(__dirname + "/public/html/index.html");
});

// Save settings
express.post('/save', function (req, res) {
    userId = req.body.userId;
    cekAPIAddress = req.body.cekAPIAddress;
    applicationId = req.body.applicationId;
    res.send();
});

// Send Launch Request
// https://clova-developers.line.me/guide/#/CEK/References/CEK_API.md#CustomExtLaunchRequest
express.post('/sendLaunch', function (req, res) {
    sessionId = uuidv4();
    sessionAttributes = {};
    let requestBody = getRequest(true, "LaunchRequest");
    send(requestBody, res);
});

// Send Intent Request
// https://clova-developers.line.me/guide/#/CEK/References/CEK_API.md#CustomExtIntentRequest
express.post('/sendIntent', function (req, res) {
    let intent = {
        "name": req.body.intentName,
        "slots": req.body.slots
    };

    let requestBody = getRequest(false, "IntentRequest");
    requestBody.request.intent = intent;
    send(requestBody, res);
});

// Send SessionEnded Request
// https://clova-developers.line.me/guide/#/CEK/References/CEK_API.md#CustomExtSessionEndedRequest
express.post('/sendSessionEnded', function (req, res) {
    let requestBody = getRequest(false, "SessionEndedRequest");
    send(requestBody, res);
});

/// Send POST to CEK Server. 
/// Sign by RSA key is not implemented.
function send(requestBody, res) {
    request({
        headers: {
            "Content-Type": "application/json",
            "SignatureCEK": "dummy"
        },
        uri: cekAPIAddress,
        body: JSON.stringify(requestBody),
        method: 'POST'
    },
        function (error, response, body) {
            let result = JSON.parse(body);
            sessionAttributes = result.sessionAttributes;
            res.send(body);
        }
    );
}

//#endregion
/* Start the service */
http.listen(port, function () {
    console.log(`listening on *:${port}`);
});

// Get Request 
function getRequest(isNew, requestType) {
    let requestBody = {
        "version": "1.0",
        "session": {
            "new": isNew,
            "sessionAttributes": sessionAttributes,
            "sessionId": sessionId,
            "user": {
                "userId": userId,
                "accessToken": "XHapQasdfsdfFsdfasdflQQ7"
            }
        },
        "context": {
            "System": {
                "application": {
                    "applicationId": applicationId
                },
                "user": {
                    "userId": userId,
                    "accessToken": "XHapQasdfsdfFsdfasdflQQ7"
                },
                "device": {
                    "deviceId": "096e6b27-1717-33e9-b0a7-510a48658a9b",
                    "display": {
                        "size": "l100",
                        "orientation": "landscape",
                        "dpi": 96,
                        "contentLayer": {
                            "width": 640,
                            "height": 360
                        }
                    }
                }
            }
        },
        "request": {
            "type": requestType
        }
    };

    return requestBody;
}
