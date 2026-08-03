// Usamos la versión legacy/build limpia de dependencias de node/canvas
import * as pdfjsLib from "https://esm.sh/pdfjs-dist@3.11.174/legacy/build/pdf.js";

// Necesitamos asignar un worker falso o vacío para evitar que intente instanciar workers en Edge
pdfjsLib.GlobalWorkerOptions.workerSrc = "data:text/javascript;base64,";

export class PdfProcessor {
  static async process(arrayBuffer: ArrayBuffer) {
    try {
      const loadingTask = pdfjsLib.getDocument({ 
        data: new Uint8Array(arrayBuffer),
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: false,
        disableFontFace: true,
        standardFontDataUrl: "https://esm.sh/pdfjs-dist@3.11.174/standard_fonts/"
      });
      
      const pdf = await loadingTask.promise;
      let fullText = "";
      const numPages = pdf.numPages;
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // Extraemos solo el texto puro
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
