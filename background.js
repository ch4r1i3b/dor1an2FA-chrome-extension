let hostname; // Declares the variable hostname out of the event chrome.tabs.onUpdated

// Defines the message listener
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'openPopup') {
    console.log("background.js message.action: ",message.action , " message.mfaCode ", message.mfaCode);
    // Opens popup.html when necessary
    chrome.extension.getBackgroundPage().originatingTabUrl = hostname;
    chrome.windows.create({
      url: 'popup.html',
      type: 'popup',
      focused: true,
      width: 210,
      height: 500,
      top: 0,
      left: (screen.width/2) - (210/2),
    });
  } else if (message.mfaCode) {
    // Send the QR code to the content script
    console.log("Estoy en background.js, recibí el código: ", message.mfaCode);
    console.log("Hostname: ",hostname);

    if (hostname) { // Verifies if the hostname is defined
      chrome.tabs.query({ active: true, currentWindow: false }, function (tabs) {
        if (tabs && tabs.length > 0) { // Verifica si se encontraron pestañas
          const tab = tabs[0];
          chrome.tabs.sendMessage(tab.id, { action: 'otherAction', mfaCode: message.mfaCode });
        }
      });
    }
    
  }
});

// Defines the event chrome.tabs.onUpdated
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    const currentUrl = tab.url;
    const hostnameurl = new URL(currentUrl);
    hostname = hostnameurl.origin; // Asigns hostname value
    //console.log(currentUrl);
  }
});





