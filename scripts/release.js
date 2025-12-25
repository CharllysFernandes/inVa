#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import archiver from 'archiver';

// Codigo responsável por criar uma release do projeto, atribuindo versão e atualizando changelog.
// Versionamento major, minor e patch são suportados.

/**
 * Atualiza a versão no package.json com base no tipo de release.
 * @param {string} releaseType - Tipo de release (major, minor, patch).
 * @returns {string} Nova versão.
 */
function updateVersion(releaseType) {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = fs.readJsonSync(packageJsonPath);
    const currentVersion = packageJson.version;
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    let newVersion;
    switch (releaseType) {
        case 'major':
            newVersion = `${major + 1}.0.0`;
            break;
        case 'minor':
            newVersion = `${major}.${minor + 1}.0`;
            break;
        case 'patch':
            newVersion = `${major}.${minor}.${patch + 1}`;
            break;
        default:
            throw new Error(`Tipo de release inválido: ${releaseType}`);
    }

    packageJson.version = newVersion;
    fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });
    console.log(`Versão atualizada para: ${newVersion}`);
    return newVersion;
}

/**
 * Cria um arquivo zip da extensão.
 * @param {string} version - Versão da extensão.
 */
function createZip(version) {
    const outputPath = path.join(process.cwd(), `releases`);
    const zipPath = path.join(outputPath, `inVa-v${version}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        console.log(`Arquivo zip criado: ${zipPath}`);
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(output);
    archive.directory('dist/', false);
    archive.finalize();
}

/**
 * Atualiza o manifest.json com a nova versão.
 * @param {string} version - Nova versão.
 */
function updateManifestVersion(version) {
    const manifestPath = path.join(process.cwd(), 'manifest.json');
    const manifest = fs.readJsonSync(manifestPath);
    manifest.version = version;
    fs.writeJsonSync(manifestPath, manifest, { spaces: 2 });
    console.log(`Manifest.json atualizado para versão: ${version}`);
}

/**
 * Executa o build do projeto.
 */
function runBuild() {
    console.log('Executando build...');
    execSync('npm run build', { stdio: 'inherit' });
}

/**
 * Cria a pasta de releases se não existir.
 */
function ensureReleasesDirectory() {
    const releasesPath = path.join(process.cwd(), 'releases');
    if (!fs.existsSync(releasesPath)) {
        fs.mkdirSync(releasesPath);
    }
}

/**
 * Função principal para criar uma release.
 * @param {string} releaseType - Tipo de release (major, minor, patch).
 */
export function createRelease(releaseType) {
    try {
        console.log(`Iniciando release do tipo: ${releaseType}`);

        // Executa o build
        runBuild();

        // Atualiza a versão
        const newVersion = updateVersion(releaseType);

        // Atualiza o manifest.json
        updateManifestVersion(newVersion);

        // Cria a pasta de releases
        ensureReleasesDirectory();

        // Cria o arquivo zip
        createZip(newVersion);

        console.log('Release concluída com sucesso!');
    } catch (error) {
        console.error('Erro ao criar release:', error);
        process.exit(1);
    }
}

// Executa o script com base nos argumentos da linha de comando
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Por favor, especifique o tipo de release: major, minor ou patch.');
    process.exit(1);
}

const releaseType = args[0];
createRelease(releaseType);