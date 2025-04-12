import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { FiPrinter } from 'react-icons/fi'; // Icone de l'imprimante

const Profil = () => {
  const { id_travailleur } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const printRef = useRef(); // Référence pour l'impression

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/travailleur/profil/${id_travailleur}`);
        setData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id_travailleur]);

  // Fonction d'impression
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Profil_${data?.nom_travailleur}`,
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Erreur: {error.message}</p>;

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("fr-FR", {
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
  };
  const calculateAge = (birthdate) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className=" mt-10 p-6 bg-slate-50 shadow-lg rounded-lg dark:bg-gray-800">
      {/* Bouton pour imprimer en haut à droite */}
      <div className="flex justify-end mb-4 no-print">
        <button
          onClick={handlePrint}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <FiPrinter className="mr-2" /> Imprimer / Générer PDF
        </button>
      </div>

      {/* Contenu à imprimer */}
      <div ref={printRef} className="printable-area m-5">
        {/* Header - Worker Information */}
        <div className="flex items-center space-x-6 mb-6">
          <img
            src={data?.imageUrl_travailleur
              ? `http://localhost:8081/${data.imageUrl_travailleur.replace('backend/', '')}`
              : 'default-image-url.jpg'} // Fallback image
            alt={data? `${data.nom_travailleur}` : "Nom de travailleur"} // Fallback alt text
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{data? `${data.nom_travailleur}` : "Nom de travailleur"}</h1>
            <p className="text-gray-600 dark:text-gray-400">Code Ménage: {data?.codeMenage || 'N/A'}</p>
            <p className="text-gray-600 dark:text-gray-400">Sexe: {data?.sexe_travailleur || 'N/A'}</p>
            <p className="text-gray-600 dark:text-gray-400">Date de Naissance: {formatDate(data?.age_travailleur || 'N/A')}</p>
            <p className="text-gray-600 dark:text-gray-400">Âgee: {calculateAge(data?.age_travailleur || 'N/A')} ans</p>
            <p className="text-gray-600 dark:text-gray-400">CIN: {data?.cin_travailleur || 'N/A'}</p>
            <p className="text-gray-600 font-semibold dark:text-gray-300">Rôle: {data?.role || 'N/A'}</p>
          </div>
        </div>

        <hr className="my-6 border-gray-300 dark:border-gray-600" />

        {/* Conjoints Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Conjoints</h2>
          {data.conjoints.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.conjoints.map((conjoint, index) => (
                <div key={`${conjoint.id_conjoint}-${index}`} className="flex items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                  <img
                    src={`http://localhost:8081/${conjoint.imageUrl_conjoint.replace('backend/', '')}`}
                    alt={`${conjoint.nom_conjoint}`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600 mr-4"
                  />
                  <div>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">{conjoint.nom_conjoint} {conjoint.prenom_conjoint}</p>
                    <p className="text-gray-600 dark:text-gray-400">Sexe: {conjoint.sexe_conjoint}</p>
                    <p className="text-gray-600 dark:text-gray-400">Date de Naissance: {formatDate(conjoint.age_conjoint)}</p>
                    <p className="text-gray-600 dark:text-gray-400">Âge: {calculateAge(conjoint.age_conjoint)} ans</p>
                    <p className="text-gray-600 dark:text-gray-400">CIN: {conjoint.cin_conjoint}</p>
                    
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Aucun conjoint trouvé.</p>
          )}
        </div>

        <hr className="my-6 border-gray-300 dark:border-gray-600" />

        {/* Enfants Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Enfants</h2>
          {data.enfants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.enfants.map((enfant, index) => (
                <div key={`${enfant.id_enfant}-${index}`} className="flex items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                  <img
                    src={`http://localhost:8081/${enfant.imageUrl_enfant.replace('backend/', '')}`}
                    alt={`${enfant.nom_enfant}`}
                    className="w-16 h-16 rounded-full border-2 border-gray-300 dark:border-gray-600 mr-4"
                  />
                  <div>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">{enfant.nom_enfant} {enfant.prenom_enfant}</p>
                    <p className="text-gray-600 dark:text-gray-400">Sexe: {enfant.sexe_enfant}</p>
                    <p className="text-gray-600 dark:text-gray-400">Date de Naissance: {formatDate(enfant.age_enfant)}</p>
                    <p className="text-gray-600 dark:text-gray-400">Âge: {calculateAge(enfant.age_enfant)} ans</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      CIN:
                      {enfant.cin_enfant === 0
                      ? enfant.sexe_enfant === 'FEMME' ? ' Encore mineure' : ' Encore mineur'
                      : ` ${enfant.cin_enfant}`}
                    </p>
                    
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Aucun enfant trouvé.</p>
          )}
        </div>

        <hr className="my-6 border-gray-300 dark:border-gray-600" />

        {/* Remplaçant Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Remplaçant</h2>
            {data.remplacant ? (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {data.remplacant.relation_remplacant === 'Self'
                    ? `${data.nom_travailleur} ${data.prenom_travailleur}`
                    : `${data.remplacant.nom_remplacant} ${data.remplacant.prenom_remplacant}`}
                </p>

                <p className="text-gray-600 dark:text-gray-400">Relation: {data.remplacant.relation_remplacant}</p>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Aucun remplaçant désigné.</p>
            )}
          </div>

          {/* Récepteur Section */}
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Récepteur de transfert</h2>
            {data.vivant === 1 ? (
              // Si le travailleur est vivant, il est le récepteur
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{data.nom_travailleur} {data.prenom_travailleur}</p>
                <p className="text-gray-600 dark:text-gray-400">Relation: Travailleur</p>
              </div>
            ) : (
              // Sinon, afficher le remplaçant comme récepteur
              data.remplacant ? (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">{data.remplacant.nom_remplacant} {data.remplacant.prenom_remplacant}</p>
                  <p className="text-gray-600 dark:text-gray-400">Relation: {data.remplacant.relation_remplacant}</p>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Aucun remplaçant désigné.</p>
              )
            )}
          </div>
        </div>
      </div>
    </div>

  );
};

export default Profil;
