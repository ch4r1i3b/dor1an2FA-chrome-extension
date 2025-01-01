// This is the fixed content.js file 20250101

(() => {
  const totpKeywords = ["auth", "token", "code", "totp", "6-digit", "otp"];
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
      return (
          input.tagName === "INPUT" &&
          (input.type === "text" || input.type === "password") &&
          attributes.some((attr) =>
              totpKeywords.some((keyword) => attr && attr.toLowerCase().includes(keyword))
          ) &&
          input.maxLength === 6
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
  // CEB start autofill
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("Received message in content.js:", message);

      if (message.action === "otherAction" && message.mfaCode) {
          const mfaCode = message.mfaCode.replace(/\s/g, "");
          console.log("Attempting to autofill TOTP code:", mfaCode);

          const mfaField = document.getElementById("mfaCode") || // Prioritize exact ID match
              Array.from(document.querySelectorAll("input[type='text'], input[type='password']"))
                  .find(input => input.id === "mfaCode" || isLikelyTOTPField(input));

          if (mfaField) {
              console.log("Detected MFA input field:", mfaField);
              mfaField.value = mfaCode;

              const submitButton = document.getElementById("mfa_submit_button") || 
                  mfaField.closest("form")?.querySelector("[type='button']") ||
                  mfaField.nextElementSibling;

              if (submitButton) {
                  console.log("Clicking submit button:", submitButton);
                  submitButton.click();
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
  // CEB end autofill
})();
