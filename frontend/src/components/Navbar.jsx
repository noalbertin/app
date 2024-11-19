import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BsMoonStarsFill } from "react-icons/bs";
import { IoSunnySharp } from "react-icons/io5";
import { ThemeContext } from '../context/ThemeContext.jsx';
import { SidebarContext } from './Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRoutes } from '../hooks/useRoutes.jsx';
import { TbLogout } from "react-icons/tb";
import { FaUserTie } from 'react-icons/fa';

const Navbar = () => {
  const { expanded, setExpanded } = useContext(SidebarContext);
  const pathname = useLocation().pathname;
  const routes = useRoutes();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null); // Reference for the dropdown menu
  const location = useLocation();
  const id_travailleur = location.state?.id_travailleur || localStorage.getItem("travailleurId");
  const [travailleur, setTravailleur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Fetch travailleur data
  useEffect(() => {
    const fetchTravailleur = async () => {
      try {
        const response = await fetch(`http://localhost:8081/travailleur/${id_travailleur}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données du travailleur');
        }
        const data = await response.json();
        setTravailleur(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id_travailleur) {
      fetchTravailleur();
    } else {
      navigate('/');
    }
  }, [id_travailleur, navigate]);

  const toggleDropdown = () => {
    setIsOpen(prevState => !prevState);
  };

  // Use useEffect to handle clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = () => {
    // Remove JWT token from localStorage
    localStorage.removeItem('token');
    // Redirect to the login page
    navigate('/'); // Make sure "/" is the login page
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const imageUrl = `http://localhost:8081/${travailleur.imageUrl_travailleur.replace('backend/', '')}`;

  return (
    <div className={`navbar fixed h-[60px] z-10 ${expanded ? 'md:pr-[250px]' : 'md:pr-[55px]'} w-full md:row-[1] flex items-center justify-between shadow-sm bg-slate-50 dark:bg-slate-800 `}>
      {routes.map((item) => 
  item.active && (
    <h1 key={item.path} className="text-2xl font-bold dark:text-slate-200">
      {item.title}
    </h1>
  )
)}

      
      <div className="flex items-center md:p-4 p-1 m-0">
        <div onClick={toggleTheme} className="mr-3 size-10 rounded-full flex items-center justify-center cursor-pointer">
          {theme === "light" ? <BsMoonStarsFill className='text-base ' /> : <IoSunnySharp className='text-xl dark:text-slate-200 ' />}
        </div>
        <div className="relative" ref={dropdownRef}>
          {/* Afficher le nom du travailleur avant l'image */}
          <div className="flex items-center">
            <div className="relative flex rounded-full bg-gray-800 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                onClick={toggleDropdown}>
              <span className="absolute -inset-1.5" />
              <span className="sr-only">Open user menu</span>
              <img
                alt="User Avatar"
                src={imageUrl} // Utilisez l'URL de l'image ici
                className="h-10 w-10 rounded-full cursor-pointer object-cover"
              />
            </div>
          </div>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-slate-50 dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-100 ">
              <div className="py-1 dark:bg-slate:800" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                <div className="block px-4 py-2 text-lg text-gray-700 dark:text-slate-300" role="menuitem">
                  {travailleur ? `${travailleur.nom_travailleur} ${travailleur.prenom_travailleur}` : "Nom de travailleur"} {/* Remplacez par le champ approprié */}
                </div>

                <nav>
                  <Link to={`/profile/${id_travailleur}`} className="block px-4 py-2 text-md text-gray-700  dark:text-slate-300" role="menuitem">
                    <span className="flex items-center dark:hover:text-blue-500">
                      <FaUserTie className="mr-2 text-md " /> {/* Icône de déconnexion avec une marge à droite */}
                      <p> Profile</p>
                    </span>
                  </Link>
                  <a href='#' onClick={handleLogout} className="block px-4 py-2 text-md text-gray-700  dark:text-slate-300" role="menuitem">
                    <span className="flex items-center dark:hover:text-blue-500">
                      <TbLogout className="mr-2 text-md " /> {/* Icône de déconnexion avec une marge à droite */}
                      <p> Déconnexion</p>
                    </span>
                  </a>
                  
                </nav>
                
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Navbar;
