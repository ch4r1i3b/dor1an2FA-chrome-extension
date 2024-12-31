
function UpdateInputElements() {
/*    
//no hace falta
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log("HOLA");
    if (message.mfaCode) {
      const mfaCodeIn = message.mfaCode.replace(/\s/g, "");
      console.log("Content.js message.action: ", message.action, "message.mfaCode: ", mfaCodeIn);
      // QR code receved from popup.js
      // Here we look for elements in the page where mfa code should be entered
      const mfaInput = document.getElementById('mfaCode');

      console.log("Content.js mfaInput: ", mfaInput);
  
      if (mfaInput) {
        mfaInput.value = mfaCodeIn; 
        const submitButton = document.getElementById('mfa_submit_button'); 
        if (submitButton) {
          submitButton.click(); 
        }
      }
    }
    });
*/

    
/*
//no hace falta

    const textElements = document.querySelectorAll('span, p, label, text, div, form'); // Modify the selector as per your specific page structure
    const searchTerm = ['MFA code', 'Enter code', 'app_otp', 'Enter code'];
//    console.log(textElements, searchTerm);
    textElements.forEach((textElement) => {
      console.log(textElement);
      const elementText = textElement.textContent.trim();
      if (searchTerm.some((term) => elementText.includes(term))) {
        console.log('Text found:::', elementText);
      }
    });
*/    
    // Insert logic for each MFA code asking page
    // AWS case (when input field appears after clicking "Next" button)
    const nextButton = document.getElementById('signin_button'); // Replace 'next_button' with the appropriate ID of your "Next" button
    console.log(nextButton);
    if (nextButton) {
      nextButton.addEventListener('click', function() {
          const mfaInput = document.getElementById('mfaCode');  // AWS
//          const mfaInput = document.getElementById('code_input'); // Nvidia
//          const mfaInput = document.getElementById('app_otp'); // Nvidia
          console.log('content.js file: found this MFA input field:', mfaInput);
          if (mfaInput) {
            chrome.runtime.sendMessage({ action: 'openPopup' });
            /*
            //no hace falta
            chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
              if (message.action === 'otherAction') {
                console.log('Message related with otherAction received');
              }
            });
            */
          }
      }
      );
    }
}
UpdateInputElements();





function UpdateInputElements() {
    const nextButton = document.getElementById('signin_button'); // Replace 'next_button' with the appropriate ID of your "Next" button
    console.log(nextButton);
    if (nextButton) {
      nextButton.addEventListener('click', function() {
          const mfaInput = document.getElementById('mfaCode');  // AWS
//          const mfaInput = document.getElementById('code_input'); // Nvidia
//          const mfaInput = document.getElementById('app_otp'); // Nvidia
          console.log('content.js file: found this MFA input field:', mfaInput);
          if (mfaInput) {
            chrome.runtime.sendMessage({ action: 'openPopup' });
          }
      }
      );
    }
}
UpdateInputElements();
