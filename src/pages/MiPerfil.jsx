import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';

export default function MiPerfil() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombreApellido: '',
    cuit: '',
    profesion: '',
    institucion: '',
    regimen: '',
    categoriaMonotributo: ''
  });

  const profesiones = [
    "Abogado",
    "Actuario",
    "Bioquímico",
    "Contador",
    "Corredor Público",
    "Despachante de Aduana",
    "Economista",
    "Enfermero",
    "Escribano",
    "Farmacéutico",
    "Fonoaudiólogo",
    "Kinesiólogo",
    "Licenciado en Administración",
    "Mediador",
    "Médico",
    "Nutricionista",
    "Odontólogo",
    "Procurador",
    "Psicólogo"
  ];

  const regimenes = [
    "Monotributo",
    "Responsable inscripto"
  ];

  const categoriasMonotributo = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "No lo sé"
  ];

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error("Error al obtener perfil:", error);
        }

        if (data && data.nombre_apellido) {
          setFormData({
            nombreApellido: data.nombre_apellido || '',
            cuit: data.cuit || '',
            profesion: data.profesion || '',
            institucion: data.institucion || '',
            regimen: data.regimen || '',
            categoriaMonotributo: data.categoria_monotributo || ''
          });
          setIsEditing(false);
        } else {
          setIsEditing(true);
        }
      } catch (err) {
        console.error("Excepción al cargar perfil:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('perfiles')
        .upsert({
          id: user.id,
          nombre_apellido: formData.nombreApellido,
          cuit: formData.cuit,
          profesion: formData.profesion,
          institucion: formData.institucion,
          regimen: formData.regimen,
          categoria_monotributo: formData.regimen === 'Monotributo' ? formData.categoriaMonotributo : null,
          updated_at: new Date()
        });

      if (error) throw error;
      alert('Perfil guardado exitosamente');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Hubo un error al guardar el perfil.');
    }
  };

  if (loading) {
    return <div style={{ padding: '24px', color: '#333' }}>Cargando datos del perfil...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '650px', margin: '0 auto', color: '#1e293b' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '24px', fontWeight: 'bold' }}>Mi Perfil</h1>
      
      {!isEditing ? (
        <div style={{
          padding: '32px',
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '24px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.4)' }}>
              {formData.nombreApellido ? formData.nombreApellido.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>{formData.nombreApellido}</h2>
              <p style={{ margin: '4px 0 0 0', color: '#3b82f6', fontWeight: '600', fontSize: '15px' }}>{formData.profesion}</p>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold', marginBottom: '4px' }}>CUIT</p>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '16px', color: '#1e293b' }}>{formData.cuit || '-'}</p>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold', marginBottom: '4px' }}>Institución / Empresa</p>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '16px', color: '#1e293b' }}>{formData.institucion || '-'}</p>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold', marginBottom: '4px' }}>Régimen Tributario</p>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '16px', color: '#1e293b' }}>{formData.regimen || '-'}</p>
            </div>
            {formData.regimen === 'Monotributo' && (
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold', marginBottom: '4px' }}>Categoría</p>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '16px', color: '#1e293b' }}>{formData.categoriaMonotributo || '-'}</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsEditing(true)}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#e2e8f0', 
              color: '#334155', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              marginTop: '8px',
              fontWeight: '600',
              alignSelf: 'flex-start',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#cbd5e1'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#e2e8f0'}
          >
            Modificar Datos
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px' }}>Completa tu tarjeta de identificación profesional.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="nombreApellido" style={{ fontWeight: '600', color: '#334155', fontSize: '14px' }}>Nombre y apellido</label>
            <input 
              type="text" 
              id="nombreApellido" 
              name="nombreApellido" 
              value={formData.nombreApellido} 
              onChange={handleChange} 
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="cuit" style={{ fontWeight: '600', color: '#334155', fontSize: '14px' }}>CUIT</label>
            <input 
              type="text" 
              id="cuit" 
              name="cuit" 
              value={formData.cuit} 
              onChange={handleChange} 
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="profesion" style={{ fontWeight: '600', color: '#334155', fontSize: '14px' }}>Profesión</label>
            <select 
              id="profesion" 
              name="profesion" 
              value={formData.profesion} 
              onChange={handleChange} 
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none' }}
              required
            >
              <option value="">Seleccione una profesión</option>
              {profesiones.map((prof, index) => (
                <option key={index} value={prof}>{prof}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="institucion" style={{ fontWeight: '600', color: '#334155', fontSize: '14px' }}>Institución / Consultorio / Empresa</label>
            <input 
              type="text" 
              id="institucion" 
              name="institucion" 
              value={formData.institucion} 
              onChange={handleChange} 
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="regimen" style={{ fontWeight: '600', color: '#334155', fontSize: '14px' }}>Régimen al que estoy adherido</label>
            <select 
              id="regimen" 
              name="regimen" 
              value={formData.regimen} 
              onChange={handleChange} 
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none' }}
              required
            >
              <option value="">Seleccione un régimen</option>
              {regimenes.map((reg, index) => (
                <option key={index} value={reg}>{reg}</option>
              ))}
            </select>
          </div>

          {formData.regimen === 'Monotributo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="categoriaMonotributo" style={{ fontWeight: '600', color: '#334155', fontSize: '14px' }}>Categoría de Monotributo</label>
              <select 
                id="categoriaMonotributo" 
                name="categoriaMonotributo" 
                value={formData.categoriaMonotributo} 
                onChange={handleChange} 
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none' }}
                required={formData.regimen === 'Monotributo'}
              >
                <option value="">Seleccione una categoría</option>
                {categoriasMonotributo.map((cat, index) => (
                  <option key={index} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
            <button 
              type="submit" 
              style={{ 
                flex: 1,
                padding: '14px', 
                backgroundColor: '#2563eb', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '15px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              Guardar Perfil
            </button>
            
            {/* Solo permitir cancelar si ya hay datos previos (nombre cargado) */}
            {formData.nombreApellido && (
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                style={{ 
                  flex: 1,
                  padding: '14px', 
                  backgroundColor: '#e2e8f0', 
                  color: '#334155', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#cbd5e1'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#e2e8f0'}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
