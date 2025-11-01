#!/usr/bin/env node

/**
 * Script de Preparação de Release para GitHub
 * 
 * Este script:
 * 1. Valida o ambiente e dependências
 * 2. Executa testes
 * 3. Faz build de produção
 * 4. Cria arquivo ZIP para publicação
 * 5. Gera informações para release no GitHub
 * 
 * Uso:
 *   node scripts/prepare-release.js
 *   npm run prepare:release
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { createWriteStream } = require('fs');
const archiver = require('archiver');

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function exec(command, errorMessage) {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    logError(errorMessage || `Erro ao executar: ${command}`);
    return false;
  }
}

function execQuiet(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    return null;
  }
}

// Lê package.json
function getPackageInfo() {
  const packagePath = path.join(__dirname, '..', 'package.json');
  return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
}

// Lê manifest.json
function getManifestInfo() {
  const manifestPath = path.join(__dirname, '..', 'manifest.json');
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

// Valida que as versões estão sincronizadas
function validateVersions() {
  logStep('1/7', 'Validando versões...');
  
  const pkg = getPackageInfo();
  const manifest = getManifestInfo();
  
  if (pkg.version !== manifest.version) {
    logError(`Versões não sincronizadas!`);
    log(`  package.json: ${pkg.version}`, 'red');
    log(`  manifest.json: ${manifest.version}`, 'red');
    log(`\n  Execute: node scripts/sync-version.js`, 'yellow');
    process.exit(1);
  }
  
  logSuccess(`Versão sincronizada: ${pkg.version}`);
  return pkg.version;
}

// Valida que não há mudanças não commitadas
function validateGitStatus() {
  logStep('2/7', 'Validando status do Git...');
  
  const status = execQuiet('git status --porcelain');
  
  if (status && status.length > 0) {
    logWarning('Existem mudanças não commitadas:');
    console.log(status);
    log('\n  Commit ou stash suas mudanças antes de continuar.', 'yellow');
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      readline.question('\nContinuar mesmo assim? (y/N): ', (answer) => {
        readline.close();
        if (answer.toLowerCase() !== 'y') {
          log('Release cancelado.', 'red');
          process.exit(1);
        }
        resolve();
      });
    });
  }
  
  logSuccess('Working directory limpo');
}

// Executa testes
function runTests() {
  logStep('3/7', 'Executando testes...');
  
  if (!exec('npm test -- --run', 'Testes falharam!')) {
    process.exit(1);
  }
  
  logSuccess('Todos os testes passaram');
}

// Executa validação de segurança
function runSecurityCheck() {
  logStep('4/7', 'Validando segurança (CSP)...');
  
  if (!exec('npm run test:security', 'Validação de segurança falhou!')) {
    process.exit(1);
  }
  
  logSuccess('Validação de segurança passou');
}

// Faz build de produção
function buildProduction() {
  logStep('5/7', 'Criando build de produção...');
  
  if (!exec('npm run build', 'Build falhou!')) {
    process.exit(1);
  }
  
  logSuccess('Build criado com sucesso');
}

// Cria arquivo ZIP para release
async function createZipArchive(version) {
  logStep('6/7', 'Criando arquivo ZIP para release...');
  
  return new Promise((resolve, reject) => {
    const distPath = path.join(__dirname, '..', 'dist');
    const releasePath = path.join(__dirname, '..', 'releases');
    
    // Cria pasta releases se não existir
    if (!fs.existsSync(releasePath)) {
      fs.mkdirSync(releasePath, { recursive: true });
    }
    
    const zipFileName = `inVa-v${version}.zip`;
    const zipFilePath = path.join(releasePath, zipFileName);
    
    // Remove arquivo ZIP anterior se existir
    if (fs.existsSync(zipFilePath)) {
      fs.unlinkSync(zipFilePath);
    }
    
    const output = createWriteStream(zipFilePath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Máxima compressão
    });
    
    output.on('close', () => {
      const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      logSuccess(`ZIP criado: ${zipFileName} (${sizeInMB} MB)`);
      log(`  Localização: ${zipFilePath}`, 'blue');
      resolve(zipFilePath);
    });
    
    archive.on('error', (err) => {
      logError(`Erro ao criar ZIP: ${err.message}`);
      reject(err);
    });
    
    archive.pipe(output);
    
    // Adiciona todo o conteúdo da pasta dist
    archive.directory(distPath, false);
    
    archive.finalize();
  });
}

// Gera informações para release no GitHub
function generateReleaseInfo(version, zipPath) {
  logStep('7/7', 'Gerando informações de release...');
  
  // Tenta extrair informações do CHANGELOG
  const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
  let releaseNotes = '';
  
  if (fs.existsSync(changelogPath)) {
    const changelog = fs.readFileSync(changelogPath, 'utf8');
    const versionRegex = new RegExp(`## \\[${version}\\][\\s\\S]*?(?=\\n## |$)`, 'i');
    const match = changelog.match(versionRegex);
    
    if (match) {
      releaseNotes = match[0]
        .replace(`## [${version}]`, '')
        .trim();
    }
  }
  
  // Informações do Git
  const gitTag = execQuiet('git describe --tags --abbrev=0 2>/dev/null') || 'v0.0.0';
  const commitsSince = execQuiet(`git log ${gitTag}..HEAD --oneline 2>/dev/null`);
  const commitCount = commitsSince ? commitsSince.split('\n').length : 0;
  
  // Cria arquivo com informações de release
  const releaseInfoPath = path.join(__dirname, '..', 'releases', `release-v${version}.md`);
  
  const releaseInfo = `# Release v${version}

## 📦 Download

- **Arquivo**: ${path.basename(zipPath)}
- **Tamanho**: ${(fs.statSync(zipPath).size / 1024 / 1024).toFixed(2)} MB

## 📝 Notas da Versão

${releaseNotes || `${commitCount} commits desde a última release.`}

## 🚀 Como Instalar

### Chrome/Edge
1. Baixe o arquivo \`inVa-v${version}.zip\`
2. Descompacte o arquivo
3. Abra Chrome/Edge e vá para \`chrome://extensions\` ou \`edge://extensions\`
4. Ative o "Modo do desenvolvedor"
5. Clique em "Carregar sem compactação"
6. Selecione a pasta descompactada

## ✅ Checklist de Verificação

- [x] Testes passaram
- [x] Build de produção criado
- [x] Validação de segurança passou
- [x] Versões sincronizadas (package.json e manifest.json)
- [x] Arquivo ZIP criado

## 🔗 Links

- [CHANGELOG completo](../CHANGELOG.md)
- [Documentação](../docs/)
- [Issues](https://github.com/CharllysFernandes/inVa/issues)

---

**Gerado automaticamente em:** ${new Date().toLocaleString('pt-BR')}
`;
  
  fs.writeFileSync(releaseInfoPath, releaseInfo);
  logSuccess(`Informações de release salvas em: ${releaseInfoPath}`);
  
  return releaseInfo;
}

// Exibe resumo final
function showSummary(version, zipPath, releaseInfo) {
  log('\n' + '='.repeat(70), 'green');
  log('                  🎉 RELEASE PREPARADO COM SUCESSO! 🎉', 'bright');
  log('='.repeat(70), 'green');
  
  log('\n📦 Versão:', 'cyan');
  log(`   v${version}`, 'bright');
  
  log('\n📁 Arquivo ZIP:', 'cyan');
  log(`   ${zipPath}`, 'bright');
  
  log('\n📝 Próximos passos:', 'yellow');
  log('   1. Revise o arquivo releases/release-v' + version + '.md');
  log('   2. Faça push das tags: git push --follow-tags origin main');
  log('   3. Vá para: https://github.com/CharllysFernandes/inVa/releases/new');
  log('   4. Selecione a tag: v' + version);
  log('   5. Faça upload do ZIP: releases/inVa-v' + version + '.zip');
  log('   6. Cole as notas de release do arquivo .md');
  log('   7. Publique!');
  
  log('\n' + '='.repeat(70), 'green');
}

// Função principal
async function main() {
  log('\n╔═══════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║        🚀 Script de Preparação de Release para GitHub 🚀        ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════════════╝\n', 'cyan');
  
  try {
    // 1. Valida versões
    const version = validateVersions();
    
    // 2. Valida Git status
    await validateGitStatus();
    
    // 3. Executa testes
    runTests();
    
    // 4. Valida segurança
    runSecurityCheck();
    
    // 5. Build de produção
    buildProduction();
    
    // 6. Cria ZIP
    const zipPath = await createZipArchive(version);
    
    // 7. Gera informações de release
    const releaseInfo = generateReleaseInfo(version, zipPath);
    
    // 8. Exibe resumo
    showSummary(version, zipPath, releaseInfo);
    
  } catch (error) {
    logError(`\nErro fatal: ${error.message}`);
    process.exit(1);
  }
}

// Executa script
if (require.main === module) {
  main();
}

module.exports = { main };
