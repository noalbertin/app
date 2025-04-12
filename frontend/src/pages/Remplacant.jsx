import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from "sweetalert2";

const Remplacant = () => {
  const location = useLocation();
  const id_travailleur = location.state?.id_travailleur || localStorage.getItem("travailleurId");
  const [remplacants, setRemplacants] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer les remplaçants (conjoint et enfants)
    if (id_travailleur) {
      axios.get(`http://localhost:8081/remplacant/selectionner_remplacant/${id_travailleur}`)
        .then(res => {
          setRemplacants(res.data);
          console.log(res.data);
        })
        .catch(error => {
          console.error("Erreur lors de la récupération des remplaçants:", error);
        });
    }
  }, [id_travailleur]);

  if (!remplacants) {
    return <div>Chargement...</div>;
  }

  // Fonction pour formater la date en un format lisible
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("fr-FR", {
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
  };

  // Fonction pour définir le remplaçant
  const definirRemplacant = (id_remplacant) => {
    axios.post('http://localhost:8081/remplacant/addRemplacant', {
      id_travailleur,
      id_remplacant
    })
    .then((res) => {
      Swal.fire({
        title: "Succès 🎉",
        text: "Remplacent ajouté avec succès !",
        icon: "success",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      }).then(() => {
        // Assurez-vous que la redirection se fait après que l'utilisateur ferme l'alerte
        navigate('/accueil', { state: { id_travailleur: localStorage.getItem('travailleurId') } });
      });
    })
    .catch((error) => {
      console.error("Erreur lors de l'ajout du remplaçant :", error);
      alert("Erreur lors de l'ajout du remplaçant");
    });
  };

  return (
    <div className="flex justify-center text-white p-5">
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="flex justify-center">
          <h1 className="uppercase text-4xl leading-normal font-bold">Choisissez votre Remplaçant</h1>
        </div>
        <div className="flex flex-row justify-center group space-x-4">
  {/* Afficher le conjoint */}
  {remplacants.conjoint && (
    <div 
      className="col-lg-3 col-md-6 col-sm-12 transform transition-all duration-300 hover:scale-105"
      onClick={() => definirRemplacant(remplacants.conjoint.id)}  // Appel à la fonction
    >
      <div className="card card-box cursor-pointer m-2 group-hover:blur-sm hover:!blur-none group-hover:scale-[0.85] hover:!scale-100 duration-100 bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <img 
          className="card-img-top w-full h-48 object-cover"
          src={`http://localhost:8081/${remplacants.conjoint.imageUrl.replace('backend/', '')}`} 
          alt="Conjoint" 
        />
        <div className="card-body p-4">
          <h5 className="card-title weight-500 text-xl font-semibold mb-2">{remplacants.conjoint.nom}</h5>
          <p className="card-text text-gray-700">Votre Conjoint, né(e) le {formatDate(remplacants.conjoint.age)}</p>
        </div>
      </div>
    </div>
  )}

  {/* Afficher les enfants */}
  {remplacants.enfants && remplacants.enfants.map((enfant) => (
    <div 
      className="col-lg-3 col-md-6 col-sm-12 transform transition-all duration-300 hover:scale-105"
      key={enfant.id}
      onClick={() => definirRemplacant(enfant.id)}  // Appel à la fonction
    >
      <div className="card card-box cursor-pointer m-2 group-hover:blur-sm hover:!blur-none group-hover:scale-[0.85] hover:!scale-100 duration-100 bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <img 
          className="card-img-top w-full h-48 object-cover"
          alt="Enfant"
          src={`http://localhost:8081/${enfant.imageUrl.replace('backend/', '')}`} 
        />
        <div className="card-body p-4">
          <h5 className="card-title weight-500 text-xl font-semibold mb-2">{enfant.nom}</h5>
          <p className="card-text text-gray-700">Enfant, né(e) le {formatDate(enfant.age)}</p>
        </div>
      </div>
    </div>
  ))}
</div>
      </form>
    </div>
  );
};

export default Remplacant;
