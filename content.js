function UpdateInputElements() {
    
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.mfaCode) {
      const mfaCodeIn = message.mfaCode.replace(/\s/g, "");
      console.log("Content.js message.action: ", message.action, "message.mfaCode: ", mfaCodeIn);
      // QR code receved from popup.js
      const awsInput = document.getElementById('mfaCode');

      console.log("Content.js awsInput: ", awsInput);
  
      if (awsInput) {
        awsInput.value = mfaCodeIn; 
        const submitButton = document.getElementById('mfa_submit_button'); 
        if (submitButton) {
          submitButton.click(); 
        }
      }
    }
    });

    const textElements = document.querySelectorAll('span, p, label'); // Modify the selector as per your specific page structure
    const searchTerm = ['MFA code', 'Enter code'];

    textElements.forEach((textElement) => {
      const elementText = textElement.textContent.trim();
      if (searchTerm.some((term) => elementText.includes(term))) {
        console.log('Text found:', elementText);
      }
    });
    // Insert logic for each MFA code asking page
    // AWS case (when input field appears after clicking "Next" button)
    const nextButton = document.getElementById('signin_button'); // Replace 'next_button' with the appropriate ID of your "Next" button
    if (nextButton) {
      nextButton.addEventListener('click', function() {
          const awsInput = document.getElementById('mfaCode');
          console.log('content.js: AWS input field:', awsInput);
          if (awsInput) {
            chrome.runtime.sendMessage({ action: 'openPopup' });
            chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
              if (message.action === 'otherAction') {
                console.log('Message related with otherAction received');
              }
            });
          }
      }
      );
    }
}
UpdateInputElements();





