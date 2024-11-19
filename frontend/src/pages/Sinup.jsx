import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Label } from "flowbite-react";
import { RiMailSendFill } from "react-icons/ri";
import { FaEye, FaEyeSlash, FaUserTie } from "react-icons/fa";
import { TbNumber } from "react-icons/tb";
import Swal from 'sweetalert2';

const Sinup = () => {
  const [step, setStep] = useState(0);
  const steps = ['Information Personnel', 'Autres Informations', 'Photo de profile '];

  const nextStep = async () => {
    const isValid = await validateCurrentStep(); // Attendez le résultat de la validation
    if (isValid) {
      if (step < steps.length - 1) {
        setStep(step + 1);
      } else {
        await handleSignup();  // Si c'est la dernière étape, traitez l'inscription
      }
    } else {
      console.log('Validation échouée, reste sur l\'étape', step);
    }
  };
  
  

  const validateCurrentStep = async () => {
    switch (step) {
      case 0:
        return await validateStep1();  // Attendez la validation asynchrone ici
      case 1:
        return await validateStep2();
      case 2:
        return await  validateStep3();
        default:
          return false;
    }
  };
  
  const validateStep1 = async () => {
    if (!nom_travailleur || !email || !codeMenage) {
      return false;
    }
  
    // Appel à la fonction qui vérifie l'email et le codeMenage
    const isValid = await validateEmailAndCodeMenage();
    return isValid; // Retourne true si la validation est réussie, sinon false
  };

  const validateStep2 =  async () => {
    if (!password || !selectedRole) {
      return false;
    }
    const isValid = await validateCinAndAge();
    return isValid;
  };

  const validateStep3 = () => {
    if (!imageUrl_travailleur) {
      Swal.fire({
        title: 'Erreur!',
        text: 'Veuillez ajouter une image.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return false; // Retourne false pour empêcher le passage à l'étape suivante ou l'inscription
    }
    return true;
  };


  const validateEmailAndCodeMenage = async () => {
    try {
      const response = await fetch('http://localhost:8081/travailleur/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, codeMenage, cin_travailleur, age_travailleur }),
      });
  
      if (response.ok) {
        // La validation est réussie
        setErrorMessage(''); // Efface le message d'erreur si tout est bon
        return true;
      } else {
        // Le serveur a renvoyé une erreur (email ou code ménage déjà utilisé)
        const result = await response.json();
        setErrorMessage(result.message); // Affiche le message d'erreur du backend
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      setErrorMessage('Erreur serveur lors de la validation.'); // Affiche une erreur générique en cas de problème serveur
      return false;
    }
  };
  const validateCinAndAge = async () => {
    try {
      const response = await fetch('http://localhost:8081/travailleur/validate2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cin_travailleur, age_travailleur }),
      });
  
      if (response.ok) {
        // La validation est réussie
        setErrorMessage(''); // Efface le message d'erreur si tout est bon
        return true;
      } else {
        // Le serveur a renvoyé une erreur (email ou code ménage déjà utilisé)
        const result = await response.json();
        setErrorMessage(result.message); // Affiche le message d'erreur du backend
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      setErrorMessage('Erreur serveur lors de la validation.'); // Affiche une erreur générique en cas de problème serveur
      return false;
    }
  };
 
  

  const prevStep = () => {
    setStep((prevStep) => {
      const newStep = Math.max(prevStep - 1, 0);
      console.log("Current step:", newStep); // Pour déboguer
      return newStep;
    });
  };
  const resetStep = () => {
    setStep(0); // Retour à l'étape initiale
  };
  

  const [nom_travailleur, setNom_travailleur] = useState('');
  const [prenom_travailleur, setPrenom_travailleur] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codeMenage, setCodeMenage] = useState('');
  const [imageUrl_travailleur, setimageUrl_travailleur] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [cin_travailleur, setCin_travailleur] = useState('');
  const [age_travailleur, setAge_travailleur] = useState('');
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
     e.preventDefault();
     

    if (step === steps.length - 1 && validateCurrentStep()) {
       // Check if image exists
     if (!imageUrl_travailleur) {
      Swal.fire({
        title: 'Erreur!',
        text: 'Veuillez ajouter une image.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
      
    }
      
      try {
        
        const formData = new FormData();
        formData.append('nom_travailleur', nom_travailleur);
        formData.append('prenom_travailleur', prenom_travailleur);
        formData.append('email', email);
        formData.append('codeMenage', codeMenage);
        formData.append('selectedRole', selectedRole);
        formData.append('password', password);
        formData.append('imageUrl_travailleur', imageUrl_travailleur);  // Ajouter l'image
        formData.append('cin_travailleur', cin_travailleur);
        formData.append('age_travailleur', age_travailleur);
        // Envoyer les données au backend via Axios ou autre méthode
        axios.post('http://localhost:8081/travailleur/addTravailleur/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
  
        // Utilisation de SweetAlert2 pour afficher l'alerte
        Swal.fire({
            title: 'Inscription réussie!',
            text: 'Veuillez vérifier votre e-mail pour le code de validation.',
            icon: 'success',
            confirmButtonText: 'OK'
        }).then(() => {
            // Redirection vers la page de vérification après confirmation
            navigate('/verify', { state: { email } });
        });
        
    } catch (error) {
        // Gestion des erreurs avec SweetAlert2
        Swal.fire({
            title: 'Erreur!',
            text: error.response?.data?.message || 'Erreur lors de l\'inscription',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
    } else {
      // Sinon, aller à l'étape suivante
      nextStep();
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

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
        setImage(URL.createObjectURL(file));
    }
};

const handleChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    setImage(URL.createObjectURL(file)); // Affiche un aperçu de l'image
    setimageUrl_travailleur(file); // Assigne l'image sélectionnée à la variable d'état
  }
};
const [selectedRole, setSelectedRole] = useState('homme');

const handleSelect = (role) => {
    setSelectedRole(role);
};





  return (
    <>
      <div className="login-header box-shadow">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div className="brand-logo">
            <a href="/">
              <img src="fimisa.svg" alt />
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
            <div className="col-md-6 col-lg-7">
              <img src="/register-page-img.png" alt />
            </div>
            <div className="col-md-6 col-lg-5">
              <div className="login-box bg-white box-shadow border-radius-10">
                <div className="login-title">
                  <h2 className="text-center text-primary">Créer un compte</h2>
                </div>
                {errorMessage && (
                <div style={{ color: 'red', marginTop: '10px' }}>
                  {errorMessage}
                </div>
                )}
        


                <form onSubmit={handleSignup}>
                  <h2 className="text-xl font-bold mb-4 flex justify-center ">{steps[step]}</h2>

                  {step === 0 && (
                    <div className="step-1">
                      <div className="">
                        <label htmlFor="Nom" className="block mb-2 text-md font-medium text-gray-900 dark:text-white">
                          Votre Nom <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FaUserTie className="absolute right-3 top-3 text-gray-500 cursor-pointer" />
                          <input 
                            type="text"
                            value={nom_travailleur}
                            onChange={(e) => setNom_travailleur(e.target.value)}
                            required
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pr-10 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          />
                        </div>
                      </div>
                      <div className="pt-3">
                        <label htmlFor="Nom" className="block mb-2 text-md font-medium text-gray-900 dark:text-white">
                          Votre Prénom <span className="text-red-500">*</span>
                        </label>
                        <div className="relative ">
                          <FaUserTie className="absolute right-3 top-3 text-gray-500 cursor-pointer" />
                          <input 
                            type="text"
                            value={prenom_travailleur}
                            onChange={(e) => setPrenom_travailleur(e.target.value)}
                            required
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pr-10 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          />
                        </div>
                      </div>

                      <div className="pt-3">
                        <label htmlFor="Email" className="block text-md font-medium text-gray-900 dark:text-white">
                          Votre Email <span className="text-red-500">*</span>
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
                        <div className="">
                          <Label htmlFor="codeMenage" value="Code de Ménage" className="text-md" /> <span className="text-red-500">*</span>
                        </div>
                        <div className="relative">
                          <TbNumber className="absolute right-3 top-3 text-gray-500 cursor-pointer" />
                          <input 
                            id="codeMenage"
                            type="number"
                            value={codeMenage}
                            onChange={(e) => setCodeMenage(e.target.value)}
                            required
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pr-10 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                     <>
                     <div className="select-role">
                       <label className="block text-md font-medium text-gray-900 dark:text-white mb-3">
                         Sélectionnez votre genre <span className="text-red-500">*</span>
                       </label>
                       <div className="btn-group btn-group-toggle" data-toggle="buttons">
                           <label 
                               className={`btn ${selectedRole === 'homme' ? 'active' : ''}`}
                               onClick={() => handleSelect('homme')}
                           >
                               <input
                                   type="radio"
                                   name="options"
                                   id="admin"
                                   checked={selectedRole === 'homme'}
                                   onChange={() => handleSelect('homme')}
                                   required
                               />
                               <div className="icon">
                                   <img src="/male.svg" className="svg" alt="homme" />
                               </div>
                               <span>Je suis</span> Un Homme
                           </label>
                           
                           <label 
                               className={`btn ${selectedRole === 'femme' ? 'active' : ''}`}
                               onClick={() => handleSelect('femme')}
                           >
                               <input
                                   type="radio"
                                   name="options"
                                   id="user"
                                   checked={selectedRole === 'femme'}
                                   onChange={() => handleSelect('femme')}
                               />
                               <div className="icon">
                                   <img src="/female.svg" className="svg" alt="femme" />
                               </div>
                               <span>Je suis</span> Une Femme
                           </label>
                     </div>
                   </div>
                   <div class="row">
                        <div class="col-md-6 col-sm-12">
                          <div class="form-group">
                            <label>CIN</label>
                            <input type="number" class="form-control"
                              value={cin_travailleur}
                              onChange={(e) => setCin_travailleur(e.target.value)}
                              required
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                            />
                          </div>
                        </div>
                        <div class="col-md-6 col-sm-12">
                          <div class="form-group">
                            <label>Âge</label>
                            <input type="date" class="form-control"
                            value={age_travailleur}
                            onChange={(e) => setAge_travailleur(e.target.value)}
                            required
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          />
                          </div>
                        </div>
                      </div>
                     <div className="pt-3">
                       <label htmlFor="password" className="block text-md font-medium text-gray-900 dark:text-white">
                         Mot de passe <span className="text-red-500">*</span>
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
                           required 
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
                   </>
                    
                  )}

                  {step === 2 && (
                  <>
                    <div className="step-2">
                      <label 
                        className="border-2 border-dashed border-gray-400 rounded-lg p-4 flex justify-center items-center cursor-pointer"
                        onDrop={handleDrop}
                        onDragOver={(event) => event.preventDefault()}
                        htmlFor="file-input"
                      >
                        {image ? (
                          <img src={image} alt="Uploaded" className="max-w-full max-h-60 " />
                        ) : (
                          <p className="text-gray-500">Cliquez pour télécharger</p>
                        )}
                      </label>
                      {/* Hidden input field */}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleChange} 
                        className="hidden" 
                        id="file-input" 
                        required 
                        name="imageUrl_travailleur"
                      />
                    </div>

                  </>
                  )}

                  <div className="flex justify-between mt-4">
                    {step === 2 ? (
                        <button
                          onClick={resetStep}
                          className="bg-red-500 text-white p-2 rounded"
                        >
                          Annuler
                        </button>
                      ) : (
                        <button
                          onClick={prevStep}
                          disabled={step === 0} // Le bouton est désactivé si on est déjà à l'étape 0
                          className="bg-gray-300 text-gray-700 p-2 rounded"
                        >
                          Précédent
                        </button>
                      )}
                      <Button type='submit' onClick={step === steps.length - 1 ? handleSignup : nextStep}>
                        {step === steps.length - 1 ? 'Créer un compte' : 'Suivant'}
                      </Button>
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

export default Sinup;

