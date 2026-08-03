import * as pdfjsLib from "https://esm.sh/pdfjs-dist@3.11.174/legacy/build/pdf.js";

export class PdfProcessor {
  static async process(arrayBuffer: ArrayBuffer) {
    try {
      // Compatibilidad con la factoría por defecto o namespace de esm.sh
      const pdfLib = (pdfjsLib as any).default || pdfjsLib;

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
