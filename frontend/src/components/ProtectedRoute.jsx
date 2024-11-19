import React from 'react';
import { Navigate } from 'react-router-dom';

// Fonction pour vérifier si l'utilisateur est authentifié
const isAuthenticated = () => {
  return !!localStorage.getItem('token'); // Vérifie si le token est présent dans le localStorage
};

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    // Si l'utilisateur n'est pas authentifié, le rediriger vers la page de login
    return <Navigate to="/" replace />;
  }

  // Sinon, afficher la page protégée
  return children;
};

export default ProtectedRoute;
