# 📚 Documentação do Projeto inVa

Esta pasta contém toda a documentação técnica do projeto.

## 📋 Índice de Documentos

### 🔒 Segurança

- **[CONTENT_SECURITY_POLICY.md](./CONTENT_SECURITY_POLICY.md)** - Implementação e detalhes da Content Security Policy
- **[SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)** - Checklist de segurança para desenvolvimento

### 🧪 Testes e Qualidade

- **[TESTING.md](./TESTING.md)** - Guia completo de testes unitários e cobertura

### 🚀 Release e Versionamento

- **[VERSIONING.md](./VERSIONING.md)** - Guia completo de versionamento automático com conventional commits
- **[RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)** - Checklist completo para releases

## 🗂️ Organização

Cada documento foi criado com um propósito específico:

| Documento                    | Propósito                                    | Quando Consultar                 |
| ---------------------------- | -------------------------------------------- | -------------------------------- |
| `CONTENT_SECURITY_POLICY.md` | Entender e manter a CSP da extensão          | Ao adicionar scripts ou recursos |
| `SECURITY_CHECKLIST.md`      | Garantir práticas de código seguro           | Antes de commits e code reviews  |
| `TESTING.md`                 | Criar e executar testes                      | Ao adicionar funcionalidades     |
| `VERSIONING.md`              | Criar releases e seguir conventional commits | Ao fazer commits e releases      |
| `RELEASE_CHECKLIST.md`       | Processo completo de release                 | Antes e durante cada release     |

## 🔍 Guia Rápido por Tarefa

### Você quer adicionar uma nova funcionalidade?

1. Leia [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) - Práticas seguras
2. Desenvolva seguindo [CONTENT_SECURITY_POLICY.md](./CONTENT_SECURITY_POLICY.md) - Restrições de CSP
3. Adicione testes conforme [TESTING.md](./TESTING.md)
4. Faça commit seguindo [VERSIONING.md](./VERSIONING.md) - Conventional commits

### Você quer fazer um release?

1. Siga [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) - Checklist completo
2. Use [VERSIONING.md](./VERSIONING.md) - Comandos de release

### Você encontrou um problema de segurança?

1. Consulte [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) - Verificações
2. Revise [CONTENT_SECURITY_POLICY.md](./CONTENT_SECURITY_POLICY.md) - Políticas

### Você precisa adicionar testes?

1. Consulte [TESTING.md](./TESTING.md) - Estrutura e exemplos
2. Execute `npm test` para validar

## 📖 Documentação Externa

A documentação principal do usuário está em:

- **[README.md](../README.md)** - Raiz do projeto, guia de instalação e uso

## 🛠️ Manutenção desta Documentação

Ao atualizar a documentação:

- ✅ Mantenha exemplos práticos e atualizados
- ✅ Use formatação Markdown consistente
- ✅ Inclua tabelas e checklists quando útil
- ✅ Adicione emojis para facilitar navegação
- ✅ Mantenha este índice atualizado

## 📝 Histórico de Mudanças

Para ver o histórico de mudanças do projeto:

- **[CHANGELOG.md](../CHANGELOG.md)** - Changelog gerado automaticamente

---

**Última atualização:** 31 de outubro de 2025
