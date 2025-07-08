import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AttendanceTable from '../components/AttendanceTable';
import AttendanceSummary from '../components/AttendanceSummary';
// import studentsData from '../data/students.json';
// import classesData from '../data/classes.json';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';


const ParentDashboard = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [rollNo, setRollNo] = useState('');
  const [student, setStudent] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [testData, setTestData] = useState({});
  const [activityData, setActivityData] = useState({});
  const [error, setError] = useState('');
  const [allStudentsData, setAllStudentsData] = useState([]);
  const [allClassesData, setAllClassesData] = useState([]);
  const [allTeachersData, setAllTeachersData] = useState([]);
  const [teacherMap, setTeacherMap] = useState({});
  // Load all teachers from Firebase
  useEffect(() => {
    const teachersRef = ref(db, 'teachers');
    const unsubTeachers = onValue(teachersRef, (snapshot) => {
      const val = snapshot.val() || {};
      const arr = Object.values(val);
      setAllTeachersData(arr);
      // Build a map for quick lookup
      const map = {};
      arr.forEach(t => { if (t && t.id) map[t.id] = t; });
      setTeacherMap(map);
    });
    return () => unsubTeachers();
  }, []);

  useEffect(() => {
    // Load students from Firebase
    const studentsRef = ref(db, 'students');
    const unsubStudents = onValue(studentsRef, (snapshot) => {
      const val = snapshot.val() || {};
      setAllStudentsData(Object.values(val));
    });
    // Load classes from Firebase
    const classesRef = ref(db, 'classes');
    const unsubClasses = onValue(classesRef, (snapshot) => {
      const val = snapshot.val() || {};
      setAllClassesData(Object.values(val));
    });
    // Load attendance from Firebase (by student id)
    const attendanceRef = ref(db, 'attendance');
    const unsubAttendance = onValue(attendanceRef, (snapshot) => {
      setAttendanceData(snapshot.val() || {});
    });
    // Load tests from Firebase (by student id)
    const testsRef = ref(db, 'tests');
    const unsubTests = onValue(testsRef, (snapshot) => {
      setTestData(snapshot.val() || {});
    });
    // Load activities from Firebase (by student id)
    const activitiesRef = ref(db, 'activities');
    const unsubActivities = onValue(activitiesRef, (snapshot) => {
      setActivityData(snapshot.val() || {});
    });
    return () => {
      unsubStudents();
      unsubClasses();
      unsubAttendance();
      unsubTests();
      unsubActivities();
    };
  }, []);

  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    setRollNo('');
    setStudent(null);
    setError('');
  };

  const handleRollNoSubmit = (e) => {
    e.preventDefault();
    setStudent(null);
    setError('');
    if (!rollNo.trim()) {
      setError('Please enter a student ID.');
      return;
    }
    if (!selectedClass) {
      setError('Please select a class.');
      return;
    }
    // Find by roll number and class
    const foundStudent = allStudentsData.find(
      (s) => String(s.classId) === String(selectedClass.id) && String(s.rollNo) === rollNo.trim()
    );
    if (foundStudent) {
      setStudent(foundStudent);
      setError('');
    } else {
      setStudent(null);
      setError('Student not found in this class.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-white flex flex-col">
      <Navbar brandName="DAR-E-ARQAM SCHOOL (JOHAR TOWN)" />
      <div className="container mx-auto p-2 sm:p-4 flex-grow w-full max-w-2xl">
        <div className="flex items-center mb-4">
          <svg className="w-8 h-8 text-green-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Parent Dashboard</h2>
        </div>
        <p className="text-gray-600 mb-6">Check your child's attendance, test, and activity reports easily.</p>


        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4 text-green-700">Select a Teacher</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {allTeachersData.map((teacher) => {
              // Find classes for this teacher
              const teacherClasses = allClassesData.filter(cls => Array.isArray(teacher.classes) && teacher.classes.includes(cls.id));
              if (teacherClasses.length === 0) return null;
              return (
                <div key={teacher.id} className="bg-white rounded-lg shadow-xl border-t-4 border-blue-400 p-4">
                  <div className="text-lg font-bold text-blue-700 mb-2">{teacher.name}</div>
                  <div className="grid grid-cols-1 gap-2">
                    {teacherClasses.map(cls => (
                      <button
                        key={cls.id}
                        className={`p-4 rounded-lg shadow border text-base font-semibold transition-all duration-200 w-full text-center ${selectedClass && selectedClass.id === cls.id ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-white border-gray-200 hover:bg-blue-50 text-gray-800'}`}
                        onClick={() => handleClassSelect(cls)}
                      >
                        {cls.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedClass && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl mb-6 border-t-4 border-green-400 w-full">
            <h3 className="text-2xl font-semibold mb-4 text-green-700">Enter Student ID for {selectedClass.name}</h3>
            <form className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4" onSubmit={handleRollNoSubmit}>
              <input
                type="text"
                className="border border-gray-300 p-2 rounded-md flex-grow focus:ring-2 focus:ring-green-300 text-base sm:text-lg"
                placeholder="Student ID"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
              />
              <button
                type="submit"
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300 shadow text-base sm:text-lg"
              >
                View Student Report
              </button>
            </form>
            {error && <p className="text-red-500 mb-4">{error}</p>}
          </div>
        )}

        {student && (
          <>
            <div className="mb-4 text-lg font-semibold text-blue-700">Student Name: {student.name}</div>
            <div className="mt-8 bg-white p-4 sm:p-6 rounded-lg shadow-xl border-t-4 border-blue-400 w-full">
              <h3 className="text-2xl font-semibold mb-4 text-blue-700">Attendance Report</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <AttendanceSummary attendance={attendanceData} rollNo={student.id} />
                <AttendanceTable attendanceRecords={attendanceData[student.id] || {}} />
              </div>
            </div>
            {/* Test Report Section */}
            <div className="mt-8 bg-white p-4 sm:p-6 rounded-lg shadow-xl border-t-4 border-blue-400 w-full">
              <h3 className="text-2xl font-semibold mb-4 text-blue-700">Test Report</h3>
              {testData[student.id] ? (
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
                      {Object.entries(testData[student.id])
                        .sort((a, b) => a[0].localeCompare(b[0]))
                        .map(([date, test]) => (
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
              {activityData[student.id] ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border">
                    <thead>
                      <tr className="bg-green-100">
                        <th className="py-2 px-4 border-b text-left">Date</th>
                        <th className="py-2 px-4 border-b text-left">Subject</th>
                        <th className="py-2 px-4 border-b text-left">Material Submitted</th>
                        <th className="py-2 px-4 border-b text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(activityData[student.id])
                        .sort((a, b) => a[0].localeCompare(b[0]))
                        .map(([date, activity]) => (
                          <tr key={date}>
                            <td className="py-2 px-4 border-b">{date}</td>
                            <td className="py-2 px-4 border-b">{activity.subject}</td>
                            <td className="py-2 px-4 border-b">{activity.status}</td>
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