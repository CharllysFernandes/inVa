// popup.js - controla o popup da extensão
document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('saveBtn');
  const flowUrl = document.getElementById('flowUrl');
  const status = document.getElementById('status');
  const versionEl = document.getElementById('version');

  // Preencher versão se houver runtime (quando estiver empacotado como extensão)
  try {
    const manifest = chrome.runtime.getManifest();
    if (manifest && manifest.version) versionEl.textContent = `v${manifest.version}`;
  } catch (e) {
    // fallback: manter texto já presente
  }

  // Carregar valor salvo
  try {
    chrome.storage.local.get(['flowUrl'], (res) => {
      if (res && res.flowUrl) flowUrl.value = res.flowUrl;
    });
  } catch (e) {
    // não está em contexto de extensão
  }

  saveBtn.addEventListener('click', () => {
    const url = flowUrl.value?.trim() || '';
    if (!url) {
      status.textContent = 'Por favor digite uma URL válida.';
      return;
    }

    try {
      chrome.storage.local.set({ flowUrl: url }, () => {
        status.textContent = 'URL salva';
        setTimeout(() => (status.textContent = ''), 2000);
      });
    } catch (e) {
      status.textContent = 'Não foi possível salvar (modo não-extensão).';
    }
  });
});
document.getElementById('actionBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      alert('Extensão funcionando!');
    }
  });
  
  document.getElementById('result').textContent = 'Ação executada!';
});

document.getElementById('settingsBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('popup/popup.html') });
});
