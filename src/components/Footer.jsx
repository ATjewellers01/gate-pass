import React from 'react';

const Footer = ({ isFixed = true }) => {
  return (
    <div className={`${isFixed ? 'fixed bottom-0 left-0 right-0' : 'w-full mt-auto py-4'} bg-white/10 backdrop-blur-sm border-t border-gray-200/50 z-50 py-3`}>
      <div className="text-center text-xs sm:text-sm text-gray-500 font-medium">
        Powered by{' '}
        <a 
          href="https://botivate.in" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-500 hover:text-blue-600 transition-colors duration-200 font-bold hover:underline"
        >
          Botivate
        </a>
      </div>
    </div>
  );
};

export default Footer;
