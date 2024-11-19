

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "flowbite-react";

const VerifyEmail = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleVerify = async (e) => {
    e.preventDefault();
    const verificationCode = otp.join('');
    
    try {
        const response = await axios.post('http://localhost:8081/controller/verify', { email, verificationCode });
        setMessage(response.data.message);
        
        if (response.data.message === 'Compte vérifié avec succès !') {
            const token = response.data.token;
            const travailleurId = response.data.user.id_travailleur; // Récupérer l'id_travailleur de la réponse
            localStorage.setItem('token', token);
            localStorage.setItem('travailleurId', travailleurId); // Enregistrer l'id_travailleur
            navigate('/conjoint');
            
        }    
    } catch (error) {
        setMessage(error.response?.data?.message || 'Erreur lors de la vérification');
    }
  };


  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value) || value === '') {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
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
            <li><a href="/">Se Connecter</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div className="login-wrap d-flex align-items-center flex-wrap justify-content-center">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6">
            <img src="/check.svg" />
          </div>
          <div className="col-md-6">
            <div className="login-box bg-white box-shadow border-radius-10">
              <div className="login-title">
                <h2 className="text-center text-primary">Vérification Email</h2>
              </div>
              <h6 className="mb-3 font-bold text-md">
                  Veuiller entrer les codes 6 chiffres envoyer à ton email : {email}
              </h6>
              <div className="pb-3">
                {message && <p className="mt-4 text-red-500">{message}</p>}
                </div>
              <form onSubmit={handleVerify}>
              <div className="flex justify-center space-x-2 ">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-14 h-14 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength="1"
                  />
                ))}
              </div>
                
                <button type="submit" className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Vérifier
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    </>
  );
};

export default VerifyEmail;
