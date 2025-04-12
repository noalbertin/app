import React, { useState } from "react";
import axios from "axios";

const TravailleurModal = ({ travailleur, closeModal }) => {
  const [formData, setFormData] = useState({
    id_travailleur: travailleur.id_travailleur,
    codeMenage: travailleur.codeMenage,
    nom_travailleur: travailleur.nom,
    prenom_travailleur: travailleur.prenom,
    sexe_travailleur: travailleur.sexe,
    cin_travailleur: travailleur.cin,
    role: travailleur.role,
    vivant: travailleur.vivant,
    age_travailleur: travailleur.age,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:8081/travailleur/modifierTravailleur/${formData.id_travailleur}`,
        formData
      );
      alert("Travailleur modifié avec succès !");
      closeModal();
    } catch (error) {
      console.error("Erreur lors de la modification du travailleur :", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Modifier le travailleur</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              name="nom_travailleur"
              value={formData.nom_travailleur}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Prénom</label>
            <input
              type="text"
              name="prenom_travailleur"
              value={formData.prenom_travailleur}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Sexe</label>
            <select
              name="sexe_travailleur"
              value={formData.sexe_travailleur}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="HOMME">Homme</option>
              <option value="FEMME">Femme</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">CIN</label>
            <input
              type="text"
              name="cin_travailleur"
              value={formData.cin_travailleur}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Rôle</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Âge</label>
            <input
              type="date"
              name="age_travailleur"
              value={formData.age_travailleur}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="mr-2 bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TravailleurModal;