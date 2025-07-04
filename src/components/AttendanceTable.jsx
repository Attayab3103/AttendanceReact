import React from 'react';

const AttendanceTable = ({ attendanceRecords }) => {
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full bg-gradient-to-br from-white via-blue-50 to-green-50 border border-blue-200 rounded-xl shadow-xl text-sm sm:text-base">
        <thead>
          <tr>
            <th className="py-2 sm:py-3 px-2 sm:px-6 bg-blue-100 text-blue-700 text-base sm:text-lg font-semibold rounded-tl-xl">Date</th>
            <th className="py-2 sm:py-3 px-2 sm:px-6 bg-blue-100 text-blue-700 text-base sm:text-lg font-semibold rounded-tr-xl">Status</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(attendanceRecords).map(([date, status], idx, arr) => (
            <tr key={date} className="text-center hover:bg-blue-50 transition">
              <td className="py-1 sm:py-2 px-2 sm:px-6 border-b border-blue-100 break-words max-w-[120px] sm:max-w-none">{date}</td>
              <td className={`py-1 sm:py-2 px-2 sm:px-6 border-b border-blue-100 font-bold flex items-center justify-center gap-2 ${status === 'Present' ? 'text-green-600' : 'text-red-600'} text-xs sm:text-base`}>
                {status === 'Present' ? (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                )}
                {status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable; 