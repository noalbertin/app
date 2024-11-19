import { Button } from 'flowbite-react'
import React from 'react'
import { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const Conjoint = () => {
  const [formData, setFormData] = useState({
    nom_conjoint: "",
    prenom_conjoint: "",
    sexe_conjoint: "",
    age_conjoint: "",
    cin_conjoint: "",
    image_conjoint: null,
    id_travailleur: "", 
  });
  const [cinError, setCinError] = useState("");
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [nombreEnfants, setNombreEnfants] = useState(); // Nombre d'enfants

  const handleSubmitConjoint = (e) => {
    e.preventDefault();
  
    // Réinitialiser les erreurs
    setCinError("");
  
    // Vérification si une image a bien été sélectionnée
    if (!formData.image_conjoint) {
      Swal.fire({
        title: "Erreur",
        text: "Veuillez sélectionner une image pour le conjoint.",
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      });
      return;
    }
  
    const data = new FormData();
    data.append('nom_conjoint', formData.nom_conjoint);
    data.append('prenom_conjoint', formData.prenom_conjoint);
    data.append('sexe_conjoint', formData.sexe_conjoint);
    data.append('age_conjoint', formData.age_conjoint);
    data.append('cin_conjoint', formData.cin_conjoint);
    data.append('image_conjoint', formData.image_conjoint);
    data.append('id_travailleur', localStorage.getItem('travailleurId'));
  
    axios.post('http://localhost:8081/conjoint/addConjoint', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then((res) => {
      Swal.fire({
        title: "Succès 🎉",
        text: "Conjoint ajouté avec succès !",
        icon: "success",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      }).then(() => {
        const numberOfChildren = parseInt(nombreEnfants, 10); // Convert to a number
        if (numberOfChildren === 0) {
          // Rediriger vers la page d'accueil si le nombre d'enfants est 0
          navigate("/remplacant",{
            state: {
              id_travailleur: localStorage.getItem("travailleurId"), // Passer l'id_travailleur
            },
          }); 
        } else {
          // Rediriger vers la page Enfant si le nombre d'enfants est supérieur à 0
          navigate("/enfant", {
            state: {
              id_travailleur: localStorage.getItem("travailleurId"), // Passer l'id_travailleur
              nombreEnfants: numberOfChildren, // Passer le nombre d'enfants
            },
          });
        }
      });
    }).catch(error => {
      // Vérifier si l'erreur vient du CIN déjà utilisé
      if (error.response && error.response.data.error && error.response.data.error.includes("CIN")) {
        setCinError("Le CIN est déjà utilisé. Veuillez entrer un CIN unique.");
      } else {
        console.error('Erreur lors de l\'ajout du conjoint:', error);
      }
    });
  };
  
  
  
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    
    // Vérification que le fichier est une image
    if (file && file.type.startsWith("image/")) {
      setImage(URL.createObjectURL(file));
      setFormData({ ...formData, image_conjoint: file });
    } else {
      Swal.fire({
        title: "Erreur",
        text: "Veuillez sélectionner un fichier d'image valide.",
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      });
    }
  };
  
  const handleChange = (event) => {
    const file = event.target.files[0];
    
    // Vérification que le fichier est une image
    if (file && file.type.startsWith("image/")) {
      setImage(URL.createObjectURL(file));
      setFormData({ ...formData, image_conjoint: file });
    } else {
      Swal.fire({
        title: "Erreur",
        text: "Veuillez sélectionner un fichier d'image valide.",
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      });
    }
  };
  

  return (
    <div className="flex md:justify-center md:items-center md:h-screen">
      <div className="pd-ltr-20 xs-pd-20-10">
        <div className="pd-20 card-box mb-30">
          <div className="clearfix">
            <div className="pull-left">
              <h4 className="text-blue h4">A propos du Conjoint</h4>
              <p className="mb-30">Veuiller Remplir tous les champs:</p>
            </div>
          </div>
          <form onSubmit={handleSubmitConjoint}>
            <div className="row">
              <div className="col-md-6 col-sm-12">
                <div className="form-group">
                  <label>Nom du Conjoint</label>
                  <input 
                    type="text" 
                    onChange={(e) => setFormData({ ...formData, nom_conjoint: e.target.value })}
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="col-md-6 col-sm-12">
                <div className="form-group">
                  <label>Prénom du Conjoint</label>
                  <input 
                    type="text" 
                    onChange={(e) => setFormData({ ...formData, prenom_conjoint: e.target.value })}
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-3 col-sm-12">
                <div className="form-group">
                  <label>CIN du Conjoint</label>
                  <input 
                    type="number" 
                    onChange={(e) => setFormData({ ...formData, cin_conjoint: e.target.value })}
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  />
                  {/* Affichage de l'erreur sous l'input */}
                  {cinError && <p className="text-red-500 text-sm mt-1">{cinError}</p>}
                </div>
              </div>
              <div className="col-md-3 col-sm-12">
                <div className="form-group">
                  <label>Date de Naissance</label>
                  <input 
                    type="date"
                    onChange={(e) => setFormData({ ...formData, age_conjoint: e.target.value })}
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="col-md-3 col-sm-12">
                <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Sexe</label>
                <select 
                  id="category" 
                  required
                  onChange={(e) => setFormData({ ...formData, sexe_conjoint: e.target.value })} 
                  className="bg-gray-50 border cursor-pointer border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                >
                  <option value="">Selectionner le sexe</option>
                  <option value="Femme">Femme</option>
                  <option value="Homme">Homme</option>
                </select>
              </div>

              <div className="col-md-3 col-sm-12">
                <div className="form-group">
                  <label>Nombre d'enfant</label>
                  <input 
                    type="number" 
                    required
                    value={nombreEnfants}
                    onChange={(e) => setNombreEnfants(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

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
                name='image_conjoint'
              />
            </div>

            <div className='flex justify-end'>
              <Button type='submit'>Envoyer</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Conjoint;

