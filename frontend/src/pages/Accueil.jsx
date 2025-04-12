import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TbNumber } from "react-icons/tb";
import { GiFamilyHouse } from "react-icons/gi";
import { FaPersonCircleCheck, FaChildren } from "react-icons/fa6";
import { useLocation } from 'react-router-dom'; // Importer useLocation
import Histogram from '../components/Histogram';
import SkeletonSection from '../skeleton/SectionSkeleton';
import SkeletonLoader from '../skeleton/SkeletonLoader';
import { FaCamera } from "react-icons/fa";

const Accueil = () => {
  const [travailleur, setTravailleur] = useState(null);
  const location = useLocation();
  const id_travailleur = location.state?.id_travailleur || localStorage.getItem("travailleurId");
  console.log(id_travailleur);

  useEffect(() => {
    const fetchTravailleur = async () => {
      try {
        setTimeout(async () => {
          const response = await axios.get(`http://localhost:8081/travailleur/propos/${id_travailleur}`);
          setTravailleur(response.data);
        }, 500);
      } catch (error) {
        console.error('Erreur lors de la récupération du travailleur', error);
      }
    };

    if (id_travailleur) {
      fetchTravailleur();
    }
  }, [id_travailleur]);

  if (!travailleur) {
    return (
      <div className="pt-5 dark:text-slate-600">
        <div className="row">
          {/* Affichage des sections avec des SkeletonLoader */}
          {[...Array(4)].map((_, index) => (
            <SkeletonSection key={index} />
          ))}
        </div>

      <div className="title pb-2">
        <h2 className="h3 mb-0 dark:text-slate-50">Diagramme</h2>
      </div>

      <div className="row">
        <div className="col-lg-6 col-md-12 col-sm-12 mb-3">
          <div className="card-box pd-30 dark:bg-slate-800">
            <SkeletonLoader type="card" />
          </div>
        </div>

        <div className="col-lg-6 col-md-12 col-sm-12 mb-3">
          <div className="card-box pd-30 dark:bg-slate-800">
            <SkeletonLoader type="card" />
          </div>
        </div>
      </div>
    </div>
    );
  }

  return (
    <div className="pt-5 dark:text-slate-300">
      <div className="row">
        <div className="col-xl-3 col-lg-3 col-md-6 col-6 mb-3">
          <div className="card-box height-100-p widget-style3 dark:bg-slate-800">
            <div className="d-flex flex-wrap">
              <div className="widget-data">
                <div className="weight-700 font-16 dark:text-slate-200">
                  {travailleur.codeMenage}
                </div>
                <div className="font-14 font-bold dark:text-slate-200">
                  Code Ménage
                </div>
              </div>
              <div className="widget-icon">
                <div className="icon" data-color="#00eccf">
                  <TbNumber className="text-red-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Autres sections du travailleur */}
        <div className="col-xl-3 col-lg-3 col-md-6 col-6 mb-3">
          <div className="card-box height-100-p widget-style3 dark:bg-slate-800">
            <div className="d-flex flex-wrap">
              <div className="widget-data">
                <div className="weight-700 font-16 dark:text-slate-200">
                  {travailleur.total_membres_famille}
                </div>
                <div className="font-14 font-bold dark:text-slate-200">
                  Nombre de la famille
                </div>
              </div>
              <div className="widget-icon">
                <div className="icon" data-color="#ff5b5b">
                  <GiFamilyHouse />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Autres sections */}
        <div className="col-xl-3 col-lg-3 col-md-6 col-6 mb-3">
          <div className="card-box height-100-p widget-style3 dark:bg-slate-800">
            <div className="d-flex flex-wrap">
              <div className="widget-data">
                <div className="weight-700 font-16 dark:text-slate-200">
                  {travailleur.enfants_count}
                </div>
                <div className="font-14 font-bold dark:text-slate-200">
                  Nombre d'enfants
                </div>
              </div>
              <div className="widget-icon">
                <div className="icon">
                  <FaChildren />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-3 col-md-6 col-6 mb-3">
          <div className="card-box height-100-p widget-style3 dark:bg-slate-800">
            <div className="d-flex flex-wrap">
              <div className="widget-data">
                <div className="weight-700 font-16 truncate w-48 dark:text-slate-200">
                  {travailleur.nom_remplacant}
                </div>
                <div className="font-14 font-bold dark:text-slate-200">Remplaçant </div>
              </div>
              <div className="widget-icon">
                <div className="icon" data-color="#09cc06">
                  <FaPersonCircleCheck className="text-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="title pb-2">
        <h2 className="h3 mb-0 dark:text-slate-50">Diagramme</h2>
      </div>

      <div className="row">
        <div className="col-lg-6 col-md-12 col-sm-12 mb-3">
          <div className="card-box pd-30 dark:bg-slate-800">
            <h2 className='dark:text-slate-50'>Histogramme des membres (Hommes et Femmes)</h2>
            <Histogram type="sexe" />
          </div>
        </div>

        <div className="col-lg-6 col-md-12 col-sm-12 mb-3">
          <div className="card-box pd-30 dark:bg-slate-800">
            <h2 className='dark:text-slate-50'>Histogramme des âges</h2>
            <Histogram type="age" />
          </div>
        </div>
      </div>

      {/* <div className="flex flex-col items-center">
       
        <button
          className="w-24 h-24 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
        >
          <FaCamera className='size-10'/>
        </button>
      </div> */}
    </div>
  );
};

export default Accueil;
