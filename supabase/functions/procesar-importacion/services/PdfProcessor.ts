import * as pdfjsLib from "https://esm.sh/pdfjs-dist@3.11.174/legacy/build/pdf.js";

// Compatibilidad con la factoría por defecto o namespace de esm.sh
const pdfLib = (pdfjsLib as any).default || pdfjsLib;

// Fix: pdf.js necesita un worker (real o "fake") para parsear el PDF.
// En runtimes tipo Deno/Edge Function no hay soporte completo de Web Worker,
// así que cae al "fake worker", que exige indicarle manualmente dónde
// está el script del worker. Sin esto, getDocument() explota con:
// "No GlobalWorkerOptions.workerSrc specified."
// IMPORTANTE: debe ser la misma versión y el mismo build (legacy) que el import de arriba.
pdfLib.GlobalWorkerOptions.workerSrc =
  "https://esm.sh/pdfjs-dist@3.11.174/legacy/build/pdf.worker.js";

export class PdfProcessor {
  static async process(arrayBuffer: ArrayBuffer) {
    try {
      if (!pdfLib || typeof pdfLib.getDocument !== 'function') {
        throw new Error("No se pudo cargar la función getDocument de pdfjs-dist");
      }

      const loadingTask = pdfLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: false,
        disableFontFace: true
      });

      const pdf = await loadingTask.promise;
      let fullText = "";
      const numPages = pdf.numPages;

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      return {
        tipo: "PDF",
        estructura: {
          columnas: [],
          filas: [],
          texto: fullText.trim(),
          paginas: numPages
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