// js/setup.js

console.log('Entré a setup.js!');

// Ensure the DOM is fully loaded before accessing elements
document.addEventListener('DOMContentLoaded', function () {
  // Now you can safely access the 'setButton' element
  document.getElementById('setButton').addEventListener('click', function () {
    console.log('Hice clic!');
  });
});

// js/setup.js

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('setButton').addEventListener('click', function () {
    const data = {
      message: 'Hola desde setup.js!'
    };

    // Save data to local storage
    chrome.storage.local.set({ myData: data }, function () {
      console.log('Datos guardados en el local storage:', data);
    });
  });
});

