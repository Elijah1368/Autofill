const uploadButton = document.getElementById('uploadButton');
const resumeInput = document.getElementById('resumeInput');
const autofillButton = document.getElementById('autofillButton'); 
const API_KEY = "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";

var pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

// "Explain things like you would to a 10 year old learning how to code."
const systemMessage = { //  Explain things like you're talking to a software professional with 5 years of experience.
  "role": "system", "content": "Given the input fields and resume data, please fill out the fields using the data from the resume."
}

function autofillForm() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: 'fillForm' },
        (response) => {
            if (typeof response === 'undefined') {
                console.log('Response is undefined');
                return;
              }
          if (response.success) {
            console.log('Form autofilled successfully');
          }
        }
      );
    });
  }

const getInputFields = () => {
  return "first name, Last name, Email, Address, Work experience";
}

//using PDF.js to parse pdf file into a string
async function readFileAsText(file) {
  const doc = await pdfjs.getDocument(src).promise // note the use of the property promise
  const page = await doc.getPage(1);
  const textContent = await page.getTextContent();
  return textContent.items.map((item) => item.str);
}


//save resume data to local storage
function saveData(data) {
  chrome.storage.local.set({ resumeData: data });
}

//upload resume
uploadButton.addEventListener('click', () => {

  const file = resumeInput.files[0];
  const reader = new FileReader();

  readFileAsText(file).then((data) => {
    chrome.runtime.sendMessage({type: "success", data});
    handleSend(data);
  }).catch((error) => {
    chrome.runtime.sendMessage({type: "fail", error});
  });

});

const handleSend = async (message) => {
  
  const newMessage = {
    message,
    direction: 'outgoing',
    sender: "user"
  };

  
  // Initial system message to determine ChatGPT functionality
  // How it responds, how it talks, etc.
  await processMessageToChatGPT(newMessage);
};

async function processMessageToChatGPT(chatMessages) { // messages is an array of messages
  // Format messages for chatGPT API
  // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
  // So we need to reformat
 
  let role = "";

  if (chatMessages.sender === "ChatGPT") {
    role = "assistant";
  } else {
    role = "user";
  }

  let apiMessages = { role: role, content: "Input: " + getInputFields() + "\n" + "Resume Data:" + chatMessages.message}

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

  await fetch("https://api.openai.com/v1/chat/completions", 
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
    chrome.runtime.sendMessage({type: "success", data});
    setMessages([...chatMessages, {
      message: data.choices[0].message.content,
      sender: "ChatGPT"
    }]);
    setIsTyping(false);
  });
}
autofillButton.addEventListener('click', () => {
  autofillForm();
});

  
function saveData(data) {
    chrome.storage.local.set({ resumeData: data });
}

function parseResume(data) {
    const nameRegex = /(\b[A-Z][a-z]+)\s+(\b[A-Z][a-z]+)/;
    const match = nameRegex.exec(data);
  
    if (match) {
      return {
        firstName: match[1],
        lastName: match[2]
      };
    } else {
      return null;
    }
} 
