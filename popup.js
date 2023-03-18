const uploadButton = document.getElementById('uploadButton');
const resumeInput = document.getElementById('resumeInput');
const autofillButton = document.getElementById('autofillButton'); 
const API_KEY = "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";
const systemMessage = { //  Explain things like you're talking to a software professional with 5 years of experience.
  "role": "system", "content": "Given the input field IDs and resume data, please fill out the fields using the data from the resume. Return your answer as a JSON object with the keys being the input field IDs and the values being the values to fill in the input fields. For example, if the input field ID is 'firstName' and the value to fill in is 'John', then the JSON object should be { 'firstName': 'John' }"
}

async function getPdfText(data) {
  let doc = await pdfjsLib.getDocument({data}).promise;
  let pageTexts = Array.from({length: doc.numPages}, async (v,i) => {
      return (await (await doc.getPage(i+1)).getTextContent()).items.map(token => token.str).join('');
  });
  return (await Promise.all(pageTexts)).join('');
}

async function autofillForm() {
  chrome.runtime.sendMessage({type: "fetchApi"}, (userData, inputFields) => {
        handleSend(userData, inputFields);
  }).catch((error) => {
    chrome.runtime.sendMessage({type: "fail", error: "failed to get input fields api " + error})
  });
};

async function getInputFields() {
    chrome.runtime.sendMessage(
      {type: "getInputFields"},
      (inputFields) => {
          chrome.runtime.sendMessage({type: "success", data: "testing this baatchh" + inputFields})

        return inputFields;
      }
    );
}

//using PDF.js to parse pdf file into a string
async function readFileAsText(file) {
  const doc = await pdfjs.getDocument(src).promise // note the use of the property promise
  const page = await doc.getPage(1);
  return await page.getTextContent();
}

async function getItems(src) {
  const content = await getContent(src);
  const items = content.items.map((item) => item.str);
  return items;
}

/*
TODO: check if page changed from last time or if user data changed last time, if not then no need to parse data or no need to send chat gpt
*/
autofillButton.addEventListener('click', () => {
  //send message to content.js to parse input fields
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: 'parseInputIDs' },
      (inputIDs) => {
        if (typeof inputIDs === 'undefined') {
          // send message to background.js failed
          chrome.runtime.sendMessage({type: "fail", error: "failed to parse input IDs " + inputIDs})
          return;
        }
        
        autofillForm();
      }
    );
  });

});

//upload resume
uploadButton.addEventListener('click', () => {

  const file = resumeInput.files[0];
  const fileReader = new FileReader();

  fileReader.onload = (event) => {
    const fileData = new Uint8Array(event.target.result);
    getPdfText(fileData).then((userData) => {
      chrome.runtime.sendMessage({type: "saveData", userData});
    }).catch((error) => {
        chrome.runtime.sendMessage({type: "fail", error: "failed to upload file " + error});
    });
  };

  fileReader.readAsArrayBuffer(file);
});

const handleSend = async (message, inputFields) => {
  const newMessage = {
    message,
    direction: 'outgoing',
    sender: "user"
  };

  chrome.runtime.sendMessage({type: "success", data: "did you even hit handle send"})
  // Initial system message to determine ChatGPT functionality
  // How it responds, how it talks, etc.
  return await processMessageToChatGPT(newMessage, inputFields);
};

async function processMessageToChatGPT(chatMessages, inputFields) { // messages is an array of messages
  // Format messages for chatGPT API
  // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
  // So we need to reformat
 
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
  console.log(JSON.stringify(apiRequestBody));
  return await fetch("https://api.openai.com/v1/chat/completions", 
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(apiRequestBody)
  }).then((data) => {
    chrome.runtime.sendMessage({type: "success", data: "wtf is this " + data})
    return { data };
  }).catch((error) => {
    chrome.runtime.sendMessage({type: "fail", error: "failed to call openAI api " + error});
  });
}
