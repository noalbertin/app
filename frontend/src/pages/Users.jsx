import React, { useEffect, useState, useContext, useRef  } from "react";
import { Link } from 'react-router-dom'; 
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext"; 
import { GrEdit } from "react-icons/gr";
import { FaTrashAlt, FaCheck, FaArrowUp } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import { FaPrint } from "react-icons/fa6";
import { IoIosArrowDown, IoIosArrowUp  } from "react-icons/io";
import ReactToPrint from "react-to-print";
import Swal from "sweetalert2";
import { ImCross } from "react-icons/im";
import BackToTop from "../components/BackToTop";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';


const Users = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState([]); // Ajout pour suivi des lignes dépliées
  const [expandAfterSort, setExpandAfterSort] = useState(false);
  const [errors, setErrors] = useState({});
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";
  const tableRef = useRef();

  
  // Définir les couleurs en fonction du mode sombre
  const baseColor = isDarkMode ? '#2c3e50' : '#E0E0E0'; // Couleur de fond du skeleton
  const highlightColor = isDarkMode ? '#555' : '#F0F0F0';


  

  useEffect(() => {
    handleSearch();
  }, [searchQuery, data]);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8081/travailleur/");
      setData(res.data);
      setFilteredData(res.data);
      setIsLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    setTimeout(async () => {
    fetchData();
     }, 500);
  }, []);

  const handleSearch = () => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = data.filter(user => {
        // Convertir cin_travailleur en chaîne de caractères pour éviter l'erreur
        const cinTravailleur = user.cin_travailleur ? user.cin_travailleur.toString().toLowerCase() : '';
        const nomTravailleur = user.nom_travailleur ? user.nom_travailleur.toLowerCase() : '';
        const codeMenage = user.codeMenage ? user.codeMenage.toString().toLowerCase() : '';
        const role = user.role ? user.role.toLowerCase() : '';
  
        // Formatage de la date pour la recherche
        const dateNaissanceFormatee = user.date_naissance ? formatDate(user.date_naissance).toLowerCase() : '';
        const dateNaissanceBrute = user.date_naissance ? user.date_naissance : '';
        const ageTravailleur = user.age_travailleur ? calculateAge(user.age_travailleur).toString() : '';
  
        return (
          nomTravailleur.includes(query) ||
          cinTravailleur.includes(query) || // Recherche dans le cin_travailleur converti en chaîne
          codeMenage.includes(query) ||
          role.includes(query) ||
          ageTravailleur.includes(query) || 
          dateNaissanceFormatee.includes(query) || // Recherche dans la date formatée
          dateNaissanceBrute.includes(query)  // Recherche dans la date brute (format "yyyy-mm-dd")
        );
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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

  const toggleRowExpansion = (index) => {
    if (expandedRows.includes(index)) {
      setExpandedRows(expandedRows.filter(i => i !== index));
    } else {
      setExpandedRows([...expandedRows, index]);
    }
  };

  // Fonction pour trier par 100 éléments par page, puis étendre toutes les lignes
  const expandAllRows = () => {
    setItemsPerPage(100); // Définit le tri sur 100 éléments par page
    setCurrentPage(1);    // Réinitialise à la page 1
    setExpandAfterSort(true); // Marque pour expansion après tri
  };

  // Surveille le changement de itemsPerPage pour étendre les lignes après tri
  useEffect(() => {
    if (expandAfterSort && itemsPerPage === 100) {
      const allIndexes = currentData.map((_, index) => index); // Récupère tous les index visibles
      setExpandedRows(allIndexes);
      setExpandAfterSort(false); // Réinitialise le marqueur d'expansion
    }
  }, [itemsPerPage, expandAfterSort, currentData]);


  const [values, setValues] = useState({
    codeMenage: "",
    nom_travailleur: "",
    sexe_travailleur: "",
    age_travailleur: "",
    cin_travailleur: "",
    imageUrl_travailleur: "",
    role: "",
    vivant:"",
  });


  const handleModifier = async (id_travailleur) => {
    try {
      // Récupérer les données correspondant au numProduit
      const res = await axios.get(`http://localhost:8081/travailleur/${id_travailleur}`);
      const travailleurData = res.data;

      // Mettre les données dans les valeurs du formulaire
      setValues({
        id_travailleur: travailleurData.id_travailleur,
        codeMenage: travailleurData.codeMenage,
        nom_travailleur: travailleurData.nom_travailleur,
        sexe_travailleur: travailleurData.sexe_travailleur,
        cin_travailleur: travailleurData.cin_travailleur,
        role: travailleurData.role,
        vivant: travailleurData.vivant,
      });
    } catch (error) {
      console.error("Error fetching travailleur data:", error);
    }
  };


  const handleModification = async (e, id_travailleur) => {
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

  const handleDelete = (id_travailleur, nom_travailleur) => {
    // Afficher une alerte de suppression avec SweetAlert2
    Swal.fire({
      title: `Êtes-vous sûr de vouloir supprimer ${nom_travailleur }  ?`,
      text: "Vous ne pourrez pas revenir en arrière!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer!",
      cancelButtonText: "Annuler",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Appel à axios.delete pour supprimer la vente
          const response = await axios.delete(`http://localhost:8081/travailleur/supprimerTravailleur/${id_travailleur}`);
          
          // Vérifier si la suppression a réussi en fonction de la réponse de l'API
          if (response.status === 200) {
            // Actualiser les données après la suppression
            await fetchData();
  
            // Afficher une alerte de succès
            Swal.fire({
              title: "Succèss 🎉",
              text: "Suppression Réussie !",
              icon: "success",
              confirmButtonColor: "#3085d6",
              confirmButtonText: "OK",
            });
          } else {
            // Gérer les autres cas d'échec
            Swal.fire({
              title: "Erreur 😕",
              text: "La suppression a échoué. Veuillez réessayer.",
              icon: "error",
              confirmButtonColor: "#d33",
            });
          }
        } catch (err) {
          // Afficher une alerte d'erreur en cas de problème avec la requête
          Swal.fire({
            title: "Erreur 😕",
            text: "Un problème est survenu lors de la suppression.",
            icon: "error",
            confirmButtonColor: "#d33",
          });
          console.log(err);
        }
      }
    });
  };

  const [isOpen, setIsOpen] = useState(false);
  // Fonction pour ouvrir le modal
  const openModal = () => setIsOpen(true);

    const closeModal = () => {
      setIsOpen(false);
      // Réinitialiser les valeurs du formulaire
      setValues({
        codeMenage: "",
        nom_travailleur: "",
        sexe_travailleur: "",
        cin_travailleur: "",
        role: "",
        vivant:"",
      });
      setErrors('');
      // Optionnel: rafraîchir les données après la fermeture du modal
      fetchData();
    };
  
  
  

 return (
  <div className={`w-full mt-4 ${isDarkMode ? "dark" : ""}`}>

    {/* BArre de recherche*/}
    <div className="flex justify-between items-center mb-4">
      <div className="relative w-1/3">
          <input
            type="text"
            className="border p-2 rounded w-full dark:text-slate-700"
            placeholder="Rechercher par nom ou CIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setSearchQuery('')}
            >
              ✕ {/* Vous pouvez remplacer cela par une icône */}
            </button>
          )}
      </div>
      <select
        className="border p-2 rounded dark:text-slate-700 cursor-pointer hidden md:block"
        value={itemsPerPage}
        onChange={handleItemsPerPageChange}
      >
        <option value={5}>5 par page</option>
        <option value={10}>10 par page</option>
        <option value={20}>20 par page</option>
        <option value={100}>100 par page</option>
      </select>
    </div>

    {/* Ajout du bouton d'impression */}
    <div className="flex justify-end space-x-3 cursor-pointer mb-2">
      <button 
        onClick={expandAllRows} 
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Voir tous
      </button>
      <ReactToPrint
        trigger={() => (
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">
            <FaPrint className="inline-block mr-2" />
            Imprimer
          </button>
        )}
        content={() => tableRef.current}
      />
    </div>

    {/* <div className={`flex justify-center px-3 py-2 border-b ${isDarkMode ? "bg-slate-700 text-slate-50" : "bg-white text-black"}`}>
      <p className="text-gray-500 dark:text-gray-300 ">Aucun résultat trouvé.</p>
    </div>
    
    {filteredData.length === 0 ? (*/}

    {/* Affichage en tableau pour les écrans moyens et plus grands */}
    <div className="hidden md:block">
      <div ref={tableRef}>
        <div className={`min-w-full max-w-screen-2xl mx-auto`}>
          <div className={`flex items-center justify-between px-3 py-3 border-b border-gray-200 ${isDarkMode ? "bg-slate-900 text-slate-50" : "bg-gray-50 text-black"} text-left`}>
            <span className="w-1/5 text-xs font-medium uppercase">Travailleur</span>
            <span className="w-1/5 text-xs font-medium uppercase">Code Ménage</span>
            <span className="w-1/5 text-xs font-medium uppercase">Statut</span>
            <span className="w-1/5 text-xs font-medium uppercase">Actions</span>
          </div>

          {/* Skeleton Loader pour les lignes */}
          {isLoading ? (
            // Skeleton Loader
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={`flex items-center justify-between px-3 py-2 border-b ${isDarkMode ? "bg-slate-700 text-slate-50" : "bg-white text-black"}`}
              >
                <div className="w-1/5 flex items-center space-x-2">
                  <div 
                    className="w-10 h-10 rounded-full animate-pulse"
                    style={{ backgroundColor: baseColor }}
                  ></div>
                  <div 
                    className="h-4 w-2/5 rounded animate-pulse"
                    style={{ backgroundColor: highlightColor }}
                  ></div>
                </div>
                <div 
                  className="w-1/5 h-4 rounded animate-pulse"
                  style={{ backgroundColor: highlightColor }}
                ></div>
                <div 
                  className="w-1/5 h-4 rounded animate-pulse"
                  style={{ backgroundColor: highlightColor }}
                ></div>
                <div className="w-1/5 flex space-x-2">
                  <div 
                    className="h-4 w-10 rounded animate-pulse"
                    style={{ backgroundColor: highlightColor }}
                  ></div>
                  <div 
                    className="h-4 w-10 rounded animate-pulse"
                    style={{ backgroundColor: highlightColor }}
                  ></div>
                </div>
              </div>
            ))
            
          ) : (
            filteredData.length > 0 ? (
            // Contenu normal si pas de chargement
            currentData.map((user, index) => (
              <React.Fragment key={user.id_travailleur}>
                <div
                  className={`flex items-center justify-between px-3 py-2 border-b ${isDarkMode ? "bg-slate-700 text-slate-50" : "bg-white text-black"}`}
                >
                  <div className="w-1/5 flex items-center cursor-pointer" onClick={() => toggleRowExpansion(index)}>
                    <span className="pr-1">
                      {expandedRows.includes(index) ? (
                        <IoIosArrowUp className="size-6" />
                      ) : (
                        <IoIosArrowDown className="size-6" />
                      )}
                    </span>
                    <img
                      src={`http://localhost:8081/${user.imageUrl_travailleur.replace('backend/', '')}`}
                      alt={user.nom_travailleur}
                      className="w-10 h-10 rounded-full mr-2 object-cover"
                    />
                    {user.nom_travailleur}
                  </div>
                  <span className="w-1/5">{user.codeMenage}</span>
                  <span className="w-1/5 flex items-center">
                    {user.vivant ? (
                      <span className="flex items-center text-green-500">
                        <FaCheck />
                        <span className="ml-2">Vivant</span>
                      </span>
                    ) : (
                      <span className="flex items-center text-red-500">
                        <ImCross />
                        <span className="ml-2">Mort</span>
                      </span>
                    )}
                  </span>

                  <div className="w-1/5 flex space-x-2">
                    <div className="flex justify-end space-x-2">
                      <a
                        href="#"
                        style={{ color: "#265ed7" }}
                        onClick={() => {
                          handleModifier(user.id_travailleur);
                          openModal();
                        }}
                      >
                        <GrEdit />
                      </a>

                      <a
                        href="#"
                        style={{ color: "#e95959" }}
                        onClick={() => handleDelete(user.id_travailleur, user.nom_travailleur)}
                      >
                        <FaTrashAlt />
                      </a>
                      <Link to={`/profile/${user.id_travailleur}`} className="text-green-500">
                        <IoEyeSharp />
                      </Link>
                    </div>
                  </div>
                </div>
                {expandedRows.includes(index) && (
                  <div className={`bg-gray-50 p-4 ${isDarkMode ? "bg-slate-800 text-slate-50" : "bg-gray-100 text-black"}`}>
                    <p><strong>Date de Naissance:</strong> {formatDate(user.age_travailleur)}</p>
                    <p><strong>CIN:</strong> {user.cin_travailleur}</p>
                    <p><strong>Âge:</strong> {calculateAge(user.age_travailleur)} ans</p>
                    <p><strong>Rôle:</strong> {user.role}</p>
                    <p><strong>Emai:</strong> {user.email_travailleur}</p>
                  </div>
                )}
              </React.Fragment>
            ))
          ) : (
            <div className={`flex justify-center px-3 py-2 border-b ${isDarkMode ? "bg-slate-700 text-slate-50" : "bg-white text-black"}`}>
              <p className="text-gray-500 dark:text-gray-300 ">Aucun résultat trouvé.</p>
            </div>
          ))}
        </div>
      </div>
    </div>


        {/* Affichage en carte pour les petits écrans */}
        <div className="block md:hidden">
          {currentData.map((user) => (
            <div
              key={user.id_travailleur}
              className={`p-4 mb-4 border rounded-lg shadow ${
                isDarkMode
                  ? "bg-slate-800 text-slate-50 border-slate-700"
                  : "bg-white border-gray-300"
              }`}
            >
              <div className="flex justify-between mb-2">
                <div>
                  <strong>Nom:</strong> {user.nom_travailleur}
                </div>
                <div className="ml-2 ">
                  <img
                    src={`http://localhost:8081/${user.imageUrl_travailleur.replace("backend/", "")}`}
                    alt={user.nom_travailleur}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                </div>
              </div>
              <div className="-mt-16 md:mt-0 mb-1"><strong>Code Ménage:</strong> {user.codeMenage}</div>
              <div className="mb-1"><strong>Date de Naissance:</strong> {formatDate(user.age_travailleur)}</div>
              <div className="mb-1"><strong>Sexe:</strong> {user.sexe_travailleur}</div>
              <div className="mb-1"><strong>CIN:</strong> {user.cin_travailleur}</div>
              <div className="mb-1"><strong>Rôle:</strong> {user.role}</div>
              <div className="mb-1">
                        {user.vivant ? (
                          // Si vivant est true, afficher une icône de check et le texte "Vivant"
                          <span className="flex items-center text-green-500">
                            <FaCheck/>
                            <span className="ml-2">Vivant</span>
                          </span>
                        ) : (
                          // Si vivant est false, afficher une croix rouge et le texte "Mort"
                          <span className="flex items-center text-red-500">
                            
                            <ImCross/>
                            <span className="ml-2">Mort</span>
                          </span>
                        )}
                      </div>
              <div className="flex justify-end space-x-2">
                <a href="#" style={{ color: "#265ed7" }} onClick={() => { handleModifier(user.id_travailleur); openModal(); }}>
                  <GrEdit />
                </a>

                <a href="#" style={{ color: "#e95959" }} onClick={() => handleDelete(user.id_travailleur, user.nom_travailleur)}>
                  <FaTrashAlt />
                </a>
                <Link to={`/profile/${user.id_travailleur}`} className="text-green-500">
                  <IoEyeSharp />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="hidden md:block">
          <div className="mt-4 flex justify-end items-center ">
            {/* Previous Button */}
            <button
              className={`mx-1 px-3 py-1 border rounded ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed dark:text-slate-800" : "bg-blue-500 text-white"}`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Précédent
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                className={`mx-1 px-3 py-1 border rounded ${currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200 dark:text-slate-800"}`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}

            {/* Next Button */}
            <button
              className={`mx-1 px-3 py-1 border rounded ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed dark:text-slate-800" : "bg-blue-500 text-white"}`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Suivant
            </button>
          </div>
        </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg shadow-lg  md:w-3/5 m-2 md:m-0 transform transition-all duration-300 scale-100">

            {/* Header du modal */}
            <div className="flex justify-between items-center p-4 border-b">
              <h4 className="text-lg font-semibold dark:text-slate-50">Modification du travailleur</h4>
              <button
                onClick={closeModal}
                className="text-gray-600 hover:text-gray-900"
              >
               <ImCross/>
              </button>
            </div>
            <form onSubmit={(e) => handleModification(e, values.id_travailleur)}>
              {/* Corps du modal */}
              <div className="p-4">
                
                <div className="grid gap-4 mb-4 grid-cols-2">
                  <div className="">
                    <label htmlFor="Identifiant" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Identifiant</label>
                    <input type="text" value={values.id_travailleur}
                      readOnly
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" required />
                  </div>
                
                  <div className="">
                    <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nom Travailleur</label>
                    <input type="text" value={values.nom_travailleur} 
                      onChange={(e) =>
                      setValues({ ...values, nom_travailleur: e.target.value })
                      }  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="" required />
                  </div>
                </div>
                <div className="grid gap-4 mb-4 grid-cols-2">
                  <div>
                    <label htmlFor="codeMenage" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Code Ménage</label>
                    <input
                      type="number" readOnly
                      value={values.codeMenage}
                      onChange={(e) => setValues({ ...values, codeMenage: e.target.value })}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      placeholder=""
                      required
                    />
                    {/* Affichage de l'erreur pour le Code Ménage */}
                    {errors.message && errors.message.includes("ménage") && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="cin" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">CIN</label>
                    <input
                      type="number" readOnly
                      value={values.cin_travailleur}
                      onChange={(e) => setValues({ ...values, cin_travailleur: e.target.value })}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      placeholder=""
                      required
                    />
                    {/* Affichage de l'erreur pour le CIN */}
                    {errors.message && errors.message.includes("CIN") && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 mb-4 grid-cols-3">
                  <div className="">
                  <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Sexe</label>
                    <select id="category" value={values.sexe_travailleur}
                      onChange={(e) =>
                      setValues({ ...values, sexe_travailleur: e.target.value })
                      } required className="bg-gray-50 border cursor-pointer border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
            
                      <option selected >Selectionner le sexe</option>
                      <option value="FEMME">Femme</option>
                      <option value="HOMME" >Homme</option>
                    </select>
                  </div>
                  <div className="">
                  <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Rôle</label>
                    <select id="category" value={values.role}
                      onChange={(e) =>
                      setValues({ ...values, role: e.target.value })
                      } required className="bg-gray-50 border cursor-pointer border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                      
                      <option selected  >Sélectionnez un rôle</option>
                      <option value="SIMPLE"  >Simple</option>
                      <option value="ADMINISTRATEUR"  >Administrateur</option>
                    </select>
                  </div>
                  <div className="mb-4">
                  <label htmlFor="vivant" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Vivant</label>
                  
                  <div className="flex items-center cursor-pointer">
                    {/* Option "Oui" pour true */}
                    <input
                      type="radio"
                      id="vivant-oui"
                      name="vivant"
                      value={1}
                      checked={values.vivant === 1}
                      onChange={() => setValues({ ...values, vivant: 1 })}
                      className="mr-2 cursor-pointer"
                    />
                    <label htmlFor="vivant-oui" className="mr-4 text-sm font-medium text-gray-900 dark:text-white">Oui</label>
                    
                    {/* Option "Non" pour false */}
                    <input
                      type="radio"
                      id="vivant-non"
                      name="vivant"
                      value={0}
                      checked={values.vivant === 0}
                      onChange={() => setValues({ ...values, vivant: 0 })}
                      className="mr-2 cursor-pointer "
                    />
                    <label htmlFor="vivant-non" className="text-sm font-medium text-gray-900 dark:text-white">Non</label>
                  </div>
                </div>
                </div>
              </div>
            
              {/* Footer du modal */}
              <div className="flex justify-end p-4 border-t">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-red-500 text-white rounded mr-2"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    {/* Bouton "Back to Top" */}
    {showBackToTop && (
      <button
        onClick={scrollToTop}
        className="mb-10 md:mb-0 fixed bottom-6 right-6 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition duration-300"
        aria-label="Back to top"
      >
        <FaArrowUp  size={20} />
      </button>
    )}

<BackToTop/>
   
  </div>
);

};

export default Users;
