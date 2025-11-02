# Geração Automática de Perguntas Complementares com IA

## Visão Geral

Esta funcionalidade implementa um sistema inteligente que analisa o texto digitado pelo usuário e sugere automaticamente perguntas complementares relevantes para ajudar na coleta completa de informações em tickets de suporte.

## Arquitetura

### Módulos Criados

#### 1. `src/shared/openrouter-api.ts`

Cliente da API OpenRouter para integração com modelos de linguagem.

**Principais funções:**

- `chatCompletion()` - Comunicação direta com a API OpenRouter
- `generateQuestions()` - Geração inteligente de perguntas com caching
- `isConfigured()` - Validação da configuração da API
- `clearSuggestionsCache()` - Limpeza manual do cache
- `getCacheStats()` - Estatísticas do cache

**Características:**

- ✅ Caching inteligente com TTL de 5 minutos
- ✅ Hash simples para chaves de cache
- ✅ Limpeza automática de entradas expiradas
- ✅ Modelo padrão: `meta-llama/llama-3.1-8b-instruct:free`
- ✅ Suporte a qualquer modelo compatível com OpenRouter
- ✅ Parsing robusto de JSON (com fallback para markdown code blocks)
- ✅ Validação de perguntas (máximo 200 caracteres, 3-6 perguntas)
- ✅ Tratamento completo de erros

#### 2. `src/shared/ai-suggestions.ts`

Gerenciador de interface visual das sugestões de IA.

**Classe principal: `AISuggestionsManager`**

**Métodos públicos:**

- `initialize(textarea, parentContainer)` - Inicializa o gerenciador
- `generate(text)` - Gera sugestões para um texto
- `hide()` - Oculta o container de sugestões
- `destroy()` - Limpa recursos e remove do DOM

**Características:**

- ✅ Estilos CSS injetados dinamicamente (sem conflitos)
- ✅ Debounce automático de 1.5 segundos
- ✅ Estados visuais: loading, success, empty, error
- ✅ Campos de resposta para cada pergunta
- ✅ Botão "Aplicar Respostas" - insere no formato estruturado
- ✅ Botão "Dispensar" - oculta sugestões
- ✅ UI responsiva com gradientes e animações
- ✅ Integração completa com textarea principal

#### 3. Integração com `contentScript.ts`

O content script foi atualizado para inicializar automaticamente o gerenciador de sugestões.

**Mudanças:**

```typescript
// Importação adicionada
import { AISuggestionsManager } from "@shared/ai-suggestions";

// Na função setupTextarea, adicionado:
try {
  const aiSuggestions = new AISuggestionsManager();
  await aiSuggestions.initialize(textarea, parentContainer);
  void logger.info("content", "AI suggestions manager initialized");
} catch (e) {
  void logger.warn("content", "Failed to initialize AI suggestions", {
    error: String(e),
  });
}
```

## Fluxo de Uso

### 1. Configuração Inicial

O usuário deve configurar a API do OpenRouter no popup da extensão:

1. Abrir popup da extensão
2. Seção "API do OpenRouter"
3. Preencher:

   - **API Key**: Chave de API do OpenRouter
   - **Site URL** (opcional): URL do site para header HTTP Referer
   - **App Name** (opcional): Nome do app para identificação

4. Clicar em "Salvar"
5. Opcional: Testar conexão clicando em "Testar Conexão"

### 2. Uso Automático

1. **Usuário digita** no campo de texto principal
2. **Sistema aguarda 1.5s** sem novas digitações (debounce)
3. **Texto é enviado** para a API OpenRouter
4. **IA analisa** o contexto e gera 3-6 perguntas relevantes
5. **Card visual aparece** abaixo do textarea com:
   - 💡 Ícone de sugestão
   - Lista de perguntas
   - Campos de texto para respostas
   - Botões "Aplicar Respostas" e "Dispensar"

### 3. Aplicação de Respostas

O usuário pode:

- **Responder** algumas ou todas as perguntas
- **Clicar em "Aplicar Respostas"** para inserir no texto principal
- **Formato inserido**:

```
[Texto original do usuário]

📋 Informações Complementares:
- Qual é o modelo do equipamento?
  R: HP LaserJet Pro M404dn
- Quando o problema começou?
  R: Ontem pela manhã, após atualização do driver
- O erro está ocorrendo sempre?
  R: Sim, em todas as tentativas de impressão
```

## Prompt Engineering

O sistema usa um prompt otimizado para contexto de suporte N1:

```
Você é um assistente de suporte técnico N1. Dado o texto abaixo descrevendo um problema,
gere 3 a 6 perguntas complementares que um analista N1 deveria fazer para coletar
informações essenciais e resolver o ticket.

Foque em perguntas sobre:
- Detalhes técnicos (modelo, versão, configuração)
- Cronologia (quando começou, mudanças recentes)
- Recorrência e padrões
- Impacto no trabalho do usuário
- Tentativas de solução já realizadas

Retorne APENAS um array JSON com as perguntas, sem explicações adicionais.
Formato: ["pergunta 1?", "pergunta 2?", ...]

Texto do usuário:
{userText}
```

## Cache e Performance

### Estratégia de Cache

- **Chave**: Hash simples do texto do usuário
- **TTL**: 5 minutos (300.000ms)
- **Limpeza**: Automática ao verificar cache
- **Benefícios**:
  - ✅ Reduz custos com API
  - ✅ Melhora latência para textos repetidos
  - ✅ Evita chamadas desnecessárias

### Exemplo de Hash

```typescript
"Impressora não funciona" → Hash: "abc123xyz"
```

Se o usuário digitar o mesmo texto em 5 minutos, o resultado é retornado do cache instantaneamente.

## Testes

### Cobertura de Testes

**Módulo: `ai-suggestions.test.ts`**

- ✅ 19 testes passando
- ✅ 98.38% de cobertura de linhas
- ✅ 84% de cobertura de branches
- ✅ 100% de cobertura de funções

**Cenários testados:**

1. Inicialização e injeção de estilos
2. Criação de container
3. Skip se API não configurada
4. Estados de loading, sucesso, erro, vazio
5. Rendering de perguntas
6. Captura de respostas
7. Aplicação de respostas ao textarea
8. Dismiss de sugestões
9. Destruição e limpeza de recursos
10. Prevenção de geração duplicada

### Executar Testes

```bash
# Testes específicos do módulo
npm test -- ai-suggestions

# Todos os testes
npm run test:coverage
```

## Segurança

### Content Security Policy (CSP)

O `manifest.json` foi atualizado para permitir conexões com OpenRouter:

```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self'; connect-src 'self' https://openrouter.ai"
}
```

### Proteções Implementadas

- ✅ API Key armazenada em `chrome.storage.sync` (criptografada pelo Chrome)
- ✅ Sem inline scripts ou `eval()`
- ✅ Headers HTTP corretos (User-Agent, Referer customizáveis)
- ✅ Timeout de requisições (10 segundos)
- ✅ Validação de respostas JSON
- ✅ Rate limiting existente no storage

## Logs e Debugging

### Níveis de Log

O módulo usa o logger existente da extensão:

```typescript
// Debug
void logger.debug("openrouter", "Cache hit", { key: cacheKey });

// Info
void logger.info("openrouter", "Generated questions", {
  count: 5,
  cached: false,
});

// Warn
void logger.warn("openrouter", "Empty response from API");

// Error
void logger.error("openrouter", "API request failed", { error: err.message });
```

### Verificar Logs

1. Abrir DevTools (F12)
2. Console
3. Filtrar por `[inVa]` ou `[OPENROUTER]`

### Estatísticas do Cache

```javascript
// No console do DevTools
chrome.runtime.sendMessage({ type: "getCacheStats" }, (response) => {
  console.log("Cache size:", response.size);
  console.log("Cache keys:", response.keys);
});
```

## Limitações Conhecidas

1. **Mínimo de Texto**: Requer pelo menos 10 caracteres para gerar sugestões
2. **Debounce**: 1.5 segundos de espera após parar de digitar
3. **Máximo de Perguntas**: 3-6 perguntas por vez
4. **Tamanho de Pergunta**: Máximo 200 caracteres por pergunta
5. **Cache TTL**: 5 minutos (não configurável)
6. **Modelos**: Depende da disponibilidade do OpenRouter

## Configuração Avançada

### Mudar Modelo de IA

No código (`openrouter-api.ts`), alterar a constante:

```typescript
const DEFAULT_MODEL = "meta-llama/llama-3.1-8b-instruct:free";
// Para:
const DEFAULT_MODEL = "anthropic/claude-3-opus";
```

### Ajustar TTL do Cache

```typescript
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
// Para:
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos
```

### Modificar Debounce

```typescript
private readonly DEBOUNCE_DELAY_MS = 1500; // 1.5 segundos
// Para:
private readonly DEBOUNCE_DELAY_MS = 2000; // 2 segundos
```

## Troubleshooting

### Sugestões não aparecem

**Possíveis causas:**

1. API não configurada → Verificar popup da extensão
2. Texto muito curto → Digitar pelo menos 10 caracteres
3. Erro de API → Verificar logs no console (F12)
4. Debounce ativo → Aguardar 1.5s sem digitar

### Erro "Failed to generate suggestions"

**Soluções:**

1. Verificar API Key no popup
2. Testar conexão com botão "Testar Conexão"
3. Verificar saldo de créditos no OpenRouter
4. Verificar logs detalhados no console
5. Limpar cache: `clearSuggestionsCache()`

### Perguntas não relevantes

**Melhorias:**

1. Digitar mais contexto antes de aguardar sugestões
2. Incluir palavras-chave específicas (modelo, erro, data)
3. Ajustar prompt no código se necessário
4. Testar com modelo de IA diferente

## Roadmap Futuro

### Melhorias Planejadas

- [ ] Configuração de modelo via popup (sem editar código)
- [ ] Ajuste de TTL do cache via settings
- [ ] Histórico de sugestões geradas
- [ ] Feedback sobre qualidade das perguntas (👍/👎)
- [ ] Templates de perguntas customizados por tipo de ticket
- [ ] Suporte a múltiplos idiomas
- [ ] Análise de sentimento do texto
- [ ] Integração com base de conhecimento interna

## Referências

- [OpenRouter API Documentation](https://openrouter.ai/docs)
- [Chrome Extension Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Content Security Policy](https://developer.chrome.com/docs/extensions/mv3/security/)
- [Llama 3.1 Model Card](https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct)

## Contribuição

Para contribuir com melhorias:

1. Implementar mudanças
2. Adicionar/atualizar testes
3. Executar `npm run test:coverage`
4. Garantir 100% dos testes passando
5. Executar `npm run build`
6. Testar manualmente na extensão
7. Atualizar esta documentação

## Suporte

Para dúvidas ou problemas:

1. Verificar logs no console
2. Consultar esta documentação
3. Revisar testes existentes
4. Abrir issue no repositório (se aplicável)
