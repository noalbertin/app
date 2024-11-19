import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "flowbite-react";

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState('');
    const { token } = useParams(); // Le token est récupéré depuis l'URL
    const navigate = useNavigate();
    const [passwordStrength, setPasswordStrength] = useState(0);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("Les mots de passe ne correspondent pas");
            return;
        }

        try {
            // Envoie la requête POST au backend avec le nouveau mot de passe et le token
            const response = await axios.post(`http://localhost:8081/controller/reset-password/${token}`, { newPassword: password });
            
            // Enregistrement du message de succès
            setMessage(response.data.message);  
        
            // Stocke le token dans le localStorage pour maintenir l'authentification
            localStorage.setItem('token', token);
        
            // Redirection vers la page d'accueil après la réinitialisation du mot de passe
            navigate('/accueil');
            
        } catch (error) {
            // Gestion des erreurs et affichage du message d'erreur
            setMessage(error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe.');
        }
        
    };

     // Fonction pour calculer la force du mot de passe
  const calculatePasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength += 1;  // Longueur >= 8 caractères
    if (/[A-Z]/.test(password) || /[a-z]/.test(password)) strength += 1;  // Majuscules/minuscules
    if (/\d/.test(password)) strength += 1;  // Contient des chiffres
    if (/[\W_]/.test(password)) strength += 1;  // Caractères spéciaux

    return strength;
  };

  const handlePasswordChange = (e) => {

    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  // Fonction pour changer la couleur en fonction de la force
  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 1: return 'bg-red-500';   // Faible
      case 2: return 'bg-orange-500'; // Moyenne
      case 3: return 'bg-yellow-500'; // Moyenne-forte
      case 4: return 'bg-green-500';  // Forte
      default: return 'bg-gray-300';  // Aucun
    }
  };

  const getStrengthLabel = () => {
    switch (passwordStrength) {
      case 1: return "Très faible";
      case 2: return "Faible";
      case 3: return "Moyen";
      case 4: return "Fort";
      default: return "Entrez un mot de passe";
    }
  };


    return (
        <>
        <div className="login-header box-shadow">
          <div className="container-fluid d-flex justify-content-between align-items-center">
            <div className="brand-logo">
              <a href="/">
                <img src="/fimisa.svg" alt />
              </a>
            </div>
            <div className="login-menu">
              <ul>
                <li><a href="/sinup">S'inscrire</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="login-wrap d-flex align-items-center flex-wrap justify-content-center">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-6 col-lg-7">
                <img src="/ok.svg" alt />
              </div>
              <div className="col-md-6 col-lg-5">
                <div className="login-box bg-white box-shadow border-radius-10">
                  <div className="login-title">
                    <h2 className="text-center text-primary">Changer mot de passe</h2>
                  </div>
                 
                  <form onSubmit={handleSubmit}>
                    
                    <div className="pt-3">
                      <label htmlFor="password" className="block mb-2 text-md font-medium text-gray-900 dark:text-white">
                       Nouveau mot de passe
                      </label>
                      <div className="relative">
                        {showPassword ? (
                          <FaEyeSlash className="absolute right-3 top-3 text-gray-500 cursor-pointer" onClick={() => setShowPassword(false)} />
                        ) : (
                          <FaEye className="absolute right-3 top-3 text-gray-500 cursor-pointer" onClick={() => setShowPassword(true)} />
                        )}
                        <input 
                          type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={handlePasswordChange}
                            placeholder="Nouveau mot de passe"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pr-10 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        />
                      </div>
                      {/* Barre de progression pour la force du mot de passe */}
                    <div className="mt-2 h-2 w-full bg-gray-300 rounded-full">
                      <div className={`h-2 rounded-full ${getStrengthColor()}`} style={{ width: `${(passwordStrength / 4) * 100}%` }}></div>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {getStrengthLabel()}
                    </p>
                    </div>

                    <div className="pt-3">
                      <label htmlFor="password" className="block mb-2 text-md font-medium text-gray-900 dark:text-white">
                       Confirmer votre mot de passe
                      </label>
                      <div className="relative">
                        {showPassword ? (
                          <FaEyeSlash className="absolute right-3 top-3 text-gray-500 cursor-pointer" onClick={() => setShowPassword(false)} />
                        ) : (
                          <FaEye className="absolute right-3 top-3 text-gray-500 cursor-pointer" onClick={() => setShowPassword(true)} />
                        )}
                        <input 
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirmer mot de passe"
                          required 
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pr-10 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        />
                      </div>
                    </div>
                    {message && <p className="text-red-500 mt-4">{message}</p>}
                    
                    <div className="row pt-3">
                      <div className="col-sm-12">
                        <div className="input-group mb-0">
                          <Button type='submit' className="btn btn-primary btn-lg btn-block"> Réinitialiser le mot de passe</Button>
                        </div>
                        
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
};

export default ResetPassword;
