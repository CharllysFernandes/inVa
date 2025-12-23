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
  const saveCreateTicketUrlBtn = document.getElementById('saveCreateTicketUrl');
  const createTicketUrlInput = document.getElementById('createTicketUrl');
  const saveStatus = document.getElementById('saveStatus');

  // Carregar valor salvo
  try {
    chrome.storage.local.get(['createTicketUrl'], (res) => {
      if (res && res.createTicketUrl) createTicketUrlInput.value = res.createTicketUrl;
    });
  } catch (e) {
    // não está em contexto de extensão
    const localUrl = localStorage.getItem('createTicketUrl');
    if (localUrl) createTicketUrlInput.value = localUrl;
  }

  saveCreateTicketUrlBtn.addEventListener('click', () => {
    const url = createTicketUrlInput.value?.trim() || '';
    if (!url) {
      saveStatus.textContent = 'Por favor digite uma URL válida.';
      saveStatus.hidden = false;
      return;
    }
    // Salvar no localStorage
    localStorage.setItem('createTicketUrl', url);
    // Salvar no chrome.storage.local
    try {
      chrome.storage.local.set({ createTicketUrl: url }, () => {
        saveStatus.textContent = 'Salvo!';
        saveStatus.hidden = false;
        setTimeout(() => (saveStatus.hidden = true), 2000);
      });
    } catch (e) {
      saveStatus.textContent = 'Salvo localmente!';
      saveStatus.hidden = false;
      setTimeout(() => (saveStatus.hidden = true), 2000);
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
