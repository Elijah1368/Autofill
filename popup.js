const uploadButton = document.getElementById('uploadButton');
const resumeInput = document.getElementById('resumeInput');
const autofillButton = document.getElementById('autofillButton'); 

async function getPdfText(data) {
  let doc = await pdfjsLib.getDocument({data}).promise;
  let pageTexts = Array.from({length: doc.numPages}, async (v,i) => {
      return (await (await doc.getPage(i+1)).getTextContent()).items.map(token => token.str).join('');
  });
  return (await Promise.all(pageTexts)).join('');
}

async function autofillForm(tabId) {
  // var inputFields = await getInputFields();
  // var userData = await getSavedData();
  // var data = await handleSend(userData, inputFields);
  // chrome.runtime.sendMessage({type: "success api call", data});
  chrome.runtime.sendMessage({
    type: "fetchAPI"
  },
  (data) => {
    chrome.runtime.sendMessage({type: "fillInForm", data, tabId})
  });
};

async function getSavedData() {
  return await chrome.runtime.sendMessage(
    {type: "getSavedData"},
    (userData) => {
      return userData;
    }
  );
}

async function getInputFields() {
  return await chrome.runtime.sendMessage(
      {type: "getInputFields"},
      (data) => {
        chrome.runtime.sendMessage({type: "success input fields", data})
        return data.inputIDs;
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
        
        autofillForm(tabs[0].id);
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
    getPdfText(fileData).then((data) => {
      chrome.runtime.sendMessage({type: "saveData", data});
    }).catch((error) => {
        chrome.runtime.sendMessage({type: "fail", error: "failed to upload file " + error});
    });
  };

  fileReader.readAsArrayBuffer(file);
});