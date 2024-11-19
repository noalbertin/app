import React, { useContext, useState } from 'react';
import clsx from "clsx";
import { Link } from 'react-router-dom';
import { SidebarContext } from "./Sidebar"; // Importer le contexte Sidebar

const NavLink = ({ icon: Icon, title, active, path }) => {
  const { expanded } = useContext(SidebarContext);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Link to={path} className="relative w-full" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
      <div
        className={clsx(
          "flex flex-col md:flex-row items-center justify-center md:justify-start p-3 rounded-md cursor-pointer transition-colors duration-200",
          active
            ? "md:bg-gradient-to-tr md:from-indigo-200 md:to-indigo-100 text-indigo-800 dark:md:text-indigo-800 dark:text-purple-600"
            : "hover:bg-indigo-50 text-gray-600 dark:text-slate-300 dark:hover:bg-slate-600"
        )}
      >
        <Icon
          size={expanded ? 30 : 20}
          className={active ? "text-indigo-800 dark:md:text-indigo-800 dark:text-purple-600" : "text-gray-600 dark:text-slate-300"}
        />
        <p
          className={`overflow-hidden transition-all duration-300 ${
            expanded ? "md:w-52 md:ml-3 md:opacity-100" : "md:w-0 md:opacity-0"
          }

           text-xs md:text-base font-bold`
        }
        >
          {title}
        </p>
        {!expanded && showTooltip && (
          <div className="hidden md:block absolute md:left-full md:ml-2 p-1 bg-gray-700 text-white text-xs rounded shadow-lg">
            {title}
          </div>
        )}
      </div>
    </Link>
  );
};

export default NavLink;
