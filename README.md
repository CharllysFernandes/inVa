# inVa

Projeto inicial de uma extensão para Google Chrome e Microsoft Edge escrita em TypeScript. A extensão realça rapidamente elementos de texto na página ativa e permite personalizar a cor de destaque.

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

- `src/background`: scripts de background/service worker.
- `src/content`: scripts injetados nas páginas.
- `src/popup`: interface do popup de ação.
- `src/options`: página de opções da extensão.
- `src/shared`: utilitários e tipos compartilhados.

## Próximos passos sugeridos

- Adicionar ícones em diferentes resoluções na pasta `dist/icons` e referenciar no `manifest.json`.
- Implementar testes unitários para funções de utilidade em `src/shared`.
- Publicar a extensão nas lojas oficiais após revisar permissões e políticas.
