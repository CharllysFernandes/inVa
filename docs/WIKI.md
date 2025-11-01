# 📚 Documentação Wiki

A documentação completa da extensão inVa está disponível na Wiki do GitHub.

## 🔗 Acessar a Wiki

**Link principal**: https://github.com/CharllysFernandes/inVa/wiki

## 📖 Páginas Disponíveis

### Para Usuários

| Página         | Descrição                         | Link Direto                                                                |
| -------------- | --------------------------------- | -------------------------------------------------------------------------- |
| **Home**       | Página inicial com visão geral    | [🏠 Home](https://github.com/CharllysFernandes/inVa/wiki/Home)             |
| **Instalação** | Guia completo de instalação       | [📥 Instalação](https://github.com/CharllysFernandes/inVa/wiki/Instalação) |
| **Como Usar**  | Guia de uso com exemplos práticos | [📖 Como Usar](https://github.com/CharllysFernandes/inVa/wiki/Como-Usar)   |
| **FAQ**        | Perguntas frequentes              | [❓ FAQ](https://github.com/CharllysFernandes/inVa/wiki/FAQ)               |

### Páginas Futuras (Planejadas)

- **Configuração** - Detalhes de configuração avançada
- **Troubleshooting** - Solução de problemas comuns
- **Desenvolvimento** - Setup do ambiente de desenvolvimento
- **Arquitetura** - Estrutura e design do projeto
- **Testes** - Guia de testes
- **Build e Release** - Processo de build e publicação
- **Contribuindo** - Como contribuir com o projeto
- **Segurança** - Políticas de segurança (CSP)
- **API Reference** - Referência da API interna
- **Versionamento** - Sistema de versionamento

## 🛠️ Manutenção da Wiki

### Clonar Repositório da Wiki

```bash
git clone https://github.com/CharllysFernandes/inVa.wiki.git
```

### Adicionar Nova Página

1. Clone o repositório da Wiki (se ainda não fez)
2. Crie um novo arquivo `.md` na raiz
3. Escreva o conteúdo em Markdown
4. Commit e push:

```bash
cd inVa.wiki
git add Nome-Da-Pagina.md
git commit -m "docs: adicionar página Nome Da Página"
git push origin master
```

### Editar Página Existente

```bash
cd inVa.wiki
# Edite o arquivo desejado
git add Pagina-Modificada.md
git commit -m "docs: atualizar página X"
git push origin master
```

### Convenções de Nomenclatura

- Use **PascalCase** com hífens para nomes de arquivos: `Como-Usar.md`
- Use caracteres acentuados normalmente: `Instalação.md`
- O título da página deve estar no início do arquivo como `# Título`

### Formato de Links Internos

Para linkar páginas da Wiki entre si:

```markdown
[[Nome da Página|Nome-Da-Pagina]]
[[Instalação|Instalação]]
[[Como Usar|Como-Usar]]
```

## 📝 Conteúdo Atual

### Home.md

- Introdução à extensão
- Links rápidos para todas as seções
- Aviso legal sobre InvGate
- Status do projeto
- Links da comunidade

### Instalação.md

- Pré-requisitos
- Instalação via loja (futuro)
- Instalação manual (desenvolvedor)
  - Download do release
  - Clonar repositório
- Instruções para Chrome e Edge
- Verificação da instalação
- Atualização e desinstalação
- Troubleshooting de instalação

### Como-Usar.md

- Visão geral das funcionalidades
- Usando o painel de comentários
  - Acessar painel
  - Salvar rascunhos
  - Sincronização automática
  - Limpeza automática
- Usando o popup
  - Informações da extensão
  - Configuração de URL
  - Ferramentas de diagnóstico
- Fluxos de trabalho típicos
- Configuração avançada
- Interface do painel
- Dicas e truques
- Problemas comuns

### FAQ.md

- Instalação e Configuração (3 perguntas)
- Segurança e Privacidade (3 perguntas)
- Funcionalidades (5 perguntas)
- Atualizações e Manutenção (3 perguntas)
- Problemas e Suporte (3 perguntas)
- Para Desenvolvedores (4 perguntas)
- Dados e Storage (3 perguntas)
- Compatibilidade (3 perguntas)
- Outros (3 perguntas)

**Total**: 33 perguntas e respostas

## 🎯 Roadmap de Documentação

### Fase 1: Básico (✅ Concluído)

- [x] Home
- [x] Instalação
- [x] Como Usar
- [x] FAQ

### Fase 2: Usuário Avançado (Planejado)

- [ ] Configuração
- [ ] Troubleshooting
- [ ] Screenshots e GIFs

### Fase 3: Desenvolvedor (Planejado)

- [ ] Desenvolvimento
- [ ] Arquitetura
- [ ] Testes
- [ ] Build e Release
- [ ] Contribuindo

### Fase 4: Referência Técnica (Planejado)

- [ ] Segurança
- [ ] API Reference
- [ ] Versionamento
- [ ] Changelog integrado

## 💡 Dicas para Escrever na Wiki

### Boas Práticas

- ✅ Use emojis para melhor visual (mas não exagere)
- ✅ Inclua exemplos de código quando relevante
- ✅ Adicione links para issues/discussions quando aplicável
- ✅ Mantenha o tom amigável e acessível
- ✅ Use tabelas para comparações e listas organizadas
- ✅ Inclua avisos (⚠️) para informações importantes
- ✅ Adicione "Próximos passos" ao final de cada página

### Estrutura Recomendada

```markdown
# 🎯 Título da Página

Breve introdução sobre o que a página cobre.

## Seção Principal 1

Conteúdo...

### Subseção 1.1

Detalhes...

## Seção Principal 2

Conteúdo...

## Links Relacionados

- [[Outra Página|Outra-Pagina]]
- [Link Externo](https://exemplo.com)

---

**Dúvidas?** Consulte a [[FAQ|FAQ]].
```

## 📊 Estatísticas

- **Páginas criadas**: 4
- **Linhas de documentação**: ~575
- **Tempo de criação**: 1 sessão
- **Última atualização**: 31 de outubro de 2025

## 🔗 Links Úteis

- [Wiki Principal](https://github.com/CharllysFernandes/inVa/wiki)
- [Editar Wiki (requer clone)](https://github.com/CharllysFernandes/inVa.wiki.git)
- [Markdown Guide](https://guides.github.com/features/mastering-markdown/)
- [GitHub Wiki Docs](https://docs.github.com/en/communities/documenting-your-project-with-wikis)

---

**Contribua!** A Wiki é colaborativa. Sinta-se à vontade para sugerir melhorias ou adicionar conteúdo através de [Discussions](https://github.com/CharllysFernandes/inVa/discussions).
