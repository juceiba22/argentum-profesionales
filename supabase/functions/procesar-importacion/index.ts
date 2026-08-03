import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { stringify } from 'https://deno.land/std@0.224.0/csv/stringify.ts';
import { ImportProcessor } from './services/ImportProcessor.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { id_importacion } = await req.json();
    
    if (!id_importacion) {
      throw new Error('id_importacion es requerido');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: record, error: fetchError } = await supabaseClient
      .from('importaciones')
      .select('*')
      .eq('id', id_importacion)
      .single();

    if (fetchError || !record) {
      throw new Error(`Importación no encontrada: ${fetchError?.message}`);
    }

    await supabaseClient.from('importaciones').update({ estado: 'Procesando' }).eq('id', id_importacion);

    try {
      const { data: fileData, error: downloadError } = await supabaseClient.storage
        .from('importaciones')
        .download(record.ruta_storage);

      if (downloadError || !fileData) {
        throw new Error(`No se pudo descargar el archivo: ${downloadError?.message}`);
      }

      const arrayBuffer = await fileData.arrayBuffer();

      const resultadoJSON = await ImportProcessor.processFile(
        arrayBuffer, 
        record.nombre_archivo, 
        record.tipo_archivo,
        record.origen
      );

      let metadataToSave = null;
      if (record.origen === 'MERCADOPAGO' && Array.isArray(resultadoJSON)) {
        try {
          const csvString = stringify(resultadoJSON, {
            columns: ['Cuenta', 'Fecha', 'Descripción', 'Valor', 'Saldo', 'Descripcion_OK']
          });
          
          const csvPath = `${record.usuario_id}/processed_${id_importacion}.csv`;
          
          const { error: uploadCsvError } = await supabaseClient.storage
            .from('importaciones')
            .upload(csvPath, csvString, { contentType: 'text/csv', upsert: true });
            
          if (uploadCsvError) {
            console.error("Error subiendo CSV limpio:", uploadCsvError);
          } else {
            metadataToSave = { ruta_csv_limpio: csvPath };
          }
        } catch (csvError) {
          console.error("Error convirtiendo a CSV:", csvError);
        }
      }

      await supabaseClient
        .from('importaciones')
        .update({ 
          estado: 'Procesado',
          resultado_procesamiento: resultadoJSON,
          cantidad_registros: Array.isArray(resultadoJSON) ? resultadoJSON.length : (resultadoJSON.movimientos?.length || 0),
          metadata: metadataToSave,
          error: null
        })
        .eq('id', id_importacion);

      return new Response(JSON.stringify({ success: true, estado: 'Procesado', data: resultadoJSON }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });

    } catch (processingError: any) {
      console.error('Error durante el procesamiento:', processingError);
      await supabaseClient.from('importaciones').update({ estado: 'Error', error: processingError.message }).eq('id', id_importacion);
      throw processingError;
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
