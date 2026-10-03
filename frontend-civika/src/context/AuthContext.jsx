import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAccessToken, clearAccessToken, setOnRefreshed } from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { MOCK_USERS } from '../mock/mockData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bloqueoMsg, setBloqueoMsg] = useState(null);
  const navigate = useNavigate();

  // Escuchar cambios de token
  useEffect(() => {
    setOnRefreshed((token) => {
      if (!token) {
        setUser(null);
      }
    });
  }, []);

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    const checkSession = async () => {
      // 1. Si hay una sesión demo guardada localmente, restaurarla
      const savedMock = localStorage.getItem('civika_mock_user');
      if (savedMock) {
        try {
          const parsed = JSON.parse(savedMock);
          setUser(parsed);
          setLoading(false);
          return;
        } catch (e) {
          localStorage.removeItem('civika_mock_user');
        }
      }

      // Si estamos en la página de éxito de OAuth o hay un token en la URL, 
      // dejamos que AuthSuccess maneje la sesión inicial para evitar conflictos.
      const params = new URLSearchParams(window.location.search);
      const publicPaths = ['/auth/success', '/login', '/forgot-password', '/reset-password', '/activar-cuenta', '/accept-invitation'];
      if (publicPaths.some(p => window.location.pathname.includes(p)) || params.has('token')) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.post('/auth/refresh');
        setAccessToken(data.accessToken);
        // Decodificar el JWT usando jwt-decode
        const payload = jwtDecode(data.accessToken);
        setUser({
          id: payload.sub,
          email: payload.email,
          rol: payload.rol,
          nombre: payload.nombre,
          instructorId: payload.instructorId,
          fotoUrl: payload.fotoUrl,
        });
      } catch (err) {
        // No hay sesión activa
        setUser(null);
        clearAccessToken();
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  // Iniciar sesión directo con usuario demo sin necesidad de backend
  const loginDemo = useCallback((role = 'admin') => {
    const demoUser = MOCK_USERS[role] || MOCK_USERS.admin;
    localStorage.setItem('civika_mock_user', JSON.stringify(demoUser));
    setUser(demoUser);
    setLoading(false);
    return demoUser;
  }, []);

  const login = useCallback(async (email, password) => {
    setBloqueoMsg(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAccessToken(data.accessToken);
      setUser(data.usuario);
      localStorage.removeItem('civika_mock_user');
      setLoading(false);
      return data.usuario;
    } catch (err) {
      // Fallback a credenciales demo si el backend está desconectado o son credenciales de prueba
      const em = (email || '').toLowerCase().trim();
      let matchedRole = null;
      if (em.includes('admin') || em.includes('direccion')) matchedRole = 'admin';
      else if (em.includes('sec')) matchedRole = 'secretaria';
      else if (em.includes('prof') || em.includes('maestr') || em.includes('inst')) matchedRole = 'instructor';
      else if (em.includes('alumn') || em.includes('tutor') || em.includes('padre')) matchedRole = 'alumno';

      if (matchedRole || !err.response || err.code === 'ERR_NETWORK') {
        const demoUser = MOCK_USERS[matchedRole || 'admin'];
        localStorage.setItem('civika_mock_user', JSON.stringify(demoUser));
        setUser(demoUser);
        setLoading(false);
        return demoUser;
      }

      // Manejar error de bloqueo
      if (err.response?.status === 403 && err.response?.data?.message?.includes('bloqueada')) {
        setBloqueoMsg(err.response.data.message);
      }
      throw err;
    }
  }, []);

  const loginWithToken = useCallback((token) => {
    if (!token) {
      setLoading(false);
      return null;
    }
    
    setAccessToken(token);
    try {
      const payload = jwtDecode(token);
      const userData = {
        id: payload.sub,
        email: payload.email,
        rol: payload.rol,
        nombre: payload.nombre,
        instructorId: payload.instructorId,
        fotoUrl: payload.fotoUrl,
      };
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (error) {
      console.error('Error decoding token', error);
      clearAccessToken();
      setLoading(false);
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignorar errores
    } finally {
      localStorage.removeItem('civika_mock_user');
      clearAccessToken();
      setUser(null);
      setLoading(false);
      navigate('/login');
    }
  }, [navigate]);

  const value = {
    user,
    setUser,
    loading,
    setLoading,
    bloqueoMsg,
    setBloqueoMsg,
    login,
    loginDemo,
    loginWithToken,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
