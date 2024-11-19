import React from 'react';
import { ImCross } from "react-icons/im";
import { FaCheck } from "react-icons/fa";

const FieldComparison = ({ label, value1, value2 }) => {
  const isMatch = value1 === value2;
  return (
    <p className="flex items-center justify-between gap-4 py-2 px-3  text-slate-900 dark:text-slate-50">
        <div>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{label}: </span>
            <span className="flex-grow text-right font-medium text-slate-600 dark:text-slate-300">{value2}</span>
        </div>

        {isMatch ? (
        <FaCheck className="text-green-500 w-5 h-5" />
        ) : (
        <ImCross className="text-red-500 w-5 h-5" />
        )}
    </p>
  
  );
};

export default FieldComparison;
