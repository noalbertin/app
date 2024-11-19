import React from "react";
import { GrEdit } from "react-icons/gr";
import EditTravailleurModal from "./EditTravailleurModal";
import { useState } from "react";

const TravailleurCard = ({ travailleur, handleModifierTravailleur }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    
    
      const closeModal = () => {
        setIsModalOpen(false);
      };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateAge = (dateString) => {
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  };

  
  const handleModifierTravailleurLocal = async (id_travailleur) => {
    try {
      const res = await axios.get(`http://localhost:8081/travailleur/${id_travailleur}`);
      const travailleurData = res.data;
  
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


        setValues({
          codeMenage: "",
          nom_travailleur: "",
          prenom_travailleur: "",
          sexe_travailleur: "",
          cin_travailleur: "",
          imageUrl_travailleur:"",
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
  const openModal = async () => {
    await fetchTravailleurData(travailleur.id_travailleur); // Récupérer les données du travailleur avant d'ouvrir le modal
    setIsModalOpen(true);
  };

  const [travailleurData, setTravailleurData] = useState(null);
  const fetchTravailleurData = async (id_travailleur) => {
    try {
      const res = await axios.get(`http://localhost:8081/travailleur/${id_travailleur}`);
      setTravailleurData(res.data); // Stockez les données récupérées dans l'état
    } catch (error) {
      console.error("Erreur lors de la récupération des données du travailleur:", error);
    }
  };

  const handleSave = async (updatedValues) => {
    await handleModifierTravailleur(updatedValues.id_travailleur, updatedValues);
    closeModal();
  };


  return (
    <div className="max-w-sm bg-slate-50 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow duration-300 dark:bg-slate-800">
      <img
        className="w-full h-48 object-cover"
        src={`http://localhost:8081/${travailleur.imageUrl.replace('backend/', '')}`}
        alt="Travailleur"
      />
      <div className="p-5">
        <h5 className="text-lg font-bold dark:text-slate-200">{travailleur.nom} {travailleur.prenom}</h5>
        <p className="text-sm text-gray-700 dark:text-slate-300">Travailleur, Né le : {formatDate(travailleur.age)}</p>
        <p className="text-sm text-gray-700 dark:text-slate-300">Âge: {calculateAge(travailleur.age)} ans</p>
        <p className="text-sm text-gray-700 dark:text-slate-300">Sexe: {travailleur.sexe}</p>
        <p className="text-sm text-gray-700 dark:text-slate-300">CIN: {travailleur.cin}</p>
        <p className="text-sm text-gray-700 dark:text-slate-300">Rôle: {travailleur.role}</p>
        <div className="flex justify-end gap-2">
          <button onClick={openModal}  style={{ color: "#265ed7" }}>
            <GrEdit />
          </button>
        </div>
      </div>
      <EditTravailleurModal
        isOpen={isModalOpen}
        onClose={closeModal}
        travailleur={travailleurData} // Passez les données récupérées au modal
        handleSave={handleSave}
      />
    </div>
  );
};

export default TravailleurCard;
