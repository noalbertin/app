import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from 'react-router-dom';
import { ImCross } from "react-icons/im";
import Swal from 'sweetalert2';
import BackToTop from "../components/BackToTop";
import { IoPersonAddSharp } from "react-icons/io5";
import FamilleSkeleton from "../skeleton/FamilleSkeleton";
import { FaCamera } from "react-icons/fa";


const Famille = () => {
  const location = useLocation();
  const id_travailleur = location.state?.id_travailleur || localStorage.getItem("travailleurId");
  const [famille, setFamille] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Nouve
  


  const [image, setImage] = useState(null);
  const [ageEnfant, setAgeEnfant] = useState(''); // State pour l'âge
  const [formData, setFormData] = useState({
    nom_enfant: '',
    prenom_enfant: '',
    cin_enfant: '',
    age_enfant: '',
    sexe_enfant: '',
    image_enfant: null,
  });
  
  const [isMinor, setIsMinor] = useState(true); // Pour savoir si l'enfant est mineur
  const [cinError, setCinError] = useState('');

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
  
  // Fonction de gestion du changement de champ (y compris pour le fichier)
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });

    if (name === 'age_enfant') {
      const calculatedAge = calculateAge(value);
      setAgeEnfant(calculatedAge);
    }
  };

  // Validation au moment de la soumission du formulaire
  const handleSubmitEnfant = async (e) => {
    e.preventDefault();
    setCinError(''); // Réinitialiser le message d'erreur avant chaque soumission

    // Calculer l'âge de l'enfant
    const age = calculateAge(new Date(formData.age_enfant));

    // Vérifier que le CIN est requis uniquement si l'âge est >= 18
    if (age >= 18 && !formData.cin_enfant) {
      setCinError('Le CIN est requis pour les enfants de 18 ans et plus.');
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    data.append('id_travailleur', id_travailleur);

    try {
      await axios.post('http://localhost:8081/enfant/add', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await Swal.fire({
        title: 'Succès 🎉',
        text: 'Enfant ajouté avec succès !',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });

      setIsModalOpen(false);
      setFormData({
        nom_enfant: '',
        prenom_enfant: '',
        cin_enfant: '',
        age_enfant: '',
        sexe_enfant: '',
        image_enfant: null,
      });
      setImage(null);
      fetchFamille();
    } catch (error) {
      if (error.response?.data?.error?.includes('CIN')) {
        setCinError('Le CIN est déjà utilisé. Veuillez entrer un CIN unique.');
      } else {
        console.error("Erreur lors de l'ajout de l'enfant:", error);
      }
    }
  };

  
  
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];

    if (file && file.type.startsWith('image/')) {
      setImage(URL.createObjectURL(file));
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

  const fetchFamille = async () => {
    setLoading(true); // Indique que le chargement a commencé
    try {
      const response = await axios.get(`http://localhost:8081/travailleur/famille/${id_travailleur}`);
      setFamille(response.data);
      console.log(response.data);
    } catch (err) {
      setError('Erreur lors de la récupération des informations.');
    } finally {
      setLoading(false); // Indique que le chargement est terminé
    }
  };

  useEffect(() => {
    setTimeout(async () => {
      fetchFamille(); 
    }, 500);// Appel initial pour charger les données
  }, [id_travailleur]);

  if (loading) return <FamilleSkeleton/>;
  if (error) return <div>{error}</div>;

  const { travailleur, conjoint, enfants } = famille;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleOpenModal = () => setIsModalOpen(true); // Ouvre le modal
  const handleCloseModal = () => setIsModalOpen(false); // Ferme le modal




  const handleModifierTravailleur = async (id_travailleur) => {
    try {
      // Récupérer les données correspondant au numProduit
      const res = await axios.get(`http://localhost:8081/travailleur/${id_travailleur}`);
      const travailleurData = res.data;

      // Mettre les données dans les valeurs du formulaire
      setValues({
        id_travailleur: travailleurData.id_travailleur,
        codeMenage: travailleurData.codeMenage,
        nom_travailleur: travailleurData.nom_travailleur,
        prenom_travailleur: travailleurData.prenom_travailleur,
        sexe_travailleur: travailleurData.sexe_travailleur,
        cin_travailleur: travailleurData.cin_travailleur,
        role: travailleurData.role,
        vivant: travailleurData.vivant,
      });
    } catch (error) {
      console.error("Error fetching travailleur data:", error);
    }
  };


  const handleModificationTravailleur = async (e, id_travailleur) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8081/travailleur/modifierTravailleur/${id_travailleur}`, values);
      fetchData().then(() => {
        Swal.fire({
          title: "Succès 🎉",
          text: "Modification Réussie !",
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
        });

        closeModal ();

        setValues({
          codeMenage: "",
          nom_travailleur: "",
          prenom_travailleur: "",
          sexe_travailleur: "",
          cin_travailleur: "",
          role: "",
          vivant:"",
        });
      });
    } catch (error) {

      if (error.response && error.response.status === 400) {
        // Mise à jour des erreurs reçues du serveur
        setErrors(error.response.data);
      } else {
        console.log("Erreur inconnue", error);
      }
    }
  };

  const TravailleurList = ({ travailleur }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTravailleur, setSelectedTravailleur] = useState(null);
  
    const handleModifierClick = (travailleur) => {
      setSelectedTravailleur(travailleur);
      setIsModalOpen(true);
    };
  
    const closeModal = () => {
      setIsModalOpen(false);
      setSelectedTravailleur(null);
    };
  }


  return (
    <>
      <div className="flex justify-end mt-5">
        <button
          type="button"
          onClick={handleOpenModal}
          className="flex items-center gap-2 text-white bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 focus:ring-4 focus:outline-none focus:ring-pink-300 dark:focus:ring-pink-800 font-medium rounded-lg text-md px-6 py-3 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <IoPersonAddSharp className="text-lg" /> {/* Icône plus grande et mieux intégrée */}
          Ajouter un enfant
        </button>
      </div>

      <div className="flex justify-center text-slate-50 p-5">
        <div className="w-full max-w-6xl">
          <div className="flex justify-center mb-12">
            <h1 className="uppercase text-4xl leading-normal font-bold dark:text-slate-100">
              Membre de la famille
            </h1>
          </div>

          {/* Section des parents */}
<div className="flex flex-wrap justify-center gap-6 p-6">
  {/* Afficher le travailleur */}
  {travailleur && (
    <div className="max-w-sm bg-slate-50 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow duration-300 dark:bg-slate-800 transform transition-all duration-300 hover:scale-105">
      <img
        className="w-full h-48 object-cover"
        src={`http://localhost:8081/${travailleur.imageUrl.replace('backend/', '')}`}
        alt="Travailleur"
      />
      <div className="p-5">
        <h5 className="text-lg font-bold dark:text-slate-200">{travailleur.nom} {travailleur.prenom}</h5>
        <p className="text-sm text-gray-700 dark:text-slate-300">{travailleur.sexe === 'FEMME' ? 'Travailleur, née le ' : 'Travailleur, né le '} {formatDate(travailleur.age)}</p>
        <p className="text-sm text-gray-700 dark:text-slate-300">Âge: {calculateAge(travailleur.age)} ans</p>
        <p className="text-sm text-gray-700 dark:text-slate-300">Sexe: {travailleur.sexe}</p>
        <p className="text-sm text-gray-700 dark:text-slate-300">CIN: {travailleur.cin}</p>
        <p className="text-sm text-gray-700 dark:text-slate-300">Rôle: {travailleur.role}</p>

      </div>
      
                                                         
                                      
    </div>
  )}

  {/* Afficher le conjoint */}
  {conjoint && (
    <div className="max-w-sm bg-slate-50 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow duration-300 dark:bg-slate-800 transform transition-all duration-300 hover:scale-105">
      <img
        className="w-full h-48 object-cover"
        src={`http://localhost:8081/${conjoint.imageUrl.replace('backend/', '')}`}
        alt="Conjoint"
      />
      <div className="p-5">
        <h5 className="text-lg font-bold dark:text-slate-200">{conjoint.nom} {conjoint.prenom}</h5>
        <p className="text-sm text-gray-700 dark:text-slate-300">{conjoint.sexe === 'FEMME' ? 'Conjoint, née le ' : 'Conjoint, né le '} {formatDate(conjoint.age)}</p>
        <p className="text-sm text-gray-700 dark:text-slate-300">Âge: {calculateAge(conjoint.age)} ans</p>
        <p className="text-sm text-gray-700 dark:text-slate-300">Sexe: {conjoint.sexe}</p>
        <p className="text-sm text-gray-700 dark:text-slate-300">CIN: {conjoint.cin}</p>
      </div>
    </div>
  )}

  {/* Afficher les enfants */}
  {enfants &&
    enfants.map((enfant) => (
      <div
        className="max-w-sm bg-slate-50 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow duration-300 dark:bg-slate-800 transform transition-all duration-300 hover:scale-105"
        key={enfant.id}
      >
        <img
          className="w-full h-48 object-cover"
          src={`http://localhost:8081/${enfant.imageUrl.replace('backend/', '')}`}
          alt="Enfant"
        />
        <div className="p-5">
          <h5 className="text-lg font-bold dark:text-slate-200">{enfant.nom} {enfant.prenom}</h5>
          <p className="text-sm text-gray-700 dark:text-slate-300">{enfant.sexe === 'FEMME' ? 'Enfant, née le ' : 'Enfant, né le '} {formatDate(enfant.age)}</p>
          <p className="text-sm text-gray-700 dark:text-slate-300">Âge: {calculateAge(enfant.age)} ans</p>
          <p className="text-sm text-gray-700 dark:text-slate-300">Sexe: {enfant.sexe}</p>
          <p className="text-sm text-gray-700 dark:text-slate-300">
            CIN:
            {enfant.cin === '0'
              ? enfant.sexe === 'FEMME' ? ' Encore mineure' : ' Encore mineur'
              : ` ${enfant.cin}`}
          </p>
        </div>
      </div>
    ))}
</div>
        </div>
      </div>

       {/* Modal */}

       {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg shadow-lg md:w-3/5 m-2 md:m-0 transform transition-all duration-300 scale-100 
                            max-h-[90vh] overflow-y-auto">
              
              {/* Header du modal */}
              <div className="flex justify-between items-center p-4 border-b">
                <h4 className="text-lg font-semibold dark:text-slate-50">Ajouter un Enfant</h4>
                <button className="text-gray-600 hover:text-gray-900" onClick={handleCloseModal}>
                  <ImCross />
                </button>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmitEnfant}>
                <div className="flex flex-col items-center pt-3">
                  {/* Circular button for image upload */}
                    <label 
                        htmlFor="file-input" 
                        className="w-32 h-32 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 cursor-pointer"
                      >
                    {formData.image_enfant ? (
                      // Display uploaded image
                      <img 
                        src={URL.createObjectURL(formData.image_enfant)}
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
                    name="image_enfant" 
                    onChange={handleChange} 
                    className="hidden" 
                    id="file-input" 
                    required 
                  />
                </div>
                <div className="p-4">
                  <div className="grid gap-4 mb-4 grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nom de l'enfant</label>
                      <input
                        type="text"
                        name="nom_enfant"
                        onChange={handleChange}
                        required
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Prenom de l'enfant</label>
                      <input
                        type="text"
                        name="prenom_enfant"
                        onChange={handleChange}
                        required
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 mb-4 grid-cols-3">
                    <div className="form-group">
                        <label>Date de Naissance</label>
                        <input
                          type="date"
                          name="age_enfant"
                          required
                          onChange={handleChange}
                          className="bg-gray-50 border cursor-pointer border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        />
                    </div>

                    
                    <div>
                      <div className="form-group">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">CIN</label>
                        <input
                          type="number"
                          name="cin_enfant"
                          onChange={handleChange}
                          required={ageEnfant >= 18}
                          className={`bg-gray-50 border ${cinError ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-md rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white`}
                        />
                        {cinError && <p className="text-red-500 text-sm mt-1">{cinError}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Sexe</label>
                      <select
                        name="sexe_enfant"
                        required
                        onChange={handleChange}
                        className="bg-gray-50 border cursor-pointer border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      >
                        <option value="" disabled selected>Selectionner le sexe</option>
                        <option value="FEMME">Femme</option>
                        <option value="HOMME">Homme</option>
                      </select>
                    </div>
                  </div>

                  {/* <div className="step-2">
                    <label className="border-2 border-dashed p-4 flex justify-center items-center cursor-pointer">
                      {formData.image_enfant ? (
                        <img
                          src={URL.createObjectURL(formData.image_enfant)}
                          alt="Uploaded"
                          className="max-w-full max-h-60"
                        />
                      ) : (
                        <p className="text-gray-500">Cliquez pour télécharger une image</p>
                      )}
                      <input
                        type="file"
                        name="image_enfant"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                        required
                      />
                    </label>
                  </div> */}
                  
                </div>

                {/* Footer du modal */}
                <div className="flex justify-end p-4 border-t">
                  <button type="button" className="px-4 py-2 bg-red-500 text-white rounded mr-2" onClick={handleCloseModal}>
                    Fermer
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <BackToTop/>

    </>
   


  );
};

export default Famille;
