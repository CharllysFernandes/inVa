# 🔧 Scripts do Projeto

Esta pasta contém scripts auxiliares para automatizar tarefas do projeto.

## 📋 Scripts Disponíveis

### 1. prepare-release.js

**Propósito**: Prepara release completo para publicação no GitHub

**Uso**:

```bash
npm run prepare:release
```

**O que faz**:

- ✅ Valida versões (package.json ↔ manifest.json)
- ✅ Verifica status do Git
- ✅ Executa testes completos
- ✅ Valida segurança (CSP)
- ✅ Cria build de produção
- ✅ Gera arquivo ZIP para distribuição
- ✅ Cria release notes automáticas

**Saída**:

- `releases/inVa-vX.X.X.zip` - Arquivo para publicação
- `releases/release-vX.X.X.md` - Notas de release

**Documentação**: [docs/BUILD_AND_RELEASE.md](../docs/BUILD_AND_RELEASE.md)

---

### 2. sync-version.js

**Propósito**: Sincroniza versão entre package.json e manifest.json

**Uso**:

```bash
node scripts/sync-version.js
```

**O que faz**:

- Lê versão do package.json
- Atualiza manifest.json com a mesma versão
- Executa automaticamente após `npm run release`

**Quando usar**:

- Após atualizar manualmente a versão
- Se versions ficarem dessincronizadas
- É chamado automaticamente pelo standard-version

---

### 3. validate-csp.js

**Propósito**: Valida Content Security Policy e práticas de segurança

**Uso**:

```bash
npm run test:security
```

**O que faz**:

- Valida CSP no manifest.json
- Verifica ausência de scripts inline
- Detecta event handlers inline
- Busca por padrões inseguros (eval, innerHTML, etc.)

**Documentação**: [docs/SECURITY_CHECKLIST.md](../docs/SECURITY_CHECKLIST.md)

---

## 🚀 Workflows Comuns

### Criar uma nova release

```bash
# 1. Criar versão
npm run release

# 2. Preparar release
npm run prepare:release

# 3. Push
git push --follow-tags origin main

# 4. Publicar no GitHub (manual)
```

### Sincronizar versões manualmente

```bash
node scripts/sync-version.js
```

### Validar segurança

```bash
npm run test:security
```

## 📚 Referências

- [BUILD_AND_RELEASE.md](../docs/BUILD_AND_RELEASE.md) - Guia completo de release
- [VERSIONING.md](../docs/VERSIONING.md) - Guia de versionamento
- [SECURITY_CHECKLIST.md](../docs/SECURITY_CHECKLIST.md) - Checklist de segurança

## 🛠️ Desenvolvimento

### Adicionar novo script

1. Crie arquivo `.js` nesta pasta
2. Adicione header de documentação
3. Torne executável: `chmod +x scripts/nome-do-script.js`
4. Adicione entrada no `package.json` scripts
5. Documente aqui neste README

### Convenções

- Use Node.js puro (sem deps externas quando possível)
- Adicione comentários e logs claros
- Trate erros apropriadamente
- Use `process.exit(1)` para falhas
- Adicione cores no output para melhor UX

---

**Última atualização:** 31 de outubro de 2025
