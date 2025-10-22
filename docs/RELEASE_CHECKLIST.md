# ✅ Checklist de Release

Use este checklist antes de criar uma nova versão para garantir qualidade.

## Pré-Release

### 🧪 Testes

- [ ] Todos os testes passando: `npm test -- --run`
- [ ] Coverage adequado: `npm run test:coverage`
- [ ] Testes manuais na extensão carregada

### 🔍 Qualidade de Código

- [ ] TypeScript sem erros: `npm run typecheck`
- [ ] Build de produção funciona: `npm run build`
- [ ] Sem console.logs desnecessários
- [ ] Código revisado e refatorado

### 📚 Documentação

- [ ] README atualizado com novas funcionalidades
- [ ] JSDoc atualizado em funções modificadas
- [ ] TESTING.md atualizado se necessário
- [ ] Comentários de código claros

### 🔐 Segurança e Permissões

- [ ] Nenhuma informação sensível no código
- [ ] Permissões no manifest.json justificadas
- [ ] Dependências atualizadas: `npm audit`

## Durante Release

### 📝 Commits

- [ ] Commits seguem Conventional Commits
- [ ] Mensagens de commit são claras e descritivas
- [ ] Commits relacionados agrupados

### 🏷️ Versionamento

- [ ] Dry-run executado: `npx standard-version --dry-run`
- [ ] Tipo de versão correto (patch/minor/major)
- [ ] CHANGELOG gerado corretamente
- [ ] package.json e manifest.json sincronizados

### 🚀 Execução

```bash
# 1. Verificar tudo
npm test -- --run
npm run typecheck
npm run build

# 2. Dry-run para preview
npx standard-version --dry-run

# 3. Criar release
npm run release  # ou release:patch/minor/major

# 4. Revisar mudanças
git show HEAD
cat CHANGELOG.md

# 5. Push
git push --follow-tags origin main
```

## Pós-Release

### 📦 Distribuição

- [ ] Tag criada e pushed no GitHub
- [ ] GitHub Release criada (opcional)
- [ ] Versão testada localmente antes de publicar

### 📢 Comunicação

- [ ] Changelog revisado e legível
- [ ] Breaking changes documentadas
- [ ] Migration guide criado (se necessário)

### 🔄 Preparação para Próxima

- [ ] Branch main atualizada
- [ ] Issues relacionadas fechadas
- [ ] Próximos passos documentados

## Tipos de Release

### 🐛 Patch (0.1.0 → 0.1.1)

**Quando usar**: Correções de bugs, pequenas melhorias

**Checklist adicional**:

- [ ] Bug corrigido está testado
- [ ] Não quebra nenhuma funcionalidade existente
- [ ] Pode ser aplicado sem mudanças no código do usuário

### ✨ Minor (0.1.0 → 0.2.0)

**Quando usar**: Novas funcionalidades, melhorias significativas

**Checklist adicional**:

- [ ] Nova funcionalidade está completamente testada
- [ ] Documentação da nova funcionalidade criada
- [ ] Backwards compatible (não quebra código existente)
- [ ] Exemplos de uso fornecidos

### 💥 Major (0.1.0 → 1.0.0)

**Quando usar**: Breaking changes, mudanças na API

**Checklist adicional**:

- [ ] Breaking changes documentadas no CHANGELOG
- [ ] Migration guide criado
- [ ] Deprecation warnings adicionados (se aplicável)
- [ ] Todos os testes atualizados
- [ ] README atualizado com nova API

## Comandos Úteis

```bash
# Ver commits desde última tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline

# Ver diff desde última tag
git diff $(git describe --tags --abbrev=0)

# Ver todas as tags
git tag -l

# Ver detalhes de uma tag
git show v0.1.0

# Testar build da extensão
cd dist && ls -la

# Verificar tamanho dos arquivos
du -sh dist/*

# Contar linhas de código
find src -name '*.ts' | xargs wc -l
```

## Exemplo de Fluxo Completo

```bash
# 1. Feature branch
git checkout -b feat/new-feature
# ... trabalhar na feature ...
git commit -m "feat: adicionar nova funcionalidade"

# 2. Voltar para main
git checkout main
git merge feat/new-feature

# 3. Checklist pré-release
npm test -- --run          # ✅ Todos passam
npm run typecheck          # ✅ Sem erros
npm run build              # ✅ Build OK
npm audit                  # ✅ Sem vulnerabilidades

# 4. Dry-run
npx standard-version --dry-run
# Revisar output: versão 0.1.0 → 0.2.0

# 5. Release real
npm run release

# 6. Revisar
git show HEAD              # Ver commit de release
cat CHANGELOG.md           # Ver changelog gerado

# 7. Push
git push --follow-tags origin main

# 8. Criar GitHub Release
# GitHub → Releases → Create new release → v0.2.0
# Copiar conteúdo relevante do CHANGELOG.md

# 9. Testar versão publicada
git clone https://github.com/CharllysFernandes/inVa.git temp-test
cd temp-test
npm install
npm run build
# Carregar dist/ na extensão
```

## ⚠️ Problemas Comuns

### Commit de release foi criado mas não foi pushed

```bash
# Se algo deu errado antes do push
git push --follow-tags origin main
```

### Tag foi criada errada

```bash
# Remover tag local
git tag -d v0.x.x

# Remover tag remota (se já foi pushed)
git push origin :refs/tags/v0.x.x

# Reverter commit de release
git reset --hard HEAD~1

# Tentar novamente
npm run release
```

### CHANGELOG está bagunçado

```bash
# Editar manualmente CHANGELOG.md
git add CHANGELOG.md
git commit --amend --no-edit
```

### Esqueci de rodar testes antes de release

```bash
# Se ainda não fez push
git reset --hard HEAD~1
git tag -d v0.x.x

# Rodar testes
npm test -- --run

# Tentar release novamente
npm run release
```

## 📊 Métricas de Qualidade

Antes de cada release, verificar:

- **Cobertura de Testes**: > 80%
- **Tamanho do Bundle**: contentScript.js < 150KB
- **Tempo de Build**: < 15 segundos
- **Erros TypeScript**: 0
- **Vulnerabilidades**: 0 high/critical
- **Testes Passando**: 100%

```bash
# Verificar cobertura
npm run test:coverage

# Verificar tamanho do bundle
ls -lh dist/*.js

# Verificar vulnerabilidades
npm audit --production
```

---

**Lembre-se**: É melhor fazer releases pequenas e frequentes do que grandes e raras! 🚀
