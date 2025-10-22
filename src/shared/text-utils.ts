/**
 * Utilitários para normalização e validação de conteúdo de texto
 * @module text-utils
 */

/**
 * Normaliza o texto para facilitar comparações entre edições do CKEditor
 * - Converte toda quebra de linha (CRLF, CR, LF) para "\n"
 * - Remove espaços excedentes no começo e no final
 * @function normalizeContent
 * @param {string} value - Texto a ser normalizado
 * @returns {string} Texto normalizado
 * @example
 * const normalized = normalizeContent("  Hello\r\nWorld  ");
 * // Returns: "Hello\nWorld"
 */
export function normalizeContent(value: string): string {
  return value.replace(/\r\n?|\n/g, "\n").trim();
}

/**
 * Verifica se o conteúdo normalizado está vazio
 * Remove espaços não-quebráveis (nbsp) antes da verificação
 * @function isContentEmpty
 * @param {string} value - Texto a ser verificado
 * @returns {boolean} True se o conteúdo estiver vazio
 * @example
 * isContentEmpty("   "); // true
 * isContentEmpty("\u00a0"); // true (nbsp)
 * isContentEmpty("Hello"); // false
 */
export function isContentEmpty(value: string): boolean {
  return normalizeContent(value).replace(/\u00a0/g, "").trim().length === 0;
}

/**
 * Verifica se dois conteúdos são iguais após normalização
 * Útil para comparar conteúdo do textarea com conteúdo do CKEditor
 * @function contentEquals
 * @param {string} a - Primeiro texto
 * @param {string} b - Segundo texto
 * @returns {boolean} True se os textos são iguais após normalização
 * @example
 * contentEquals("Hello\r\n", "Hello\n"); // true
 * contentEquals("  Test  ", "Test"); // true
 */
export function contentEquals(a: string, b: string): boolean {
  return normalizeContent(a) === normalizeContent(b);
}
