import React, { useState } from 'react';
import { Button } from "flowbite-react";
import axios from 'axios';
import { RiMailSendFill } from "react-icons/ri";
import Swal from 'sweetalert2';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:8081/controller/forgot-password', { email });
      setMessage(response.data.message);  // Afficher un message de succès ou d'erreur
      // Utilisation de SweetAlert2 pour afficher l'alerte
          Swal.fire({
            title: 'Email de réinitialisation envoyé!',
            text: 'Veuillez vérifier votre boîte de réception.',
            icon: 'success',
            confirmButtonText: 'OK'
        });
        
    } catch (error) {
        // Gestion des erreurs avec SweetAlert2
        Swal.fire({
            title: 'Erreur!',
            text: error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe',
            icon: 'error',
            confirmButtonText: 'OK'
        });
  }};

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
          <li><a href="/">Se Connecter</a></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="login-wrap d-flex align-items-center flex-wrap justify-content-center">
    <div className="container">
      <div className="row align-items-center">
        <div className="col-md-6">
          <img src="/forgot-password.png" alt />
        </div>
        <div className="col-md-6">
          <div className="login-box bg-white box-shadow border-radius-10">
            <div className="login-title">
              <h2 className="text-center text-primary">Mot de passe oublié</h2>
            </div>
            <h6 className="mb-3 font-bold text-md">
                Entrez votre adresse email pour réinitialiser votre mot de passe
            </h6>
            <form onSubmit={handleSubmit}>
              <div className="input-group custom">
                <input  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="form-control form-control-lg" placeholder="Email" />
                <div className="input-group-append custom">
                  <span className="input-group-text"><RiMailSendFill /></span>
                </div>
              </div>
                
              <div className="row align-items-center">
                <div className="col-5">
                  <div className="input-group mb-0">
                    <Button type="submit" className="btn btn-primary btn-lg btn-block">Envoyer</Button>
                  </div>
                </div>
                <div className="col-2">
                  <div className="font-16 weight-600 text-center" data-color="#707373">
                    OU
                  </div>
                </div>
                <div className="col-5">
                  <div className="input-group mb-0">
                    <a className="btn btn-outline-danger btn-lg btn-block" href="/">Annuler</a>
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
}

export default ForgetPassword;
