import QrScanner from "./libs/qr-scanner/qr-scanner.min.js";

class PopupPage {
    constructor() {
        this.lstResult = document.querySelector(".list-result");
        this.btnVideo = document.querySelector(".btn-camera");
    }
    async initialize() {
        QrScanner.WORKER_PATH = "./libs/qr-scanner/qr-scanner-worker.min.js";
        const hasCamera = await QrScanner.hasCamera();
        if (hasCamera) {
            this.btnVideo.disabled = false;
            this.btnVideo.addEventListener("click", () => this.onVideoButtonClick());
// CEB: start the camera
            this.btnVideo.click();
        }
        document.body.loc(); // get rid???
    }

    async onVideoButtonClick() {
        if (this.currScanner) {
            this.currScanner.stop();
            this.currScanner = null;
            this.btnVideo.classList.add("btn-success");
            this.btnVideo.classList.remove("btn-danger");
        }
        else {
            try {
                const permission = await navigator.mediaDevices.getUserMedia({
                    video: true,
                });
                const video = document.querySelector(".video-preview");
                video.exclusiveDisplay();

                const scanner = this.currScanner = new QrScanner(video, result => {
                    this.processResult(result, true);
                });
                scanner.start();
                this.btnVideo.classList.add("btn-danger");
                this.btnVideo.classList.remove("btn-success");
            }
            catch (e) {
                if (e.name == "NotAllowedError") {
                    chrome.tabs.create({
                        url: "/permission.html",
                    });
                    return;
                }
                console.error(e);
                try {
                    this.currScanner.stop();
                }
                catch (e) {
                    console.error(e);
                }
                this.currScanner = null;
                this.btnVideo.classList.add("btn-success");
                this.btnVideo.classList.remove("btn-danger");
            }
        }
    }

    processResult(result, removeDuplicate) {
        let prefix = result.substring(0, result.indexOf(';'));
        result = result.substring(result.indexOf(';') + 1); // here I have the QR code

        if (prefix == "msg") {
            alert("ALERT\n\nThe site you are trying\nto log in is not registeredd.\n\nIt could be a \nPHISHING attack.");
            window.close();
        } else {


            // Send mfaCode
            chrome.runtime.sendMessage({ mfaCode: result });

            console.log('not phishing!!!');
            console.log('closing the window');
            setTimeout(function () {
                open(location, '_self').close();
                console.log('window closed');

                chrome.tabs.query(
                    { currentWindow: true, active: true },
                    function (tabs) {
                        console.log("Sending otherAction message to tab id:", tabs[0].id, "code: ", result);
                      // Send message to the content script
                      chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        function: function () {
                          console.log("otherAction message sent to the content script");
                          chrome.runtime.sendMessage({ 
                            action: 'otherAction',
                            updateMfaCode: result
                        });
                        },
                      });
                    }
                );
            }, 10); // Wait 10 seconds before closing window
        }
    }

}

// PopupPage with the real time camera video 
//
new PopupPage().initialize();

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const tab = tabs[0];
  const backgroundPage = chrome.extension.getBackgroundPage();
  const originatingTabUrl = backgroundPage.originatingTabUrl;
  chrome.storage.sync.get('size', function (data) {
    var size = 200;
    if (data.size) {
      size = data.size;
    }
    if (/^http(s)?:\/\//i.test(originatingTabUrl)) {
      // Extract hostname from the URL
      const url = new URL(originatingTabUrl);
      const hostname = url.hostname;

      $('#qr_code').empty().qrcode({ width: size, height: size, text: hostname });
      $('#url').width(size).text(hostname);
      $('#not_available').hide();
      $('#qr_code canvas').click(function () {
        chrome.tabs.create({
          url: qrBase64(hostname, { width: size, height: size })
        });
      });

      if (typeof _gaq !== 'undefined') {
        _gaq.push(['_trackEvent', 'Top', hostname]);
      }
    } else {
      $('#qr_code').hide();
      $('#url').hide();
      $('#not_available').show();
      console.log('not_av');
    }
  });
});
