// popup.js - controla o popup da extensão
document.addEventListener('DOMContentLoaded', () => {
  const versionEl = document.getElementById('appVersion');

  // Preencher versão se houver runtime (quando estiver empacotado como extensão)
  try {
    const manifest = chrome.runtime.getManifest();
    if (manifest && manifest.version) versionEl.textContent = `v${manifest.version}`;
  } catch (e) {
    // fallback: manter texto já presente
  }

  // Configurações Gerais
  const hideKnowledgeBaseCheckbox = document.getElementById('hideKnowledgeBase');
  const saveGeneralSettingsBtn = document.getElementById('saveGeneralSettings');
  const generalSettingsStatus = document.getElementById('generalSettingsStatus');

  // Carregar valor salvo do checkbox
  try {
    chrome.storage.local.get([window.INVA_CONSTANTS.KB_FEATURED_ARTICLES_STORAGE_KEY], (result) => {
      const savedValue = result[window.INVA_CONSTANTS.KB_FEATURED_ARTICLES_STORAGE_KEY];
      console.log('Valor carregado do chrome.storage para switch_kb_featured_articles:', savedValue);
      if (savedValue !== undefined) {
        hideKnowledgeBaseCheckbox.checked = savedValue === true;
      }
    });
  } catch (e) {
    console.warn('chrome.storage não disponível:', e);
    // fallback para localStorage (não recomendado)
    const savedValue = localStorage.getItem(window.INVA_CONSTANTS.KB_FEATURED_ARTICLES_STORAGE_KEY);
    console.log('Fallback: Valor carregado do localStorage para switch_kb_featured_articles:', savedValue);
    if (savedValue !== null) {
      hideKnowledgeBaseCheckbox.checked = savedValue === 'true';
    }
  }

  // Adiciona listener para atualizar o estado do checkbox
  hideKnowledgeBaseCheckbox.addEventListener('change', async () => {
    const isChecked = hideKnowledgeBaseCheckbox.checked;
    console.log('Checkbox alterado:', isChecked);
  });

  saveGeneralSettingsBtn.addEventListener('click', async () => {
    const isChecked = hideKnowledgeBaseCheckbox.checked;
    try {
      const storageObj = {};
      storageObj[window.INVA_CONSTANTS.KB_FEATURED_ARTICLES_STORAGE_KEY] = isChecked;
      chrome.storage.local.set(storageObj, () => {
        if (chrome.runtime.lastError) {
          console.error('Erro ao salvar no chrome.storage:', chrome.runtime.lastError);
          generalSettingsStatus.textContent = 'Erro ao salvar!';
        } else {
          generalSettingsStatus.textContent = 'Salvo!';
          // Aplicar mudança na página ativa, se aplicável
          applyToActiveTab(isChecked);
        }
        generalSettingsStatus.hidden = false;
        setTimeout(() => (generalSettingsStatus.hidden = true), 2000);
      });
    } catch (e) {
      console.warn('chrome.storage não disponível, usando localStorage:', e);
      // fallback
      localStorage.setItem(window.INVA_CONSTANTS.KB_FEATURED_ARTICLES_STORAGE_KEY, isChecked.toString());
      generalSettingsStatus.textContent = 'Salvo localmente!';
      generalSettingsStatus.hidden = false;
      setTimeout(() => (generalSettingsStatus.hidden = true), 2000);
    }
  });

  // Função para aplicar a visibilidade na aba ativa
  async function applyToActiveTab(shouldHide) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) return;

      // Verifica se a URL da aba ativa termina com 'incident/create'
      const isIncidentCreatePage = tab.url && tab.url.endsWith('incident/create');

      // Envia uma mensagem para o content script
      chrome.tabs.sendMessage(tab.id, {
        action: 'toggleKnowledgeBase',
        hide: shouldHide
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('Não foi possível enviar mensagem para o content script:', chrome.runtime.lastError);
        } else {
          console.log('Mensagem enviada para o content script com sucesso.');
        }
      });
    } catch (e) {
      console.warn('Não foi possível aplicar na aba ativa:', e);
    }
  }

  // OpenRouter (placeholder - implementar se necessário)
  const saveOpenRouterConfigBtn = document.getElementById('saveOpenRouterConfig');
  const testOpenRouterConnectionBtn = document.getElementById('testOpenRouterConnection');
  const openrouterStatus = document.getElementById('openrouterStatus');

  if (saveOpenRouterConfigBtn) {
    saveOpenRouterConfigBtn.addEventListener('click', () => {
      // TODO: implementar salvamento da API key
      openrouterStatus.textContent = 'Funcionalidade não implementada';
      openrouterStatus.hidden = false;
      setTimeout(() => (openrouterStatus.hidden = true), 2000);
    });
  }

  if (testOpenRouterConnectionBtn) {
    testOpenRouterConnectionBtn.addEventListener('click', () => {
      // TODO: implementar teste de conexão
      openrouterStatus.textContent = 'Funcionalidade não implementada';
      openrouterStatus.hidden = false;
      setTimeout(() => (openrouterStatus.hidden = true), 2000);
    });
  }

  // Diagnóstico (placeholder)
  const debugEnabledCheckbox = document.getElementById('debugEnabled');
  const viewLogsBtn = document.getElementById('viewLogs');
  const clearLogsBtn = document.getElementById('clearLogs');
  const logsOutput = document.getElementById('logsOutput');

  if (viewLogsBtn) {
    viewLogsBtn.addEventListener('click', () => {
      // TODO: implementar visualização de logs
      logsOutput.textContent = 'Logs não disponíveis';
      logsOutput.hidden = false;
    });
  }

  if (clearLogsBtn) {
    clearLogsBtn.addEventListener('click', () => {
      // TODO: implementar limpeza de logs
      logsOutput.textContent = '';
      logsOutput.hidden = true;
    });
  }
});
