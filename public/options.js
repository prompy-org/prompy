/* eslint-disable no-undef */
document.addEventListener('DOMContentLoaded', () => {
  // Load saved options
  chrome.storage.sync.get({
    apiUrl: 'https://api.prompy.org/api',
    theme: 'system',
    syncFrequency: 15
  }, (items) => {
    document.getElementById('api-url').value = items.apiUrl;
    document.getElementById('theme').value = items.theme;
    document.getElementById('sync-frequency').value = items.syncFrequency;
  });

  // Save options
  document.getElementById('save-options').addEventListener('click', () => {
    const apiUrl = document.getElementById('api-url').value;
    const theme = document.getElementById('theme').value;
    const syncFrequency = parseInt(document.getElementById('sync-frequency').value, 10);

    chrome.storage.sync.set({
      apiUrl,
      theme,
      syncFrequency
    }, () => {
      // Show saved message
      const status = document.createElement('div');
      status.textContent = 'Options saved!';
      status.style.color = 'green';
      status.style.marginTop = '10px';
      document.body.appendChild(status);
      
      setTimeout(() => {
        status.remove();
      }, 2000);
    });
  });
});
