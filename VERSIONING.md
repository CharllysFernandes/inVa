# 🔄 Versionamento Automático

Este projeto utiliza [standard-version](https://github.com/conventional-changelog/standard-version) para versionamento automático seguindo o [Semantic Versioning](https://semver.org/lang/pt-BR/).

## 📋 Conventional Commits

O projeto segue a convenção [Conventional Commits](https://www.conventionalcommits.org/pt-br/):

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé(s) opcional(is)]
```

### Tipos de Commit

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **perf**: Melhoria de performance
- **refactor**: Refatoração de código
- **docs**: Mudanças na documentação
- **test**: Adição ou correção de testes
- **build**: Mudanças no sistema de build ou dependências
- **chore**: Tarefas de manutenção

### Exemplos

```bash
# Nova funcionalidade (minor version bump)
git commit -m "feat: adicionar suporte a markdown nos comentários"

# Correção de bug (patch version bump)
git commit -m "fix: corrigir erro ao salvar comentários vazios"

# Breaking change (major version bump)
git commit -m "feat!: refatorar API de storage

BREAKING CHANGE: métodos load/save agora retornam Promise"

# Com escopo
git commit -m "feat(storage): adicionar rate limiting"
git commit -m "fix(popup): corrigir layout em telas pequenas"
```

## 🚀 Comandos de Release

### Release Automático (recomendado)

Analisa os commits desde a última tag e determina automaticamente o tipo de versão:

```bash
npm run release
```

### Release Manual

Especificar o tipo de versão manualmente:

```bash
# Patch (0.1.0 -> 0.1.1) - Correções de bugs
npm run release:patch

# Minor (0.1.0 -> 0.2.0) - Novas funcionalidades
npm run release:minor

# Major (0.1.0 -> 1.0.0) - Breaking changes
npm run release:major
```

### Primeira Release

Para criar a primeira versão sem bump:

```bash
npm run release:first
```

## 🔧 O que o comando faz?

Quando você executa `npm run release`, o standard-version:

1. ✅ **Analisa os commits** desde a última tag
2. 📊 **Determina a nova versão** baseado nos commits
3. 📝 **Atualiza o CHANGELOG.md** com as mudanças
4. 🔄 **Atualiza package.json** com a nova versão
5. 🔄 **Atualiza manifest.json** (via script sync-version.js)
6. 📦 **Cria um commit de release**
7. 🏷️ **Cria uma tag git** com a nova versão

## 📤 Publicar a Release

Após executar o comando de release, você precisa fazer push das mudanças e tags:

```bash
# Push do commit e tags
git push --follow-tags origin main
```

## 🔍 Verificar Versão

Para ver qual será a próxima versão sem fazer mudanças:

```bash
npx standard-version --dry-run
```

## 📚 Estrutura de Arquivos

- **`.versionrc.json`**: Configuração do standard-version
- **`scripts/sync-version.js`**: Script para sincronizar versão entre package.json e manifest.json
- **`CHANGELOG.md`**: Histórico de mudanças gerado automaticamente

## 🎯 Fluxo de Trabalho Recomendado

1. Fazer commits seguindo Conventional Commits:

   ```bash
   git add .
   git commit -m "feat: adicionar nova funcionalidade"
   ```

2. Quando estiver pronto para release:

   ```bash
   npm test              # Garantir que testes passam
   npm run build         # Garantir que build funciona
   npm run release       # Criar release
   ```

3. Fazer push:

   ```bash
   git push --follow-tags origin main
   ```

4. (Opcional) Criar GitHub Release baseado na tag

## 🛠️ Troubleshooting

### Erro: "tag already exists"

Se uma tag já existe, você pode forçar uma nova release:

```bash
npx standard-version --release-as patch
```

### Erro ao sincronizar manifest.json

O script `sync-version.js` garante que package.json e manifest.json tenham sempre a mesma versão. Se houver erro, verifique:

- Permissões de escrita nos arquivos
- Sintaxe JSON válida em ambos arquivos

### Reverter uma release

Se você criou uma release por engano (antes de fazer push):

```bash
git reset --hard HEAD~1
git tag -d v0.x.x
```

## 📖 Referências

- [Semantic Versioning](https://semver.org/lang/pt-BR/)
- [Conventional Commits](https://www.conventionalcommits.org/pt-br/)
- [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
- [standard-version](https://github.com/conventional-changelog/standard-version)
