

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from "flowbite-react";
import { RiMailSendFill } from "react-icons/ri";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8081/controller/login', { email, password });
     
      // Sauvegarde du token et de l'ID du travailleur dans localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('travailleurId', response.data.id_travailleur);

      navigate('/accueil', { state: { id_travailleur: localStorage.getItem('travailleurId') } });
    } catch (error) {
      setMessage(error.response.data.message || 'Error during login');
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="pre-loader">
          <div className="pre-loader-box">
            <div className="loader-logo">
              <img src="fimisa.svg" alt="Logo" />
            </div>
            
            <div className="loading-text">Chargement...</div>
          </div>
        </div>
      ) : (
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
                  <img src="/login-page-img.png" alt />
                </div>
                <div className="col-md-6 col-lg-5">
                  <div className="login-box bg-white box-shadow border-radius-10">
                    <div className="login-title">
                      <h2 className="text-center text-primary">Connexion</h2>
                    </div>
                    
                    <form onSubmit={handleLogin}>
                      <div className="">
                        <label htmlFor="Email" className="block mb-2 text-md font-medium text-gray-900 dark:text-white">
                          Votre Email
                        </label>
                        <div className="relative">
                          <RiMailSendFill className="absolute right-3 top-3 text-gray-500 cursor-pointer" />
                          <input 
                            type="email"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pr-10 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          />
                        </div>
                      </div>
                      <div className="pt-3">
                        <label htmlFor="password" className="block mb-2 text-md font-medium text-gray-900 dark:text-white">
                          Mot de passe
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
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pr-10 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          />
                        </div>
                      </div>
                      <div className="">
                        {message && <p className="text-red-500 mt-2">{message}</p>}
                      </div>
                      <div className="row pb-30 pt-3">
                        <div className="col-6">
                          <div className="custom-control custom-checkbox">
                            <input type="checkbox" className="custom-control-input" id="customCheck1" />
                            <label className="custom-control-label" htmlFor="customCheck1">Se souvenir</label>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="forgot-password">
                            <a href="/mot_de_passe_oublie">Mot de passe oublié</a>
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-12">
                          <div className="input-group mb-0">
                            <Button type='submit' className="btn btn-primary btn-lg btn-block">Se Connecter</Button>
                          </div>
                          <div className="font-16 weight-600 pt-2 pb-2 text-center" data-color="#707373">
                            OU
                          </div>
                          <div className="input-group mb-0">
                            <a className="btn btn-outline-primary btn-lg btn-block" href="/sinup">Créer un Compte</a>
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
      )}
    </>
  );
};

export default Login;
