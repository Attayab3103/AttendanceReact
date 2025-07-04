import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-blue-600 via-green-500 to-blue-400 shadow-lg py-4">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center px-2 sm:px-0">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-white mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg>
          <h1 className="text-white text-2xl font-extrabold tracking-wide drop-shadow">Attendance App</h1>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;