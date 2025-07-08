import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-green-100 to-white flex flex-col">
      <Navbar brandName="DAR-E-ARQAM SCHOOL (JOHAR TOWN)" />
      <div className="flex-grow flex flex-col items-center justify-center px-2 w-full">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-12 h-12 text-blue-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
            <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">DAR-E-ARQAM SCHOOL (JOHAR TOWN)</h1>
          </div>
          <p className="text-lg text-gray-600">Effortless student progress tracking for teachers and parents</p>
        </div>
        <div className="bg-white p-4 sm:p-8 rounded-lg shadow-xl w-full max-w-xs sm:max-w-md text-center border-t-4 border-blue-400">
          <h2 className="text-2xl font-bold mb-6 text-blue-700">Welcome!</h2>
          <p className="mb-4 text-gray-700 text-base">Please select your role to continue:</p>
          <Link to="/teacher" className="block bg-blue-500 text-white py-3 px-4 rounded-md text-base sm:text-xl mb-4 hover:bg-blue-600 transition duration-300 shadow">
            I'm a Teacher
          </Link>
          <p className="text-xs text-gray-500 mb-2">Teachers: Login with your unique PIN. You can manage multiple classes and mark attendance, tests, and activities for each student. If you don't have a PIN, contact the admin.</p>
          <Link to="/parent" className="block bg-green-500 text-white py-3 px-4 rounded-md text-base sm:text-xl hover:bg-green-600 transition duration-300 shadow">
            I'm a Parent
          </Link>
          <p className="text-xs text-gray-500">Parents: Enter your child's student ID to view attendance, test results, and activities. If you have multiple children, you can view each child's progress separately.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 