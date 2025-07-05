import React from 'react';
import logo from '../logo/logoschool.png';

const Navbar = ({ brandName = "Dar e Arqam School" }) => {
  return (
    <nav className="bg-gradient-to-r from-blue-600 via-green-500 to-blue-400 shadow-lg py-4">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center px-2 sm:px-0">
        <div className="flex items-center">
          <img src={logo} alt="School Logo" className="w-10 h-10 mr-3 rounded-full shadow bg-white object-contain" />
          <h1 className="text-white text-2xl font-extrabold tracking-wide drop-shadow">{brandName}</h1>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;