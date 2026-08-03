export class GeminiProcessor {
  static async analyze(estructuraExtraida: any, origen: string) {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY no está configurada en las variables de entorno.");
    }

    // gemini-1.5-flash fue discontinuado por Google (404 NOT_FOUND).
    // Se actualiza a gemini-3.6-flash (GA, familia recomendada actual).
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    let prompt = "";

    if (origen === 'MERCADOPAGO') {
      prompt = `
Eres un experto en transformación de datos y análisis de extractos.
Se te proporciona el contenido crudo de un extracto de MERCADO PAGO.
Debes extraer todas las transacciones de la tabla del documento y devolver ESTRICTAMENTE un JSON Array con la información procesada y limpia. No agregues texto ni comentarios fuera del JSON Array.

Reglas de limpieza:
1. Formato de fecha: 'YYYY-MM-DD'.
2. Descripción: Unificar saltos de línea (un solo string limpio).
3. 'Valor' y 'Saldo': Números puros (ej: 1234.56), sin el símbolo '$' ni separadores de miles. Si es un egreso (gasto/envío), usa el signo negativo en 'Valor'.
4. Crea el campo 'Descripcion_OK' basado en la descripción original siguiendo estas reglas exactas:
   - Si empieza con 'Transferencia recibida' -> 'Transferencia recibida'
   - Si empieza con 'Transferencia enviada' -> 'Transferencia enviada'
   - Si empieza con 'Pago' -> 'Pago'
   - Si empieza con 'Envío de dinero' -> 'Envío de dinero'
   - Caso contrario -> Copiar descripción original.
5. Crea el campo 'Cuenta' siempre con el valor exacto 'MERCADO PAGO'.

Estructura requerida de cada objeto en el JSON Array:
{
  "Cuenta": "MERCADO PAGO",
  "Fecha": "YYYY-MM-DD",
  "Descripción": "Descripción original limpia",
  "Valor": 0.0,
  "Saldo": 0.0,
  "Descripcion_OK": "Valor según reglas"
}

Contenido a analizar:
${JSON.stringify(estructuraExtraida).substring(0, 30000)}
`;
    } else {
      prompt = `
Eres un asistente experto en conciliación bancaria y contable.
Se te proporciona el contenido crudo (filas o texto) de una importación cuyo origen es: ${origen}.
Tu objetivo es analizar la información, estructurarla y devolverla ESTRICTAMENTE en formato JSON, sin comentarios adicionales ni markdown.

Estructura requerida del JSON de respuesta:
{
  "resumen": "Breve resumen del contenido del documento (ej. Extracto Banco Galicia Julio 2026)",
  "moneda": "ARS",
  "total_ingresos": 0.0,
  "total_egresos": 0.0,
  "movimientos": [
    {
      "fecha": "YYYY-MM-DD",
      "descripcion": "Detalle de la transacción",
      "importe": 0.0,
      "tipo": "INGRESO" | "EGRESO",
      "categoria_sugerida": "Proveedor" | "Venta" | "Servicio" | "Otro"
    }
  ]
}

Ten en cuenta que:
- Los montos egresos deben ser reportados como números positivos en "importe", pero indicando tipo "EGRESO".
- Si no encuentras fecha en alguna fila irrelevante (ej. encabezados), ignórala.
- Sólo devuelve JSON.

Contenido a analizar:
${JSON.stringify(estructuraExtraida).substring(0, 30000)} // Limite de seguridad
`;
    }

    try {
      console.log("Inicio llamada Gemini:", Date.now());

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 100000); // 100s máximo

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            thinkingConfig: {
              thinkingBudget: 0
            }
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log("Fin llamada Gemini:", Date.now());

      if (!response.ok) {
        const errData = await response.text();
        throw new Error(`Error en API de Gemini: ${response.status} - ${errData}`);
      }

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiText) {
        throw new Error("Gemini no devolvió una respuesta válida.");
      }

      const parsedJSON = JSON.parse(aiText);
      return parsedJSON;
      
    } catch (error: any) {
      console.error("GeminiProcessor Error:", error);
      throw new Error(`Fallo el procesamiento con IA: ${error.message}`);
    }
  }
}