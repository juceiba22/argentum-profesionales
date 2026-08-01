import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllClientes } from '../services/clientesApi';
import { createServicio } from '../services/serviciosApi';
import { Briefcase, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function MisServicios() {
  const { tenantId } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  
  const [formData, setFormData] = useState({
    clienteId: '',
    monto: '',
    detalle: '',
    observaciones: ''
  });
  
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    async function loadClientes() {
      if (!tenantId) return;
      try {
        setLoadingClientes(true);
        const data = await getAllClientes(tenantId);
        setClientes(data || []);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
      } finally {
        setLoadingClientes(false);
      }
    }
    loadClientes();
  }, [tenantId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clienteId || !formData.monto || !formData.detalle) {
      setMensaje({ tipo: 'error', texto: 'Por favor completa todos los campos requeridos.' });
      return;
    }

    try {
      setProcesando(true);
      setMensaje({ tipo: '', texto: '' });
      
      await createServicio({
        clienteId: formData.clienteId,
        monto: Number(formData.monto),
        detalle: formData.detalle,
        observaciones: formData.observaciones
      }, tenantId);
      
      setMensaje({ 
        tipo: 'exito', 
        texto: 'Servicio registrado con éxito. Ya puedes facturarlo en la pestaña Emitir Factura.' 
      });
      
      // Limpiar formulario
      setFormData({
        clienteId: '',
        monto: '',
        detalle: '',
        observaciones: ''
      });
      
    } catch (error) {
      console.error(error);
      setMensaje({ tipo: 'error', texto: 'Hubo un error al registrar el servicio. Revisa tu conexión o intenta más tarde.' });
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <Briefcase size={32} color="var(--accent-primary)" />
        <h1 style={{ fontSize: '28px', margin: 0, fontWeight: 'bold' }}>Mis Servicios</h1>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Registra los servicios prestados a tus clientes. Luego podrás emitirles la factura correspondiente.
      </p>

      {mensaje.texto && (
        <div style={{
          backgroundColor: mensaje.tipo === 'exito' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${mensaje.tipo === 'exito' ? 'var(--success)' : 'var(--danger)'}`,
          color: mensaje.tipo === 'exito' ? 'var(--success)' : 'var(--danger)',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {mensaje.tipo === 'exito' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <span>{mensaje.texto}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Cliente *</label>
          {loadingClientes ? (
            <div style={{ padding: '12px', color: 'var(--text-secondary)' }}>Cargando clientes...</div>
          ) : (
            <select 
              name="clienteId" 
              value={formData.clienteId} 
              onChange={handleChange} 
              className="input-field"
              required
            >
              <option value="">-- Selecciona un cliente --</option>
              {clientes.map(cl => (
                <option key={cl.id} value={cl.id}>
                  {cl.nombre} {cl.cuit ? `(CUIT: ${cl.cuit})` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Monto de los honorarios / servicio *</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>$</span>
            <input 
              type="number" 
              name="monto" 
              value={formData.monto} 
              onChange={handleChange} 
              className="input-field"
              placeholder="0.00"
              min="0"
              step="0.01"
              style={{ paddingLeft: '32px' }}
              required
            />
          </div>
        </div>

        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Detalle del servicio *</label>
          <input 
            type="text" 
            name="detalle" 
            value={formData.detalle} 
            onChange={handleChange} 
            className="input-field"
            placeholder="Ej. Asesoría contable mensual, Consulta médica, Representación legal..."
            required
          />
        </div>

        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Observaciones (Opcional)</label>
          <textarea 
            name="observaciones" 
            value={formData.observaciones} 
            onChange={handleChange} 
            className="input-field"
            placeholder="Notas adicionales sobre el trabajo realizado..."
            rows={4}
            style={{ resize: 'vertical' }}
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          style={{ padding: '14px', fontSize: '1rem', marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}
          disabled={procesando || loadingClientes}
        >
          {procesando ? (
            <><Loader2 className="animate-spin" size={20} /> Guardando...</>
          ) : (
            'Registrar Servicio'
          )}
        </button>
      </form>
    </div>
  );
}
