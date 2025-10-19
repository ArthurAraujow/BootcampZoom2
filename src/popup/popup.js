document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('zoomIn').addEventListener('click', () => adjustZoom(0.1));
  document.getElementById('zoomOut').addEventListener('click', () => adjustZoom(-0.1));
  document.getElementById('resetZoom').addEventListener('click', () => adjustZoom(0, true));
});

function adjustZoom(change, reset = false) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    chrome.tabs.getZoom(tabId, (currentZoom) => {
      const newZoom = reset ? 1 : currentZoom + change;
      chrome.tabs.setZoom(tabId, newZoom);
    });
  });
}