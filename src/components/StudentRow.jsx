import React from 'react';

const StudentRow = ({ student, attendance, onToggleAttendance }) => {
  const isPresent = attendance === 'Present';
  const isAbsent = attendance === 'Absent';
  const isUnmarked = attendance !== 'Present' && attendance !== 'Absent';

  // Add explicit buttons for Present/Absent
  const handleMark = (status) => {
    if (attendance !== status) {
      onToggleAttendance(student.rollNo, status);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-b border-blue-100 bg-white rounded-lg shadow-sm mb-2 gap-2 sm:gap-0">
      <span className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
        {student.name} <span className="text-xs text-gray-500">({student.rollNo})</span>
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => handleMark('Present')}
          className={`px-4 py-2 rounded-full font-bold shadow transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isPresent ? 'bg-green-600 text-white ring-2 ring-green-300' : 'bg-gray-300 text-gray-700 border border-gray-400'}`}
        >
          Present
        </button>
        <button
          onClick={() => handleMark('Absent')}
          className={`px-4 py-2 rounded-full font-bold shadow transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isAbsent ? 'bg-red-600 text-white ring-2 ring-red-300' : 'bg-gray-300 text-gray-700 border border-gray-400'}`}
        >
          Absent
        </button>
      </div>
      {/* No fallback label if not marked */}
    </div>
  );
};

export default StudentRow;