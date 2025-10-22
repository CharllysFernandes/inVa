# 🔒 Content Security Policy (CSP) - Implementação

## Visão Geral

Uma **Content Security Policy (CSP)** rigorosa foi implementada para proteger a extensão contra ataques de injeção de código, como XSS (Cross-Site Scripting), clickjacking e outros vetores de ataque.

## 📋 CSP Implementada

### 1. Manifest V3 - Extension Pages

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'; upgrade-insecure-requests;"
  }
}
```

### 2. HTML Meta Tag (Defesa em Profundidade)

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; 
               script-src 'self'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data:; 
               font-src 'self'; 
               connect-src 'self'; 
               object-src 'none'; 
               base-uri 'none'; 
               form-action 'none'; 
               frame-ancestors 'none';"
/>
```

## 🛡️ Diretivas Explicadas

### Diretivas Principais

| Diretiva                      | Valor    | Propósito                                           |
| ----------------------------- | -------- | --------------------------------------------------- |
| **script-src**                | `'self'` | Permite apenas scripts da própria extensão          |
| **object-src**                | `'none'` | Bloqueia plugins (Flash, Java, etc.)                |
| **base-uri**                  | `'none'` | Previne manipulação da tag `<base>`                 |
| **frame-ancestors**           | `'none'` | Previne clickjacking (extensão não pode ser iframe) |
| **form-action**               | `'none'` | Restringe submissão de formulários                  |
| **upgrade-insecure-requests** | -        | Força HTTPS em requisições                          |

### Diretivas HTML Adicionais

| Diretiva        | Valor                    | Propósito                          |
| --------------- | ------------------------ | ---------------------------------- |
| **default-src** | `'self'`                 | Fallback padrão para recursos      |
| **style-src**   | `'self' 'unsafe-inline'` | Permite CSS externo e inline       |
| **img-src**     | `'self' data:`           | Permite imagens locais e data URIs |
| **font-src**    | `'self'`                 | Permite fontes apenas da extensão  |
| **connect-src** | `'self'`                 | Restringe conexões XHR/fetch       |

## 🚫 O que é Bloqueado

### ❌ Scripts Inline

```html
<!-- BLOQUEADO -->
<script>
  alert("inline script");
</script>

<!-- BLOQUEADO -->
<button onclick="doSomething()">Click</button>
```

**Solução**: Use event listeners em arquivos .js externos

```javascript
// ✅ PERMITIDO - popup.js
document.getElementById("btn").addEventListener("click", doSomething);
```

### ❌ eval() e new Function()

```javascript
// ❌ BLOQUEADO
eval("alert(1)");
new Function("alert(1)")();
setTimeout("alert(1)", 100);
```

**Solução**: Use código estático

```javascript
// ✅ PERMITIDO
setTimeout(() => alert(1), 100);
```

### ❌ Scripts Externos

```html
<!-- ❌ BLOQUEADO -->
<script src="https://cdn.example.com/library.js"></script>
```

**Solução**: Bundle bibliotecas com webpack

```bash
npm install library
# webpack incluirá no bundle
```

## ✅ O que é Permitido

### ✅ Scripts Externos da Extensão

```html
<!-- ✅ PERMITIDO -->
<script type="module" src="popup.js"></script>
<script src="contentScript.js"></script>
```

### ✅ CSS Externo e Inline

```html
<!-- ✅ PERMITIDO -->
<link rel="stylesheet" href="popup.css" />
<style>
  .my-class {
    color: blue;
  }
</style>
```

### ✅ Imagens Locais e Data URIs

```html
<!-- ✅ PERMITIDO -->
<img src="Logo.png" alt="Logo" />
<img src="data:image/png;base64,..." alt="Icon" />
```

## 🔐 Níveis de Segurança

### Nível 1: Manifest V3 CSP (Obrigatório)

- Aplicado automaticamente pelo Chrome
- Controla todas as páginas da extensão
- Não pode ser desabilitado

### Nível 2: Meta Tag CSP (Defesa em Profundidade)

- Adicionado em `popup.html`
- Reforça as políticas do manifest
- Proteção adicional contra bypass

### Nível 3: Código Seguro (Responsabilidade do Desenvolvedor)

- Validação de entradas
- Sanitização de dados
- Escape de HTML
- Uso de `textContent` ao invés de `innerHTML`

## 🛠️ Verificação de Conformidade

### Checklist de Desenvolvimento

- [x] ❌ Sem scripts inline no HTML
- [x] ❌ Sem event handlers inline (`onclick`, `onerror`, etc.)
- [x] ❌ Sem `eval()`, `Function()`, ou `setTimeout(string)`
- [x] ❌ Sem `innerHTML` com conteúdo não sanitizado
- [x] ✅ Todos os scripts em arquivos .js separados
- [x] ✅ Event listeners via `addEventListener()`
- [x] ✅ Uso de `textContent` ou `createTextNode()`
- [x] ✅ Bibliotecas bundled via webpack

### Testar CSP

1. **Abrir DevTools no popup**:

   - Clique com botão direito no popup → Inspecionar
   - Aba Console: verificar violações de CSP

2. **Verificar manifest.json**:

   ```bash
   cat manifest.json | grep content_security_policy
   ```

3. **Forçar violação (teste)**:
   ```javascript
   // No console do popup - deve ser bloqueado
   eval('console.log("test")');
   // Erro esperado: Refused to evaluate a string as JavaScript...
   ```

## 📚 Recursos Adicionais

### Documentação Oficial

- [Chrome Extension Security](https://developer.chrome.com/docs/extensions/mv3/security/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

## ✅ Status da Implementação

- ✅ CSP adicionada ao manifest.json
- ✅ CSP meta tag adicionada ao popup.html
- ✅ Código existente já está conforme
- ✅ Sem scripts inline
- ✅ Sem event handlers inline
- ✅ Sem uso de eval()
- ✅ Build testado e funcionando

---

**A extensão agora possui uma CSP rigorosa que protege contra os principais vetores de ataque!** 🔒
