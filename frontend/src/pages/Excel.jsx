import * as XLSX from 'xlsx';
import ExcelJS from "exceljs";
import React, { useState, useEffect, useRef, useContext } from 'react';
import Swal from 'sweetalert2';
import { FaPrint, FaFileCsv } from "react-icons/fa6";
import { FaPlus, FaMinus, FaTrashAlt } from "react-icons/fa";
import { PiMicrosoftExcelLogoBold } from "react-icons/pi";
import BackToTop from "../components/BackToTop";
import { saveAs } from "file-saver";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { ThemeContext } from "../context/ThemeContext"; 
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
 
const Excel = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [expandedRows, setExpandedRows] = useState([]); 
    const [ménages, setMénages] = useState([]);
    const [filteredMénages, setFilteredMénages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [allExpanded, setAllExpanded] = useState(false);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMénages = filteredMénages.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const handleOpenModal = () => setIsOpen(true);
    const [isLoading, setIsLoading] = useState(true);

    const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";

  // Définir les couleurs en fonction du mode sombre
  const baseColor = isDarkMode ? '#2c3e50' : '#E0E0E0'; // Couleur de fond du skeleton
  const highlightColor = isDarkMode ? '#555' : '#F0F0F0';


  // Fonction pour générer le PDF
  const generatePDF = () => {
    if (isLoading) {
      alert('Les données sont en cours de chargement. Veuillez patienter.');
      return;
    }
  
    // Créer un tableau HTML dynamiquement
    const table = document.createElement('table');
    table.style.width = '100%';
    table.setAttribute('border', '1');
    table.style.fontSize = '14px'; // Taille de police par défaut pour le tableau
  
    // Créer l'en-tête du tableau
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = [
      'Num Ménage', 'Nom Travailleur', 'Remplaçant', 'Mère', 'Sexe',
      'Récepteur Transfert', 'CIN Récepteur', 'Chef de Ménage','District', 'Commune', 'Fokontany', 'Groupe de Critère'
    ];
  
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      th.style.padding = '12px'; // Augmenter le padding pour plus d'espace
      th.style.backgroundColor = '#f2f2f2';
      th.style.fontSize = '16px'; // Taille de police plus grande pour l'en-tête
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
  
    // Créer le corps du tableau avec les données
    const tbody = document.createElement('tbody');
    ménages.forEach(ménage => {
      const row = document.createElement('tr');
      const columns = [
        ménage.num_ménage,
        ménage.nom_travailleur,
        ménage.remplaçant,
        ménage.mère,
        ménage.sexe,
        ménage.récepteur_transfert,
        ménage.cin_récepteur,
        ménage.nom_chef_ménage,
        ménage.district,
        ménage.commune,
        ménage.fokontany,
        ménage.groupe_critere,
      ];
  
      columns.forEach(columnText => {
        const td = document.createElement('td');
        td.textContent = columnText;
        td.style.padding = '12px'; // Augmenter le padding pour plus d'espace
        td.style.fontSize = '14px'; // Taille de police plus grande pour les cellules
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
  
    // Ajouter le tableau à un conteneur temporaire
    const pdfContainer = document.createElement('div');
    pdfContainer.style.position = 'absolute';
    pdfContainer.style.left = '-9999px';
    pdfContainer.appendChild(table);
    document.body.appendChild(pdfContainer);
  
    // Convertir le tableau en PDF
    html2canvas(pdfContainer, {
      scale: 2, // Augmenter la résolution pour un meilleur rendu
      useCORS: true, // Permettre le chargement des images externes
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4'); // Mode paysage (landscape)
      const imgWidth = 297; // Largeur de la page A4 en mode paysage
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('Liste des bénéficiaires.pdf');
  
      // Nettoyer le conteneur temporaire
      document.body.removeChild(pdfContainer);
    });
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setProgress(0);
  };


  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };
  
  const handleCloseModal = () => {
    setFile(null);
    setFileName(null); // Réinitialise fileName lors de la fermeture
    setIsOpen(false);
  };


  // Fonction pour récupérer les données du backend
  const fetchData = () => {
    axios.get('http://localhost:8081/excel/')
      .then(response => {
        setMénages(response.data);
        setFilteredMénages(response.data);
         setIsLoading(false);
      })
      .catch(error => console.error('Error fetching data:', error));
  };

  // Appel initial de fetchData dans useEffect
  useEffect(() => {
    setTimeout(async () => {
    fetchData();
     }, 500);
  }, []);

  const exportToExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Ménages");
  
    // Données
    const headers = Object.keys(ménages[0]);
    const rows = ménages.map((row) => Object.values(row));
  
    // Définir les en-têtes avec leurs clés et largeur
    worksheet.columns = headers.map((header) => ({
      header: header.toUpperCase(), // En majuscule
      key: header,
      width: 25, // Largeur de chaque colonne
    }));
  
    // Ajouter les données
    worksheet.addRows(rows);
  
    // Styliser uniquement la première ligne (les en-têtes)
    const headerRow = worksheet.getRow(1); // Récupérer la première ligne
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } }; // Texte blanc
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4CAF50" }, // Fond vert
      };
      cell.alignment = { horizontal: "center", vertical: "middle" }; // Centrer le texte
    });
  
    // Générer le fichier Excel
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      saveAs(blob, "menages.xlsx");
    });
  };
  

  const exportToCSV = () => {
    // Ajoute le BOM UTF-8 pour garantir l'encodage correct des caractères spéciaux
    const bom = "\uFEFF";

    // Prépare les en-têtes et les lignes du CSV
    const headers = Object.keys(ménages[0]).join(', ') + '\n';
    const rows = ménages
        .map(ménage => Object.values(ménage).join(', '))
        .join('\n');

    // Combine le BOM, les en-têtes et les lignes de données
    const csvContent = bom + headers + rows;

    // Créer un blob avec le contenu en UTF-8
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Télécharger le fichier avec `FileSaver.js` ou une autre méthode
    saveAs(blob, "menages.csv");
  };


  const handleFileUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const response = await fetch('http://localhost:8081/excel/traiter', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Upload réussi',
          text: 'Le fichier a été téléchargé et traité avec succès!',
        });
        fetchData();
        handleCloseModal();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Échec du téléchargement',
          text: 'Erreur lors du traitement du fichier.',
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur est survenue pendant le téléchargement.',
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

useEffect(() => {
  // Filtrage en fonction de la recherche
  const filtered = ménages.filter(ménage =>
    Object.values(ménage).some(value =>
      value != null && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  setFilteredMénages(filtered);
}, [searchTerm, ménages]);

// Handle search across all fields
useEffect(() => {
  const results = ménages.filter(ménage =>
    [
      ménage.num_ménage,
      ménage.nom_chef_ménage,
      ménage.statut,
      ménage.récepteur_transfert,
      ménage.sexe,
      ménage.cin_récepteur,
      ménage.nom_travailleur,
      ménage.remplaçant,
      ménage.mère,
      ménage.groupe_critere,
      ménage.direction,
      ménage.region,
      ménage.district,
      ménage.commune,
      ménage.fokontany,
    ].some(field =>
      field != null && field.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  setFilteredMénages(results);
  setCurrentPage(1); // Reset to first page on new search
}, [searchTerm, ménages]); // Assurez-vous que l'état allExpanded est initialisé

// Nouvelle fonction pour étendre toutes les rangées
const expandAllRows = () => {
  const allIndexes = filteredMénages.map((_, index) => index);
  setExpandedRows(allIndexes);
};

// Nouvelle fonction pour réduire toutes les rangées
const collapseAllRows = () => {
  setExpandedRows([]); // Vide l'état expandedRows pour réduire toutes les lignes
};

// Fonction pour basculer l'affichage des détails de chaque rangée
const toggleRowExpansion = (index) => {
  setExpandedRows((prevExpandedRows) =>
    prevExpandedRows.includes(index)
      ? prevExpandedRows.filter((i) => i !== index) // Retirer l'index si déjà étendu
      : [...prevExpandedRows, index] // Ajouter l'index si non étendu
  );
};

// Fonction pour tout étendre ou tout réduire
const toggleAllRowsExpansion = () => {
  if (allExpanded) {
    setExpandedRows([]); // Réduit toutes les rangées
  } else {
    setExpandedRows(filteredMénages.map((_, index) => index)); // Étend toutes les rangées
  }
  setAllExpanded(!allExpanded); // Basculer l'état allExpanded
};



  const handleDelete = (id, nom_travailleur) => {
    // Afficher une alerte de suppression avec SweetAlert2
    Swal.fire({
      title: `Êtes-vous sûr de vouloir supprimer ${nom_travailleur } ?`,
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
          const response = await axios.delete(`http://localhost:8081/excel/supprimerExcel/${id}`);
          
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


  return (
    <div className='pt-5 dark:text-slate-300'>
      <div className="flex justify-end">
        <button
          onClick={handleOpenModal}
          className="flex items-center text-white bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 focus:ring-4 focus:outline-none focus:ring-pink-300 dark:focus:ring-pink-800 font-medium rounded-lg text-md px-6 py-3 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Ajouter une nouvelle liste
        </button>
      </div>
      {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg w-full max-w-md p-6 shadow-lg">
                      <h2 className="text-xl font-bold mb-4 dark:text-slate-50">Ajouter un fichier XLSX</h2>

                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="dropzone-file"
                          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dar dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg
                              className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 20 16"
                            >
                              <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                              />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Fichier Excel uniquement (MAX. 5 Mo)</p>
                          </div>
                          <input
                            id="dropzone-file"
                            type="file"
                            accept=".xlsx, .xls"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>

                      {fileName && <p className="text-gray-600 mt-2 dark:text-slate-50">Fichier sélectionné: {fileName}</p>}

                      {uploading && (
                        <div className="relative pt-1 mt-4 w-full">
                          <div className="overflow-hidden h-4 text-xs flex rounded bg-blue-200">
                            <div
                              style={{ width: `${progress}%` }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{progress}%</p>
                        </div>
                      )}

                      <div className="flex justify-between mt-4">
                        <div className="flex justify-end">
                          <button onClick={handleFileUpload} disabled={uploading} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                            {uploading ? 'En cours...' : 'Traiter'}
                          </button>
                        </div>
                        <button
                            onClick={handleCloseModal}
                            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
                        >
                            Annuler
                        </button>
                      </div>
                  </div>
                </div>
            )}
          
            
      <div>
        <h2 className="h3 dark:text-slate-50 mb-2">Liste des Bénéficiaires</h2>
      </div>

      <div className="flex justify-between items-center mb-4">
                <div className="relative w-full md:w-1/3">
                    <input
                      type="text"
                      className="border p-2 rounded w-full dark:text-slate-700"
                      placeholder="Rechercher par nom ou CIN..."
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
                <select className="border p-2 rounded cursor-pointer hidden md:block dark:bg-slate-500 dark:text-slate-50" onChange={handleItemsPerPageChange}>
                    <option value={5} >5 par page</option>
                    <option value={10}>10 par page</option>
                    <option value={20}>20 par page</option>
                    <option value={100}>100 par page</option>
                  </select>
      </div>


            <div className="flex justify-end space-x-3 cursor-pointer mb-2">
            <button
              onClick={toggleAllRowsExpansion}
              className="hidden md:block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              {allExpanded ? (
                <>
                  <FaMinus className="inline-block mr-2" />
                  Réduire
                </>
              ) : (
                <>
                  <FaPlus className="inline-block mr-2" />
                  Voir
                </>
              )}
            </button>
             <button 
                    onClick={exportToExcel} 
                    className="px-4 py-2 bg-green-600 text-white rounded-lg">
                    <PiMicrosoftExcelLogoBold className="inline-block mr-2"/>Excel
                </button>
                <button 
                  onClick={exportToCSV} 
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg">
                  <FaFileCsv className="inline-block mr-2"/>CSV
              </button>
              <button
                onClick={generatePDF}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                <FaPrint className="inline-block mr-2" />
                PDF
              </button>
            </div>

            
            <div className="overflow-x-auto hidden md:block">
              <table className="min-w-full bg-slate-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-lg rounded-lg overflow-hidden" >
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 border-b dark:border-gray-600 font-semibold text-gray-700 dark:text-gray-300">Num Ménage</th>
                    <th className="py-3 px-4 border-b dark:border-gray-600 font-semibold text-gray-700 dark:text-gray-300">Nom Travailleur</th>
                    <th className="py-3 px-4 border-b dark:border-gray-600 font-semibold text-gray-700 dark:text-gray-300">Remplaçant</th>
                    <th className="py-3 px-4 border-b dark:border-gray-600 font-semibold text-gray-700 dark:text-gray-300">Mère</th>
                    <th className="py-3 px-4 border-b dark:border-gray-600 font-semibold text-gray-700 dark:text-gray-300">Statut</th>
                    <th className="py-3 px-4 border-b dark:border-gray-600 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {isLoading ? (
                    // Affichage des skeletons pendant le chargement
                    [...Array(5)].map((_, index) => (
                      <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <td className="py-3 px-4 border-b dark:border-gray-600 text-gray-800 dark:text-gray-300">
                          <Skeleton width={120} height={20} baseColor={baseColor} highlightColor={highlightColor}  />
                        </td>
                        <td className="py-3 px-4 border-b dark:border-gray-600 text-gray-800 dark:text-gray-300">
                          <Skeleton width={180} height={20} baseColor={baseColor} highlightColor={highlightColor}  />
                        </td>
                        <td className="py-3 px-4 border-b dark:border-gray-600 text-gray-800 dark:text-gray-300">
                          <Skeleton width={150} height={20}  baseColor={baseColor} highlightColor={highlightColor} />
                        </td>
                        <td className="py-3 px-4 border-b dark:border-gray-600 text-gray-800 dark:text-gray-300">
                          <Skeleton width={120} height={20} baseColor={baseColor} highlightColor={highlightColor}  />
                        </td>
                        <td className="py-3 px-4 border-b dark:border-gray-600 text-gray-800 dark:text-gray-300">
                          <Skeleton width={80} height={20} baseColor={baseColor} highlightColor={highlightColor}  />
                        </td>
                        <td className="py-3 px-4 border-b dark:border-gray-600 text-center">
                          <Skeleton width={80} height={20} baseColor={baseColor} highlightColor={highlightColor}  />
                        </td>
                      </tr>
                    ))
                  ) : (
                    currentMénages.length > 0 ? (
                      currentMénages.map((ménage, index) => (
                        <React.Fragment key={index}>
                          <tr className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <td className="py-3 px-4 border-b dark:border-gray-600 text-gray-800 dark:text-gray-300">{ménage.num_ménage}</td>
                            <td className="py-3 px-4 border-b dark:border-gray-600 text-gray-800 dark:text-gray-300">{ménage.nom_travailleur}</td>
                            <td className="py-3 px-4 border-b dark:border-gray-600 text-gray-800 dark:text-gray-300">{ménage.remplaçant}</td>
                            <td className="py-3 px-4 border-b dark:border-gray-600 text-gray-800 dark:text-gray-300">{ménage.mère}</td>
                            <td className="py-3 px-4 border-b dark:border-gray-600 text-gray-800 dark:text-gray-300">{ménage.statut}</td>
                            <td className="py-3 px-4 border-b dark:border-gray-600 text-center">
                              <button
                                onClick={() => toggleRowExpansion(index)}
                                className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
                              >
                                {expandedRows.includes(index) ? 'Réduire' : 'Voir Plus'}
                              </button>
                            </td>
                          </tr>
                          {expandedRows.includes(index) && (
                            <tr>
                              <td colSpan="6" className="bg-gray-50 dark:bg-gray-700 p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-800 dark:text-gray-300">
                                  <p><strong>Sexe:</strong> {ménage.sexe}</p>
                                  <p><strong>Récepteur Transfert:</strong> {ménage.récepteur_transfert}</p>
                                  <p><strong>CIN Récepteur:</strong> {ménage.cin_récepteur}</p>
                                  <p><strong>Chef de Ménage:</strong> {ménage.nom_chef_ménage}</p>
                                  <p><strong>Direction:</strong> {ménage.direction}</p>
                                  <p><strong>Région:</strong> {ménage.region}</p>
                                  <p><strong>District:</strong> {ménage.district}</p>
                                  <p><strong>Commune:</strong> {ménage.commune}</p>
                                  <p><strong>Fokontany:</strong> {ménage.fokontany}</p>
                                  <p><strong>Groupe de Critère:</strong> {ménage.groupe_critere}</p>
                                  
                                </div>
                                <div className="flex justify-end">
                                  <a href="#" style={{ color: "#e95959" }} onClick={() => handleDelete(ménage.id, ménage.nom_travailleur)}>
                                    <FaTrashAlt />
                                  </a>                   
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-gray-500 dark:text-gray-300">
                          Aucun résultat trouvé
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>


            <div className="grid grid-cols-1 gap-4 md:hidden">
            {currentMénages.length > 0 ? (
              currentMénages.map((ménage, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-100 dark:bg-slate-600">
                  <h3 className="text-xl font-bold text-center dark:text-slate-50">{ménage.nom_travailleur}</h3>
                  <p><strong>Num Ménage:</strong> {ménage.num_ménage}</p>
                  <p><strong>Statut:</strong> {ménage.statut}</p>
                  <p><strong>Remplaçant:</strong> {ménage.remplaçant}</p>
                  <p><strong>Mère:</strong> {ménage.mère}</p>
                  <p><strong>Sexe:</strong> {ménage.sexe}</p>
                  <p><strong>Récepteur Transfert:</strong> {ménage.récepteur_transfert}</p>
                  <p><strong>CIN Récepteur:</strong> {ménage.cin_récepteur}</p>
                  <p><strong>Chef de Ménage:</strong> {ménage.nom_chef_ménage}</p>
                  <p><strong>Direction:</strong> {ménage.direction}</p>
                  <p><strong>Région:</strong> {ménage.region}</p>
                  <p><strong>District:</strong> {ménage.district}</p>
                  <p><strong>Commune:</strong> {ménage.commune}</p>
                  <p><strong>Fokontany:</strong> {ménage.fokontany}</p>
                  <p><strong>Groupe de Critère:</strong> {ménage.groupe_critere}</p>
                  <div className="flex justify-end">
                    <a href="#" style={{ color: "#e95959" }} onClick={() => handleDelete(ménage.id, ménage.nom_travailleur)}>
                      <FaTrashAlt />
                    </a>                   
                  </div>
                  
                </div>

              ))
            ):(
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500 dark:text-gray-300">
                  Aucun résultat trouvé
                </td>
              </tr>
            )}
            </div>


            {/* Pagination */}
            <div className="flex justify-end mt-4 space-x-2 mb-4 md:mb-0">
              {/* Bouton Précédent */}
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-gray-300 dark:bg-slate-50 dark:text-slate-600 hover:bg-gray-400 disabled:opacity-50"
              >
                Précédent
              </button>

              {/* Pages de pagination */}
              {Array.from({
                length: Math.min(5, Math.ceil(filteredMénages.length / itemsPerPage)),
              }, (_, index) => {
                const page = currentPage <= 3 ? index + 1 : currentPage - 3 + index;
                if (page > Math.ceil(filteredMénages.length / itemsPerPage)) return null;

                return (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page ? 'bg-blue-500 text-slate-50 ' : 'bg-slate-300 dark:bg-slate-400 dark:text-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              {/* Bouton Suivant */}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(filteredMénages.length / itemsPerPage)}
                className="px-3 py-1 rounded-md bg-gray-300 dark:bg-slate-50 dark:text-slate-600 hover:bg-gray-400 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>

          <BackToTop/>




    </div>
  );
};

export default Excel;


