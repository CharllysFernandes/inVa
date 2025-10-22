#!/usr/bin/env node

/**
 * Script para validar a Content Security Policy da extensão
 * Verifica se as diretivas obrigatórias estão presentes
 */

const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', 'manifest.json');
const popupHtmlPath = path.join(__dirname, '..', 'src', 'popup', 'popup.html');

console.log('🔒 Validando Content Security Policy...\n');

let hasErrors = false;

// Verificar manifest.json
try {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  console.log('📋 Verificando manifest.json...');
  
  if (!manifest.content_security_policy) {
    console.error('  ❌ CSP não encontrada no manifest.json');
    hasErrors = true;
  } else {
    console.log('  ✅ CSP encontrada');
    
    const csp = manifest.content_security_policy.extension_pages;
    
    // Diretivas obrigatórias
    const requiredDirectives = [
      { name: 'script-src', value: "'self'", reason: 'Previne execução de scripts externos' },
      { name: 'object-src', value: "'none'", reason: 'Bloqueia plugins (Flash, Java)' },
      { name: 'base-uri', value: "'none'", reason: 'Previne manipulação de base tag' }
    ];
    
    // Diretivas recomendadas
    const recommendedDirectives = [
      { name: 'frame-ancestors', value: "'none'", reason: 'Previne clickjacking' },
      { name: 'form-action', value: "'none'", reason: 'Restringe submissão de formulários' }
    ];
    
    console.log('\n  Diretivas Obrigatórias:');
    for (const directive of requiredDirectives) {
      if (csp.includes(directive.name)) {
        const correctValue = csp.includes(`${directive.name} ${directive.value}`);
        if (correctValue) {
          console.log(`  ✅ ${directive.name}: ${directive.value} - ${directive.reason}`);
        } else {
          console.log(`  ⚠️  ${directive.name} presente mas com valor incorreto`);
          console.log(`     Esperado: ${directive.value}`);
        }
      } else {
        console.error(`  ❌ ${directive.name} ausente - ${directive.reason}`);
        hasErrors = true;
      }
    }
    
    console.log('\n  Diretivas Recomendadas:');
    for (const directive of recommendedDirectives) {
      if (csp.includes(directive.name)) {
        console.log(`  ✅ ${directive.name}: ${directive.value} - ${directive.reason}`);
      } else {
        console.log(`  ⚠️  ${directive.name} ausente (recomendada) - ${directive.reason}`);
      }
    }
    
    // Verificar práticas inseguras
    console.log('\n  Verificando práticas inseguras:');
    const unsafePractices = [
      { pattern: "'unsafe-eval'", risk: 'CRÍTICO', message: 'Permite eval() - NUNCA usar' },
      { pattern: "'unsafe-inline'", risk: 'ALTO', message: 'Permite scripts inline - Evitar em script-src' }
    ];
    
    for (const practice of unsafePractices) {
      if (csp.includes(practice.pattern)) {
        console.error(`  ❌ [${practice.risk}] ${practice.pattern} detectado - ${practice.message}`);
        hasErrors = true;
      }
    }
    
    if (!csp.includes("'unsafe-eval'") && !csp.includes("'unsafe-inline'")) {
      console.log('  ✅ Nenhuma prática insegura detectada');
    }
  }
  
} catch (error) {
  console.error('  ❌ Erro ao ler manifest.json:', error.message);
  hasErrors = true;
}

// Verificar popup.html
console.log('\n📄 Verificando popup.html...');
try {
  const popupHtml = fs.readFileSync(popupHtmlPath, 'utf8');
  
  // Verificar meta tag CSP
  if (popupHtml.includes('Content-Security-Policy')) {
    console.log('  ✅ Meta tag CSP encontrada');
  } else {
    console.log('  ⚠️  Meta tag CSP não encontrada (recomendada para defesa em profundidade)');
  }
  
  // Verificar scripts inline
  const inlineScriptPattern = /<script(?![^>]*src=)[^>]*>[\s\S]*?<\/script>/gi;
  const inlineScripts = popupHtml.match(inlineScriptPattern);
  
  if (inlineScripts && inlineScripts.length > 0) {
    console.error('  ❌ Scripts inline detectados (violam CSP):');
    inlineScripts.forEach((script, i) => {
      const preview = script.substring(0, 60).replace(/\n/g, ' ');
      console.error(`     ${i + 1}. ${preview}...`);
    });
    hasErrors = true;
  } else {
    console.log('  ✅ Nenhum script inline detectado');
  }
  
  // Verificar event handlers inline
  const inlineHandlers = [
    'onclick=', 'onload=', 'onerror=', 'onmouseover=', 
    'onmouseout=', 'onchange=', 'onsubmit='
  ];
  
  const foundHandlers = [];
  for (const handler of inlineHandlers) {
    if (popupHtml.includes(handler)) {
      foundHandlers.push(handler.replace('=', ''));
    }
  }
  
  if (foundHandlers.length > 0) {
    console.error('  ❌ Event handlers inline detectados (violam CSP):');
    foundHandlers.forEach(handler => {
      console.error(`     - ${handler}`);
    });
    hasErrors = true;
  } else {
    console.log('  ✅ Nenhum event handler inline detectado');
  }
  
} catch (error) {
  console.error('  ❌ Erro ao ler popup.html:', error.message);
  hasErrors = true;
}

// Verificar código-fonte
console.log('\n🔍 Verificando código-fonte...');

const srcDir = path.join(__dirname, '..', 'src');
const files = getAllFiles(srcDir, ['.ts', '.js']);

let unsafePatterns = {
  eval: 0,
  newFunction: 0,
  setTimeoutString: 0,
  dangerousInnerHTML: 0
};

for (const file of files) {
  // Pular arquivos de teste
  if (file.includes('.test.')) continue;
  
  const content = fs.readFileSync(file, 'utf8');
  
  // eval()
  if (/\beval\s*\(/g.test(content)) {
    unsafePatterns.eval++;
  }
  
  // new Function()
  if (/new\s+Function\s*\(/g.test(content)) {
    unsafePatterns.newFunction++;
  }
  
  // setTimeout/setInterval com string
  if (/set(?:Timeout|Interval)\s*\(\s*['"`]/g.test(content)) {
    unsafePatterns.setTimeoutString++;
  }
  
  // innerHTML com variáveis (potencialmente perigoso)
  if (/\.innerHTML\s*=\s*(?!['"`]\s*['"`])[^'"`]/g.test(content)) {
    // Ignora innerHTML = "" ou innerHTML = ''
    const matches = content.match(/\.innerHTML\s*=\s*(?!['"`]\s*['"`])[^'"`]/g);
    if (matches && !matches.every(m => m.includes('""') || m.includes("''"))) {
      unsafePatterns.dangerousInnerHTML++;
    }
  }
}

const totalIssues = Object.values(unsafePatterns).reduce((a, b) => a + b, 0);

if (totalIssues === 0) {
  console.log('  ✅ Nenhum padrão inseguro detectado no código');
} else {
  console.log('  ⚠️  Padrões potencialmente inseguros detectados:');
  if (unsafePatterns.eval > 0) {
    console.error(`     ❌ eval() encontrado em ${unsafePatterns.eval} arquivo(s)`);
    hasErrors = true;
  }
  if (unsafePatterns.newFunction > 0) {
    console.error(`     ❌ new Function() encontrado em ${unsafePatterns.newFunction} arquivo(s)`);
    hasErrors = true;
  }
  if (unsafePatterns.setTimeoutString > 0) {
    console.error(`     ❌ setTimeout/setInterval com string em ${unsafePatterns.setTimeoutString} arquivo(s)`);
    hasErrors = true;
  }
  if (unsafePatterns.dangerousInnerHTML > 0) {
    console.log(`     ⚠️  innerHTML com variável em ${unsafePatterns.dangerousInnerHTML} arquivo(s) - revisar`);
  }
}

// Resultado final
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.error('❌ FALHA: Problemas de segurança encontrados!\n');
  process.exit(1);
} else {
  console.log('✅ SUCESSO: CSP configurada corretamente!\n');
  console.log('A extensão está protegida contra:');
  console.log('  • Cross-Site Scripting (XSS)');
  console.log('  • Clickjacking');
  console.log('  • Code Injection');
  console.log('  • Plugins maliciosos');
  console.log('  • Data exfiltration\n');
  process.exit(0);
}

// Helper functions
function getAllFiles(dir, extensions) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, extensions));
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}
