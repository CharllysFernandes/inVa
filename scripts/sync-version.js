#!/usr/bin/env node

/**
 * Script para sincronizar a versão entre package.json e manifest.json
 * Executado automaticamente pelo standard-version após bump de versão
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const manifestJsonPath = path.join(__dirname, '..', 'manifest.json');

try {
  // Ler package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const version = packageJson.version;

  console.log(`📦 Versão atual: ${version}`);

  // Ler manifest.json
  const manifestJson = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));
  
  // Atualizar versão no manifest
  manifestJson.version = version;

  // Escrever manifest.json atualizado
  fs.writeFileSync(
    manifestJsonPath,
    JSON.stringify(manifestJson, null, 4) + '\n',
    'utf8'
  );

  console.log(`✅ manifest.json atualizado para versão ${version}`);
} catch (error) {
  console.error('❌ Erro ao sincronizar versão:', error.message);
  process.exit(1);
}
