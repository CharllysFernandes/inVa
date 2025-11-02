# 🔍 Debug: Problema na API OpenRouter

## 📊 Logs Adicionados

Adicionei logs detalhados para rastrear exatamente onde o erro está ocorrendo:

### No Content Script (`openrouter-api.ts`)

```
[OPENROUTER] Sending chat completion request via background
[OPENROUTER] Calling chrome.runtime.sendMessage
[OPENROUTER] Received response from background
```

### No Background Script (`background.ts`)

```
[BACKGROUND] Message received
[BACKGROUND] Processing OpenRouter chat completion
[BACKGROUND] Making request to OpenRouter
[BACKGROUND] OpenRouter response received
[BACKGROUND] OpenRouter request successful
```

---

## 🧪 Como Testar Agora

### 1. Recarregar a Extensão

```
Chrome → Extensões → inVa → Recarregar (botão de refresh)
```

### 2. Abrir DevTools do Background

```
Chrome → Extensões → inVa → "service worker" (link azul)
```

Isso abre o console do background script onde veremos os logs do fetch.

### 3. Abrir DevTools da Página

```
F12 na página do InvGate
```

### 4. Testar a Feature

1. Digitar no campo de texto
2. Aguardar 1.5 segundos
3. **Observar os logs**

---

## 🔍 Cenários de Erro

### Cenário 1: Background não recebe mensagem

**Logs esperados:**

```
[OPENROUTER] Sending chat completion request via background
[OPENROUTER] Calling chrome.runtime.sendMessage
[OPENROUTER] No response from background script ❌
```

**Causa:** Service worker não está ativo ou há erro no listener.

**Solução:**

1. Verificar se service worker está rodando (link azul em Extensões)
2. Recarregar extensão completamente
3. Verificar console do background para erros

---

### Cenário 2: Background recebe mas API falha

**Logs esperados:**

```
[BACKGROUND] Message received
[BACKGROUND] Processing OpenRouter chat completion
[BACKGROUND] Making request to OpenRouter
[BACKGROUND] OpenRouter API error ❌
```

**Causa:** Problema na requisição ou API Key inválida.

**Solução:**

1. Verificar API Key no popup
2. Testar API Key diretamente: https://openrouter.ai/playground
3. Verificar saldo de créditos no OpenRouter

---

### Cenário 3: Resposta OK mas parsing falha

**Logs esperados:**

```
[BACKGROUND] OpenRouter response received (status: 200)
[BACKGROUND] OpenRouter request failed ❌
```

**Causa:** Formato de resposta inesperado.

**Solução:** Verificar estrutura do JSON retornado.

---

## 🛠️ Ferramentas de Debug

### Verificar Service Worker

No console do background, execute:

```javascript
// Verificar se listener está registrado
chrome.runtime.onMessage.hasListeners();
```

### Testar Mensagem Manualmente

No console da página (F12), execute:

```javascript
chrome.runtime.sendMessage(
  {
    type: "OPENROUTER_CHAT_COMPLETION",
    messages: [{ role: "user", content: "Teste" }],
  },
  (response) => {
    console.log("Response:", response);
  }
);
```

### Testar API Diretamente

No console do **background** (service worker), execute:

```javascript
// Copiar e colar no console do service worker
(async () => {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer SEU_API_KEY_AQUI",
        "HTTP-Referer": "https://inva-extension.com",
        "X-Title": "inVa Extension",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [{ role: "user", content: "Olá" }],
        temperature: 0.7,
        max_tokens: 100,
      }),
    }
  );

  console.log("Status:", response.status);
  const data = await response.json();
  console.log("Data:", data);
})();
```

---

## 📋 Checklist de Validação

Execute estes passos e anote os resultados:

- [ ] **Extensão recarregada**
  - Chrome → Extensões → Recarregar
- [ ] **Service worker ativo**
  - Verificar link "service worker" está azul
  - Clicar e ver console sem erros
- [ ] **API Key configurada**
  - Abrir popup
  - Verificar campo "API Key" preenchido
  - Botão "Testar Conexão" → Sucesso
- [ ] **Logs do Content Script**
  - F12 na página do InvGate
  - Console → Filtrar por `[inVa]`
  - Ver logs de "Sending chat completion"
- [ ] **Logs do Background Script**
  - Console do service worker
  - Ver logs de "Message received"
  - Ver logs de "OpenRouter response"

---

## 🎯 Próximos Passos

### Se o erro persistir após os logs:

1. **Copie TODOS os logs** do console (tanto da página quanto do background)
2. **Anote qual cenário** se aplica (1, 2 ou 3)
3. **Execute o teste manual** da API no console do background
4. **Verifique a resposta** e compartilhe os detalhes

### Informações úteis para debug:

```javascript
// No console do background, execute:
navigator.userAgent;
chrome.runtime.getManifest().version;
chrome.storage.sync.get(["OPENROUTER_API_KEY"], (r) =>
  console.log("Has key:", !!r.OPENROUTER_API_KEY)
);
```

---

## 📚 Referências

- [Chrome Extension Message Passing](https://developer.chrome.com/docs/extensions/mv3/messaging/)
- [Service Workers in Extensions](https://developer.chrome.com/docs/extensions/mv3/service_workers/)
- [OpenRouter API Docs](https://openrouter.ai/docs)
- [Debugging Extensions](https://developer.chrome.com/docs/extensions/mv3/tut_debugging/)

---

**Status:** Aguardando logs detalhados para continuar o debug 🔍
