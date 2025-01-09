
(() => {
  const totpKeywords = ["auth", "token", "code", "totp", "6-digit", "otp"];
  const submitKeywords = ["submit", "verify", "confirm", "continue", "log in", "sign in"]; // Keywords for submit buttons
  let popupTriggered = false;

  // Helper function to determine if an input field matches TOTP criteria
  const isLikelyTOTPField = (input) => {
    const attributes = [
        input.name,
        input.placeholder,
        input.getAttribute("aria-label"),
        input.id,
        input.className,
    ];
    const regex = /\b6[-\s]?digit\b/i; // Matches "6-digit", "6 digit", or similar variations

    const matchesRegexOrKeywords = attributes.some((attr) =>
        attr && (regex.test(attr) || totpKeywords.some((keyword) => attr.toLowerCase().includes(keyword)))
    );

    console.log("Inspecting input field:", input);
    console.log("Attributes checked:", attributes);
    console.log("Matches regex or keywords:", matchesRegexOrKeywords);
    console.log("Max length is 6:", input.maxLength === 6);

    return (
        input.tagName === "INPUT" &&
        (input.type === "text" || input.type === "password") &&
        matchesRegexOrKeywords &&
        input.maxLength === 6
    );
  };


  // CEB start changes
  const findInputField = () => {
      const eligibleFields = Array.from(document.querySelectorAll("input[type='text'], input[type='password']"))
          .filter(input => isLikelyTOTPField(input) && !input.id.includes("candidate"));

      if (eligibleFields.length > 0) {
          console.log("Eligible MFA input fields:", eligibleFields);
          return eligibleFields[0];
      }

      console.log("No eligible MFA input fields found.");
      return null;
  };

  const findSubmitButton = (inputField) => {
      const possibleButtons = Array.from(document.querySelectorAll("button, input[type='button'], input[type='submit']"))
          .filter(button => !button.id.includes("candidate"));

      const exactButton = possibleButtons.find(button => button.id === "mfa_submit_button");
      if (exactButton) {
          console.log("Exact match for submit button found:", exactButton);
          return exactButton;
      }

      const fallbackButton = possibleButtons.find(button => 
          inputField.closest("form")?.contains(button) ||
          submitKeywords.some(keyword => button.innerText?.toLowerCase().includes(keyword))
      );

      console.log("Fallback match for submit button:", fallbackButton);
      return fallbackButton || null;
  };
  // CEB end changes

  // Intersection Observer to detect visible TOTP fields
  const handleIntersect = (entries, observer) => {
      entries.forEach((entry) => {
          if (entry.isIntersecting && !popupTriggered) {
              popupTriggered = true;
              console.log("Detected TOTP input field:", entry.target);

              chrome.runtime.sendMessage(
                  { action: "openPopup" },
                  (response) => {
                      if (response && response.success) {
                          console.log("Popup triggered successfully.");
                      } else {
                          console.error("Failed to trigger popup.");
                          popupTriggered = false;
                      }
                  }
              );
              observer.unobserve(entry.target);
          }
      });
  };

  const observer = new IntersectionObserver(handleIntersect, { threshold: 0.1 });

  document.querySelectorAll("input").forEach((input) => {
      if (isLikelyTOTPField(input)) {
          console.log("Observing potential TOTP field:", input);
          observer.observe(input);
      }
  });

  // Listener for autofilling TOTP codes
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("Received message in content.js:", message);

      if (message.action === "otherAction" && message.mfaCode) {
          const mfaCode = message.mfaCode.replace(/\s/g, "");
          console.log("Attempting to autofill TOTP code:", mfaCode);

          const mfaField = findInputField();
          if (mfaField) {
              console.log("Using MFA input field:", mfaField);
              mfaField.value = mfaCode;

              const submitButton = findSubmitButton(mfaField);
              if (submitButton) {
                  console.log("Clicking submit button:", submitButton);
                  submitButton.click();
              } else {
                  console.log("No valid submit button found, simulating Enter keypress.");
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
})();

