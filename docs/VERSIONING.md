# 🔄 Guia Completo de Versionamento# 🔄 Versionamento Automático

Este projeto utiliza [standard-version](https://github.com/conventional-changelog/standard-version) para versionamento automático seguindo o [Semantic Versioning](https://semver.org/lang/pt-BR/).Este projeto utiliza [standard-version](https://github.com/conventional-changelog/standard-version) para versionamento automático seguindo o [Semantic Versioning](https://semver.org/lang/pt-BR/).

## 📋 Índice## 📋 Conventional Commits

- [Conventional Commits](#-conventional-commits)O projeto segue a convenção [Conventional Commits](https://www.conventionalcommits.org/pt-br/):

- [Comandos de Release](#-comandos-de-release)

- [Fluxo de Trabalho](#-fluxo-de-trabalho-recomendado)```

- [Exemplos Práticos](#-exemplos-práticos)<tipo>[escopo opcional]: <descrição>

- [Troubleshooting](#-troubleshooting)

[corpo opcional]

## 📝 Conventional Commits

[rodapé(s) opcional(is)]

O projeto segue a convenção [Conventional Commits](https://www.conventionalcommits.org/pt-br/):```

````### Tipos de Commit

<tipo>[escopo opcional]: <descrição>

- **feat**: Nova funcionalidade

[corpo opcional]- **fix**: Correção de bug

- **perf**: Melhoria de performance

[rodapé(s) opcional(is)]- **refactor**: Refatoração de código

```- **docs**: Mudanças na documentação

- **test**: Adição ou correção de testes

### Tipos de Commit- **build**: Mudanças no sistema de build ou dependências

- **chore**: Tarefas de manutenção

| Tipo       | Descrição               | Bump de versão? |

| ---------- | ----------------------- | --------------- |### Exemplos

| `feat`     | Nova funcionalidade     | ✅ Minor        |

| `fix`      | Correção de bug         | ✅ Patch        |```bash

| `perf`     | Melhoria de performance | ✅ Patch        |# Nova funcionalidade (minor version bump)

| `refactor` | Refatoração             | ❌              |git commit -m "feat: adicionar suporte a markdown nos comentários"

| `docs`     | Documentação            | ❌              |

| `test`     | Testes                  | ❌              |# Correção de bug (patch version bump)

| `build`    | Build/CI                | ❌              |git commit -m "fix: corrigir erro ao salvar comentários vazios"

| `chore`    | Manutenção              | ❌              |

# Breaking change (major version bump)

**Nota**: Adicionar `!` após o tipo ou incluir `BREAKING CHANGE:` no corpo faz bump **major**.git commit -m "feat!: refatorar API de storage



### Exemplos de CommitsBREAKING CHANGE: métodos load/save agora retornam Promise"



```bash# Com escopo

# Nova funcionalidade (minor: 0.1.0 → 0.2.0)git commit -m "feat(storage): adicionar rate limiting"

git commit -m "feat: adicionar suporte a markdown nos comentários"git commit -m "fix(popup): corrigir layout em telas pequenas"

git commit -m "feat(popup): adicionar botão de configurações"```



# Correção de bug (patch: 0.1.0 → 0.1.1)## 🚀 Comandos de Release

git commit -m "fix: corrigir erro ao salvar comentários vazios"

git commit -m "fix(storage): resolver problema de rate limiting"### Release Automático (recomendado)



# Breaking change (major: 0.1.0 → 1.0.0)Analisa os commits desde a última tag e determina automaticamente o tipo de versão:

git commit -m "feat!: refatorar API de storage

```bash

BREAKING CHANGE: Todos os métodos agora retornam Promise.npm run release

Substituir callbacks por async/await nas chamadas.```



Antes:### Release Manual

  storage.load(key, (data) => { ... })

Especificar o tipo de versão manualmente:

Depois:

  const data = await storage.load(key)"```bash

# Patch (0.1.0 -> 0.1.1) - Correções de bugs

# Outros tipos (aparecem no CHANGELOG mas não fazem bump)npm run release:patch

git commit -m "docs: atualizar guia de instalação"

git commit -m "test: adicionar testes para rate limiter"# Minor (0.1.0 -> 0.2.0) - Novas funcionalidades

git commit -m "refactor: simplificar lógica de sincronização"npm run release:minor

git commit -m "chore: atualizar dependências"

```# Major (0.1.0 -> 1.0.0) - Breaking changes

npm run release:major

## 🚀 Comandos de Release```



### Release Automático (recomendado)### Primeira Release



Analisa os commits desde a última tag e determina automaticamente o tipo de versão:Para criar a primeira versão sem bump:



```bash```bash

npm run releasenpm run release:first

````

### Release Manual## 🔧 O que o comando faz?

Especificar o tipo de versão manualmente:Quando você executa `npm run release`, o standard-version:

```bash1. ✅ **Analisa os commits** desde a última tag

# Patch (0.1.0 → 0.1.1) - Correções de bugs2. 📊 **Determina a nova versão** baseado nos commits

npm run release:patch3. 📝 **Atualiza o CHANGELOG.md** com as mudanças

4. 🔄 **Atualiza package.json** com a nova versão

# Minor (0.1.0 → 0.2.0) - Novas funcionalidades5. 🔄 **Atualiza manifest.json** (via script sync-version.js)

npm run release:minor6. 📦 **Cria um commit de release**

7. 🏷️ **Cria uma tag git** com a nova versão

# Major (0.1.0 → 1.0.0) - Breaking changes

npm run release:major## 📤 Publicar a Release

```

Após executar o comando de release, você precisa fazer push das mudanças e tags:

### Primeira Release

````bash

Para criar a primeira versão sem bump:# Push do commit e tags

git push --follow-tags origin main

```bash```

npm run release:first

```## 🔍 Verificar Versão



### Preview (Dry-run)Para ver qual será a próxima versão sem fazer mudanças:



Ver o que será feito sem fazer mudanças:```bash

npx standard-version --dry-run

```bash```

npx standard-version --dry-run

```## 📚 Estrutura de Arquivos



## 🔧 O que o comando faz?- **`.versionrc.json`**: Configuração do standard-version

- **`scripts/sync-version.js`**: Script para sincronizar versão entre package.json e manifest.json

Quando você executa `npm run release`, o standard-version:- **`CHANGELOG.md`**: Histórico de mudanças gerado automaticamente



1. ✅ **Analisa os commits** desde a última tag## 🎯 Fluxo de Trabalho Recomendado

2. 📊 **Determina a nova versão** baseado nos commits

3. 📝 **Atualiza o CHANGELOG.md** com as mudanças1. Fazer commits seguindo Conventional Commits:

4. 🔄 **Atualiza package.json** com a nova versão

5. 🔄 **Atualiza manifest.json** (via script sync-version.js)   ```bash

6. 📦 **Cria um commit de release**   git add .

7. 🏷️ **Cria uma tag git** com a nova versão   git commit -m "feat: adicionar nova funcionalidade"

````

## 📤 Publicar a Release

2. Quando estiver pronto para release:

Após executar o comando de release, você precisa fazer push das mudanças e tags:

````bash

```bash   npm test              # Garantir que testes passam

# Push do commit e tags   npm run build         # Garantir que build funciona

git push --follow-tags origin main   npm run release       # Criar release

```   ```



## 🎯 Fluxo de Trabalho Recomendado3. Fazer push:



### Desenvolvimento diário   ```bash

git push --follow-tags origin main

```bash   ```

# 1. Feature branch

git checkout -b feat/my-feature4. (Opcional) Criar GitHub Release baseado na tag



# 2. Desenvolver com commits convencionais## 🛠️ Troubleshooting

git commit -m "feat: adicionar nova funcionalidade"

git commit -m "test: adicionar testes unitários"### Erro: "tag already exists"

git commit -m "docs: atualizar documentação"

Se uma tag já existe, você pode forçar uma nova release:

# 3. Testes locais

npm test```bash

npm run buildnpx standard-version --release-as patch

````

# 4. Merge para main

git checkout main### Erro ao sincronizar manifest.json

git merge feat/my-feature

```O script `sync-version.js` garante que package.json e manifest.json tenham sempre a mesma versão. Se houver erro, verifique:

### Criando um release- Permissões de escrita nos arquivos

- Sintaxe JSON válida em ambos arquivos

````bash

# 1. Garantir que tudo está funcionando### Reverter uma release

npm test              # Testes passam

npm run typecheck     # Sem erros TypeScriptSe você criou uma release por engano (antes de fazer push):

npm run build         # Build funciona

```bash

# 2. Preview do releasegit reset --hard HEAD~1

npx standard-version --dry-rungit tag -d v0.x.x

````

# 3. Criar release

npm run release # Automático## 📖 Referências

# 4. Revisar mudanças- [Semantic Versioning](https://semver.org/lang/pt-BR/)

git show HEAD- [Conventional Commits](https://www.conventionalcommits.org/pt-br/)

cat CHANGELOG.md- [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)

- [standard-version](https://github.com/conventional-changelog/standard-version)

# 5. Fazer push

git push --follow-tags origin main

# 6. (Opcional) Criar GitHub Release

# https://github.com/CharllysFernandes/inVa/releases

````

## 💡 Exemplos Práticos

### Cenário 1: Correção de Bug Urgente

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
````

### Cenário 2: Nova Funcionalidade

```bash
# Vários commits da feature
git commit -m "feat(storage): adicionar cache em memória"
git commit -m "test(storage): adicionar testes para cache"
git commit -m "docs: documentar cache feature"

# Testar
npm test -- --run
npm run build

# Preview
npx standard-version --dry-run

# Release minor (0.1.1 → 0.2.0)
npm run release

# Push
git push --follow-tags origin main
```

### Cenário 3: Breaking Change

```bash
# Refatoração com breaking change
git commit -m "feat!: refatorar API de storage para async/await

BREAKING CHANGE: Todos os métodos agora retornam Promise.
Substituir callbacks por async/await nas chamadas."

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
```

### Cenário 4: Múltiplas Mudanças

```bash
# Vários commits diferentes
git commit -m "perf(storage): otimizar leitura de cache"
git commit -m "perf(editor): reduzir chamadas ao DOM"
git commit -m "fix(popup): corrigir layout em mobile"
git commit -m "test: adicionar benchmark tests"

# Ver preview
npx standard-version --dry-run

# Release automática
npm run release  # Resultado: patch bump

# Push
git push --follow-tags origin main
```

## 🛠️ Troubleshooting

### Erro: "tag already exists"

```bash
# Remover tag local
git tag -d v0.x.x

# Remover tag remota (se já foi pushed)
git push origin :refs/tags/v0.x.x

# Tentar novamente
npm run release
```

### Reverter release (antes do push)

Se você criou uma release mas percebeu um erro antes de fazer push:

```bash
# Reverter commit e tag
git reset --hard HEAD~1
git tag -d v0.x.x

# Corrigir o problema
git add src/fix.ts
git commit -m "fix: corrigir problema"

# Tentar release novamente
npm run release
```

### Erro ao sincronizar manifest.json

O script `sync-version.js` garante que package.json e manifest.json tenham sempre a mesma versão. Se houver erro, verifique:

- Permissões de escrita nos arquivos
- Sintaxe JSON válida em ambos arquivos

### CHANGELOG está bagunçado

```bash
# Editar manualmente CHANGELOG.md
vim CHANGELOG.md

# Emendar commit de release
git add CHANGELOG.md
git commit --amend --no-edit
```

## 🔍 Comandos Úteis

### Ver commits desde última tag

```bash
git log $(git describe --tags --abbrev=0)..HEAD --oneline
```

### Ver diff desde última tag

```bash
git diff $(git describe --tags --abbrev=0)
```

### Ver todas as tags

```bash
git tag --sort=-version:refname | head -5
```

### Ver próxima versão sem criar release

```bash
npx standard-version --dry-run | grep "bumping version"
```

### Ver tamanho do bundle

```bash
npm run build
ls -lh dist/*.js
```

## 📚 Estrutura de Arquivos

- **`.versionrc.json`**: Configuração do standard-version
- **`scripts/sync-version.js`**: Script para sincronizar versão entre package.json e manifest.json
- **`CHANGELOG.md`**: Histórico de mudanças gerado automaticamente
- **`package.json`**: Scripts de release e versão

## 📖 Referências

- [Semantic Versioning](https://semver.org/lang/pt-BR/)
- [Conventional Commits](https://www.conventionalcommits.org/pt-br/)
- [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
- [standard-version](https://github.com/conventional-changelog/standard-version)

## ✅ Checklist Pré-Release

Antes de cada release, verificar:

- [ ] Todos os testes passando: `npm test -- --run`
- [ ] TypeScript sem erros: `npm run typecheck`
- [ ] Build de produção funciona: `npm run build`
- [ ] Commits seguem Conventional Commits
- [ ] Dry-run executado: `npx standard-version --dry-run`
- [ ] CHANGELOG revisado
- [ ] Documentação atualizada

Consulte [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) para checklist completo.

## 🎓 Dicas

✅ **Faça**: Commits pequenos e frequentes com mensagens claras  
✅ **Faça**: Use scopes para organizar (`feat(storage)`, `fix(popup)`)  
✅ **Faça**: Teste antes de fazer release

❌ **Não faça**: Commits genéricos tipo "update" ou "fix stuff"  
❌ **Não faça**: Incluir múltiplas funcionalidades em um commit  
❌ **Não faça**: Release sem testar

---

**Pronto para começar!** Use `npm run release` quando estiver pronto para criar uma nova versão. 🚀
