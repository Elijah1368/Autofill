chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ userData: {} });
    chrome.storage.local.set({ inputIDs: [] });

});
const handleSend = async (sendResponse, message, inputFields) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };
  
    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    return await processMessageToChatGPT(sendResponse, newMessage, inputFields);
  };
  
  async function processMessageToChatGPT(sendResponse, chatMessages, inputFields) { // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat
   
    const API_KEY = "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";
    const systemMessage = { //  Explain things like you're talking to a software professional with 5 years of experience.
      "role": "system", "content": "Given the input field IDs and resume data, please fill out the fields using the data from the resume. Return your answer as a JSON object with the keys being the input field IDs and the values being the values to fill in the input fields. For example, if the input field ID is 'firstName' and the value to fill in is 'John', then the JSON object should be { 'firstName': 'John' }"
    };
  
    let role = "";
  
    if (chatMessages.sender === "ChatGPT") {
      role = "assistant";
    } else {
      role = "user";
    }
  
    let apiMessages = { role: role, content: "Input: " + inputFields + "\n" + "Resume Data:" + chatMessages.message}
    
    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act. 
    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,  // The system message DEFINES the logic of our chatGPT
        apiMessages // The messages from our chat with ChatGPT
      ]
    }
  
    //sned message to background to display apiRequestBody
    console.log("api request body: " + JSON.stringify(apiRequestBody));
    return await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
        return data.json();
    }).then((data) => {
        console.log("successfully got api call " + data.choices[0].message.content);
        sendResponse(data.choices[0].message.content);
    }).catch((error) => {
        console.error("failedapi call " + error);
    });
  }
  
  
  async function sendFoo(sendResponse, userData, inputIDs) {
    const foo = await handleSend(sendResponse, userData, inputIDs);
  }
  

//on message with type success, display something on console
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "saveData") {
        chrome.storage.local.set({ userData: request.data });
        //get user data from storage
        chrome.storage.local.get(['userData'], function(result) {
            console.log('User Data stored: ' + JSON.stringify(result.userData));
        });
        return true;
    }

    if (request.type === "getSavedData") {
        chrome.storage.local.get(['userData'], function(result) {
            console.log("Got the saved data" + JSON.stringify(result.userData));
            sendResponse(result.userData);
        });
        return true;
    }

    if (request.type === "saveInputIDs") {
        chrome.storage.local.set({ inputIDs: request.data });

        chrome.storage.local.get(['inputIDs'], function(result) {
            console.log('Input IDS stored: ' + result.inputIDs);
            sendResponse(result.inputIDs);
        });

        return true;
    }

    if (request.type === "saveInput") {
        chrome.storage.local.set({ inputs: request.data });

        chrome.storage.local.get(['inputs'], function(result) {
            console.log('Input stored: ' + result.inputs);
            sendResponse(result.inputIDs);
        });

        return true;
    }

    if (request.type === "getInputFields") {
        chrome.storage.local.get(['inputIDs']).then((result) => {
            //return inputIDs
            console.log("Got the input fields " + result.inputIDs);
            sendResponse(result.inputIDs);

        });

        return true;
    }
    if (request.type === 'success input fields') {
        console.log("success got input fields " + JSON.stringify(request.data));
    }
    // if (request.type === "fetchApi") {
    //     chrome.storage.local.get(['userData'], function({ userData }) {
    //         chrome.storage.local.get(['inputIDs'], function({ inputIDs }) {
    //             console.log("fetching api..");

    //             let resolve = function ( chatGPTResponse )  {
    //                 console.log(chatGPTResponse);
    //                 console.log("successfully got api call " + chatGPTResponse.choices[0].message.content);
    //                 return chatGPTResponse;
    //             };

    //             let reject = function ( error )  {
    //                 console.log("failed to call openAI api " + error);
    //             };

    //             let a = async function(resolve, reject) {
    //                 let res = await sendResponse(userData,inputIDs);
    //                 resolve(res);
    //                 reject(res);
    //             };

    //             a(resolve, reject).then((result) => {
    //                 console.log("success " + result);
    //             }).catch((error) => {
    //                 console.log("error " + error);
    //             });
    //         })
    //     });
    // }

    if (request.type === "fetchAPI") {
        chrome.storage.local.get(['userData'], function({ userData }) {
            chrome.storage.local.get(['inputIDs'], function({ inputIDs }) {
                sendFoo(sendResponse, userData, inputIDs );
                return true;
            });
            return true;
        });

        return true;
    }

    if (request.type === "fillInForm") {
        chrome.storage.local.set({ apiData: request.data });
        console.log("filling in form ");

        chrome.storage.local.get(['inputs'], function(result) {
            fillInInputs(result.inputs, request.data);
        });
        return true;
    }

    if (request.type === 'success') {
        console.log("success " + request.data);
    }


    //received api request body
    if (request.type === 'api request body') {
        console.log("request body " + JSON.stringify(request.apiRequestBody));
    }



    if (request.type === 'success api call') {
        console.log("succesfully got api call ");
        console.log(JSON.stringify(request.data));
    }

    if (request.type === 'fail') {
        let requestErr = request.error;
        console.log("fail ");
        console.error(requestErr);

        if (requestErr !== undefined) {
            console.error(requestErr.stack);
        }
    }
    return true;
});


function fillInInputs(elements, jsonObj) {
    for (let key in jsonObj) {
      let inputElem = elements.get(key);
      if (inputElem) {
        inputElem.value = jsonObj[key];
      }
    }
  }