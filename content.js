chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'parseInputIDs') {
      // Find all input elements on the current page
   
      const inputElements = document.getElementsByTagName('input');
      const inputIDs = [];

      // Loop through each input element and add its ID to the inputIDs array
      for (let i = 0; i < inputElements.length; i++) {
        if (inputElements[i].id) {
          inputIDs.push(inputElements[i].id);
        }
      }

      // Send a message to the background script with the inputIDs array
      chrome.runtime.sendMessage({type: 'saveInputIDs', data: inputIDs}, (data) => { sendResponse(data) });

    };
  
  
    if (request.type === 'fillForm') {
      chrome.storage.local.get(['resumeData'], (result) => {
        const data = result.resumeData;
        const inputs = document.getElementsByTagName('input');
        const randomWord = () => {
          return Math.random().toString(36).substring(2, 7);
        };
  
        for (let i = 0; i < inputs.length; i++) {
          const input = inputs[i];
          const { name } = input;
          let value;
  
          if (name in data) {
            value = data[name];
          } else {
            switch (name) {
              case 'firstName':
                value = data.firstName || randomWord();
                break;
              case 'lastName':
                value = data.lastName || randomWord();
                break;
              case 'email':
                value = data.email || `${randomWord()}@example.com`;
                break;
              case 'phone':
                value = data.phone || `${Math.floor(Math.random() * 9000000000) + 1000000000}`;
                break;
              default:
                value = randomWord();
            }
          }
  
          input.value = value;
        }
  
        sendResponse({ success: true });
      });
    }
  
    return true;
  });
  