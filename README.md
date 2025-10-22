# inVa

Extensão para Google Chrome e Microsoft Edge escrita em TypeScript cujo objetivo é agilizar o fluxo de criação de chamados na plataforma **InvGate Service Desk**. Ela injeta um painel assistente dentro da página de criação de incidentes, permite salvar temporariamente rascunhos de comentários, sincroniza esse texto com o CKEditor utilizado pela aplicação e remove o conteúdo do armazenamento assim que o envio ocorre – mantendo o campo pronto para o próximo atendimento. O popup da extensão também oferece um painel de diagnóstico para habilitar logs detalhados e configurar a URL de criação de tickets utilizada como gatilho para o conteúdo.

## Aviso legal

- **InvGate** é uma marca e plataforma pertencente aos seus respectivos proprietários.
- Este projeto não é afiliado, mantido, patrocinado ou endossado pela InvGate.
- A extensão foi desenvolvida de forma independente, com fins de prototipagem e aumento de produtividade, e não altera o código-fonte original da aplicação InvGate.
- Ao utilizá-la, verifique as políticas internas da sua organização e os termos de uso da plataforma para assegurar conformidade jurídica e contratual.

## Principais funcionalidades

- Armazena rascunhos de comentários localmente enquanto o usuário prepara o chamado.
- Replica automaticamente o texto salvo para o CKEditor da página InvGate, evitando retrabalho.
- Limpa o rascunho do `localStorage` após o envio do formulário, mantendo o campo disponível para novas anotações.
- Disponibiliza no popup um painel com logo, status de versão, configuração da URL monitorada e ferramentas de debug (visualização/limpeza de logs, alternância de modo debug).
- Construída inteiramente em TypeScript, utilizando ferramentas modernas (webpack, manifest V3) para facilitar evolução e manutenção.

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
- npm ou pnpm para gerenciamento de dependências

## Como começar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Gere os arquivos da extensão em `dist/`:

   ```bash
   npm run build
   ```

   Para desenvolvimento contínuo utilize o modo de observação:

   ```bash
   npm run watch
   ```

3. Carregue a pasta `dist/` como extensão não empacotada:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Ative o modo desenvolvedor e escolha **Load unpacked** / **Carregar sem compactação**.

## Scripts disponíveis

- `npm run build`: gera uma versão otimizada para distribuição.
- `npm run watch`: recompila automaticamente ao alterar os arquivos fonte.
- `npm run typecheck`: executa o TypeScript apenas para verificação de tipos.
- `npm run clean`: remove a pasta `dist/`.

## Estrutura dos diretórios

```
src/
├── background/         # Service worker (MV3)
│   └── background.ts
├── content/           # Scripts injetados nas páginas
│   ├── contentScript.ts  # Orquestração principal
│   └── editor-sync.ts    # Sincronização CKEditor
├── popup/             # Interface do popup
│   ├── popup.ts
│   ├── popup.html
│   └── popup.css
└── shared/            # Módulos compartilhados
    ├── constants.ts      # Constantes centralizadas
    ├── types.ts          # Definições de tipos TypeScript
    ├── logger.ts         # Sistema de logging
    ├── utils.ts          # Utilitários de storage de URL
    ├── comment-storage.ts # Gerenciador de comentários
    ├── text-utils.ts     # Normalização de texto
    ├── dom-utils.ts      # Helpers de DOM
    └── elemento.ts       # Template HTML injetado
```

### Arquitetura modularizada

O projeto foi organizado seguindo princípios SOLID e boas práticas TypeScript:

- **Separação de responsabilidades**: cada módulo tem uma função clara e única
- **Injeção de dependências**: uso de módulos singleton exportados (`editorSync`, `commentStorage`)
- **Constantes centralizadas**: seletores, limites e chaves de storage em `constants.ts`
- **Tipagem forte**: tipos compartilhados em `types.ts` evitam duplicação
- **Utilitários reutilizáveis**: helpers de DOM, texto e debounce isolados
- **Manager classes**: `CKEditorSyncManager` e `CommentStorageManager` encapsulam estado e lógica complexa
- **Factory functions**: `createCommentForm()` cria elementos programaticamente com type-safety
- **CSS modular**: estilos encapsulados com prefixo `inva-` evitam conflitos

## Próximos passos sugeridos

- Adicionar ícones em diferentes resoluções na pasta `dist/icons` e referenciar no `manifest.json`.
- Implementar testes unitários para funções de utilidade em `src/shared`.
- Publicar a extensão nas lojas oficiais após revisar permissões e políticas.
