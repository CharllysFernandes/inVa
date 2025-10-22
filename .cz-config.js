// Configuração para Commitizen
// Ajuda a criar commits no formato Conventional Commits

module.exports = {
  types: [
    { value: 'feat', name: 'feat:     ✨ Nova funcionalidade' },
    { value: 'fix', name: 'fix:      🐛 Correção de bug' },
    { value: 'perf', name: 'perf:     ⚡ Melhoria de performance' },
    { value: 'refactor', name: 'refactor: ♻️  Refatoração de código' },
    { value: 'docs', name: 'docs:     📚 Documentação' },
    { value: 'test', name: 'test:     ✅ Testes' },
    { value: 'build', name: 'build:    🔧 Build/CI' },
    { value: 'chore', name: 'chore:    🔨 Manutenção' },
    { value: 'style', name: 'style:    💄 Formatação' },
    { value: 'ci', name: 'ci:       👷 CI/CD' },
    { value: 'revert', name: 'revert:   ⏪ Reverter commit' }
  ],

  scopes: [
    { name: 'storage' },
    { name: 'popup' },
    { name: 'content' },
    { name: 'background' },
    { name: 'editor' },
    { name: 'logger' },
    { name: 'tests' },
    { name: 'build' },
    { name: 'deps' }
  ],

  allowCustomScopes: true,
  allowBreakingChanges: ['feat', 'fix', 'perf', 'refactor'],
  skipQuestions: ['body', 'footer'],

  messages: {
    type: 'Selecione o tipo de mudança que você está fazendo:',
    scope: '\nSelecione o escopo desta mudança (opcional):',
    customScope: 'Defina um escopo customizado:',
    subject: 'Escreva uma descrição curta da mudança:\n',
    body: 'Forneça uma descrição detalhada (opcional). Use "|" para quebra de linha:\n',
    breaking: 'Liste as BREAKING CHANGES (opcional):\n',
    footer: 'Liste os issues fechados por esta mudança (opcional). Ex.: #31, #34:\n',
    confirmCommit: 'Você tem certeza que deseja prosseguir com o commit acima?'
  },

  subjectLimit: 100
};
