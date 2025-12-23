
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

// 1. Limpar pasta dist
async function cleanDist() {
    await fs.remove(dist);
    await fs.ensureDir(dist);
    console.log('Pasta dist limpa.');
}

// 2. Copiar arquivos necessários
async function copyFiles() {
    // manifest.json
    await fs.copy(path.join(root, 'manifest.json'), path.join(dist, 'manifest.json'));

    // assets (ícones)
    await fs.copy(path.join(root, 'assets'), path.join(dist, 'assets'));

    // shared
    await fs.copy(path.join(root, 'src/shared'), path.join(dist, 'src/shared'));

    //features
    await fs.copy(path.join(root, 'src/features'), path.join(dist, 'src/features'));

    // popup
    await fs.copy(path.join(root, 'src/popup/popup.html'), path.join(dist, 'src/popup/popup.html'));
    await fs.copy(path.join(root, 'src/popup/popup.js'), path.join(dist, 'src/popup/popup.js'));
    await fs.copy(path.join(root, 'src/popup/popup.css'), path.join(dist, 'src/popup/popup.css'));

    // content script
    await fs.copy(path.join(root, 'src/content/content.js'), path.join(dist, 'src/content/content.js'));

    // service worker (ajustar caminho se necessário)
    const swSrc = path.join(root, 'src/service_worker/service_worker.js');
    if (fs.existsSync(swSrc)) {
        await fs.copy(swSrc, path.join(dist, 'src/service_worker/service_worker.js'));
    }

    // Copiar outros arquivos se necessário
    console.log('Arquivos copiados para dist.');
}

// 3. Sinalizar conclusão
async function build() {
    try {
        await cleanDist();
        await copyFiles();
        console.log('Build concluído com sucesso!');
    } catch (err) {
        console.error('Erro no build:', err);
        process.exit(1);
    }
}

build();
