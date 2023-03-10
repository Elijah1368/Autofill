chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
  