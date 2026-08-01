import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Clientes from './pages/Clientes';
import Gastos from './pages/Gastos';
import MiPerfil from './pages/MiPerfil';
import Facturacion from './pages/Facturacion';
import Importaciones from './pages/Importaciones';
import { ActivityProvider } from './context/ActivityContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';


// Componente para proteger y redirigir rutas
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', backgroundColor: '#0f172a', color: '#f8fafc' }}>
        <p style={{ fontSize: '1.2rem', fontFamily: 'system-ui, sans-serif', fontWeight: 600 }}>Cargando sesión...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Fallback seguro de rol si el rol aún es nulo o se está resolviendo
  const effectiveRole = role || user?.user_metadata?.role || 'admin';

  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', marginTop: '100px' }}>
        <h2>Acceso Denegado</h2>
        <p>No tienes los permisos necesarios para ver esta pantalla.</p>
      </div>
    );
  }

  return children;
};

// Componente para manejar la redirección post-login
const LoginRedirect = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', backgroundColor: '#0f172a', color: '#f8fafc' }}>
        <p style={{ fontSize: '1.2rem', fontFamily: 'system-ui, sans-serif', fontWeight: 600 }}>Cargando...</p>
      </div>
    );
  }
  
  if (user) {
    const effectiveRole = role || user?.user_metadata?.role || 'admin';
    return <Navigate to="/perfil" replace />;
  }
  
  return <Login />;
};

function App() {
  return (
    <AuthProvider>
      <ActivityProvider>
        <Router>
          <Routes>
            {/* Ruta Pública (Login) */}
            <Route path="/" element={<LoginRedirect />} />
            
            {/* Ruta Pública de Promociones Eliminada */}
            
            {/* Rutas Protegidas (Requieren Sesión) */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/perfil" element={<ProtectedRoute allowedRoles={['admin', 'ventas']}><MiPerfil /></ProtectedRoute>} />
              <Route path="/clientes" element={<ProtectedRoute allowedRoles={['admin']}><Clientes /></ProtectedRoute>} />
              <Route path="/facturacion" element={<ProtectedRoute allowedRoles={['admin']}><Facturacion /></ProtectedRoute>} />
              <Route path="/importaciones" element={<ProtectedRoute allowedRoles={['admin']}><Importaciones /></ProtectedRoute>} />
              {/* ERP Rutas */}
              <Route path="/erp/gastos" element={<ProtectedRoute allowedRoles={['admin']}><Gastos /></ProtectedRoute>} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ActivityProvider>
    </AuthProvider>
  );
}

export default App;
