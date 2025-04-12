import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar, { SidebarContext } from './components/Sidebar';
import Navbar from './components/Navbar';
function App() {
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const id_travailleur = location.state?.id_travailleur || localStorage.getItem("travailleurId");
  // Redirect to login if id_travailleur is not found
  useEffect(() => {
    if (!id_travailleur) {
      navigate('/');
    }
  }, [id_travailleur, navigate]);
  // Define sidebar width based on expanded state
  const sidebarWidth = expanded ? "md:w-[250px]" : "md:w-[55px]";
  const contentPadding = expanded ? "md:ml-[250px]" : "md:ml-[55px]";
  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, sidebarWidth }}>
      <main className="w-full h-screen flex">
        <Sidebar id_travailleur={id_travailleur} />
        <div className={`flex flex-col flex-grow transition-all duration-300 ease-in-out ${contentPadding}`}>
          <Navbar id_travailleur={id_travailleur} />
          <div className="contentElement flex-grow p-5 pt-[60px] bg-gray-100 dark:bg-slate-900 dark:text-slate-300">
            <Outlet id_travailleur={id_travailleur} />
          </div>
        </div>
      </main>
    </SidebarContext.Provider>
  );
}

export default App;
