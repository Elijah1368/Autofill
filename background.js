chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ userData: {} });
    chrome.storage.local.set({ inputIDs: [] });
});

//on message with type success, display something on console
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {


    if (request.type === "saveData") {
        chrome.storage.local.set({ userData: request.data });
        //get user data from storage
        chrome.storage.local.get(['userData'], function(result) {
            console.log('User Data stored: ' + result.userData);
        });
    }

    if (request.type === "saveInputIDs") {
        chrome.storage.local.set({ inputIDs: request.data });

        
        chrome.storage.local.get(['inputIDs'], function(result) {
            console.log('Input IDS stored: ' + result.inputIDs);
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


