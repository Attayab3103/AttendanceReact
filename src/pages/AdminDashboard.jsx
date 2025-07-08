import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, set, onValue, remove } from 'firebase/database';
import Navbar from '../components/Navbar';

const ADMIN_PIN = 'Date@3103';

const AdminDashboard = () => {
  const [teachers, setTeachers] = useState([]);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);

  const handleDeleteTeacher = async (id) => {
    setSuccess('');
    setError('');
    try {
      await remove(ref(db, `teachers/${id}`));
      setSuccess('Teacher deleted successfully!');
    } catch {
      setError('Failed to delete teacher.');
    }
  };


  useEffect(() => {
    if (!adminAuthenticated) return;
    const teachersRef = ref(db, 'teachers');
    return onValue(teachersRef, (snapshot) => {
      const val = snapshot.val() || {};
      setTeachers(Array.isArray(val) ? val : Object.values(val));
    });
  }, [adminAuthenticated]);

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!name.trim() || !pin.trim()) {
      setError('Please enter both name and PIN.');
      return;
    }
    try {
      // Find max id
      const maxId = teachers.reduce((max, t) => Math.max(max, t.id || 0), 0);
      const newId = maxId + 1;
      const newTeacher = { id: newId, name, pin, classes: [] };
      await set(ref(db, `teachers/${newId}`), newTeacher);
      setSuccess('Teacher created successfully!');
      setName('');
      setPin('');
    } catch {
      setError('Failed to create teacher.');
    }
  };

  if (!adminAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-blue-100 to-white flex flex-col">
        <Navbar brandName="DAR-E-ARQAM SCHOOL (JOHAR TOWN)" />
        <div className="flex flex-col items-center justify-center flex-grow">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96 text-center border-t-4 border-yellow-400 mt-8">
            <h2 className="text-2xl font-bold mb-4 text-yellow-700">Admin Login</h2>
            <input
              type="password"
              className="border border-gray-300 p-2 rounded-md w-full mb-4"
              placeholder="Enter Admin PIN"
              value={adminPinInput}
              onChange={e => setAdminPinInput(e.target.value)}
            />
            <button
              className="bg-yellow-500 text-white py-2 px-4 rounded-md w-full hover:bg-yellow-600"
              onClick={() => {
                if (adminPinInput === ADMIN_PIN) {
                  setAdminAuthenticated(true);
                } else {
                  setError('Incorrect admin PIN!');
                }
              }}
            >Login as Admin</button>
            {error && <p className="text-red-600 mt-4">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-blue-100 to-white flex flex-col">
      <Navbar brandName="DAR-E-ARQAM SCHOOL (JOHAR TOWN)" />
      <div className="container mx-auto p-2 sm:p-4 flex-grow w-full max-w-2xl">
        <div className="flex items-center mb-4">
          <svg className="w-8 h-8 text-yellow-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Admin Dashboard</h2>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-xl border-t-4 border-yellow-400 w-full mb-8">
          <h3 className="text-xl font-bold mb-4 text-yellow-700">Create New Teacher PIN</h3>
          <form className="flex flex-col gap-4" onSubmit={handleCreateTeacher}>
            <input
              type="text"
              className="border border-gray-300 p-2 rounded-md"
              placeholder="Teacher Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <input
              type="text"
              className="border border-gray-300 p-2 rounded-md"
              placeholder="Teacher PIN"
              value={pin}
              onChange={e => setPin(e.target.value)}
            />
            <button
              type="submit"
              className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition duration-300 shadow"
            >Create Teacher</button>
          </form>
          {success && <p className="text-green-600 mt-2">{success}</p>}
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-xl border-t-4 border-blue-400 w-full">
          <h3 className="text-xl font-bold mb-4 text-blue-700">All Teachers</h3>
          <ul>
            {teachers.map(t => (
              <TeacherEditRow key={t.id} teacher={t} onDelete={handleDeleteTeacher} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Inline editable row for teacher
function TeacherEditRow({ teacher, onDelete }) {
  const [editMode, setEditMode] = React.useState(false);
  const [name, setName] = React.useState(teacher.name);
  const [pin, setPin] = React.useState(teacher.pin);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await set(ref(db, `teachers/${teacher.id}`), {
        ...teacher,
        name,
        pin
      });
      setEditMode(false);
    } catch (e) {
      setError('Failed to update teacher.');
    }
    setSaving(false);
  };

  return (
    <li className="mb-2 flex items-center justify-between">
      {editMode ? (
        <span style={{display: 'flex', alignItems: 'center', width: '100%'}}>
          <input
            type="text"
            className="border border-gray-300 rounded-md px-2 py-1 mr-2 w-32"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={saving}
          />
          <input
            type="text"
            className="border border-gray-300 rounded-md px-2 py-1 mr-2 w-24"
            value={pin}
            onChange={e => setPin(e.target.value)}
            disabled={saving}
          />
          <button
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm mr-2"
            onClick={handleSave}
            disabled={saving}
          >Save</button>
          <button
            className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400 text-sm mr-2"
            onClick={() => { setEditMode(false); setName(teacher.name); setPin(teacher.pin); }}
            disabled={saving}
          >Cancel</button>
          <button
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
            onClick={() => onDelete(teacher.id)}
            disabled={saving}
          >Delete</button>
          {error && <span className="text-red-600 ml-2 text-xs">{error}</span>}
        </span>
      ) : (
        <>
          <span>{teacher.name} (PIN: {teacher.pin})</span>
          <div>
            <button
              className="ml-4 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm mr-2"
              onClick={() => setEditMode(true)}
            >Edit</button>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
              onClick={() => onDelete(teacher.id)}
            >Delete</button>
          </div>
        </>
      )}
    </li>
  );
}

export default AdminDashboard;
