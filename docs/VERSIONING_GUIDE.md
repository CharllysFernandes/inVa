# 🚀 Guia Rápido de Versionamento

## Fazendo commits

### Opção 1: Commit manual (formato convencional)

```bash
git commit -m "feat: adicionar nova funcionalidade"
git commit -m "fix: corrigir bug no storage"
git commit -m "docs: atualizar README"
```

### Opção 2: Com Commitizen (recomendado)

```bash
npm install -g commitizen
git add .
git cz
```

## Criando uma nova versão

### 1. Certifique-se que tudo está funcionando

```bash
npm test                    # Rodar testes
npm run typecheck          # Verificar tipos
npm run build              # Build de produção
```

### 2. Ver o que será feito (dry-run)

```bash
npx standard-version --dry-run
```

### 3. Criar a versão

```bash
npm run release            # Automático (recomendado)
# ou
npm run release:patch      # 0.1.0 → 0.1.1
npm run release:minor      # 0.1.0 → 0.2.0
npm run release:major      # 0.1.0 → 1.0.0
```

### 4. Fazer push

```bash
git push --follow-tags origin main
```

## O que cada comando faz?

### `npm run release`

1. Analisa commits desde a última tag
2. Determina versão automaticamente:
   - `feat:` → minor (0.1.0 → 0.2.0)
   - `fix:` → patch (0.1.0 → 0.1.1)
   - `BREAKING CHANGE:` → major (0.1.0 → 1.0.0)
3. Atualiza CHANGELOG.md
4. Atualiza package.json e manifest.json
5. Cria commit e tag

### `npm run release:patch/minor/major`

- Força um tipo específico de versão

## Exemplos de commits

```bash
# Novo recurso (minor: 0.1.0 → 0.2.0)
git commit -m "feat: adicionar suporte a dark mode"
git commit -m "feat(popup): adicionar botão de configurações"

# Correção de bug (patch: 0.1.0 → 0.1.1)
git commit -m "fix: corrigir erro ao salvar comentário vazio"
git commit -m "fix(storage): resolver problema de rate limiting"

# Breaking change (major: 0.1.0 → 1.0.0)
git commit -m "feat!: refatorar API de storage

BREAKING CHANGE: métodos agora retornam Promise ao invés de callback"

# Outros tipos (não afetam versão, mas aparecem no CHANGELOG)
git commit -m "docs: atualizar guia de instalação"
git commit -m "test: adicionar testes para rate limiter"
git commit -m "refactor: simplificar lógica de sincronização"
git commit -m "chore: atualizar dependências"
```

## Tipos de commit

| Tipo       | Descrição               | Bump de versão? |
| ---------- | ----------------------- | --------------- |
| `feat`     | Nova funcionalidade     | ✅ Minor        |
| `fix`      | Correção de bug         | ✅ Patch        |
| `perf`     | Melhoria de performance | ✅ Patch        |
| `refactor` | Refatoração             | ❌              |
| `docs`     | Documentação            | ❌              |
| `test`     | Testes                  | ❌              |
| `build`    | Build/CI                | ❌              |
| `chore`    | Manutenção              | ❌              |

**Nota**: Adicionar `!` após o tipo ou incluir `BREAKING CHANGE:` no corpo faz bump **major**.

## Fluxo completo

```bash
# 1. Fazer suas mudanças
git add src/shared/new-feature.ts

# 2. Commit seguindo convenção
git commit -m "feat(shared): adicionar cache de dados"

# 3. Mais commits...
git commit -m "fix(popup): corrigir layout mobile"
git commit -m "docs: atualizar README com novos recursos"

# 4. Quando estiver pronto para release
npm test && npm run build
npm run release

# 5. Push
git push --follow-tags origin main

# 6. (Opcional) Criar release no GitHub
# Vai para https://github.com/CharllysFernandes/inVa/releases
# Cria nova release baseada na tag v0.x.x
```

## Dicas

✅ **Faça**: Commits pequenos e frequentes com mensagens claras  
✅ **Faça**: Use scopes para organizar (`feat(storage)`, `fix(popup)`)  
✅ **Faça**: Teste antes de fazer release

❌ **Não faça**: Commits genéricos tipo "update" ou "fix stuff"  
❌ **Não faça**: Incluir múltiplas funcionalidades em um commit  
❌ **Não faça**: Release sem testar

## Troubleshooting

### "tag already exists"

```bash
git tag -d v0.x.x              # Remove tag local
git push origin :refs/tags/v0.x.x  # Remove tag remota
npm run release                # Tenta novamente
```

### Reverter release local (antes do push)

```bash
git reset --hard HEAD~1
git tag -d v0.x.x
```

### Ver últimas tags

```bash
git tag --sort=-version:refname | head -5
```

### Ver changelog de uma versão

```bash
git show v0.1.0:CHANGELOG.md
```
