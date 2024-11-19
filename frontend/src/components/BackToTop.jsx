import React, { useEffect, useState } from "react";
import {FaArrowUp } from "react-icons/fa";

const BackToTop = () => {

    const [showBackToTop, setShowBackToTop] = useState(false);

  // Écoute de l'événement de scroll pour afficher ou cacher le bouton "Back to Top"
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fonction pour revenir en haut de la page
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <div>

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
      
    </div>
  )
}

export default BackToTop
