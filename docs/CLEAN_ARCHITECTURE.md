# 🏛️ Clean Architecture - Projeto inVa

## 📐 Estrutura

```
src/
├── domain/                      # Camada de Domínio (Regras de Negócio)
│   ├── entities/               # Entidades de domínio
│   │   └── config.ts
│   └── use-cases/              # Casos de uso
│       └── config-use-cases.ts
│
├── infrastructure/              # Camada de Infraestrutura
│   ├── repositories/           # Implementações de repositórios
│   │   └── chrome-storage-repository.ts
│   └── adapters/               # Adaptadores externos
│
├── presentation/                # Camada de Apresentação
│   └── popup/
│       ├── popup-controller.ts # Controller
│       └── ui/
│           └── status.ts       # UI helpers
│
├── popup/                       # Entry point (Framework)
│   ├── popup.ts               # Composição e inicialização
│   ├── ui/                    # Elementos DOM
│   └── handlers/              # Handlers legados
│
├── content/                     # Content scripts
│   └── features/
│
├── background/                  # Service worker
│
└── shared/                      # Utilitários compartilhados
    ├── core/
    ├── services/
    └── ui/
```

## 🎯 Camadas

### 1. Domain (Domínio)
**Responsabilidade:** Regras de negócio puras

**Entidades:**
- `config.ts` - Modelos de dados (TicketUrlConfig, OpenRouterConfig, etc.)

**Use Cases:**
- `LoadConfigUseCase` - Carrega todas as configurações
- `SaveTicketUrlUseCase` - Salva URL do ticket
- `SaveOpenRouterConfigUseCase` - Salva config OpenRouter
- `SaveGeneralSettingsUseCase` - Salva configurações gerais
- `ToggleDebugUseCase` - Alterna modo debug

**Regras:**
- ❌ Não depende de nenhuma camada externa
- ✅ Apenas lógica de negócio pura
- ✅ Interfaces para repositórios

### 2. Infrastructure (Infraestrutura)
**Responsabilidade:** Implementações técnicas

**Repositories:**
- `ChromeStorageRepository` - Implementa ConfigRepository usando chrome.storage

**Regras:**
- ✅ Implementa interfaces do domínio
- ✅ Acessa APIs externas (chrome.storage)
- ❌ Não conhece a camada de apresentação

### 3. Presentation (Apresentação)
**Responsabilidade:** Lógica de apresentação

**Controllers:**
- `PopupController` - Orquestra use cases e UI

**Regras:**
- ✅ Usa use cases do domínio
- ✅ Não conhece detalhes de infraestrutura
- ✅ Callbacks para UI

### 4. Framework (popup/, content/, background/)
**Responsabilidade:** Entry points e composição

**Regras:**
- ✅ Compõe todas as camadas
- ✅ Inicializa dependências
- ✅ Conecta UI com controllers

## 🔄 Fluxo de Dados

```
UI Event → Controller → Use Case → Repository → chrome.storage
                                                      ↓
UI Update ← Controller ← Use Case ← Repository ← chrome.storage
```

## 📦 Dependências

```
Framework → Presentation → Domain ← Infrastructure
```

**Regra de Dependência:**
- Camadas externas dependem de camadas internas
- Camadas internas NÃO dependem de camadas externas

## 🎓 Benefícios

✅ **Testabilidade** - Use cases isolados  
✅ **Manutenibilidade** - Separação clara de responsabilidades  
✅ **Flexibilidade** - Fácil trocar infraestrutura  
✅ **Escalabilidade** - Adicionar features sem afetar outras camadas  

## 📝 Exemplo de Uso

```typescript
// 1. Criar repository
const repo = new ChromeStorageRepository();

// 2. Criar use cases
const loadConfig = new LoadConfigUseCase(repo);
const saveTicketUrl = new SaveTicketUrlUseCase(repo);

// 3. Criar controller
const controller = new PopupController(
  loadConfig,
  saveTicketUrl,
  // ... outros use cases
);

// 4. Usar no UI
await controller.initialize(elements);
await controller.handleSaveTicketUrl(url, onSuccess, onError);
```

## 🧪 Testando

```typescript
// Mock repository
class MockRepository implements ConfigRepository {
  async getTicketUrl() { return "http://test.com"; }
  // ...
}

// Testar use case
const useCase = new LoadConfigUseCase(new MockRepository());
const result = await useCase.execute();
expect(result.ticketUrl).toBe("http://test.com");
```

## 📚 Referências

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
