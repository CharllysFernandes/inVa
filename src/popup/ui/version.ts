/**
 * Gerencia exibição da versão da extensão
 */

export function displayVersion(element: HTMLElement | null): void {
  if (!element) return;

  try {
    const manifest = chrome.runtime.getManifest();
    const version = manifest.version_name ?? manifest.version;
    element.textContent = `v${version}`;
  } catch {
    element.textContent = "v";
  }
}
