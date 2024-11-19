// Sidebar.jsx
import React, { createContext, useContext } from "react";
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarRightCollapse } from "react-icons/tb";
import NavLink from "./NavLink";
import { useRoutes } from "../hooks/useRoutes";
import clsx from "clsx";

export const SidebarContext = createContext();

const Sidebar = () => {
  const { expanded, setExpanded, sidebarWidth } = useContext(SidebarContext);

  const routes = useRoutes();

  return (
    <div
      className={`sidebarn fixed bottom-0 bg-slate-50 z-10 w-full ${sidebarWidth} h-[60px] md:h-screen md:col-[1] flex md:flex-col dark:bg-slate-700 transition-all duration-300`}
    >
      <div className="relative flex items-center justify-center h-[60px] md:h-[100px]">
        <div
          className={`absolute inset-0 flex items-center justify-center overflow-hidden transition-all duration-300 ${
            expanded ? "w-full opacity-100" : "w-0 opacity-0"
          }`}
        >
          <img src="fimisa.svg" alt="Logo" className="object-cover" />
        </div>
        <div
          className="absolute top-2 right-2"
          onClick={() => setExpanded((curr) => !curr)}
        >
          {expanded ? (
            <TbLayoutSidebarLeftCollapse
              size={30}
              className="cursor-pointer dark:text-slate-200"
            />
          ) : (
            <TbLayoutSidebarRightCollapse
              size={30}
              className="cursor-pointer dark:text-slate-200"
            />
          )}
        </div>
      </div>
      <div className={clsx(
  "flex flex-1 md:flex-col justify-around md:justify-start items-center md:items-start space-x-4 md:space-x-0 md:space-y-1 shadow-2xl",
  expanded ? "md:p-5" : "md:space-y-2 md:m-1 md:p-0"
)}>
  {routes
    .filter(item => item.showInSidebar) // Ne pas afficher les routes avec showInSidebar: false
    .map((item) => (
      <NavLink
        key={item.path}
        path={item.path}
        active={item.active}
        title={item.title}
        icon={item.icon}
      />
    ))}
</div>

    </div>
  );
};

export default Sidebar;
