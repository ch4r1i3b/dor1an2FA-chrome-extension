
// This is content.js file 20241230
//
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
    const nextButton = document.getElementById('signin_button'); 
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


/*
// This is content.js file
//
const sites = [
  { hostname: "signin.aws.amazon.com", fieldName: "mfaCode" },
  { hostname: "example.com", fieldName: "auth_2fa" },
  // Add more entries as needed
];

// Check if the current site is in the list
function isSiteInList(url) {
  // CEB start: Added validation for invalid URLs
  try {
    const currentHostname = new URL(url).hostname; // Attempt to extract hostname
    return sites.find(site => site.hostname === currentHostname);
  } catch (e) {
    console.error("Invalid URL passed to isSiteInList:", url, e);
    return null; // Return null if URL is invalid
  }
  // CEB end
}

// Find the input field by name
function findFieldByName(fieldName) {
  return document.getElementsByName(fieldName)[0];
}

// Main function to update input elements and check site conditions
function UpdateInputElements() {
  // Listen for messages to autofill or process
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.mfaCode) {
      const mfaCodeIn = message.mfaCode.replace(/\s/g, "");
      console.log("Content.js message.action: ", message.action, "message.mfaCode: ", mfaCodeIn);

      const inputField = document.getElementById(message.fieldName);
      console.log("Content.js inputField: ", inputField);

      if (inputField) {
        inputField.value = mfaCodeIn;
        const submitButton = document.getElementById('mfa_submit_button');
        if (submitButton) {
          submitButton.click();
        }
      }
    }
  });

  // CEB start: Detect if the site matches and contains the field
  chrome.runtime.sendMessage({ action: "getCurrentTabUrl" }, function (response) {
    if (response && response.url) {
      const currentUrl = response.url;
      const matchingSite = isSiteInList(currentUrl);

      if (matchingSite) {
        const inputField = findFieldByName(matchingSite.fieldName);

        if (inputField) {
          console.log("Matched site and field. Triggering popup for:", currentUrl);
          chrome.runtime.sendMessage({ action: "openPopup" });
        }
      } else {
        console.log("No matching site or input field found for URL:", currentUrl);
      }
    } else {
      console.error("No URL returned from background.js");
    }
  });
  // CEB end
}

UpdateInputElements();
*/