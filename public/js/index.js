
var sessionAttributes;
var sessionId;

function onload() {
    $('#cekAPIAddress')[0].value = localStorage.getItem('cekAPIAddress');
    $('#userId')[0].value = localStorage.getItem('userId');
    $('#applicationId')[0].value = localStorage.getItem('applicationId');
    save();
}

/// Save the settings.
function save() {
    let cekAPIAddress = $('#cekAPIAddress').val().toString();
    let userId = $('#userId').val().toString();
    let applicationId = $('#applicationId').val().toString();
    localStorage.setItem('cekAPIAddress', cekAPIAddress);
    localStorage.setItem('userId', userId);
    localStorage.setItem('applicationId', applicationId);
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
        }
    });
}

/// Send Launch Request
function sendLaunch() {
    $.ajax({
        url: "/sendLaunch",
        contentType: "application/json",
        type: "POST",
        success: function (body) {
            displayResult(body);
        },
        error: function (xhr, ajaxOptions, thrownError) {
        }
    });
}


/// Send SessionEnded Request
function sendSessionEnded() {
    $.ajax({
        url: "/sendSessionEnded",
        contentType: "application/json",
        type: "POST",
        success: function (body) {
            displayResult(body);
        },
        error: function (xhr, ajaxOptions, thrownError) {
        }
    });
}

/// Parse the result and display.
function displayResult(body) {
    let response = JSON.parse(body);
    // Parse speech elements.
    let speech = "";
    if (response.response.outputSpeech.values) {
        response.response.outputSpeech.values.forEach((value) => {
            speech += value.value + "\r\n";
        });
    }
    if (response.response.outputSpeech.brief) {
        speech += response.response.outputSpeech.brief.value;
    }
    if (response.response.outputSpeech.verbose) {
        response.response.outputSpeech.verbose.values.forEach((value) => {
            speech += value.value + "\r\n";
        });
    }
    $('#speech')[0].innerText = speech;
    $('#rawdata')[0].innerText = JSON.stringify(response, null, '  ');
}

onload();