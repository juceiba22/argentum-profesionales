import { supabase } from './supabaseClient';

export const createServicio = async (servicioData, tenantId) => {
  try {
    const { data, error } = await supabase
      .from('servicios')
      .insert([{
        tenant_id: tenantId,
        cliente_id: servicioData.clienteId,
        monto: servicioData.monto,
        detalle: servicioData.detalle,
        observaciones: servicioData.observaciones
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creando servicio:', error);
    throw error;
  }
};

export const getAllServicios = async (tenantId) => {
  try {
    const { data, error } = await supabase
      .from('servicios')
      .select(`
        *,
        clientes (nombre, cuit, doc_tipo, doc_nro, condicion_iva, email)
      `)
      .eq('tenant_id', tenantId)
      .order('fecha_servicio', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    throw error;
  }
};

export const getServicioById = async (id, tenantId) => {
  try {
    const { data, error } = await supabase
      .from('servicios')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error obteniendo servicio por ID:', error);
    throw error;
  }
};
