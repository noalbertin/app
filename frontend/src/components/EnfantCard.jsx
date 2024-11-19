import React from "react";
import { GrEdit } from "react-icons/gr";
import { FaTrashAlt } from "react-icons/fa";

const EnfantCard = ({ enfant, handleEdit, handleDelete }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-sm bg-slate-50 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow duration-300 dark:bg-slate-800">
      <img
        className="w-full h-48 object-cover"
        src={`http://localhost:8081/${enfant.imageUrl.replace('backend/', '')}`}
        alt="Enfant"
      />
      <div className="p-5">
        <h5 className="text-lg font-bold dark:text-slate-200">{enfant.nom} {enfant.prenom}</h5>
        <p className="text-sm text-gray-700 dark:text-slate-300">Enfant, {enfant.sexe === 'FEMME' ? 'Née le' : 'Né le'} {formatDate(enfant.age)}</p>
        <p className="text-sm text-gray-700 dark:text-slate-300">Sexe: {enfant.sexe}</p>
        <p className="text-sm text-gray-700 dark:text-slate-300">
          CIN:
          {enfant.cin === '0' ? (enfant.sexe === 'FEMME' ? ' Encore mineure' : ' Encore mineur') : enfant.cin}
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => handleEdit(enfant.id, "enfant")} style={{ color: "#265ed7" }}>
            <GrEdit />
          </button>
          <button onClick={() => handleDelete(enfant.id, "enfant")} style={{ color: "#e95959" }}>
            <FaTrashAlt />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnfantCard;
