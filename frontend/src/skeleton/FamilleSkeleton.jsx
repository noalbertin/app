import React from 'react';
import SkeletonLoader from './SkeletonLoader';

const FamilleSkeleton = () => {
  return (
    <>
      {/* Bouton de modal */}
      <div className="flex justify-end mt-5">
        <SkeletonLoader type="text" width={200} height={40} />
      </div>

      {/* Titre */}
      <div className="flex justify-center text-slate-50 p-5">
        <div className="w-full max-w-6xl">
          <div className="flex justify-center mb-12">
            <h1 className="uppercase text-4xl leading-normal font-bold dark:text-slate-100">
              <SkeletonLoader type="text" width={300} height={40} />
            </h1>
          </div>

          {/* Section des parents */}
          <div className="flex flex-wrap justify-center gap-6">
            {/* Skeleton pour le travailleur */}
            <div className="max-w-sm bg-slate-50 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow duration-300 dark:bg-slate-800">
              <SkeletonLoader type="text" width="100%" height={200} />
              <div className="p-5">
                <SkeletonLoader type="text" width={150} height={20} />
                <SkeletonLoader type="text" width={100} height={20} />
                <SkeletonLoader type="text" width={120} height={20} />
                <SkeletonLoader type="text" width={100} height={20} />
                <SkeletonLoader type="text" width={100} height={20} />
              </div>
            </div>

            {/* Skeleton pour le conjoint */}
            <div className="max-w-sm bg-slate-50 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow duration-300 dark:bg-slate-800">
              <SkeletonLoader type="text" width="100%" height={200} />
              <div className="p-5">
                <SkeletonLoader type="text" width={150} height={20} />
                <SkeletonLoader type="text" width={100} height={20} />
                <SkeletonLoader type="text" width={120} height={20} />
                <SkeletonLoader type="text" width={100} height={20} />
                <SkeletonLoader type="text" width={100} height={20} />
              </div>
            </div>

            {/* Skeleton pour les enfants */}
            <div className="max-w-sm bg-slate-50 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow duration-300 dark:bg-slate-800">
              <SkeletonLoader type="text" width="100%" height={200} />
              <div className="p-5">
                <SkeletonLoader type="text" width={150} height={20} />
                <SkeletonLoader type="text" width={100} height={20} />
                <SkeletonLoader type="text" width={120} height={20} />
                <SkeletonLoader type="text" width={100} height={20} />
                <SkeletonLoader type="text" width={100} height={20} />
              </div>
            </div>

            
          </div>
        </div>
      </div>

      
    </>
  );
};

export default FamilleSkeleton;
