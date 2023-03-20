chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'parseInputIDs') {
      // Find all input elements on the current page
      const inputElements = document.getElementsByTagName('input');
      const inputIDs = [];
      const inputs=new Map();
      // Loop through each input element and add its ID to the inputIDs array
      for (let i = 0; i < inputElements.length; i++) {
        if (inputElements[i].id) {
          inputIDs.push(inputElements[i].id);
          inputs.set(inputElements[i].id, inputElements[i]);
        }
      }
      // Send a message to the background script with the inputIDs array
      chrome.runtime.sendMessage({type: 'saveInputIDs', data: inputIDs}, (data) => { sendResponse(data) });
      chrome.runtime.sendMessage({type: 'saveInput', data: inputs}, (data) => { sendResponse(data) });
      return true;
    };
      
    if (request.type === 'fillInForm') {
      chrome.runtime.sendMessage({type: 'success ', data: "hitting contentjs"});
      fillInInputs(request.data);
      return true;
    }
    
  });
  
  function fillInInputs(jsonObj) {
    for (let key in jsonObj) {
      let inputElem = document.querySelector(`input[name=${key}]`);
      if (inputElem) {
        inputElem.value = jsonObj[key];
      }
    }
  }