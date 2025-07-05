import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import StudentRow from '../components/StudentRow';
import DateSelector from '../components/DateSelector';
import studentsData from '../data/students.json';
import { db } from '../firebase';
import { ref, set, onValue, remove } from 'firebase/database';


const SUBJECTS = ["PSED", "KUW", "ENGLISH", "URDU", "MATH"];
const ACTIVITY_TYPES = ["Quiz", "Assignment", "Project", "Classwork", "Other"];

const ACTIVITY_STATUS = ["Submitted", "Not Submitted"];

const TeacherDashboard = () => {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [attendance, setAttendance] = useState({}); // {rollNo: {date: status}}
  const [activeBox, setActiveBox] = useState("attendance"); // attendance | test | activity

  // Test state
  const [testSubject, setTestSubject] = useState("");
  const [testDate, setTestDate] = useState("");
  const [testTotalMarks, setTestTotalMarks] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const [testMarks, setTestMarks] = useState({}); // {rollNo: marks}
  const [testData, setTestData] = useState({});
  const [editingTestDate, setEditingTestDate] = useState(null);

  // Activity state
  const [activitySubject, setActivitySubject] = useState("");
  const [activityDate, setActivityDate] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [activityStatus, setActivityStatus] = useState({}); // {rollNo: status}
  const [activityData, setActivityData] = useState({});
  const [editingActivityDate, setEditingActivityDate] = useState(null);

  // Remove editAttendanceDate/editAttendanceData state and handlers
  // Use selectedDate and attendance for both marking and editing

  // --- Mark Attendance Handlers ---
  const [isEditingAttendance, setIsEditingAttendance] = useState(false);

  const handleEditAttendance = (date, dateMap) => {
    setSelectedDate(date);
    setIsEditingAttendance(true);
    // Pre-fill attendance for all students for this date
    studentsData.forEach(student => {
      // If not already set, set in Firebase (to ensure UI is in sync)
      if (!attendance[student.rollNo]?.[date]) {
        set(ref(db, `attendance/${student.rollNo}/${date}`), '');
      }
    });
  };

  const handleCancelEditAttendance = () => {
    setIsEditingAttendance(false);
  };

  const handleSaveEditAttendance = async () => {
    const allFilled = studentsData.every(student => attendance[student.rollNo] === 'Present' || attendance[student.rollNo] === 'Absent');
    if (!allFilled) {
      toast.error('Please mark attendance for all students.');
      return;
    }
    try {
      await Promise.all(studentsData.map(student => set(ref(db, `attendance/${student.rollNo}/${selectedDate}`), attendance[student.rollNo])));
      toast.success('Attendance updated!');
      setIsEditingAttendance(false);
    } catch (err) {
      toast.error('Failed to update attendance.');
    }
  };

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
    setTestDate(`${yyyy}-${mm}-${dd}`);
    setActivityDate(`${yyyy}-${mm}-${dd}`);

    // Load attendance from Firebase
    const attendanceRef = ref(db, "attendance");
    onValue(attendanceRef, (snapshot) => {
      setAttendance(snapshot.val() || {});
    });
    // Load tests from Firebase
    const testsRef = ref(db, "tests");
    onValue(testsRef, (snapshot) => {
      setTestData(snapshot.val() || {});
    });
    // Load activities from Firebase
    const activitiesRef = ref(db, "activities");
    onValue(activitiesRef, (snapshot) => {
      setActivityData(snapshot.val() || {});
    });
  }, []);
  // Edit/Delete for Test
  const handleEditTest = (date, test) => {
    setTestDate(date);
    setTestSubject(test.subject);
    setTestTotalMarks(test.totalMarks);
    setTestDescription(test.description || "");
    // Load marks for all students for this test date
    const marksObj = {};
    studentsData.forEach((student) => {
      marksObj[student.rollNo] = (testData[student.rollNo] && testData[student.rollNo][date]?.marks) || "";
    });
    setTestMarks(marksObj);
    setEditingTestDate(date);
  };

  const handleDeleteTest = async (date) => {
    try {
      await Promise.all(
        studentsData.map((student) => remove(ref(db, `tests/${student.rollNo}/${date}`)))
      );
      toast.success("Test deleted successfully!");
      if (editingTestDate === date) setEditingTestDate(null);
    } catch (err) {
      toast.error("Failed to delete test.");
    }
  };

  // Edit/Delete for Activity
  const handleEditActivity = (date, activity) => {
    setActivityDate(date);
    setActivitySubject(activity.subject);
    setActivityDescription(activity.description || "");
    // Load status for all students for this activity date
    const statusObj = {};
    studentsData.forEach((student) => {
      statusObj[student.rollNo] = (activityData[student.rollNo] && activityData[student.rollNo][date]?.status) || "";
    });
    setActivityStatus(statusObj);
    setEditingActivityDate(date);
  };

  const handleDeleteActivity = async (date) => {
    try {
      await Promise.all(
        studentsData.map((student) => remove(ref(db, `activities/${student.rollNo}/${date}`)))
      );
      toast.success("Activity deleted successfully!");
      if (editingActivityDate === date) setEditingActivityDate(null);
    } catch (err) {
      toast.error("Failed to delete activity.");
    }
  };
  // --- Activity Save Handler ---
  const handleActivityStatusChange = (rollNo, value) => {
    setActivityStatus((prev) => ({ ...prev, [rollNo]: value }));
  };

  const handleSaveActivity = async () => {
    if (!activitySubject || !activityDate || !activityDescription) {
      toast.error("Please fill all activity details.");
      return;
    }
    try {
      // For both new and edit, require all status fields to be filled
      const allFilled = studentsData.every((student) => activityStatus[student.rollNo] !== undefined && activityStatus[student.rollNo] !== "");
      if (!allFilled) {
        toast.error("Please select status for all students.");
        return;
      }
      if (editingActivityDate) {
        await Promise.all(
          studentsData.map((student) => {
            const status = activityStatus[student.rollNo];
            return set(ref(db, `activities/${student.rollNo}/${editingActivityDate}`), {
              subject: activitySubject,
              description: activityDescription,
              status: status,
            });
          })
        );
        toast.success("Activity updated successfully!");
        setEditingActivityDate(null);
      } else {
        await Promise.all(
          studentsData.map((student) => {
            const status = activityStatus[student.rollNo];
            return set(
              ref(db, `activities/${student.rollNo}/${activityDate}`),
              {
                subject: activitySubject,
                description: activityDescription,
                status: status,
              }
            );
          })
        );
        toast.success("Activity saved successfully!");
      }
      setActivityStatus({});
      setActivityDescription("");
    } catch (err) {
      toast.error("Failed to save activity.");
    }
  };

  const handleLogin = () => {
    if (password === 'teacher123') {
      setLoggedIn(true);
    } else {
      toast.error('Incorrect password!');
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
            {/* Use Navbar for logo and branding, remove direct logo import to avoid blank page issues */}
            <span className="text-3xl font-extrabold text-gray-800 tracking-tight align-middle">DAR-E-ARQAM SCHOOL (JOHAR TOWN)</span>
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

  // --- Test Save Handler ---
  const handleTestMarksChange = (rollNo, value) => {
    setTestMarks((prev) => ({ ...prev, [rollNo]: value }));
  };

  const handleSaveTest = async () => {
    if (!testSubject || !testDate || !testTotalMarks || !testDescription) {
      toast.error("Please fill all test details.");
      return;
    }
    try {
      // For both new and edit, require all marks fields to be filled
      const allFilled = studentsData.every((student) => testMarks[student.rollNo] !== undefined && testMarks[student.rollNo] !== "");
      if (!allFilled) {
        toast.error("Please enter marks for all students.");
        return;
      }
      if (editingTestDate) {
        await Promise.all(
          studentsData.map((student) => {
            const marks = testMarks[student.rollNo];
            return set(ref(db, `tests/${student.rollNo}/${editingTestDate}`), {
              subject: testSubject,
              totalMarks: testTotalMarks,
              description: testDescription,
              marks: marks,
            });
          })
        );
        toast.success("Test updated successfully!");
        setEditingTestDate(null);
      } else {
        await Promise.all(
          studentsData.map((student) => {
            const marks = testMarks[student.rollNo];
            return set(
              ref(db, `tests/${student.rollNo}/${testDate}`),
              {
                subject: testSubject,
                totalMarks: testTotalMarks,
                description: testDescription,
                marks: marks,
              }
            );
          })
        );
        toast.success("Test marks saved successfully!");
      }
      setTestMarks({});
      setTestDescription("");
    } catch (err) {
      toast.error("Failed to save test marks.");
    }
  };

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-green-100 to-white flex flex-col">
      <Navbar brandName="DAR-E-ARQAM SCHOOL (JOHAR TOWN)" />
      <div className="container mx-auto p-2 sm:p-4 flex-grow w-full max-w-2xl">
        <div className="flex items-center mb-4">
          <svg className="w-8 h-8 text-blue-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Teacher Dashboard</h2>
        </div>
        <p className="text-gray-600 mb-6">Welcome Ma'am Aneela!</p>

        {/* Box Selector */}
        <div className="flex gap-4 mb-6">
          <button
            className={`flex-1 p-4 rounded-lg shadow text-lg font-semibold border-t-4 transition-all duration-200 ${activeBox === "attendance" ? "bg-blue-100 border-blue-500" : "bg-white border-gray-200 hover:bg-blue-50"}`}
            onClick={() => setActiveBox("attendance")}
          >Attendance</button>
          <button
            className={`flex-1 p-4 rounded-lg shadow text-lg font-semibold border-t-4 transition-all duration-200 ${activeBox === "test" ? "bg-blue-100 border-blue-500" : "bg-white border-gray-200 hover:bg-blue-50"}`}
            onClick={() => setActiveBox("test")}
          >Test</button>
          <button
            className={`flex-1 p-4 rounded-lg shadow text-lg font-semibold border-t-4 transition-all duration-200 ${activeBox === "activity" ? "bg-blue-100 border-blue-500" : "bg-white border-gray-200 hover:bg-blue-50"}`}
            onClick={() => setActiveBox("activity")}
          >Activity</button>
        </div>

        {/* Attendance Box */}
        {activeBox === "attendance" && (
          <>
            <p className="text-xl mb-4 font-semibold text-blue-700">Current Date: {selectedDate}</p>
            <DateSelector selectedDate={selectedDate} onDateChange={date => { setSelectedDate(date); setIsEditingAttendance(false); }} />
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl mb-6 border-t-4 border-blue-400 w-full">
              <h3 className="text-2xl font-semibold mb-4 text-blue-700">{isEditingAttendance ? `Edit Attendance for ${selectedDate} (${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })})` : 'Mark Attendance'}</h3>
              {studentsData.map((student) => (
                <div id={`student-row-${student.rollNo}`} key={student.id}>
                  <StudentRow
                    student={student}
                    attendance={attendance[student.rollNo]?.[selectedDate]}
                    onToggleAttendance={handleToggleAttendance}
                  />
                </div>
              ))}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSubmitAttendance}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 w-full shadow text-base sm:text-lg"
                >
                  {isEditingAttendance ? 'Update Attendance' : 'Submit Attendance'}
                </button>
                {isEditingAttendance && (
                  <button
                    onClick={handleCancelEditAttendance}
                    className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-300 w-full shadow text-base sm:text-lg"
                  >Cancel</button>
                )}
              </div>
            </div>
            {/* Existing Attendance Section */}
            <div className="mt-8 bg-white p-4 sm:p-6 rounded-lg shadow-xl border-t-4 border-blue-400 w-full">
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Existing Attendance</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="py-2 px-4 border-b text-left">Date</th>
                      <th className="py-2 px-4 border-b text-left">Day</th>
                      <th className="py-2 px-4 border-b text-left">Status</th>
                      <th className="py-2 px-4 border-b text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Collect all unique dates
                      const dateMap = {};
                      studentsData.forEach(student => {
                        const att = attendance[student.rollNo] || {};
                        Object.entries(att).forEach(([date, status]) => {
                          if (!dateMap[date]) dateMap[date] = {};
                          dateMap[date][student.rollNo] = status;
                        });
                      });
                      const allDates = Object.keys(dateMap).sort();
                      return allDates.map(date => {
                        const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
                        const studentsMarked = Object.keys(dateMap[date]).length;
                        const totalStudents = studentsData.length;
                        const status = studentsMarked === totalStudents ? 'Marked' : 'Not Marked';
                        return (
                          <tr key={date}>
                            <td className="py-2 px-4 border-b">{date}</td>
                            <td className="py-2 px-4 border-b">{day}</td>
                            <td className="py-2 px-4 border-b">{status}</td>
                            <td className="py-2 px-4 border-b">
                              <button
                                className="text-blue-600 hover:underline mr-2"
                                onClick={() => handleEditAttendance(date, dateMap[date])}
                              >Edit</button>
                              <button
                                className="text-red-600 hover:underline"
                                onClick={async () => {
                                  await Promise.all(studentsData.map(student => remove(ref(db, `attendance/${student.rollNo}/${date}`))));
                                  toast.success('Attendance deleted for date');
                                }}
                              >Delete</button>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Test Box */}
        {activeBox === "test" && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl mb-6 border-t-4 border-blue-400 w-full">
            <h3 className="text-2xl font-semibold mb-4 text-blue-700">Add/Edit Test Marks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Subject</label>
                <select
                  className="border border-gray-300 rounded-md p-2 w-full"
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                >
                  <option value="">Select</option>
                  {SUBJECTS.map((subj) => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Date</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded-md p-2 w-full"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  disabled={!!editingTestDate}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Total Marks</label>
                <input
                  type="number"
                  className="border border-gray-300 rounded-md p-2 w-full"
                  value={testTotalMarks}
                  onChange={(e) => setTestTotalMarks(e.target.value)}
                  min="1"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Description</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-md p-2 w-full"
                  value={testDescription}
                  onChange={(e) => setTestDescription(e.target.value)}
                  placeholder="e.g. Test on Chapter 2"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="py-2 px-4 border-b text-left">Roll No</th>
                    <th className="py-2 px-4 border-b text-left">Name</th>
                    <th className="py-2 px-4 border-b text-left">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsData.map((student) => (
                    <tr key={student.id}>
                      <td className="py-2 px-4 border-b">{student.rollNo}</td>
                      <td className="py-2 px-4 border-b">{student.name}</td>
                      <td className="py-2 px-4 border-b">
                        <input
                          type="number"
                          className="border border-gray-300 rounded-md p-1 w-24"
                          value={testMarks[student.rollNo] || ""}
                          onChange={(e) => handleTestMarksChange(student.rollNo, e.target.value)}
                          min="0"
                          max={testTotalMarks || undefined}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={handleSaveTest}
              className="mt-6 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 w-full shadow text-base sm:text-lg"
            >
              {editingTestDate ? "Update Test" : "Save Test Marks"}
            </button>
            {/* List of existing tests for editing/deleting */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Existing Tests</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="py-2 px-4 border-b text-left">Date</th>
                      <th className="py-2 px-4 border-b text-left">Subject</th>
                      <th className="py-2 px-4 border-b text-left">Description</th>
                      <th className="py-2 px-4 border-b text-left">Total Marks</th>
                      <th className="py-2 px-4 border-b text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testData[studentsData[0]?.rollNo] &&
                      Object.entries(testData[studentsData[0].rollNo])
                        .sort((a, b) => a[0].localeCompare(b[0]))
                        .map(([date, test]) => (
                          <tr key={date}>
                            <td className="py-2 px-4 border-b">{date}</td>
                            <td className="py-2 px-4 border-b">{test.subject}</td>
                            <td className="py-2 px-4 border-b">{test.description}</td>
                            <td className="py-2 px-4 border-b">{test.totalMarks}</td>
                            <td className="py-2 px-4 border-b">
                              <button className="text-blue-600 hover:underline mr-2" onClick={() => handleEditTest(date, test)}>Edit</button>
                              <button className="text-red-600 hover:underline" onClick={() => handleDeleteTest(date)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Activity Box */}
        {activeBox === "activity" && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl mb-6 border-t-4 border-blue-400 w-full">
            <h3 className="text-2xl font-semibold mb-4 text-blue-700">Add/Edit Activity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Subject</label>
                <select
                  className="border border-gray-300 rounded-md p-2 w-full"
                  value={activitySubject}
                  onChange={(e) => setActivitySubject(e.target.value)}
                >
                  <option value="">Select</option>
                  {SUBJECTS.map((subj) => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Date</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded-md p-2 w-full"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  disabled={!!editingActivityDate}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Description</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-md p-2 w-full"
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  placeholder="e.g. Activity on Chapter 1"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="py-2 px-4 border-b text-left">Roll No</th>
                    <th className="py-2 px-4 border-b text-left">Name</th>
                    <th className="py-2 px-4 border-b text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsData.map((student) => (
                    <tr key={student.id}>
                      <td className="py-2 px-4 border-b">{student.rollNo}</td>
                      <td className="py-2 px-4 border-b">{student.name}</td>
                      <td className="py-2 px-4 border-b">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className={`py-1 px-3 rounded-md text-sm font-semibold shadow border transition duration-200 focus:outline-none ${activityStatus[student.rollNo] === 'Submitted' ? 'bg-green-500 text-white border-green-600' : 'bg-white text-green-700 border-green-400 hover:bg-green-50'}`}
                            onClick={() => handleActivityStatusChange(student.rollNo, 'Submitted')}
                          >
                            Submitted
                          </button>
                          <button
                            type="button"
                            className={`py-1 px-3 rounded-md text-sm font-semibold shadow border transition duration-200 focus:outline-none ${activityStatus[student.rollNo] === 'Not Submitted' ? 'bg-red-500 text-white border-red-600' : 'bg-white text-red-700 border-red-400 hover:bg-red-50'}`}
                            onClick={() => handleActivityStatusChange(student.rollNo, 'Not Submitted')}
                          >
                            Not Submitted
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={handleSaveActivity}
              className="mt-6 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 w-full shadow text-base sm:text-lg"
            >
              {editingActivityDate ? "Update Activity" : "Save Activity"}
            </button>
            {/* List of existing activities for editing/deleting */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-2 text-blue-700">Existing Activities</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="py-2 px-4 border-b text-left">Date</th>
                      <th className="py-2 px-4 border-b text-left">Subject</th>
                      <th className="py-2 px-4 border-b text-left">Description</th>
                      <th className="py-2 px-4 border-b text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityData[studentsData[0]?.rollNo] &&
                      Object.entries(activityData[studentsData[0].rollNo])
                        .sort((a, b) => a[0].localeCompare(b[0]))
                        .map(([date, activity]) => (
                          <tr key={date}>
                            <td className="py-2 px-4 border-b">{date}</td>
                            <td className="py-2 px-4 border-b">{activity.subject}</td>
                            <td className="py-2 px-4 border-b">{activity.description}</td>
                            <td className="py-2 px-4 border-b">
                              <button className="text-blue-600 hover:underline mr-2" onClick={() => handleEditActivity(date, activity)}>Edit</button>
                              <button className="text-red-600 hover:underline" onClick={() => handleDeleteActivity(date)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;