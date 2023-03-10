const uploadButton = document.getElementById('uploadButton');
const resumeInput = document.getElementById('resumeInput');
const autofillButton = document.getElementById('autofillButton'); 

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

uploadButton.addEventListener('click', () => {
  const file = resumeInput.files[0];
  const reader = new FileReader();
  
  reader.onload = () => {
    const data = reader.result;
    const parsedData = parseResume(data);
    saveData(parsedData);
    chrome.runtime.sendMessage({type: "success", reader: data, data: parsedData});
  };

  reader.readAsText(file);
//send message to background.js

});


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
