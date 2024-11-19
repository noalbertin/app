import React from 'react';
import { Outlet } from 'react-router-dom';

function SimpleLayout() {
  return (
    <div className="w-full h-screen bg-gray-100 dark:bg-slate-900">
      <Outlet />
    </div>
  );
}

export default SimpleLayout;
