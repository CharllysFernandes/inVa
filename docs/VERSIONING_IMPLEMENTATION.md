# 📦 Sistema de Versionamento Automático - Implementação Completa

## ✅ O que foi implementado

### 1. **Standard-Version** instalado

- Gerenciador de versionamento automático
- Baseado em Conventional Commits
- Gera CHANGELOG automaticamente
- Bumps de versão inteligentes

### 2. **Scripts npm** adicionados

```bash
npm run release          # Release automática (analisa commits)
npm run release:patch    # Forçar patch (0.1.0 → 0.1.1)
npm run release:minor    # Forçar minor (0.1.0 → 0.2.0)
npm run release:major    # Forçar major (0.1.0 → 1.0.0)
npm run release:first    # Primeira release (sem bump)
```

### 3. **Arquivos de configuração criados**

#### `.versionrc.json` - Configuração do standard-version

- Define tipos de commit (feat, fix, perf, etc.)
- Configura formato do CHANGELOG
- Script postbump para sincronização
- Tradução para português

#### `scripts/sync-version.js` - Sincronização automática

- Sincroniza versão entre package.json e manifest.json
- Executado automaticamente após bump
- Previne inconsistências

#### `.cz-config.js` - Configuração Commitizen (opcional)

- Helper para criar commits convencionais
- Usa: `git cz` ao invés de `git commit`
- Interface interativa em português

### 4. **Documentação completa**

#### `CHANGELOG.md`

- Histórico de mudanças do projeto
- Gerado e atualizado automaticamente
- Organizado por versão e tipo de mudança

#### `VERSIONING.md`

- Guia completo sobre o sistema
- Explicação de Conventional Commits
- Exemplos práticos
- Troubleshooting

#### `docs/VERSIONING_GUIDE.md`

- Guia rápido e prático
- Comandos essenciais
- Exemplos de uso real
- Tabela de tipos de commit

#### `docs/RELEASE_CHECKLIST.md`

- Checklist pré-release
- Checklist durante release
- Checklist pós-release
- Troubleshooting detalhado

#### `README.md` atualizado

- Seção de scripts expandida
- Referência ao versionamento
- Link para documentação completa

## 🎯 Como usar

### Fluxo básico

```bash
# 1. Fazer commits convencionais
git add .
git commit -m "feat: adicionar nova funcionalidade"
git commit -m "fix: corrigir bug no storage"

# 2. Quando estiver pronto para release
npm test -- --run          # Garantir que testes passam
npm run build              # Garantir que build funciona

# 3. Criar release
npm run release            # Automático

# 4. Fazer push
git push --follow-tags origin main
```

### Preview antes de release

```bash
npx standard-version --dry-run
```

### Forçar tipo específico

```bash
npm run release:patch      # Apenas correções
npm run release:minor      # Nova funcionalidade
npm run release:major      # Breaking change
```

## 📊 Tipos de commit e impacto

| Commit   | Exemplo                  | Versão            | Efeito     |
| -------- | ------------------------ | ----------------- | ---------- |
| `feat:`  | `feat: adicionar cache`  | 0.1.0 → **0.2.0** | Minor bump |
| `fix:`   | `fix: corrigir leak`     | 0.1.0 → **0.1.1** | Patch bump |
| `perf:`  | `perf: otimizar loop`    | 0.1.0 → **0.1.1** | Patch bump |
| `feat!:` | `feat!: nova API`        | 0.1.0 → **1.0.0** | Major bump |
| `docs:`  | `docs: atualizar README` | 0.1.0 → 0.1.0     | Sem bump\* |
| `test:`  | `test: adicionar testes` | 0.1.0 → 0.1.0     | Sem bump\* |

\*Aparece no CHANGELOG mas não causa bump de versão

## 🔧 O que acontece em um release?

1. **Análise de commits**: Desde última tag até HEAD
2. **Determinação de versão**: Based em tipos de commit
3. **Atualização de arquivos**:
   - `package.json` → nova versão
   - `manifest.json` → nova versão (via sync-version.js)
   - `CHANGELOG.md` → adiciona seção da nova versão
4. **Git commit**: `chore(release): v0.x.x`
5. **Git tag**: `v0.x.x`

## 📁 Estrutura de arquivos

```
inVa/
├── .versionrc.json              # Config standard-version
├── .cz-config.js                # Config commitizen (opcional)
├── CHANGELOG.md                 # Histórico de mudanças
├── VERSIONING.md                # Guia completo
├── scripts/
│   └── sync-version.js          # Sincroniza package.json ↔ manifest.json
├── docs/
│   ├── VERSIONING_GUIDE.md      # Guia rápido
│   └── RELEASE_CHECKLIST.md     # Checklist de release
└── package.json                 # Scripts de release
```

## ✨ Funcionalidades

### ✅ Automático

- Determina versão baseada em commits
- Gera CHANGELOG formatado
- Sincroniza package.json e manifest.json
- Cria commit e tag
- Suporte a breaking changes

### ✅ Manual

- Força tipo de versão específico
- Dry-run para preview
- Customização via .versionrc.json
- Rollback de releases

### ✅ Documentado

- 4 arquivos de documentação
- Exemplos práticos
- Troubleshooting
- Checklist completo

## 🚀 Próximos passos recomendados

### Opcional: Instalar Commitizen globalmente

```bash
npm install -g commitizen
```

Depois use `git cz` ao invés de `git commit` para ter um wizard interativo.

### Opcional: Husky + Commitlint

Para validar commits automaticamente:

```bash
npm install --save-dev @commitlint/{config-conventional,cli} husky
npx husky init
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
```

### Opcional: GitHub Actions para release automática

Criar `.github/workflows/release.yml`:

```yaml
name: Release
on:
  push:
    tags:
      - "v*"
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: softprops/action-gh-release@v1
```

## 🎓 Referências

- [Semantic Versioning](https://semver.org/lang/pt-BR/)
- [Conventional Commits](https://www.conventionalcommits.org/pt-br/)
- [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
- [standard-version](https://github.com/conventional-changelog/standard-version)
- [Commitizen](https://github.com/commitizen/cz-cli)

## ✅ Status da implementação

| Item                       | Status |
| -------------------------- | ------ |
| standard-version instalado | ✅     |
| Scripts npm configurados   | ✅     |
| .versionrc.json criado     | ✅     |
| sync-version.js criado     | ✅     |
| .cz-config.js criado       | ✅     |
| CHANGELOG.md inicializado  | ✅     |
| Documentação completa      | ✅     |
| README atualizado          | ✅     |
| Build testado              | ✅     |
| Dry-run testado            | ✅     |

## 🎉 Pronto para usar!

O sistema de versionamento está completamente implementado e testado. Você pode começar a usar imediatamente com:

```bash
npm run release
```

Consulte `VERSIONING.md` ou `docs/VERSIONING_GUIDE.md` para guias detalhados.
