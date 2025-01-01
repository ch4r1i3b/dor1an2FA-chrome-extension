
// This is content.js 
//

// This is content.js file (this code send the right 6-digit but not submit)
//
function UpdateInputElements() {
  const totpKeywords = ["auth", "token", "code", "totp", "6-digit", "otp"];

  // Helper function to determine if an input field matches the criteria
  const isLikelyTOTPField = (input) => {
      const attributes = [
          input.name,
          input.placeholder,
          input.getAttribute("aria-label"),
          input.id,
          input.className,
      ];
      return (
          input.tagName === "INPUT" &&
          (input.type === "text" || input.type === "password") &&
          input.maxLength === 6 && // Most TOTP codes are 6 digits
          (input.getAttribute("autocomplete") === "one-time-code" || // Prioritize OTP-specific attributes
              attributes.some((attr) =>
                  totpKeywords.some((keyword) => attr && attr.toLowerCase().includes(keyword))
              ))
      );
  };

  // CEB start autofill
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("Received message in content.js:", message);

      if (message.action === 'otherAction' && message.mfaCode) {
          const mfaCodeIn = message.mfaCode.replace(/\s/g, "");
          console.log("Attempting to autofill MFA Code:", mfaCodeIn);

          // Find the matching input field for TOTP
          const mfaInput = Array.from(document.querySelectorAll("input[type='text'], input[type='password']"))
              .filter((input) => isLikelyTOTPField(input))
              .find((input) => input.id === "mfaCode"); // Prioritize by exact ID match
          
          if (mfaInput) {
              console.log("Detected MFA input field:", mfaInput);
              mfaInput.value = mfaCodeIn; // Autofill the field

              const submitButton = mfaInput.closest("form")?.querySelector("[type='submit']");
              if (submitButton) {
                  console.log("Clicking submit button.");
                  submitButton.click(); // Simulate form submission
              }
              sendResponse({ success: true });
          } else {
              console.error("No valid MFA input field found.");
              sendResponse({ success: false });
          }
      } else {
          console.warn("Message action not recognized or missing mfaCode.");
          sendResponse({ success: false });
      }
  });
  // CEB end autofill

  // Observer to detect when the desired input field becomes visible
  const handleIntersect = (entries, observer) => {
      entries.forEach((entry) => {
          if (entry.isIntersecting) {
              console.log("Detected TOTP input field:", entry.target);

              chrome.runtime.sendMessage({ action: "openPopup" });
              observer.disconnect(); // Stop observing once the field is detected
          }
      });
  };

  const observer = new IntersectionObserver(handleIntersect, { threshold: 0.1 });

  // Attach observer to all input fields
  document.querySelectorAll("input").forEach((input) => {
      if (isLikelyTOTPField(input)) {
          console.log("Observing potential TOTP field:", input);
          observer.observe(input);
      }
  });
}

// Initialize the script
UpdateInputElements();





/*
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
    //
    // THIS IS ONLY!!!!! FOR AWS!!!!!
    //

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
*/


/*

// This is content.js file for multiple pages
// // This is content.js file (this code submit)
(() => {
  const totpKeywords = ["auth", "token", "code", "totp", "6-digit", "otp"];
  let popupTriggered = false; // Prevent duplicate popups

  // Helper function to determine if an input field matches TOTP criteria
  const isLikelyTOTPField = (input) => {
    const attributes = [
      input.name,
      input.placeholder,
      input.getAttribute("aria-label"),
      input.id,
      input.className,
    ];
    return (
      input.tagName === "INPUT" &&
      (input.type === "text" || input.type === "password") &&
      attributes.some((attr) =>
        totpKeywords.some((keyword) => attr && attr.toLowerCase().includes(keyword))
      ) &&
      input.maxLength === 6 // Most TOTP codes are 6 digits
    );
  };

  // Intersection Observer to detect visible TOTP fields
  const handleIntersect = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !popupTriggered) {
        popupTriggered = true; // Mark as triggered
        console.log("Detected TOTP input field:", entry.target);

        chrome.runtime.sendMessage(
          { action: "openPopup" },
          (response) => {
            if (response && response.success) {
              console.log("Popup triggered successfully.");
            } else {
              console.error("Failed to trigger popup.");
              popupTriggered = false; // Allow retries if popup fails
            }
          }
        );
        observer.unobserve(entry.target); // Cleanup observer for this field
      }
    });
  };

  const observer = new IntersectionObserver(handleIntersect, { threshold: 0.1 });

  // Attach observer to all input fields
  document.querySelectorAll("input").forEach((input) => {
    if (isLikelyTOTPField(input)) {
      console.log("Observing potential TOTP field:", input);
      observer.observe(input);
    }
  });

  // Listener for autofilling TOTP codes
  // CEB start submit
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received message in content.js:", message);

    if (message.action === "otherAction" && message.mfaCode) {
        const mfaCode = message.mfaCode.replace(/\s/g, "");
        console.log("Attempting to autofill TOTP code:", mfaCode);

        const mfaField = Array.from(document.querySelectorAll("input[type='text'], input[type='password']"))
            .find(input => input.id === "mfaCode" || isLikelyTOTPField(input));

        if (mfaField) {
            console.log("Detected MFA input field:", mfaField);
            mfaField.value = mfaCode; // Autofill the field

            // Debug: Log possible submit buttons
            const possibleSubmitButtons = [
                document.querySelector("#mfa_submit_button"),
                mfaField.closest("form")?.querySelector("[type='button']"),
                mfaField.nextElementSibling,
            ];
            console.log("Possible submit buttons:", possibleSubmitButtons);

            const submitButton = possibleSubmitButtons.find(button => button !== null);
            if (submitButton) {
                console.log("Clicking submit button:", submitButton);
                submitButton.click(); // Simulate button click
            } else {
                console.log("No submit button found, simulating Enter keypress.");
                const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
                mfaField.dispatchEvent(event);
            }
            sendResponse({ success: true });
        } else {
            console.error("No valid MFA input field found.");
            sendResponse({ success: false });
        }
    } else {
        console.log("Message action not handled or missing mfaCode:", message);
    }
  });
  // CEB end submit

})();


*/



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