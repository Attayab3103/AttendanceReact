import React from 'react';
import logo from '../logo/logoschool.png';

const Navbar = ({ brandName = "DAR-E-ARQAM SCHOOL (JOHAR TOWN)" }) => {
  return (
    <nav className="bg-gradient-to-r from-blue-600 via-green-500 to-blue-400 shadow-lg py-3 sm:py-4 w-full">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center px-2 sm:px-4 w-full">
        <div className="flex items-center w-full">
          <img src={logo} alt="School Logo" className="w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3 rounded-full shadow bg-white object-contain" />
          <h1 className="text-white text-lg sm:text-2xl font-extrabold tracking-wide drop-shadow truncate">{brandName}</h1>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;