import React from 'react';
import SkeletonLoader from './SkeletonLoader';

const SkeletonSection = () => (
  <div className="col-xl-3 col-lg-3 col-md-6 col-6 mb-3">
    <div className="card-box height-100-p widget-style3 dark:bg-slate-800">
      <div className="d-flex flex-wrap">
        <div className="widget-data">
        <SkeletonLoader
          type="text"
          className="dark:bg-slate-700"
          width={100}
          height={20}
          
        />

          <SkeletonLoader type="text" width={80} height={20} />
        </div>
        <div className="widget-icon">
          <SkeletonLoader type="text" width={30} height={30} />
        </div>
      </div>
    </div>
  </div>
);

export default SkeletonSection;
