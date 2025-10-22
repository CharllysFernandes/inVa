# 🔒 Checklist de Segurança

Use este checklist ao desenvolver novas funcionalidades ou revisar código existente.

## ✅ Content Security Policy

### Manifest.json

- [x] CSP configurada em `content_security_policy.extension_pages`
- [x] `script-src 'self'` - apenas scripts da extensão
- [x] `object-src 'none'` - bloqueia plugins
- [x] `base-uri 'none'` - previne manipulação de base tag
- [x] `frame-ancestors 'none'` - previne clickjacking
- [x] `form-action 'none'` - restringe formulários
- [x] `upgrade-insecure-requests` - força HTTPS

### HTML

- [x] Meta tag CSP no popup.html
- [x] Sem scripts inline
- [x] Sem event handlers inline (onclick, onerror, etc.)
- [x] Todos os scripts em arquivos .js separados

### JavaScript

- [x] Sem uso de `eval()`
- [x] Sem uso de `new Function()`
- [x] Sem `setTimeout(string)` ou `setInterval(string)`
- [x] Sem importação de scripts externos via CDN

## 🛡️ Práticas de Código Seguro

### Manipulação de DOM

- [x] Uso de `textContent` para texto não confiável
- [x] `innerHTML` usado apenas para limpeza (`innerHTML = ""`)
- [x] Criação de elementos via `createElement()` e `appendChild()`
- [x] Atributos definidos via propriedades, não strings

### Entrada do Usuário

- [x] Validação de URLs (`type="url"` no input)
- [x] Sanitização de dados antes de armazenar
- [x] Normalização de texto via `text-utils.ts`
- [x] Limitação de tamanho de entrada

### Armazenamento

- [x] Chrome Storage API (não localStorage direto)
- [x] Rate limiting implementado
- [x] Validação de dados ao recuperar do storage
- [x] Tratamento de erros em operações de storage

### Permissões

- [x] Apenas permissões necessárias no manifest
- [x] `activeTab` ao invés de `tabs` quando possível
- [x] `host_permissions` justificadas
- [x] Documentação de por que cada permissão é necessária

## 🔍 Verificações Automáticas

### Scripts de Teste

```bash
# Validar CSP e práticas de segurança
npm run test:security

# Verificar tipos TypeScript
npm run typecheck

# Executar testes unitários
npm test -- --run

# Build de produção
npm run build
```

### Checklist Pré-Commit

- [ ] `npm run test:security` passa ✅
- [ ] `npm run typecheck` sem erros ✅
- [ ] `npm test -- --run` todos os testes passam ✅
- [ ] `npm run build` compila com sucesso ✅

## 🚨 Código Não Permitido

### ❌ Scripts Inline

```html
<!-- NUNCA FAZER -->
<script>
  console.log("inline script");
</script>
```

### ❌ Event Handlers Inline

```html
<!-- NUNCA FAZER -->
<button onclick="handleClick()">Click</button>
```

### ❌ eval() e similares

```javascript
// NUNCA FAZER
eval("alert(1)");
new Function("alert(1)")();
setTimeout("alert(1)", 100);
```

### ❌ innerHTML com dados não confiáveis

```javascript
// NUNCA FAZER
element.innerHTML = userInput; // XSS vulnerability!
element.innerHTML = `<div>${data}</div>`; // XSS vulnerability!
```

### ❌ Scripts externos via CDN

```html
<!-- NUNCA FAZER -->
<script src="https://cdn.example.com/lib.js"></script>
```

## ✅ Código Permitido e Recomendado

### ✅ Event Listeners

```javascript
// RECOMENDADO
document.getElementById("btn").addEventListener("click", handleClick);
```

### ✅ textContent para texto

```javascript
// RECOMENDADO
element.textContent = userInput; // Seguro!
```

### ✅ createElement para HTML

```javascript
// RECOMENDADO
const div = document.createElement("div");
div.textContent = data;
element.appendChild(div);
```

### ✅ Libraries via npm + webpack

```bash
# RECOMENDADO
npm install library
```

```javascript
import library from "library";
// webpack fará bundle automaticamente
```

## 🔄 Fluxo de Desenvolvimento Seguro

### 1. Antes de Começar

- [ ] Entender o requisito de segurança
- [ ] Revisar CSP e limitações
- [ ] Planejar abordagem sem violar CSP

### 2. Durante o Desenvolvimento

- [ ] Escrever código em arquivos .ts/.js separados
- [ ] Usar `textContent` para dados não confiáveis
- [ ] Adicionar event listeners via JavaScript
- [ ] Validar e sanitizar entradas

### 3. Antes de Commit

- [ ] Executar `npm run test:security`
- [ ] Revisar código para padrões inseguros
- [ ] Testar manualmente no browser
- [ ] Verificar console por violações de CSP

### 4. Review de Código

- [ ] Outro desenvolvedor revisou?
- [ ] Práticas de segurança seguidas?
- [ ] Testes de segurança passam?
- [ ] Documentação atualizada?

## 📋 Checklist de Funcionalidade

### Adicionando Novo Formulário

- [ ] Inputs têm validação de tipo (`type="url"`, `type="email"`, etc.)
- [ ] Validação de comprimento máximo
- [ ] Sanitização de dados antes de usar
- [ ] Event listeners via JavaScript, não inline

### Adicionando Nova Página HTML

- [ ] Meta tag CSP incluída
- [ ] Sem scripts inline
- [ ] Sem event handlers inline
- [ ] Scripts carregados via `<script src="">`

### Adicionando Biblioteca Externa

- [ ] Instalada via npm (não CDN)
- [ ] Versão específica no package.json
- [ ] Não requer `unsafe-eval` ou `unsafe-inline`
- [ ] Webpack pode fazer bundle

### Modificando manifest.json

- [ ] CSP mantida ou fortalecida
- [ ] Permissões justificadas
- [ ] Versão atualizada (se aplicável)
- [ ] Testado no Chrome/Edge

## 🧪 Testes de Segurança

### Testes Manuais

1. **Testar CSP no DevTools**:

   ```javascript
   // No console do popup - deve falhar
   eval('console.log("test")');
   // Esperado: "Refused to evaluate..."
   ```

2. **Tentar injetar script**:

   ```javascript
   // Deve ser seguro
   element.textContent = "<script>alert(1)</script>";
   // Script não deve executar
   ```

3. **Verificar console por violações**:
   - Abrir DevTools no popup
   - Verificar tab Console
   - Não deve haver erros de CSP

### Testes Automatizados

```bash
# Script personalizado
npm run test:security

# Saída esperada:
# ✅ CSP configurada corretamente
# ✅ Sem scripts inline
# ✅ Sem event handlers inline
# ✅ Sem padrões inseguros
```

## 📊 Métricas de Segurança

### Alvos

- **CSP Compliance**: 100%
- **Scripts Inline**: 0
- **Event Handlers Inline**: 0
- **eval() calls**: 0
- **Vulnerabilidades conhecidas**: 0

### Comandos de Verificação

```bash
# Verificar vulnerabilidades em dependências
npm audit

# Verificar versões desatualizadas
npm outdated

# Analisar bundle de segurança
npm run build && ls -lh dist/
```

## 🚀 Antes de Release

### Security Checklist Final

- [ ] `npm audit` sem vulnerabilidades critical/high
- [ ] `npm run test:security` passa
- [ ] Todas as permissões do manifest justificadas
- [ ] CSP rigorosa mantida
- [ ] Documentação de segurança atualizada
- [ ] Testes manuais de segurança realizados
- [ ] Review de código de segurança feito

### Documentação

- [ ] CONTENT_SECURITY_POLICY.md atualizado
- [ ] README.md reflete práticas de segurança
- [ ] Mudanças de segurança no CHANGELOG

## 📚 Recursos de Segurança

### Documentação

- [Chrome Extension Security](https://developer.chrome.com/docs/extensions/mv3/security/)
- [OWASP Cheat Sheet](https://cheatsheetseries.owasp.org/)
- [CSP Reference](https://content-security-policy.com/)

### Ferramentas

- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk](https://snyk.io/) - Análise de vulnerabilidades

### Treinamento

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Secure Coding Guidelines](https://wiki.sei.cmu.edu/confluence/display/seccode)

## ⚠️ Incidentes de Segurança

### Se Encontrar Vulnerabilidade

1. **Não commitar** código vulnerável
2. **Documentar** a vulnerabilidade
3. **Corrigir** imediatamente
4. **Testar** a correção
5. **Revisar** código similar

### Reportar Vulnerabilidade

Se você encontrar uma vulnerabilidade de segurança:

1. **NÃO** abra uma issue pública
2. Entre em contato com os mantenedores diretamente
3. Forneça detalhes e steps para reproduzir
4. Aguarde correção antes de divulgar publicamente

## ✅ Status Atual

### Implementado

- ✅ CSP rigorosa no manifest.json
- ✅ CSP meta tag no popup.html
- ✅ Sem scripts inline
- ✅ Sem event handlers inline
- ✅ Rate limiting para storage
- ✅ Validação de entradas
- ✅ Script de validação automática
- ✅ Documentação completa

### Próximos Passos (Opcional)

- [ ] CSP reporting endpoint
- [ ] Subresource Integrity (SRI)
- [ ] Automated security scanning no CI/CD
- [ ] Penetration testing

---

**Mantenha este checklist atualizado e consulte-o regularmente!** 🔒
