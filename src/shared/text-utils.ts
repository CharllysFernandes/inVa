/**
 * Utilitários para normalização e validação de conteúdo
 */

/**
 * Normaliza o texto para facilitar comparações entre edições do CKEditor.
 * - Converte toda quebra de linha para "\n".
 * - Remove espaços excedentes no começo e no final.
 */
export function normalizeContent(value: string): string {
  return value.replace(/\r\n?|\n/g, "\n").trim();
}

/**
 * Verifica se o conteúdo normalizado está vazio (incluindo nbsp)
 */
export function isContentEmpty(value: string): boolean {
  return normalizeContent(value).replace(/\u00a0/g, "").trim().length === 0;
}

/**
 * Verifica se dois conteúdos são iguais após normalização
 */
export function contentEquals(a: string, b: string): boolean {
  return normalizeContent(a) === normalizeContent(b);
}
