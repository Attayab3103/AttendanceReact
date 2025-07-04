import React from 'react';

const DateSelector = ({ selectedDate, onDateChange }) => {
  return (
    <div className="mb-4 flex items-center gap-2">
      <label className="text-gray-700 font-medium" htmlFor="date-picker">Select Date:</label>
      <input
        id="date-picker"
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-200 shadow-sm w-full max-w-xs"
        min={new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
        max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
      />
    </div>
  );
};

export default DateSelector; 