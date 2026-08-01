import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function MiPerfil() {
  const { user } = useAuth();
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí se guardaría la información en la base de datos (Supabase)
    alert('Perfil guardado exitosamente');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', color: 'white' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>Mi Perfil</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="nombreApellido">Nombre y apellido</label>
          <input 
            type="text" 
            id="nombreApellido" 
            name="nombreApellido" 
            value={formData.nombreApellido} 
            onChange={handleChange} 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', color: 'black' }}
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="cuit">CUIT</label>
          <input 
            type="text" 
            id="cuit" 
            name="cuit" 
            value={formData.cuit} 
            onChange={handleChange} 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', color: 'black' }}
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="profesion">Profesión</label>
          <select 
            id="profesion" 
            name="profesion" 
            value={formData.profesion} 
            onChange={handleChange} 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', color: 'black' }}
            required
          >
            <option value="">Seleccione una profesión</option>
            {profesiones.map((prof, index) => (
              <option key={index} value={prof}>{prof}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="institucion">Institución / Consultorio / Empresa</label>
          <input 
            type="text" 
            id="institucion" 
            name="institucion" 
            value={formData.institucion} 
            onChange={handleChange} 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', color: 'black' }}
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="regimen">Régimen al que estoy adherido</label>
          <select 
            id="regimen" 
            name="regimen" 
            value={formData.regimen} 
            onChange={handleChange} 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', color: 'black' }}
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
            <label htmlFor="categoriaMonotributo">Categoría de Monotributo</label>
            <select 
              id="categoriaMonotributo" 
              name="categoriaMonotributo" 
              value={formData.categoriaMonotributo} 
              onChange={handleChange} 
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', color: 'black' }}
              required={formData.regimen === 'Monotributo'}
            >
              <option value="">Seleccione una categoría</option>
              {categoriasMonotributo.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}

        <button 
          type="submit" 
          style={{ 
            padding: '12px', 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            marginTop: '16px',
            fontWeight: 'bold'
          }}
        >
          Guardar Perfil
        </button>
      </form>
    </div>
  );
}
