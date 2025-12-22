# Extensão Chrome/Edge

## Instalação

1. Execute `npm run build` para gerar os arquivos na pasta `/dist`
2. Abra Chrome/Edge e vá para `chrome://extensions/` ou `edge://extensions/`
3. Ative o "Modo do desenvolvedor"
4. Clique em "Carregar sem compactação"
5. Selecione a pasta `/dist`

## Estrutura

- `manifest.json` - Configuração da extensão
- `popup.html` - Interface do popup
- `popup.js` - Lógica da extensão
- `build.js` - Script de build
