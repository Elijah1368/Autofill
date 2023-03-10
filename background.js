chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ resumeData: {} });
});

//on message with type success, display something on console
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'success') {
        console.log("success");
        console.log(request.reader);
    }
});
