chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ userData: {} });
    chrome.storage.local.set({ inputIDs: [] });
});

//on message with type success, display something on console
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.type === "saveData") {
        chrome.storage.local.set({ userData: request.data });
        //get user data from storage
        chrome.storage.local.get(['userData'], function(result) {
            console.log('User Data stored: ' + result.userData);
        });
    }

    if (request.type === "getSavedData") {
        chrome.storage.local.get(['userData'], function(result) {
            console.log("Got the saved data");
            sendResponse(result.userData);
        });
    }

    if (request.type === "saveInputIDs") {
        chrome.storage.local.set({ inputIDs: request.data });
        chrome.storage.local.get(['inputIDs'], function(result) {
            console.log('Input IDS stored: ' + result.inputIDs);
            sendResponse(result.inputIDs);
        });
    }
    
    if (request.type === "fetchApi") {
        chrome.storage.local.get(['userData'], function({ userData }) {
            chrome.storage.local.get(['inputIDs'], function({ inputIDs }) {
                console.log("fetching api..");

                let resolve = function ( chatGPTResponse )  {
                    console.log(chatGPTResponse);
                    console.log("successfully got api call " + chatGPTResponse.choices[0].message.content);
                    return chatGPTResponse;
                };

                let reject = function ( error )  {
                    console.log("failed to call openAI api " + error);
                };

                let a = async function(resolve, reject) {
                    let res = await sendResponse(userData,inputIDs);
                    resolve(res);
                    reject(res);
                };

                a(resolve, reject).then((result) => {
                    console.log("success " + result);
                }).catch((error) => {
                    console.log("error " + error);
                });
            })
        });
    }
    if (request.type === "getInputFields") {
        chrome.storage.local.get(['inputIDs']).then((result) => {
            //return inputIDs
            console.log("Got the input fields " + result.inputIDs);
            sendResponse(result.inputIDs);
        });
    }

    if (request.type === 'success') {
        console.log("success " + request.data);
    }

    if (request.type === 'fail') {
        let requestErr = request.error;
        console.log("fail ");
        console.error(requestErr);

        if (requestErr !== undefined) {
            console.error(requestErr.stack);
        }
    }
});


