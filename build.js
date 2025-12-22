const fs = require('fs-extra');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');
const assetsDir = path.join(__dirname, 'assets');

async function build() {
  try {
    // Limpar pasta dist
    await fs.emptyDir(distDir);
    
    // Copiar arquivos src
    await fs.copy(srcDir, distDir);
    
    // Copiar assets
    await fs.copy(assetsDir, path.join(distDir, 'assets'));
    
    // Copiar e corrigir manifest.json
    const manifest = await fs.readJson('manifest.json');
    
    // Corrigir caminhos no manifest
    manifest.action.default_popup = manifest.action.default_popup.replace('src/', '');
    manifest.background.service_worker = manifest.background.service_worker.replace('src/', '');
    manifest.content_scripts[0].js = manifest.content_scripts[0].js.map(js => js.replace('src/', ''));
    
    await fs.writeJson(path.join(distDir, 'manifest.json'), manifest, { spaces: 2 });
    
    console.log('Build concluído com sucesso!');
  } catch (error) {
    console.error('Erro no build:', error);
  }
}

build();
