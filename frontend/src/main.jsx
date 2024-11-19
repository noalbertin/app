import React from "react";
import ReactDOM from "react-dom/client";
import App from './App.jsx';
import './index.css';

import {
  RouterProvider,
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

import Accueil from "./pages/Accueil.jsx";
import Comparaison from "./pages/Comparaison.jsx";
import Login from "./pages/Login.jsx";
import Profil from "./pages/Profil.jsx";
import Sinup from "./pages/Sinup.jsx";
import Users from "./pages/Users.jsx";
import ForgetPassword from "./pages/ForgetPassword.jsx";
import ThemeContextProvider from "./context/ThemeContext.jsx";
import ProtectedRoute from './components/ProtectedRoute.jsx'; // Importer le composant

import MainLayout from './layouts/MainLayout'; // Layout principal
import SimpleLayout from './layouts/SimpleLayout'; // Layout simple pour Login
import Verify from './pages/VerifyEmail.jsx';
import ResetPassword from './pages/ResetPassword.jsx'
import Exemple from './pages/Exemple.jsx'
import Conjoint from './pages/Conjoint'
import Enfants from "./pages/Enfants.jsx";
import Remplacant from "./pages/Remplacant.jsx";
import Famille from "./pages/Famille.jsx";
import Excel from "./pages/Excel.jsx"

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Routes publiques */}
      <Route element={<SimpleLayout />} path="/">
        <Route path="/" element={<Login />} /> {/* Login sans protection */}
        <Route path="/sinup" element={<Sinup />} /> {/* Inscription sans protection */}
        <Route path="/mot_de_passe_oublie" element={<ForgetPassword />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/exemple" element={<Exemple />} />
        <Route path="/conjoint" element={<Conjoint />} />
        <Route path="/enfant" element={<Enfants/>}/>
        <Route path="/remplacant" element={<Remplacant/>}/>
      </Route>

      {/* Routes protégées avec MainLayout */}
      <Route element={<MainLayout />}>
        <Route
          path="/accueil"
          element={
            <ProtectedRoute>
              <Accueil />
            </ProtectedRoute>
          }
        />
        <Route
          path="/utilisateurs"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id_travailleur"
          element={
            <ProtectedRoute>
              <Profil />
            </ProtectedRoute>
          }
        />
        <Route
          path="/comparaison"
          element={
            <ProtectedRoute>
              <Comparaison />
            </ProtectedRoute>
          }
        />
        <Route
          path="/famille"
          element={
            <ProtectedRoute>
              <Famille />
            </ProtectedRoute>
          }
        />
        <Route
          path="/excel"
          element={
            <ProtectedRoute>
              <Excel />
            </ProtectedRoute>
          }
        />

      </Route>
      
    </>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeContextProvider>
    <RouterProvider router={router} />
  </ThemeContextProvider>
);
