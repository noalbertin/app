// AuthContext.jsx
import React, { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Create AuthContext
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const login = (credentials) => {
    // Your login logic here (e.g., authenticate user)
    setIsAuthenticated(true);
    navigate('/accueil'); // Navigate to a different route after login
  };

  const logout = () => {
    setIsAuthenticated(false);
    navigate('/'); // Redirect to login after logout
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
