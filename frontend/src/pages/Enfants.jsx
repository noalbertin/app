import { Button } from 'flowbite-react';
import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCamera } from "react-icons/fa";

const Example = () => {
  const location = useLocation();
  const { id_travailleur, nombreEnfants } = location.state; // Retrieve id_travailleur and number of children

  const [enfants, setEnfants] = useState(
    Array.from({ length: nombreEnfants }, () => ({
      nom_enfant: '',
      prenom_enfant:'',
      cin_enfant: '',
      age_enfant: '',
      sexe_enfant: '',
      image_enfant: null,
    }))
  );

  const [currentIndex, setCurrentIndex] = useState(0); // Track the current child index
  const [cinError, setCinError] = useState('');
  const navigate = useNavigate();
  const [image, setImage] = useState(null);

  const handleEnfantChange = (key, value) => {
    const updatedEnfants = [...enfants];
    updatedEnfants[currentIndex][key] = value;
    setEnfants(updatedEnfants);
  };

  const handleSubmitEnfant = (e) => {
    e.preventDefault();
  
    // Reset errors
    setCinError('');
  
    const currentEnfant = enfants[currentIndex];
  
    // Check if an image has been selected
    if (!currentEnfant.image_enfant) {
      Swal.fire({
        title: 'Erreur',
        text: "Veuillez sélectionner une image pour l'enfant.",
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK',
      });
      return;
    }
  
    const data = new FormData();
    data.append('nom_enfant', currentEnfant.nom_enfant);
    data.append('prenom_enfant', currentEnfant.prenom_enfant);
    data.append('sexe_enfant', currentEnfant.sexe_enfant);
    data.append('age_enfant', currentEnfant.age_enfant);
    data.append('cin_enfant', currentEnfant.cin_enfant);
    data.append('image_enfant', currentEnfant.image_enfant);
    data.append('id_travailleur', id_travailleur);
  
    axios
      .post('http://localhost:8081/enfant/add', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        Swal.fire({
          title: 'Succès 🎉',
          text: `Enfant ${currentIndex + 1} ajouté avec succès !`,
          icon: 'success',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        }).then(() => {
          // Move to the next child or navigate to another page if all children are added
          if (currentIndex < nombreEnfants - 1) {
            setCurrentIndex(currentIndex + 1); // Show next child form
            setImage(null); // Réinitialiser l'image ici
          } else {
            navigate('/remplacant', { id_travailleur: localStorage.getItem("travailleurId") });
          }
        });
      })
      .catch((error) => {
        if (error.response && error.response.data.error && error.response.data.error.includes('CIN')) {
          setCinError('Le CIN est déjà utilisé. Veuillez entrer un CIN unique.');
        } else {
          console.error("Erreur lors de l'ajout de l'enfant:", error);
        }
      });
  };
  

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];

    if (file && file.type.startsWith('image/')) {
      setImage(URL.createObjectURL(file));
      handleEnfantChange('image_enfant', file);
    } else {
      Swal.fire({
        title: 'Erreur',
        text: "Veuillez sélectionner un fichier d'image valide.",
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleChange = (event) => {
    const file = event.target.files[0];

    if (file && file.type.startsWith('image/')) {
      setImage(URL.createObjectURL(file));
      handleEnfantChange('image_enfant', file);
    } else {
      Swal.fire({
        title: 'Erreur',
        text: "Veuillez sélectionner un fichier d'image valide.",
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK',
      });
    }
  };

  const calculateAge = (dateString) => {
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    // Vérifiez si l'anniversaire de cette année a eu lieu
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--; // Si l'anniversaire n'a pas eu lieu, décrémentez l'âge
    }
    return age;
};

  return (
    <div className='flex md:justify-center md:items-center md:h-screen'>
      <div className="pd-ltr-20 xs-pd-20-10">
        <div className="pd-20 card-box mb-30">
          <div className="clearfix">
            <div className="pull-left">
              <h4 className="text-blue h4">Enfant {currentIndex + 1} / {nombreEnfants}</h4>
              <p className="mb-30">Veuillez remplir tous les champs pour chaque enfant:</p>
            </div>
          </div>
          <form onSubmit={handleSubmitEnfant}>
            <div className="flex flex-col items-center">
              {/* Circular button for image upload */}
                <label 
                    htmlFor="file-input" 
                    className="w-32 h-32 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 cursor-pointer"
                  >
                {image ? (
                  // Display uploaded image
                  <img 
                    src={image} 
                    alt="Uploaded" 
                    className="rounded-full w-full h-full object-cover"
                  />
                ) : (
                  // Display placeholder text or icon
                  <FaCamera className="text-gray-500 text-5xl" />
                )}
              </label>

              {/* Hidden file input */}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleChange} 
                className="hidden" 
                id="file-input" 
                required 
                name="image_conjoint"
              />
            </div>
            <div className="row">
              <div className="col-md-6 col-sm-12">
                <div className="form-group">
                  <label>Nom de l'enfant</label>
                  <input
                    type="text"
                    onChange={(e) => handleEnfantChange('nom_enfant', e.target.value)}
                    value={enfants[currentIndex].nom_enfant}
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  />
                </div>
                
              </div>
              <div className="col-md-6 col-sm-12">
                <div className="form-group">
                  <label>Prénom de l'enfant</label>
                  <input
                    type="text"
                    onChange={(e) => handleEnfantChange('prenom_enfant', e.target.value)}
                    value={enfants[currentIndex].prenom_enfant}
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  />
                </div>
                
              </div>
            </div>

            <div className="row mb-3">
                <div className="col-md-4 col-sm-12">
                    <div className="form-group">
                        <label>Date de Naissance</label>
                        <input
                            type="date"
                            onChange={(e) => {
                                const age = calculateAge(e.target.value); // Calculez l'âge à partir de la date
                                handleEnfantChange('age_enfant', e.target.value); // Mettre à jour la date de naissance
                                handleEnfantChange('age_enfant_value', age); // Mettre à jour l'âge
                            }}
                            value={enfants[currentIndex].age_enfant}
                            required
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                        />
                    </div>
                </div>

                <div className="col-md-4 col-sm-12">
                    <div className="form-group">
                        <label>CIN de l'enfant</label>
                        <input
                            type="number"
                            onChange={(e) => handleEnfantChange('cin_enfant', e.target.value)}
                            value={enfants[currentIndex].cin_enfant}
                            required={calculateAge(enfants[currentIndex].age_enfant) >= 18} // Le CIN est requis si l'âge est >= 18
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                        />
                        {cinError && <p className="text-red-500 text-sm mt-1">{cinError}</p>}
                    </div>
                </div>

                <div className="col-md-4 col-sm-12">
                    <label htmlFor="sexe_enfant" className="block mb-2 text-sm font-medium text-gray-900">Sexe</label>
                    <select
                    id="sexe_enfant"
                    required
                    value={enfants[currentIndex].sexe_enfant}
                    onChange={(e) => handleEnfantChange('sexe_enfant', e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    >
                    <option value="">Sélectionner le sexe</option>
                    <option value="Femme">Femme</option>
                    <option value="Homme">Homme</option>
                    </select>
                </div>
            </div>

            {/* <div className="step-2">
              <label
                className="border-2 border-dashed border-gray-400 rounded-lg p-4 flex justify-center items-center cursor-pointer"
                onDrop={handleDrop}
                onDragOver={(event) => event.preventDefault()}
                htmlFor="file-input"
              >
                {image ? (
                  <img src={image} alt="Uploaded" className="max-w-full max-h-60" />
                ) : (
                  <p className="text-gray-500">Cliquez pour télécharger</p>
                )}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
                id="file-input"
                name="image_enfant"
                required
              />
            </div> */}

            <div className="flex justify-end">
              <Button type="submit">Envoyer</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Example;
