import React from 'react';
import './PageTransition.css';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <div className="page-wrapper">
      {children}
    </div>
  );
};

export default PageTransition;
