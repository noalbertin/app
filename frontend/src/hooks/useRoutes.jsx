import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom'; 
import { FaChartLine, FaUserTie, FaUsers } from "react-icons/fa";
import { IoHome } from "react-icons/io5";
import { PiUsersFourFill, PiMicrosoftExcelLogoBold } from "react-icons/pi";
import axios from 'axios';

export const useRoutes = () => {
  const location = useLocation().pathname;
  const [role, setRole] = useState(null);

  const id_travailleur = location.state?.id_travailleur || localStorage.getItem("travailleurId");

  useEffect(() => {
    if (id_travailleur) {
      axios.get(`http://localhost:8081/travailleur/role/${id_travailleur}`)
  .then(response => {
    if (response.data.role) {
      setRole(response.data.role);
    } else {
      console.error('Rôle non trouvé pour cet utilisateur');
    }
  })
  .catch(error => {
    console.error('Erreur lors de la récupération du rôle:', error);
  });

    }
  }, [id_travailleur]);

  const routes = useMemo(() => {
    const constructedRoutes = [
      {
        title: "Accueil",
        icon: IoHome,
        path: "/accueil",
        active: location === "/accueil",
        showInSidebar: true,
      },
      {
        title: "Famille",
        icon: PiUsersFourFill,
        path: "/famille",
        active: location === "/famille",
        showInSidebar: true,
      },
      ...(role === "ADMINISTRATEUR" ? [
        
        {
          title: "Bénéficiaire",
          icon: PiMicrosoftExcelLogoBold,
          path: "/beneficiaire",
          active: location === "/beneficiaire",
          showInSidebar: true,
        },
        {
          title: "Utilisateurs",
          icon: FaUsers,
          path: "/utilisateurs",
          active: location === "/utilisateurs",
          showInSidebar: true,
        },
        {
          title: "Comparaison",
          icon: FaChartLine,
          path: "/comparaison",
          active: location === "/comparaison",
          showInSidebar: true,
        },
      ] : []),
      {
        title: "Profil",
        icon: FaUserTie,
        path: `/profile/${id_travailleur}`,
        active: location.startsWith("/profile"),
        showInSidebar: false,
      },
    ];
    return constructedRoutes;
  }, [location, role, id_travailleur]);

  return routes;
};
