import { extractText, getDocumentProxy } from "https://esm.sh/unpdf@0.11.0";

// unpdf está construido específicamente para runtimes serverless/edge
// (Deno, Cloudflare Workers, Vercel Edge, etc.), a diferencia de
// pdfjs-dist "legacy", que depende de APIs del DOM del navegador
// (document, Worker real) que no existen en Deno. Por eso no hace
// falta configurar ningún workerSrc ni fake worker acá.

export class PdfProcessor {
  static async process(arrayBuffer: ArrayBuffer) {
    try {
      const data = new Uint8Array(arrayBuffer);

      console.log("Inicio extracción PDF:", Date.now());

      const pdf = await getDocumentProxy(data);
      const { totalPages, text } = await extractText(pdf, { mergePages: true });

      console.log("Fin extracción PDF:", Date.now());

      const fullText = (Array.isArray(text) ? text.join("\n") : text).trim();

      console.log("Caracteres extraídos del PDF:", fullText.length);

      return {
        tipo: "PDF",
        estructura: {
          columnas: [],
          filas: [],
          texto: fullText,
          paginas: totalPages
        },
        estadisticas: {
          filas: 0,
          columnas: 0,
          caracteres: fullText.length
        }
      };
    } catch (error: any) {
      console.error("Error detallado en PDFProcessor:", error);
      throw new Error(`Error al procesar PDF: ${error.message}`);
    }
  }
}