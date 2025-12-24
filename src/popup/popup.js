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
    const savedValue = localStorage.getItem('switch_kb_featured_articles');
    if (savedValue !== null) {
      hideKnowledgeBaseCheckbox.checked = savedValue === 'true';
    }
  } catch (e) {
    // ignore
  }

  saveGeneralSettingsBtn.addEventListener('click', () => {
    const isChecked = hideKnowledgeBaseCheckbox.checked;
    try {
      localStorage.setItem('switch_kb_featured_articles', isChecked.toString());
      generalSettingsStatus.textContent = 'Salvo!';
      generalSettingsStatus.hidden = false;
      setTimeout(() => (generalSettingsStatus.hidden = true), 2000);
    } catch (e) {
      generalSettingsStatus.textContent = 'Erro ao salvar!';
      generalSettingsStatus.hidden = false;
      setTimeout(() => (generalSettingsStatus.hidden = true), 2000);
    }
  });

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
