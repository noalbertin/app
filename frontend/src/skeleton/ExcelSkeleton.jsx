import React from 'react';
import SkeletonLoader from './SkeletonLoader';

const ExcelSkeleton = () => {
  return (
    <>
        
        <div className="overflow-x-auto hidden md:block">
            <table className="min-w-full bg-slate-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-lg rounded-lg overflow-hidden">
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {[...Array(5)].map((_, index) => (
                    <div key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <td className="py-3 px-4 border-b dark:border-gray-600 text-gray-800 dark:text-gray-300">
                        <SkeletonLoader width={120} height={20} />
                        </td>
                        <td className="py-3 px-4 border-b dark:border-gray-600 text-gray-800 dark:text-gray-300">
                        <SkeletonLoader width={180} height={20} />
                        </td>
                        <td className="py-3 px-4 border-b dark:border-gray-600 text-gray-800 dark:text-gray-300">
                        <SkeletonLoader width={150} height={20} />
                        </td>
                        <td className="py-3 px-4 border-b dark:border-gray-600 text-gray-800 dark:text-gray-300">
                        <SkeletonLoader width={120} height={20} />
                        </td>
                        <td className="py-3 px-4 border-b dark:border-gray-600 text-gray-800 dark:text-gray-300">
                        <SkeletonLoader width={80} height={20} />
                        </td>
                        <td className="py-3 px-4 border-b dark:border-gray-600 text-center">
                        <SkeletonLoader width={80} height={20} />
                        </td>
                    </div>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Mobile SkeletonLoader */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
        {[...Array(5)].map((_, index) => (
            <div key={index} className="p-4 border rounded-lg bg-gray-100 dark:bg-slate-600">
            <h3 className="text-xl font-bold text-center dark:text-slate-50">
                <SkeletonLoader width={150} height={25} />
            </h3>
            <p><strong>Num Ménage:</strong> <SkeletonLoader width={100} height={20} /></p>
            <p><strong>Statut:</strong> <SkeletonLoader width={100} height={20} /></p>
            <p><strong>Remplaçant:</strong> <SkeletonLoader width={120} height={20} /></p>
            <p><strong>Mère:</strong> <SkeletonLoader width={120} height={20} /></p>
            <p><strong>Sexe:</strong> <SkeletonLoader width={80} height={20} /></p>
            <p><strong>Récepteur Transfert:</strong> <SkeletonLoader width={150} height={20} /></p>
            <p><strong>CIN Récepteur:</strong> <SkeletonLoader width={120} height={20} /></p>
            <p><strong>Chef de Ménage:</strong> <SkeletonLoader width={130} height={20} /></p>
            <p><strong>Direction:</strong> <SkeletonLoader width={100} height={20} /></p>
            <p><strong>Région:</strong> <SkeletonLoader width={120} height={20} /></p>
            <p><strong>District:</strong> <SkeletonLoader width={120} height={20} /></p>
            <p><strong>Commune:</strong> <SkeletonLoader width={120} height={20} /></p>
            <p><strong>Fokontany:</strong> <SkeletonLoader width={120} height={20} /></p>
            <p><strong>Groupe de Critère:</strong> <SkeletonLoader width={150} height={20} /></p>
            </div>
        ))}
        </div>

        {/* Pagination SkeletonLoader */}
        <div className="flex justify-end mt-4 space-x-2 mb-4 md:mb-0">
        <button className="px-3 py-1 rounded-md bg-gray-300 dark:bg-slate-50 dark:text-slate-600 hover:bg-gray-400 disabled:opacity-50">
            <SkeletonLoader width={80} height={30} />
        </button>
        {[...Array(3)].map((_, index) => (
            <button key={index} className="px-3 py-1 rounded-md bg-slate-300 dark:bg-slate-400 dark:text-slate-50">
            <SkeletonLoader width={30} height={20} />
            </button>
        ))}
        <button className="px-3 py-1 rounded-md bg-gray-300 dark:bg-slate-50 dark:text-slate-600 hover:bg-gray-400 disabled:opacity-50">
            <SkeletonLoader width={80} height={30} />
        </button>
        </div>
    </>
   
    );
};

export default ExcelSkeleton;

