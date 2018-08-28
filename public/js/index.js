
var sessionAttributes;
var sessionId;
var enableSpeech;

function onload() {
    $('#cekAPIAddress')[0].value = localStorage.getItem('cekAPIAddress');
    $('#userId')[0].value = localStorage.getItem('userId');
    $('#applicationId')[0].value = localStorage.getItem('applicationId');
    $('#enableSpeech')[0].value = localStorage.getItem('enableSpeech');
    save();
}

/// Save the settings.
function save() {
    let cekAPIAddress = $('#cekAPIAddress').val().toString();
    let userId = $('#userId').val().toString();
    let applicationId = $('#applicationId').val().toString();
    enableSpeech = $('#enableSpeech')[0].checked;
    localStorage.setItem('cekAPIAddress', cekAPIAddress);
    localStorage.setItem('userId', userId);
    localStorage.setItem('applicationId', applicationId);
    localStorage.setItem('enableSpeech', enableSpeech);
    let reqeustBody = { "cekAPIAddress": cekAPIAddress, "userId": userId, "applicationId": applicationId };
    $.ajax({
        url: "/save",
        contentType: "application/json",
        type: "POST",
        data: JSON.stringify(reqeustBody),
        success: function () {
            $('#message')[0].innerText = "";
        },
        error: function (xhr, ajaxOptions, thrownError) {
        }
    });
}

/// Send Intent Request
function sendIntent() {
    checkUri();
    let intentName = $('#intentName').val().toString();
    let slotName = $('#slotName').val().toString();
    let slotValue = $('#slotValue').val().toString();
    let slots = null;
    if (slotName) {
        slots = `{
            "${slotName}": {
                "name": "${slotName}",
                "value": "${slotValue}"
            }
        }`;
    }

    let requestBody = { "intentName": intentName, "slots": JSON.parse(slots) };
    $.ajax({
        url: "/sendIntent",
        contentType: "application/json",
        type: "POST",
        data: JSON.stringify(requestBody),
        success: function (body) {
            displayResult(body);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("Request Failed!")
        }
    });
}

/// Send Launch Request
function sendLaunch() {
    checkUri();
    $.ajax({
        url: "/sendLaunch",
        contentType: "application/json",
        type: "POST",
        success: function (body) {
            displayResult(body);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("Request Failed!")
        }
    });
}


/// Send SessionEnded Request
function sendSessionEnded() {
    checkUri();
    $.ajax({
        url: "/sendSessionEnded",
        contentType: "application/json",
        type: "POST",
        success: function (body) {
            displayResult(body);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("Request Failed!")
        }
    });
}

/// Parse the result and display.
function displayResult(body) {
    let response;
    try {
        response = JSON.parse(body);
    } catch (e) {
        $('#speech')[0].innerText = "Failed to parse json: " + e.toString();
    }

    if (response == null) {
        return;
    }

    // Parse speech elements.
    let speech = "";

    if (response.response.outputSpeech.values) {
        if (response.response.outputSpeech.type == "SimpleSpeech") {
            speech += response.response.outputSpeech.values.value + "\r\n";
            speak(response.response.outputSpeech.values);
        }
        else {
            response.response.outputSpeech.values.forEach((value) => {
                speech += value.value + "\r\n";
                speak(value);
            });
        }
    }
    if (response.response.outputSpeech.brief) {
        speech += response.response.outputSpeech.brief.value;
    }
    if (response.response.outputSpeech.verbose) {
        if (response.response.outputSpeech.verbose.type == "SimpleSpeech") {
            speech += response.response.outputSpeech.verbose.values.value + "\r\n";
            speak(response.response.outputSpeech.verbose.values);
        }
        else {
            response.response.outputSpeech.verbose.values.forEach((value) => {
                speech += value.value + "\r\n";
                speak(value);
            });
        }
    }
    $('#speech')[0].innerText = speech;

    $('#rawdata')[0].innerText = JSON.stringify(response, null, '  ');
}

function speak(speechInfoObject) {
    if(!enableSpeech || speechInfoObject.type == "URL"){
        return;
    }
    let msg = new SpeechSynthesisUtterance(speechInfoObject.value);
    switch (speechInfoObject.lang) {
        case "en":
            msg.lang = "en-US";
            break;
        case "ja":
            msg.lang = "ja-JP";
            break;
        case "ko":
            msg.lang = "ko-KR";
            break;
    }
    window.speechSynthesis.speak(msg);
}

function checkUri(){
    if(!$('#cekAPIAddress').val().toString()){
        alert("Enter CEK Server first.");
    }
}
onload();
