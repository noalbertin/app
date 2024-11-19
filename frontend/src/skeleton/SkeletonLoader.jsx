import React, { useContext } from "react";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import { ThemeContext } from "../context/ThemeContext"; 

// Composant Skeleton personnalisé
const SkeletonLoader = ({ type, width = 100, height = 20, count = 1 }) => {
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";

  // Définir les couleurs en fonction du mode sombre
  const baseColor = isDarkMode ? '#2c3e50' : '#E0E0E0'; // Couleur de fond du skeleton
  const highlightColor = isDarkMode ? '#555' : '#F0F0F0'; // Couleur de l'animation du skeleton

  if (type === 'text') {
    return (
      <Skeleton 
        count={count} 
        width={width} 
        height={height} 
        baseColor={baseColor} 
        highlightColor={highlightColor} 
      />
    );
  } else if (type === 'card') {
    return (
      <div className="skeleton-card">
        <Skeleton width="80%" height={40} baseColor={baseColor} highlightColor={highlightColor} />
        <Skeleton height={250} baseColor={baseColor} highlightColor={highlightColor} />
      </div>
    );
  }
  
  return <Skeleton width={width} height={height} baseColor={baseColor} highlightColor={highlightColor} />;
};

export default SkeletonLoader;
