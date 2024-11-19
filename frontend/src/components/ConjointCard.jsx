import React from "react";
import { GrEdit } from "react-icons/gr";
import { FaTrashAlt } from "react-icons/fa";

const ConjointCard = ({ conjoint, handleEdit, handleDelete }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-sm bg-slate-50 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow duration-300 dark:bg-slate-800">
      <img
        className="w-full h-48 object-cover"
        src={`http://localhost:8081/${conjoint.imageUrl.replace('backend/', '')}`}
        alt="Conjoint"
      />
      <div className="p-5">
        <h5 className="text-lg font-bold dark:text-slate-200">{conjoint.nom} {conjoint.prenom}</h5>
        <p className="text-sm text-gray-700 dark:text-slate-300">Conjoint, Né le : {formatDate(conjoint.age)}</p>
        <p className="text-sm text-gray-700 dark:text-slate-300">Sexe: {conjoint.sexe}</p>
        <p className="text-sm text-gray-700 dark:text-slate-300">CIN: {conjoint.cin}</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => handleEdit(conjoint.id, "conjoint")} style={{ color: "#265ed7" }}>
            <GrEdit />
          </button>
          <button onClick={() => handleDelete(conjoint.id, "conjoint")} style={{ color: "#e95959" }}>
            <FaTrashAlt />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConjointCard;
