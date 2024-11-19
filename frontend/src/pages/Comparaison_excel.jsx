import React, { useEffect, useState, useRef, useContext } from 'react';
import axios from 'axios';
import { FaPlus, FaMinus, FaPrint } from "react-icons/fa";
import ReactToPrint from "react-to-print";
import { ThemeContext } from "../context/ThemeContext"; 
import { FaCheckCircle , FaTimesCircle  } from 'react-icons/fa';
import FieldComparison from '../components/FieldComparison';
import SkeletonLoader from '../skeleton/SkeletonLoader';

const Comparaison_excel = () => {
  const [nomsCommuns, setNomsCommuns] = useState([]);
  const [filteredNames, setFilteredNames] = useState([]);
  const [displayedNames, setDisplayedNames] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [selectedName, setSelectedName] = useState(null);
  const comparaisonRef = useRef();
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Récupération des doublons via l'API
  useEffect(() => {
    axios.get('http://localhost:8081/excel/noms-communs')
      .then((response) => {
        setNomsCommuns(response.data);
        setFilteredNames(response.data);
        setDisplayedNames(response.data.slice(0, 4)); // Limite initiale à 4 noms affichés
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des noms communs :", error);
      });
  }, []);
  
  // Met à jour `filteredNames` selon `searchTerm`
  useEffect(() => {
    const filtered = nomsCommuns.filter((nameObj) =>
      nameObj.nom_commun.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNames(filtered);
    setDisplayedNames(filtered.slice(0, 4));
  }, [searchTerm, nomsCommuns]);

  // Gestion de la sélection d'un nom
  const handleNameClick = (nameObj) => {
    setSelectedName(nameObj);
  };

// Mise à jour de l'affichage selon `showAll`
useEffect(() => {
  setDisplayedNames(filteredNames); // Affiche tous les noms sans limitation
}, [filteredNames]);


  // Définir les champs à comparer
  const fieldsToCompare = [
    { label: 'Numéro de ménage', key: 'num_ménage' },
    { label: 'Chef de ménage', key: 'nom_chef_ménage' },
    { label: 'Statut', key: 'statut' },
    { label: 'Récepteur de transfert', key: 'récepteur_transfert' },
    { label: 'Sexe', key: 'sexe' },
    { label: 'CIN Récepteur', key: 'cin_récepteur' },
    { label: 'Travailleur', key: 'nom_travailleur' },
    { label: 'Remplaçant', key: 'remplaçant' },
    { label: 'Groupe Critère', key: 'groupe_critere' },
    { label: 'Direction', key: 'direction' },
    { label: 'Région', key: 'region' },
    { label: 'District', key: 'district' },
    { label: 'Commune', key: 'commune' },
    { label: 'Fokontany', key: 'fokontany' },
    { label: 'Mère', key: 'mère' },
  ];

  return (
    <>
    <div className="flex justify-end mb-3 mt-4">
          <div className="relative w-full md:w-1/3 ">
            <input
              type="text"
              className="border p-2 rounded w-full dark:text-slate-700 "
              placeholder="Rechercher le nom ou prénom identique"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setSearchTerm('')}
              >
                ✕ {/* Icône pour effacer */}
              </button>
            )}
          </div>
          </div>
      <div className="title pb-2 mt-3 z-10 flex flex-col">
        <div>
          <h2 className="h3 mb-0 dark:text-slate-50">Tous les noms communs et doublons</h2>
        </div>
        <div className="flex justify-end items-center mb-4 gap-1">
          <ReactToPrint
            trigger={() => (
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-slate-50 rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-300">
                <FaPrint /> Imprimer
              </button>
            )}
            content={() => comparaisonRef.current}
          />

          {filteredNames.length > 4 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-4 py-2 flex items-center gap-2 bg-blue-500 text-slate-50 rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300"
            >
              {showAll ? <FaMinus /> : <FaPlus />} {showAll ? "Voir moins" : "Voir tous"}
            </button>
          )}
        </div>
      </div>

      <div className="p-2" >
        <div className="w-full max-w-4xl mx-auto"> 
          <div className={`flex flex-row flex-wrap ${!showAll ? 'max-h-24 overflow-y-auto' : ''}`}>
            {displayedNames.length === 0 ? (
              <p>Aucun doublon trouvé</p>
            ) : (
              displayedNames.map((nameObj, index) => (
                <div key={index} className="w-1/2 md:w-1/4 p-2">
                  <div
                    className="bg-blue-100 p-3 rounded-lg flex justify-center cursor-pointer"
                    onClick={() => handleNameClick(nameObj)}
                  >
                    {/* Afficher nom_commun */}
                    <span className="text-lg font-semibold text-gray-800">{nameObj.nom_commun}</span>
                  </div>
                </div>

              ))
            )}
          </div>
        </div>

        <div className="p-2" ref={comparaisonRef}> 
          {selectedName ? (
            <div>
              <h3 className="text-lg font-semibold dark:text-slate-50">
                Détails pour : {selectedName.nom_commun}
              </h3>
              <div className="mt-3">
                <div className={`grid md:mb-12 md:grid-cols-2 gap-6 ${isDarkMode ? "bg-slate-900 text-slate-50" : "bg-gray-50 text-slate-800"}`}>

                  {/* Carte pour Ménage 1 */}
                  <div className="p-4 border rounded-lg shadow-lg dark:bg-slate-800 dark:text-slate-50 bg-slate-100">
                    {fieldsToCompare.map((field, idx) => (
                      <p className=" gap-4 py-2 px-3  text-slate-900 dark:text-slate-50" key={idx}>
                        <strong>{field.label}:</strong> {selectedName[`${field.key}_1`]}
                      </p>
                    ))}
                  </div>

                  {/* Carte pour Ménage 2 avec icônes de correspondance */}
                  <div className="p-4 border rounded-lg shadow-lg dark:bg-slate-800 dark:text-slate-50 bg-slate-100">
                    {fieldsToCompare.map((field, idx) => (
                      <FieldComparison 
                        key={idx}
                        label={field.label}
                        value1={selectedName[`${field.key}_1`]}
                        value2={selectedName[`${field.key}_2`]}
                      />
                    ))}
                  </div>

                </div>
              </div>
            </div>
          ) : (
            <p>Sélectionnez un nom pour afficher les détails.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Comparaison_excel;
