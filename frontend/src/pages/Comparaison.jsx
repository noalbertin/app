import React, { useEffect, useState, useRef, useContext } from 'react';
import axios from 'axios';
import { FaPlus, FaMinus, FaArrowUp , FaUserTie  } from "react-icons/fa";
import ReactToPrint from "react-to-print";
import { FaPrint } from "react-icons/fa6";
import { ThemeContext } from "../context/ThemeContext"; 
import { SiMicrosoftexcel } from "react-icons/si";
import BackToTop from '../components/BackToTop';
import Comparaison_excel from './Comparaison_excel';
import SkeletonLoader from '../skeleton/SkeletonLoader';


const Comparaison = () => {
  const [namesData, setNamesData] = useState([]);
  const [detailsData, setDetailsData] = useState({ travailleurs: [], conjoints: [], enfants: [] });
  const [selectedName, setSelectedName] = useState(null); // État pour le nom sélectionné
  const comparaisonRef = useRef();
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";
  const [activeTab, setActiveTab] = useState("travailleur");
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false); // Gérer l'affichage limité ou complet
  const [searchTerm, setSearchTerm] = useState(''); // Gérer le terme de recherche
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);


  // Utiliser useEffect pour récupérer les noms avec les ids au chargement
 
    const fetchNamesData = async () => {
      try {
        const response = await axios.get('http://localhost:8081/comparaison/nom_comparaison');
        setNamesData(response.data.duplicateNames);
        setDetailsData({
          travailleurs: response.data.travailleurs,
          conjoints: response.data.conjoints,
          enfants: response.data.enfants
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };

  useEffect(() => {
    setTimeout(async () => {
      fetchNamesData();
     }, 1000);
  }, []);

  // Fonction pour afficher les détails des ids
  const getDetailsById = (id) => {
    const allDetails = [...detailsData.travailleurs, ...detailsData.conjoints, ...detailsData.enfants];
    return allDetails.find(detail => detail.id === id);
  };

  // Fonction pour gérer la sélection d'un nom
  const handleNameClick = (nameObj) => {
    setSelectedName(nameObj);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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


  // Filtrer les noms selon le terme de recherche
  const filteredNames = namesData.filter((nameObj) =>
    nameObj.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const displayedNames = filteredNames;

   // Fonction pour gérer la sélection d'un onglet
   const handleTabChange = (tab) => {
    setActiveTab(tab);
  };


  return (
    <>
      <div className="border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
          <li className="mr-2">
            <button 
              onClick={() => handleTabChange("travailleur")} 
              className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg ${
                activeTab === "travailleur" 
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }`}
            >
              <FaUserTie className={`mr-2 text-md  ${
                activeTab === "travailleur" 
                  ? "text-blue-600 border-blue-600 dark:text-blue-500"
                  : "text-gray-500"}`} /> Personne
            </button>
          </li>
          <li className="mr-2">
            <button 
              onClick={() => handleTabChange("excel")} 
              className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg ${
                activeTab === "excel" 
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }`}
            >
              <SiMicrosoftexcel className={`mr-2 text-md  ${
                activeTab === "excel" 
                  ? "text-blue-600 border-blue-600 dark:text-blue-500"
                  : "text-gray-500"}`} /> Fichier Excel
            </button>
          </li>
        </ul>
      </div>

      {activeTab === "travailleur" && (
        <div className="travailleur">
          <div className="">
            
            <div className="flex justify-end mb-3 mt-4">
              <div className="relative w-full md:w-1/3 ">
                  <input
                    type="text"
                    className="border p-2 rounded w-full dark:text-slate-700"
                    placeholder="Rechercher le nom ou prenom identique"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setSearchTerm('')}
                    >
                      ✕ {/* Vous pouvez remplacer cela par une icône */}
                    </button>
                  )}
              </div>
            </div>
          
            <div className="title pb-2 mt-3 z-10  flex flex-col">
              <div>
                <h2 className="h3 mb-0 dark:text-slate-50">Tous les noms et prénoms identiques</h2>
              </div>
              
              {/* Bouton pour Voir plus */}
              <div className="flex justify-end items-center mb-4 gap-1">
                {/* Bouton pour imprimer */}
                <ReactToPrint
                  trigger={() => (
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-slate-50 rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-300">
                      <FaPrint/> Imprimer
                    </button>
                  )}
                  content={() => comparaisonRef.current}
                />

                {/* Bouton pour voir plus/moins */}
                {filteredNames.length > 4 && (
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="px-4 py-2 flex items-center gap-2 bg-blue-500 text-slate-50 rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300"
                  >
                    {showAll ? (
                      <>
                        <FaMinus/> Voir moins

                      </>
                    ) : (
                      <>
                        <FaPlus/> Voir tous

                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
            {/* Liste avec hauteur limitée et scroll */}
            <div className="w-full max-w-4xl mx-auto">
              <div className={`flex flex-row flex-wrap ${!showAll ? 'max-h-24 overflow-y-auto' : ''}`}>
                {isLoading ? (
                  // Affichez les skeletons
                  Array(4).fill().map((_, index) => (
                    <div key={index} className="w-1/2 md:w-1/4 p-2">
                      <SkeletonLoader type="card" width="100%" height={100} />
                    </div>
                  ))
                ) : displayedNames.length === 0 ? (
                  <p>Aucun doublon trouvé</p>
                ) : (
                  displayedNames.map((nameObj, index) => (
                    <div key={index} className="w-1/2 md:w-1/4 p-2">
                      <div
                        className="bg-blue-100 p-3 rounded-lg flex items-center justify-between cursor-pointer"
                        onClick={() => handleNameClick(nameObj)}
                      >
                        <span className="text-lg font-semibold text-gray-800">{nameObj.nom}</span>
                        <span className="bg-blue-500 text-slate-50 rounded-full px-3 py-1 text-sm font-medium">
                          {nameObj.occurences}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>


            {/* Séparateur */}
            <div className="inline-flex items-center justify-center w-full">
              <hr className="w-48 h-1 mx-auto my-4 bg-gray-100 border-0 rounded md:my-10 dark:bg-gray-700" />
            </div>
          </div>
          
          {/* Section des détails, sous la liste de noms */}
          <div className=" p-2" > 
            {selectedName ? (
              <div ref={comparaisonRef}>
                <h3 className="text-lg font-semibold dark:text-slate-50">Détails pour: {selectedName.nom}</h3>
                <div className="mt-3">
                <div className={`grid mb-8 border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 md:mb-12 md:grid-cols-2 gap-6 ${isDarkMode ? "bg-slate-900 text-slate-50" : "bg-gray-50 text-slate-800"} p-6`}>
                  {isLoadingDetails ? (
                    // Affichez les Skeletons pendant le chargement
                    Array(4).fill().map((_, index) => (
                      <div key={index} className={`flex flex-col items-center justify-center p-8 text-center rounded-lg shadow-md ${isDarkMode ? "bg-slate-900" : "bg-gray-50"} transition-transform duration-300`}>
                        <SkeletonLoader type="text" width="60%" height={20} />
                        <SkeletonLoader type="text" width="80%" height={20} />
                        <SkeletonLoader type="text" width="50%" height={20} />
                        <SkeletonLoader type="card" width="100%" height={100} />
                      </div>
                    ))
                  ) : (
                    // Affichez les détails une fois chargés
                    selectedName.ids.split(', ').map(id => {
                      const detail = getDetailsById(id.trim());
                      return detail ? (
                        <figure
                          key={id}
                          className={`flex flex-col items-center justify-center p-8 text-center rounded-lg shadow-md ${isDarkMode ? "bg-slate-900 text-slate-50" : "bg-gray-50 text-slate-800"} transition-transform duration-300 hover:scale-105 cursor-pointer`}
                        >
                          <div className="flex items-center justify-center mb-4">
                            <img
                              className="rounded-full w-20 h-20 object-cover"
                              src={`http://localhost:8081/${detail.image.replace('backend/', '')}`}
                              alt={`image de ${detail.nom}`}
                            />
                            <div className="ml-4 space-y-0.5 text-left rtl:text-right dark:text-slate-50">
                              <div className="text-lg font-semibold">{detail.nom} {detail.prenom}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {detail.role === 'enfant' ? `Enfant de ${detail.nom_travailleur} ${detail.prenom_travailleur} ` 
                                  : detail.role === 'conjoint'? `Conjoint de ${detail.nom_travailleur} ${detail.prenom_travailleur} `
                                : detail.role  }
                              </div>
                            </div>
                          </div>

                          <blockquote className="max-w-md mx-auto text-gray-500 dark:text-gray-400">
                            <p className="mb-2 text-gray-700 dark:text-slate-300">
                              {detail.sexe === 'FEMME' ? 'Née le ' : 'Né le '}
                              {formatDate(detail.age)}
                            </p>
                            <p className="mb-2 text-gray-700 dark:text-slate-300">
                              Âge: {calculateAge(detail.age)} ans
                            </p>
                            <p className="mb-2 text-gray-700 dark:text-slate-300">Sexe: {detail.sexe}</p>
                            <p className="text-gray-700 dark:text-slate-300">
                              {detail.cin === 0
                                ? detail.sexe === 'FEMME' ? 'CIN: Encore mineure' : 'CIN: Encore mineur'
                                : `CIN: ${detail.cin}`}
                            </p>
                          </blockquote>
                        </figure>
                      ) : (
                        <p key={id} className="text-red-500">Détails introuvables pour l'ID {id}</p>
                      );
                    })
                  )}
                </div>

                </div>
              </div>
            ) : (
              <p>Sélectionnez un nom pour afficher les détails.</p>
            )}
          </div>
        </div>
      )}


      {activeTab === "excel" && (
        <div className="excel">
          <Comparaison_excel/>
        </div>
      )}


      <BackToTop/>

    </>
  );
};

export default Comparaison;
