# 💡 Exemplos Práticos de Versionamento

## Cenário 1: Primeira Release

Você acabou de implementar o versionamento e quer criar a primeira versão oficial.

```bash
# Ver o que temos atualmente
git log --oneline -10

# Criar primeira release sem bump (mantém versão atual)
npm run release:first

# Ver o que foi gerado
cat CHANGELOG.md
git log -1
git tag

# Fazer push
git push --follow-tags origin main
```

**Resultado**:

- CHANGELOG criado com histórico de commits
- Tag `v0.1.0` criada
- Commit `chore(release): 0.1.0`

---

## Cenário 2: Correção de Bug Urgente

Bug crítico encontrado em produção. Precisa de patch release.

```bash
# Corrigir o bug
git add src/shared/buggy-file.ts
git commit -m "fix: corrigir erro crítico no storage"

# Testar
npm test -- --run
npm run build

# Release patch (0.1.0 → 0.1.1)
npm run release:patch

# Push
git push --follow-tags origin main
```

**Resultado**:

- Versão: 0.1.0 → **0.1.1**
- CHANGELOG atualizado com seção "🐛 Correções de Bugs"

---

## Cenário 3: Nova Funcionalidade

Implementou uma nova feature completa.

```bash
# Vários commits da feature
git add src/shared/new-feature.ts
git commit -m "feat(storage): adicionar cache em memória"

git add src/shared/new-feature.test.ts
git commit -m "test(storage): adicionar testes para cache"

git add README.md
git commit -m "docs: documentar cache feature"

# Testar tudo
npm test -- --run
npm run build

# Preview do que será gerado
npx standard-version --dry-run

# Release minor (0.1.1 → 0.2.0)
npm run release:minor

# Ou deixar automático decidir
npm run release  # Também resultaria em minor por causa do "feat:"

# Push
git push --follow-tags origin main
```

**Resultado**:

- Versão: 0.1.1 → **0.2.0**
- CHANGELOG com seções:
  - ✨ Novos Recursos (feat)
  - ✅ Testes (test)
  - 📚 Documentação (docs)

---

## Cenário 4: Breaking Change

Refatoração que quebra compatibilidade.

```bash
# Refatoração com breaking change
git add src/shared/api.ts
git commit -m "feat!: refatorar API de storage para async/await

BREAKING CHANGE: Todos os métodos agora retornam Promise.
Substituir callbacks por async/await nas chamadas.

Antes:
  storage.load(key, (data) => { ... })

Depois:
  const data = await storage.load(key)"

# Criar migration guide
echo "## v1.0.0 Migration Guide..." > docs/MIGRATION_v1.md
git add docs/MIGRATION_v1.md
git commit -m "docs: adicionar guia de migração v1.0.0"

# Testar extensivamente
npm test -- --run
npm run build

# Release major (0.2.0 → 1.0.0)
npm run release:major

# Push
git push --follow-tags origin main

# Criar GitHub Release com warning
# https://github.com/CharllysFernandes/inVa/releases/new
# Tag: v1.0.0
# Title: v1.0.0 - Breaking Changes
# Description: [copiar CHANGELOG + link para migration guide]
```

**Resultado**:

- Versão: 0.2.0 → **1.0.0**
- CHANGELOG destaca breaking changes
- Migration guide disponível

---

## Cenário 5: Múltiplas Mudanças

Feature branch com vários tipos de commits.

```bash
# Criar feature branch
git checkout -b feat/performance-improvements

# Vários commits diferentes
git commit -m "perf(storage): otimizar leitura de cache"
git commit -m "perf(editor): reduzir chamadas ao DOM"
git commit -m "fix(popup): corrigir layout em mobile"
git commit -m "test: adicionar benchmark tests"
git commit -m "docs: atualizar performance tips"

# Merge para main
git checkout main
git merge feat/performance-improvements

# Ver o que será gerado
npx standard-version --dry-run

# Release automática
# standard-version analisa todos os commits e determina:
# - "perf:" → patch bump
# - "fix:" → patch bump
# - Resultado: 1.0.0 → 1.0.1
npm run release

# Push
git push --follow-tags origin main
```

**Resultado**:

- Versão: 1.0.0 → **1.0.1**
- CHANGELOG com seções:
  - ⚡ Melhorias de Performance
  - 🐛 Correções de Bugs
  - ✅ Testes
  - 📚 Documentação

---

## Cenário 6: Hotfix em Produção

Versão 1.0.1 está em produção com bug crítico.

```bash
# Partir da tag de produção
git checkout v1.0.1
git checkout -b hotfix/critical-bug

# Corrigir
git add src/content/critical-fix.ts
git commit -m "fix: corrigir memory leak no content script"

# Testar
npm test -- --run
npm run build

# Voltar para main e merge
git checkout main
git merge hotfix/critical-bug

# Release patch
npm run release:patch  # 1.0.1 → 1.0.2

# Push
git push --follow-tags origin main

# Deploy urgente da v1.0.2
```

---

## Cenário 7: Erro no Release (antes do push)

Você criou uma release mas percebeu um erro antes de fazer push.

```bash
# Ops, release com erro
npm run release
# Versão bumped para 1.0.3 mas há um erro no código

# Reverter release (ainda não fez push)
git reset --hard HEAD~1  # Remove commit de release
git tag -d v1.0.3        # Remove tag

# Corrigir o erro
git add src/fix.ts
git commit -m "fix: corrigir erro encontrado"

# Tentar release novamente
npm run release
# Agora sim, versão 1.0.3 correta

# Push
git push --follow-tags origin main
```

---

## Cenário 8: Desenvolvimento Paralelo

Múltiplos desenvolvedores trabalhando em features.

```bash
# Dev 1: Feature A
git checkout -b feat/feature-a
git commit -m "feat(popup): adicionar dark mode"
git checkout main

# Dev 2: Feature B
git checkout -b feat/feature-b
git commit -m "feat(storage): adicionar encryption"
git checkout main

# Merge feature A
git merge feat/feature-a

# Release 1.0.3 → 1.1.0
npm run release
git push --follow-tags origin main

# Merge feature B
git merge feat/feature-b

# Release 1.1.0 → 1.2.0
npm run release
git push --follow-tags origin main
```

**Resultado**:

- Cada feature gera sua própria minor release
- CHANGELOG organizado por versão
- Histórico limpo e rastreável

---

## Cenário 9: Pre-release / Beta

Testar versão antes de release oficial.

```bash
# Criar branch de release
git checkout -b release/v1.1.0

# Commits finais
git commit -m "chore: preparar release 1.1.0"

# Criar pre-release manual
npm version prerelease --preid=beta
# 1.0.3 → 1.0.4-beta.0

# Atualizar manifest.json manualmente
node scripts/sync-version.js

# Commit e tag
git add .
git commit -m "chore(release): 1.0.4-beta.0"
git tag v1.0.4-beta.0

# Push
git push origin release/v1.1.0
git push origin v1.0.4-beta.0

# Quando estiver pronto para release oficial
git checkout main
git merge release/v1.1.0
npm run release  # 1.0.4-beta.0 → 1.1.0
```

---

## Cenário 10: Sincronização após Pull

Outros desenvolvedores fizeram releases.

```bash
# Pull de mudanças
git pull origin main

# Ver novas tags
git tag --sort=-version:refname | head -5

# Ver changelog das novas versões
cat CHANGELOG.md

# Continuar desenvolvimento
git checkout -b feat/my-feature
# ... desenvolver ...
git commit -m "feat: minha nova feature"

# Merge e release
git checkout main
git merge feat/my-feature
npm run release
```

---

## 🎯 Dicas Práticas

### Sempre antes de release

```bash
# Checklist rápido
npm test -- --run && \
npm run typecheck && \
npm run build && \
npx standard-version --dry-run
```

### Ver próxima versão sem fazer release

```bash
npx standard-version --dry-run | grep "bumping version"
```

### Ver todos os commits desde última tag

```bash
git log $(git describe --tags --abbrev=0)..HEAD --oneline
```

### Comparar versões

```bash
# Ver diff entre duas tags
git diff v1.0.0..v1.1.0

# Ver changelog de versão específica
git show v1.1.0:CHANGELOG.md
```

### Automatizar checklist pré-release

Criar script `pre-release.sh`:

```bash
#!/bin/bash
set -e

echo "🧪 Running tests..."
npm test -- --run

echo "🔍 Type checking..."
npm run typecheck

echo "📦 Building..."
npm run build

echo "👀 Preview release..."
npx standard-version --dry-run

echo "✅ All checks passed! Ready for release."
echo "Run: npm run release"
```

Usar:

```bash
chmod +x pre-release.sh
./pre-release.sh
```

---

## 📊 Resumo de Comandos por Tipo

| Tipo de Mudança  | Commits  | Comando                 | Versão        |
| ---------------- | -------- | ----------------------- | ------------- |
| Bug fixes apenas | `fix:`   | `npm run release:patch` | 1.0.0 → 1.0.1 |
| Nova feature     | `feat:`  | `npm run release:minor` | 1.0.0 → 1.1.0 |
| Breaking change  | `feat!:` | `npm run release:major` | 1.0.0 → 2.0.0 |
| Múltiplos tipos  | Vários   | `npm run release`       | Automático    |
| Primeira versão  | -        | `npm run release:first` | Mantém versão |

---

## 🚦 Workflow Recomendado

```bash
# 1. Feature branch
git checkout -b feat/my-feature

# 2. Desenvolver com commits convencionais
git commit -m "feat: ..."
git commit -m "test: ..."
git commit -m "docs: ..."

# 3. Testes locais
npm test
npm run build

# 4. Merge para main
git checkout main
git merge feat/my-feature

# 5. Pre-release checklist
./pre-release.sh

# 6. Release
npm run release

# 7. Review
git show HEAD
cat CHANGELOG.md

# 8. Push
git push --follow-tags origin main

# 9. Deploy/Publish
# (manual ou CI/CD)
```

Pronto! Use estes exemplos como referência para seus workflows de release. 🚀
