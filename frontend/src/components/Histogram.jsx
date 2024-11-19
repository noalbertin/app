// src/components/Histogram.js
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto'; // Chart.js natif
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const Histogram = ({ type }) => {
  const chartRef = useRef(null); // Référence pour le canvas du graphique
  const chartInstance = useRef(null); // Pour stocker l'instance de Chart.js
  const location = useLocation();
  const id_travailleur = location.state?.id_travailleur || localStorage.getItem("travailleurId");

  useEffect(() => {
    // Récupérer les données basées sur le type de graphique
    const endpoint = type === 'sexe' 
      ? `http://localhost:8081/histogramme/sexe/${id_travailleur}` 
      : `http://localhost:8081/histogramme/age/${id_travailleur}`;
      
    axios.get(endpoint)
      .then(response => {
        let data;
        if (type === 'sexe') {
          const { total_hommes, total_femmes, total_personnes } = response.data;
          data = {
            labels: ['Hommes', 'Femmes', 'Total'],
            datasets: [
              {
                label: 'Nombre de membres',
                data: [total_hommes, total_femmes, total_personnes],
                backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
                borderColor: ['#36A2EB', '#FF6384', '#FFCE56'],
                borderWidth: 1,
              },
            ],
          };
        } else if (type === 'age') {
          const { nombre_majeurs, nombre_mineurs, total_age } = response.data;
          data = {
            labels: ['Majeurs', 'Mineurs', 'Total'],
            datasets: [
              {
                label: 'Ages des membres',
                data: [nombre_majeurs, nombre_mineurs, total_age],
                backgroundColor: ['#FF5733', '#33FF57', '#3357FF'],
                borderColor: ['#FF5733', '#33FF57', '#3357FF'],
                
                borderWidth: 1,
              },
            ],
          };
        }

        // Si un graphique existe déjà, nous le détruisons pour éviter les doublons
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        // Créer un nouveau graphique
        chartInstance.current = new Chart(chartRef.current, {
          type: type === 'sexe' ? 'doughnut' : 'polarArea', // Type de graphique
          data: data,
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: true },
            },
          },
        });
      })
      .catch(error => {
        console.error(`Erreur lors de la récupération des données pour ${type}`, error);
      });

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [id_travailleur, type]);

  return (
    <div>
      <canvas ref={chartRef}></canvas> {/* Canvas pour le graphique */}
    </div>
  );
};

export default Histogram;
