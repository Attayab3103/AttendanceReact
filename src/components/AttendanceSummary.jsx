import React from 'react';

const AttendanceSummary = ({ attendance, rollNo }) => {
  const studentAttendance = attendance[rollNo] || {};

  const totalDays = Object.keys(studentAttendance).length;
  const presentDays = Object.values(studentAttendance).filter(status => status === 'Present').length;
  const absentDays = totalDays - presentDays;
  const percentage = totalDays ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-green-50 p-4 sm:p-8 rounded-2xl shadow-xl border-t-4 border-blue-400 w-full">
      <div className="flex items-center mb-2 sm:mb-4">
        <svg className="w-7 h-7 text-blue-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        <h3 className="text-xl sm:text-2xl font-extrabold text-gray-800 tracking-tight">Attendance Summary</h3>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-4 text-base sm:text-lg">
        <div className="bg-blue-100 rounded-lg p-2 sm:p-3 text-center">
          <span className="block text-gray-600">Total Days</span>
          <span className="font-bold text-2xl text-blue-700">{totalDays}</span>
        </div>
        <div className="bg-green-100 rounded-lg p-2 sm:p-3 text-center">
          <span className="block text-gray-600">Present</span>
          <span className="font-bold text-2xl text-green-700">{presentDays}</span>
        </div>
        <div className="bg-red-100 rounded-lg p-2 sm:p-3 text-center">
          <span className="block text-gray-600">Absent</span>
          <span className="font-bold text-2xl text-red-700">{absentDays}</span>
        </div>
        <div className="bg-blue-50 rounded-lg p-2 sm:p-3 text-center col-span-2">
          <span className="block text-gray-600">Attendance %</span>
          <span className="font-bold text-2xl text-blue-600">{percentage}%</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSummary; 