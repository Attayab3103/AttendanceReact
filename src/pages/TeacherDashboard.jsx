import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import StudentRow from '../components/StudentRow';
import DateSelector from '../components/DateSelector';
import studentsData from '../data/students.json';
import { db } from '../firebase';
import { ref, set, onValue } from 'firebase/database';

const TeacherDashboard = () => {
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [attendance, setAttendance] = useState({}); // {rollNo: {date: status}}

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);

    // Load attendance from Firebase
    const attendanceRef = ref(db, 'attendance');
    onValue(attendanceRef, (snapshot) => {
      setAttendance(snapshot.val() || {});
    });
  }, []);

  const handleLogin = () => {
    if (password === 'teacher123') {
      setLoggedIn(true);
    } else {
      alert('Incorrect password!');
    }
  };

  // Update to accept explicit status
  const handleToggleAttendance = (rollNo, status) => {
    // Update attendance in Firebase
    set(ref(db, `attendance/${rollNo}/${selectedDate}`), status);
  };


  const handleSubmitAttendance = () => {
    // Find first student whose attendance is not marked
    const firstUnmarked = studentsData.find(student => {
      const status = attendance[student.rollNo]?.[selectedDate];
      return status !== 'Present' && status !== 'Absent';
    });
    if (firstUnmarked) {
      // Scroll to the student's row
      const el = document.getElementById(`student-row-${firstUnmarked.rollNo}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-yellow-400');
        setTimeout(() => el.classList.remove('ring-2', 'ring-yellow-400'), 2000);
      }
      toast.error(`Please mark attendance for ${firstUnmarked.name}`);
      return;
    }
    toast.success('Attendance submitted successfully!');
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-green-100 to-white flex flex-col items-center justify-center">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-10 h-10 text-blue-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Attendance App</h1>
          </div>
          <p className="text-lg text-gray-600">Teacher Login</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-xl w-80 text-center border-t-4 border-blue-400">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Teacher Login</h2>
          <input
            type="password"
            className="border border-gray-300 p-2 rounded-md w-full mb-4 focus:ring-2 focus:ring-blue-300"
            placeholder="Enter PIN"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 w-full shadow"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-green-100 to-white flex flex-col">
      <Navbar />
      <div className="container mx-auto p-2 sm:p-4 flex-grow w-full max-w-2xl">

        <div className="flex items-center mb-4">
          <svg className="w-8 h-8 text-blue-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Teacher Dashboard</h2>
        </div>
        <p className="text-gray-600 mb-6">Welcome Ma'am Aneela!</p>

        <p className="text-xl mb-4 font-semibold text-blue-700">Current Date: {selectedDate}</p>

        <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl mb-6 border-t-4 border-blue-400 w-full">
          <h3 className="text-2xl font-semibold mb-4 text-blue-700">Mark Attendance</h3>
          {
            studentsData.map(student => (
              <div id={`student-row-${student.rollNo}`} key={student.id}>
                <StudentRow
                  student={student}
                  attendance={attendance[student.rollNo]?.[selectedDate]}
                  onToggleAttendance={handleToggleAttendance}
                />
              </div>
            ))
          }
          <button
            onClick={handleSubmitAttendance}
            className="mt-6 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 w-full shadow text-base sm:text-lg"
          >
            Submit Attendance
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard; 