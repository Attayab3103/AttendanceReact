import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AttendanceTable from '../components/AttendanceTable';
import AttendanceSummary from '../components/AttendanceSummary';
import studentsData from '../data/students.json';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

const ParentDashboard = () => {
  const [rollNo, setRollNo] = useState('');
  const [student, setStudent] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [testData, setTestData] = useState({});
  const [activityData, setActivityData] = useState({});
  const [error, setError] = useState('');
  const [studentName, setStudentName] = useState('');

  useEffect(() => {
    // Load attendance from Firebase
    const attendanceRef = ref(db, 'attendance');
    onValue(attendanceRef, (snapshot) => {
      setAttendanceData(snapshot.val() || {});
    });
    // Load tests from Firebase
    const testsRef = ref(db, 'tests');
    onValue(testsRef, (snapshot) => {
      setTestData(snapshot.val() || {});
    });
    // Load activities from Firebase
    const activitiesRef = ref(db, 'activities');
    onValue(activitiesRef, (snapshot) => {
      setActivityData(snapshot.val() || {});
    });
  }, []);

  const handleRollNoSubmit = () => {
    const foundStudent = studentsData.find(s => s.rollNo === rollNo);
    if (foundStudent) {
      setStudent(foundStudent);
      setStudentName(foundStudent.name);
      setError('');
    } else {
      setStudent(null);
      setStudentName('');
      setError('Student not found. Please enter a valid roll number.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-white flex flex-col">
      <Navbar />
      <div className="container mx-auto p-2 sm:p-4 flex-grow w-full max-w-2xl">
        <div className="flex items-center mb-4">
          <svg className="w-8 h-8 text-green-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Parent Dashboard</h2>
        </div>
        <p className="text-gray-600 mb-6">Check your child's attendance, test, and activity reports easily.</p>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl mb-6 border-t-4 border-green-400 w-full">
          <h3 className="text-2xl font-semibold mb-4 text-green-700">Enter Student Roll Number to View Report</h3>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
            <input
              type="text"
              className="border border-gray-300 p-2 rounded-md flex-grow focus:ring-2 focus:ring-green-300 text-base sm:text-lg"
              placeholder="Student Roll Number"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
            />
            <button
              onClick={handleRollNoSubmit}
              className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300 shadow text-base sm:text-lg"
            >
              View Student Report
            </button>
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
        </div>

        {student && (
          <>
            <div className="mb-4 text-lg font-semibold text-blue-700">Student Name: {studentName}</div>
            <div className="mt-8 bg-white p-4 sm:p-6 rounded-lg shadow-xl border-t-4 border-blue-400 w-full">
              <h3 className="text-2xl font-semibold mb-4 text-blue-700">Attendance Report</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <AttendanceSummary attendance={attendanceData} rollNo={student.rollNo} />
                <AttendanceTable attendanceRecords={attendanceData[student.rollNo] || {}} />
              </div>
            </div>
            {/* Test Report Section */}
            <div className="mt-8 bg-white p-4 sm:p-6 rounded-lg shadow-xl border-t-4 border-blue-400 w-full">
              <h3 className="text-2xl font-semibold mb-4 text-blue-700">Test Report</h3>
              {testData[student.rollNo] ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="py-2 px-4 border-b text-left">Date</th>
                        <th className="py-2 px-4 border-b text-left">Subject</th>
                        <th className="py-2 px-4 border-b text-left">Marks</th>
                        <th className="py-2 px-4 border-b text-left">Total Marks</th>
                        <th className="py-2 px-4 border-b text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(testData[student.rollNo]).sort((a, b) => a[0].localeCompare(b[0])).map(([date, test]) => (
                        <tr key={date}>
                          <td className="py-2 px-4 border-b">{date}</td>
                          <td className="py-2 px-4 border-b">{test.subject}</td>
                          <td className="py-2 px-4 border-b">{test.marks}</td>
                          <td className="py-2 px-4 border-b">{test.totalMarks}</td>
                          <td className="py-2 px-4 border-b">{test.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">No test records found.</p>
              )}
            </div>
            {/* Activity Report Section */}
            <div className="mt-8 bg-white p-4 sm:p-6 rounded-lg shadow-xl border-t-4 border-green-400 w-full">
              <h3 className="text-2xl font-semibold mb-4 text-green-700">Activity Report</h3>
              {activityData[student.rollNo] ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border">
                    <thead>
                      <tr className="bg-green-100">
                        <th className="py-2 px-4 border-b text-left">Date</th>
                        <th className="py-2 px-4 border-b text-left">Subject</th>
                        <th className="py-2 px-4 border-b text-left">Marks</th>
                        <th className="py-2 px-4 border-b text-left">Total Marks</th>
                        <th className="py-2 px-4 border-b text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(activityData[student.rollNo]).sort((a, b) => a[0].localeCompare(b[0])).map(([date, activity]) => (
                        <tr key={date}>
                          <td className="py-2 px-4 border-b">{date}</td>
                          <td className="py-2 px-4 border-b">{activity.subject}</td>
                          <td className="py-2 px-4 border-b">{activity.marks}</td>
                          <td className="py-2 px-4 border-b">{activity.totalMarks}</td>
                          <td className="py-2 px-4 border-b">{activity.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">No activity records found.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;