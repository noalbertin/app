import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar, { SidebarContext } from '../components/Sidebar';
import Navbar from '../components/Navbar';

function MainLayout() {
  const [expanded, setExpanded] = useState(true);

  // Définir la largeur de la barre latérale en fonction de l'état `expanded`
  const sidebarWidth = expanded ? "md:w-[250px]" : "md:w-[55px]";
  const contentPadding = expanded ? "md:ml-[250px]" : "md:ml-[55px]";

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, sidebarWidth }}>
      <main className="w-full h-screen flex">
        <Sidebar />
        <div className={`flex flex-col flex-grow transition-all duration-300 ease-in-out ${contentPadding}`}>
          <Navbar />
          <div className="contentElement flex-grow p-5 pt-[60px] bg-gray-100 dark:bg-slate-900 dark:text-slate-300">
            <Outlet />
          </div>
        </div>
      </main>
    </SidebarContext.Provider>
  );
}

export default MainLayout;
