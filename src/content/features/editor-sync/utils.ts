/**
 * Utilitários para conversão de texto em HTML
 */

export function textToHtml(text: string): string {
  if (!text) return "<p><br></p>";

  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\t/g, " ");
  const paragraphs = normalized.split(/\n\n+/);

  const htmlParagraphs = paragraphs
    .map((paragraph) => {
      const lines = paragraph.split("\n");
      const htmlLines = lines
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join("<br>");

      return htmlLines ? `<p>${htmlLines}</p>` : "";
    })
    .filter((p) => p.length > 0);

  return htmlParagraphs.length > 0 ? htmlParagraphs.join("") : "<p><br></p>";
}
