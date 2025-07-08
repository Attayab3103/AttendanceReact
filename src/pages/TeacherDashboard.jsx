        
        {/* Attendance Box */}
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import StudentRow from '../components/StudentRow';
import DateSelector from '../components/DateSelector';
// import allStudentsData from '../data/students.json';
// All data is now loaded from Firebase. Static JSON imports removed.
import { db } from '../firebase';
import { ref, set, onValue, remove } from 'firebase/database';


const SUBJECTS = ["PSED", "KUW", "ENGLISH", "URDU", "MATH"];
const ACTIVITY_TYPES = ["Quiz", "Assignment", "Project", "Classwork", "Other"];

const ACTIVITY_STATUS = ["Submitted", "Not Submitted"];

const TeacherDashboard = () => {
  // Auth and teacher/class state
  const [pin, setPin] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const [teacherClasses, setTeacherClasses] = useState([]); // Array of class objects
  const [selectedClass, setSelectedClass] = useState(null); // class object
  const [studentsData, setStudentsData] = useState([]); // students of selected class
  const [allStudentsData, setAllStudentsData] = useState([]); // all students from Firebase
  const [allTeachersData, setAllTeachersData] = useState([]); // all teachers from Firebase
  const [allClassesData, setAllClassesData] = useState([]); // all classes from Firebase
  // Load all teachers and classes from Firebase
  useEffect(() => {
    const teachersRef = ref(db, 'teachers');
    const unsubTeachers = onValue(teachersRef, (snapshot) => {
      const val = snapshot.val() || {};
      setAllTeachersData(Array.isArray(val) ? val : Object.values(val));
    });
    const classesRef = ref(db, 'classes');
    const unsubClasses = onValue(classesRef, (snapshot) => {
      const val = snapshot.val() || {};
      setAllClassesData(Array.isArray(val) ? val : Object.values(val));
    });
    return () => {
      unsubTeachers();
      unsubClasses();
    };
  }, []);

  // UI state
  const [selectedDate, setSelectedDate] = useState("");
  const [attendance, setAttendance] = useState({});
  const [activeBox, setActiveBox] = useState("attendance");
  const [isEditingAttendance, setIsEditingAttendance] = useState(false);

  // Test state
  const [testSubject, setTestSubject] = useState("");
  const [testDate, setTestDate] = useState("");
  const [testTotalMarks, setTestTotalMarks] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const [testMarks, setTestMarks] = useState({});
  const [testData, setTestData] = useState({});
  const [editingTestDate, setEditingTestDate] = useState(null);

  // Activity state
  const [activitySubject, setActivitySubject] = useState("");
  const [activityDate, setActivityDate] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [activityStatus, setActivityStatus] = useState({});
  const [activityData, setActivityData] = useState({});
  const [editingActivityDate, setEditingActivityDate] = useState(null);

  // Enroll Students state
  const [enrollTabStudents, setEnrollTabStudents] = useState([]); // all students not in this class

  // Fix: newClassName and delete dialog state must be at top level, not inside conditional render
  const [newClassName, setNewClassName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);

  // Load all students from Firebase
  useEffect(() => {
    const studentsRef = ref(db, 'students');
    const unsubscribe = onValue(studentsRef, (snapshot) => {
      const val = snapshot.val() || {};
      // Convert object to array
      const arr = Object.values(val);
      setAllStudentsData(arr);
      // If a class is selected, update studentsData
      if (selectedClass) {
        setStudentsData(arr.filter(s => s.classId === selectedClass.id));
      }
    });
    return () => unsubscribe();
  }, [selectedClass]);

  // Helper: get students not in this class
  useEffect(() => {
    if (selectedClass) {
      const notInClass = allStudentsData.filter(s => s.classId !== selectedClass.id);
      setEnrollTabStudents(notInClass);
    }
  }, [selectedClass, allStudentsData]);

  // Add student to class (not used in UI, but keep for completeness)
  const handleAddStudentToClass = async (studentId) => {
    const student = allStudentsData.find(s => s.id === studentId);
    if (!student) return;
    const updatedStudent = { ...student, classId: selectedClass.id };
    try {
      await set(ref(db, `students/${updatedStudent.id}`), updatedStudent);
      toast.success('Student enrolled!');
    } catch {
      toast.error('Failed to enroll student.');
    }
  };

  // Remove student from class and reindex roll numbers in Firebase
  const handleRemoveStudentFromClass = async (studentId) => {
    // Remove the student from the class
    const student = allStudentsData.find(s => s.id === studentId);
    if (!student) return;
    try {
      // Set classId and rollNo to null for this student
      await set(ref(db, `students/${studentId}`), { ...student, classId: null, rollNo: null });
      // Get students in this class after removal
      const classStudents = allStudentsData.filter(s => s.classId === selectedClass.id && s.id !== studentId);
      // Sort by id for stable order
      const sorted = [...classStudents].sort((a, b) => a.id - b.id);
      // Reindex roll numbers
      await Promise.all(sorted.map((stu, idx) => set(ref(db, `students/${stu.id}`), { ...stu, rollNo: (idx + 1).toString() })));
      toast.success('Student removed and roll numbers reindexed!');
    } catch {
      toast.error('Failed to remove student.');
    }
  };

  const handleEditAttendance = (date, dateMap) => {
    setSelectedDate(date);
    setIsEditingAttendance(true);
    // Pre-fill attendance for all students for this date
    studentsData.forEach(student => {
      // If not already set, set in Firebase (to ensure UI is in sync)
      if (!attendance[student.id]?.[date]) {
        set(ref(db, `attendance/${student.id}/${date}`), '');
      }
    });
  };

  const handleCancelEditAttendance = () => {
    setIsEditingAttendance(false);
  };

  const handleSaveEditAttendance = async () => {
    const allFilled = studentsData.every(student => attendance[student.id] === 'Present' || attendance[student.id] === 'Absent');
    if (!allFilled) {
      toast.error('Please mark attendance for all students.');
      return;
    }
    try {
      await Promise.all(studentsData.map(student => set(ref(db, `attendance/${student.id}/${selectedDate}`), attendance[student.id])));
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
      marksObj[student.id] = (testData[student.id] && testData[student.id][date]?.marks) || "";
    });
    setTestMarks(marksObj);
    setEditingTestDate(date);
  };

  const handleDeleteTest = async (date) => {
    try {
      await Promise.all(
        studentsData.map((student) => remove(ref(db, `tests/${student.id}/${date}`)))
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
      statusObj[student.id] = (activityData[student.id] && activityData[student.id][date]?.status) || "";
    });
    setActivityStatus(statusObj);
    setEditingActivityDate(date);
  };

  const handleDeleteActivity = async (date) => {
    try {
      await Promise.all(
        studentsData.map((student) => remove(ref(db, `activities/${student.id}/${date}`)))
      );
      toast.success("Activity deleted successfully!");
      if (editingActivityDate === date) setEditingActivityDate(null);
    } catch (err) {
      toast.error("Failed to delete activity.");
    }
  };
  // --- Activity Save Handler ---
  const handleActivityStatusChange = (rollNo, value) => {
    setActivityStatus((prev) => ({ ...prev, [rollNo]: value })); // Will update below
  };

  const handleSaveActivity = async () => {
    if (!activitySubject || !activityDate || !activityDescription) {
      toast.error("Please fill all activity details.");
      return;
    }
    try {
      // For both new and edit, require all status fields to be filled
    const allFilled = studentsData.every((student) => activityStatus[student.id] !== undefined && activityStatus[student.id] !== "");
      if (!allFilled) {
        toast.error("Please select status for all students.");
        return;
      }
      if (editingActivityDate) {
        await Promise.all(
          studentsData.map((student) => {
            const status = activityStatus[student.id];
            return set(ref(db, `activities/${student.id}/${editingActivityDate}`), {
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
            const status = activityStatus[student.id];
            return set(
              ref(db, `activities/${student.id}/${activityDate}`),
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

  // --- Login with PIN ---
  const handleLogin = () => {
    const found = allTeachersData.find(t => t && t.pin && t.pin.toString() === pin.toString());
    if (found) {
      setTeacher(found);
      // Find classes for this teacher
      const tClasses = allClassesData.filter(cls => Array.isArray(found.classes) && found.classes.includes(cls.id));
      setTeacherClasses(tClasses);
      setLoggedIn(true);
    } else {
      toast.error('Incorrect PIN!');
    }
  };

  // --- Select Class ---
  const handleSelectClass = (cls) => {
    setSelectedClass(cls);
    // Filter students for this class
    const classStudents = allStudentsData.filter(s => s.classId === cls.id);
    setStudentsData(classStudents);
    setActiveBox("attendance");
  };

  // --- Create New Class ---
  const handleCreateClass = async (className) => {
    if (!className.trim()) {
      toast.error('Please enter a class name.');
      return;
    }
    try {
      // Get a new class id (max id + 1)
      const allClassesRef = ref(db, 'classes');
      let newId = 1;
      let allClasses = [];
      await new Promise((resolve) => {
        onValue(allClassesRef, (snapshot) => {
          const val = snapshot.val() || {};
          allClasses = Object.values(val);
          if (allClasses.length > 0) {
            newId = Math.max(...allClasses.map(c => Number(c.id) || 0)) + 1;
          }
          resolve();
        }, { onlyOnce: true });
      });
      // Create new class object
      const newClass = {
        id: newId,
        name: className,
        teacherId: teacher.id,
        studentIds: []
      };
      // Write to Firebase
      await set(ref(db, `classes/${newId}`), newClass);
      // Update teacher's classes in Firebase (if you store teacher-classes in Firebase)
      // Update teacher's classes array in Firebase (if teachers are stored in Firebase)
      const teacherRef = ref(db, `teachers/${teacher.id}`);
      let teacherData = null;
      await new Promise((resolve) => {
        onValue(teacherRef, (snapshot) => {
          teacherData = snapshot.val();
          resolve();
        }, { onlyOnce: true });
      });
      if (teacherData) {
        const updatedClasses = Array.isArray(teacherData.classes) ? [...teacherData.classes, newId] : [newId];
        await set(teacherRef, { ...teacherData, classes: updatedClasses });
      }
      // Optionally update local state
      setTeacherClasses(prev => [...prev, newClass]);
      toast.success('Class created!');
    } catch (err) {
      toast.error('Failed to create class.');
    }
  };

  // Update to accept explicit status
  const handleToggleAttendance = (rollNo, status) => {
    // Update attendance in Firebase
    set(ref(db, `attendance/${rollNo}/${selectedDate}`), status); // Will update below
  };


  const handleSubmitAttendance = () => {
    // Find first student whose attendance is not marked
    const firstUnmarked = studentsData.find(student => {
      const status = attendance[student.id]?.[selectedDate];
      return status !== 'Present' && status !== 'Absent';
    });
    if (firstUnmarked) {
      // Scroll to the student's row
      const el = document.getElementById(`student-row-${firstUnmarked.id}`);
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
            value={pin}
            onChange={(e) => setPin(e.target.value)}
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

  // --- Class Selection ---
  // --- Delete Class Handler ---
  const handleDeleteClass = (clsId) => {
    setClassToDelete(clsId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteClass = async () => {
    const clsId = classToDelete;
    setDeleteDialogOpen(false);
    setClassToDelete(null);
    try {
      // Remove class from classes
      await set(ref(db, `classes/${clsId}`), null);
      // Remove class from teacher's classes array
      const teacherRef = ref(db, `teachers/${teacher.id}`);
      let teacherData = null;
      await new Promise((resolve) => {
        onValue(teacherRef, (snapshot) => {
          teacherData = snapshot.val();
          resolve();
        }, { onlyOnce: true });
      });
      if (teacherData) {
        const updatedClasses = Array.isArray(teacherData.classes)
          ? teacherData.classes.filter(cid => cid !== clsId)
          : [];
        await set(teacherRef, { ...teacherData, classes: updatedClasses });
      }
      // Unassign students from this class
      const studentsToUnassign = allStudentsData.filter(s => s.classId === clsId);
      await Promise.all(studentsToUnassign.map(s => set(ref(db, `students/${s.id}`), { ...s, classId: null, rollNo: null })));
      // Update local state
      setTeacherClasses(prev => prev.filter(cls => cls.id !== clsId));
      toast.success('Class deleted!');
    } catch (err) {
      toast.error('Failed to delete class.');
    }
  };

  const cancelDeleteClass = () => {
    setDeleteDialogOpen(false);
    setClassToDelete(null);
  };

  if (loggedIn && teacherClasses.length === 0) {
    // If teacher has no classes, show a message and allow class creation
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-green-100 to-white flex flex-col items-center justify-center">
        <Navbar brandName="DAR-E-ARQAM SCHOOL (JOHAR TOWN)" />
        <div className="bg-white p-8 rounded-lg shadow-xl w-96 text-center border-t-4 border-blue-400 mt-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Welcome, {teacher?.name}!</h2>
          <p className="mb-4 text-gray-700">You have no classes yet. Create a new class to get started:</p>
          <div className="mt-4">
            <input
              type="text"
              className="border border-gray-300 p-2 rounded-md w-full mb-2"
              placeholder="New class name"
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
            />
            <button
              className="bg-green-500 text-white py-2 px-4 rounded-md w-full hover:bg-green-600"
              onClick={() => handleCreateClass(newClassName)}
            >Create New Class</button>
          </div>
        </div>
      </div>
    );
  }

  if (loggedIn && !selectedClass) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-green-100 to-white flex flex-col items-center justify-center">
        <Navbar brandName="DAR-E-ARQAM SCHOOL (JOHAR TOWN)" />
        <div className="bg-white p-8 rounded-lg shadow-xl w-96 text-center border-t-4 border-blue-400 mt-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Welcome, {teacher?.name}!</h2>
          <p className="mb-4 text-gray-700">Select a class to manage:</p>
          <div className="flex flex-col gap-3 mb-4">
            {teacherClasses.map(cls => (
              <div key={cls.id} className="flex items-center justify-between bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-2 px-2 rounded">
                <button className="flex-1 text-left" onClick={() => handleSelectClass(cls)}>
                  {cls.name}
                </button>
                <button
                  className="ml-2 bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 text-xs"
                  onClick={() => handleDeleteClass(cls.id)}
                  title="Delete Class"
                >Delete</button>
              </div>
            ))}
            {/* Delete Class Dialog */}
            {deleteDialogOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xs text-center border-t-4 border-red-500">
                  <h3 className="text-xl font-bold text-red-600 mb-4">Delete Class?</h3>
                  <p className="mb-4 text-gray-700">Are you sure you want to delete this class? This will remove the class and unassign all its students.</p>
                  <div className="flex gap-4 justify-center">
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-semibold"
                      onClick={confirmDeleteClass}
                    >Delete</button>
                    <button
                      className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 font-semibold"
                      onClick={cancelDeleteClass}
                    >Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4">
            <input
              type="text"
              className="border border-gray-300 p-2 rounded-md w-full mb-2"
              placeholder="New class name"
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
            />
            <button
              className="bg-green-500 text-white py-2 px-4 rounded-md w-full hover:bg-green-600"
              onClick={() => handleCreateClass(newClassName)}
            >Create New Class</button>
          </div>
        </div>
      </div>
    );
  }

  // --- Test Save Handler ---
  const handleTestMarksChange = (rollNo, value) => {
    setTestMarks((prev) => ({ ...prev, [rollNo]: value })); // Will update below
  };

  const handleSaveTest = async () => {
    if (!testSubject || !testDate || !testTotalMarks || !testDescription) {
      toast.error("Please fill all test details.");
      return;
    }
    try {
      // For both new and edit, require all marks fields to be filled
    const allFilled = studentsData.every((student) => testMarks[student.id] !== undefined && testMarks[student.id] !== "");
      if (!allFilled) {
        toast.error("Please enter marks for all students.");
        return;
      }
      if (editingTestDate) {
        await Promise.all(
          studentsData.map((student) => {
            const marks = testMarks[student.id];
            return set(ref(db, `tests/${student.id}/${editingTestDate}`), {
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
            const marks = testMarks[student.id];
            return set(
              ref(db, `tests/${student.id}/${testDate}`),
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
          <button
            className={`flex-1 p-4 rounded-lg shadow text-lg font-semibold border-t-4 transition-all duration-200 ${activeBox === "enroll" ? "bg-green-100 border-green-500" : "bg-white border-gray-200 hover:bg-green-50"}`}
            onClick={() => setActiveBox("enroll")}
          >Enroll Students</button>
        </div>
        {/* Tab Content */}
        {/* Tab Content Start - removed unnecessary fragment */}
          {/* Enroll Students Box */}
          {activeBox === "enroll" && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl mb-6 border-t-4 border-green-400 w-full">
              <h3 className="text-2xl font-semibold mb-4 text-green-700">Enroll Students in {selectedClass?.name}</h3>
              <p className="mb-2 text-gray-700">Students currently in this class:</p>
              <ul className="mb-4">
                {studentsData.length === 0 && <li className="text-gray-500">No students enrolled yet.</li>}
                {studentsData.map(student => (
                  <li key={student.id} className="flex items-center justify-between border-b py-1">
                    <span>{student.name} (Roll No: {student.rollNo})</span>
                    <button
                      className="text-red-600 hover:underline text-sm"
                      onClick={() => handleRemoveStudentFromClass(student.id)}
                    >Remove</button>
                  </li>
                ))}
              </ul>
              <p className="mb-2 text-gray-700 font-semibold">Add a new student to this class:</p>
              <form className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2" onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                const name = form.name.value.trim();
                if (!name) {
                  toast.error('Please enter the student name.');
                  return;
                }
                // Find current students in this class
                const classStudents = allStudentsData.filter(s => s.classId === selectedClass.id);
                // Find the highest roll number in this class
                let maxRoll = 0;
                classStudents.forEach(s => {
                  const rn = parseInt(s.rollNo, 10);
                  if (!isNaN(rn) && rn > maxRoll) maxRoll = rn;
                });
                const nextRollNo = (maxRoll + 1).toString();
                // Generate new id
                const maxId = allStudentsData.reduce((max, s) => Math.max(max, s.id), 0);
                const newStudent = {
                  id: maxId + 1,
                  name,
                  rollNo: nextRollNo,
                  classId: selectedClass.id
                };
                try {
                  await set(ref(db, `students/${newStudent.id}`), newStudent);
                  toast.success(`Student enrolled! Assigned roll number: ${nextRollNo}`);
                  form.reset();
                } catch {
                  toast.error('Failed to enroll student.');
                }
              }}>
                <input name="name" type="text" className="border border-gray-300 rounded-md p-2 w-full" placeholder="Student Name" />
                <button type="submit" className="bg-green-500 text-white rounded-md px-4 py-2 hover:bg-green-600 col-span-2 sm:col-span-1">Add Student</button>
              </form>
              <p className="text-xs text-gray-400 mt-2">(This will update students.json in a real app)</p>
            </div>
          )}

          {/* Attendance Box */}
          {activeBox === "attendance" && (
            <>
              <p className="text-xl mb-4 font-semibold text-blue-700">Current Date: {selectedDate}</p>
              <DateSelector selectedDate={selectedDate} onDateChange={date => { setSelectedDate(date); setIsEditingAttendance(false); }} />
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl mb-6 border-t-4 border-blue-400 w-full">
                <h3 className="text-2xl font-semibold mb-4 text-blue-700">{isEditingAttendance ? `Edit Attendance for ${selectedDate} (${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })})` : 'Mark Attendance'}</h3>
                {studentsData.map((student) => (
                  <div id={`student-row-${student.id}`} key={student.id}>
                    <StudentRow
                      student={student}
                      attendance={attendance[student.id]?.[selectedDate]}
                      onToggleAttendance={(id, status) => handleToggleAttendance(student.id, status)}
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
                          const att = attendance[student.id] || {};
                          Object.entries(att).forEach(([date, status]) => {
                            if (!dateMap[date]) dateMap[date] = {};
                            dateMap[date][student.id] = status;
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
                                    await Promise.all(studentsData.map(student => remove(ref(db, `attendance/${student.id}/${date}`))));
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
                          value={testMarks[student.id] || ""}
                          onChange={(e) => handleTestMarksChange(student.id, e.target.value)}
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
                    {testData[studentsData[0]?.id] &&
                      Object.entries(testData[studentsData[0].id])
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
                            className={`py-1 px-3 rounded-md text-sm font-semibold shadow border transition duration-200 focus:outline-none ${activityStatus[student.id] === 'Submitted' ? 'bg-green-500 text-white border-green-600' : 'bg-white text-green-700 border-green-400 hover:bg-green-50'}`}
                            onClick={() => handleActivityStatusChange(student.id, 'Submitted')}
                          >
                            Submitted
                          </button>
                          <button
                            type="button"
                            className={`py-1 px-3 rounded-md text-sm font-semibold shadow border transition duration-200 focus:outline-none ${activityStatus[student.id] === 'Not Submitted' ? 'bg-red-500 text-white border-red-600' : 'bg-white text-red-700 border-red-400 hover:bg-red-50'}`}
                            onClick={() => handleActivityStatusChange(student.id, 'Not Submitted')}
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
                    {activityData[studentsData[0]?.id] &&
                      Object.entries(activityData[studentsData[0].id])
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