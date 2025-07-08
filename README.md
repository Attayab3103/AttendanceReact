# DAR-E-ARQAM SCHOOL Attendance & Reporting App

A modern, Firebase-powered school attendance and reporting system for teachers, parents, and admins. Built with React, Vite, React Router, and Tailwind CSS. Supports robust multi-teacher, multi-parent, and admin flows with real-time data, PIN-based login, and a beautiful, mobile-friendly UI.

[![Vercel](https://vercelbadge.vercel.app/api/attendance-react-weld/vercel)](https://attendance-react-weld.vercel.app/)

---

## 🚀 Demo

**Live Demo:** [attendance-react-weld.vercel.app](https://attendance-react-weld.vercel.app/)

---

## Features

- **Firebase Realtime Database** for all data (teachers, classes, students, attendance, tests, activities)
- **Multi-teacher**: Each teacher manages their own classes and students
- **Multi-parent**: Parents can view their child's attendance, test, and activity reports by selecting teacher/class
- **Admin dashboard**: Secure admin area to create, edit, and delete teacher accounts (PIN-protected)
- **PIN-based login** for teachers and admin
- **Class management**: Create, delete, and manage classes and students
- **Attendance, test, and activity tracking** (all keyed by student ID)
- **No static JSON**: All data is live from Firebase
- **Mobile-friendly, modern UI** with Tailwind CSS
- **Ready for Vercel or Docker deployment**

---

## How It Works

### Admin Flow
- The admin logs in at `/admin` using a secure PIN (set in your Firebase or code).
- Admin can create new teacher accounts, edit teacher names and PINs, or delete teachers.
- All teacher data is stored in Firebase and updates in real time for all users.

### Teacher Flow
- Teachers log in at `/teacher` using their unique PIN (set by the admin).
- After login, teachers see a dashboard with their name and a list of their classes.
- Teachers can:
  - **Create new classes** (which are linked to their account in Firebase)
  - **Delete classes** (removes the class and unassigns all students)
  - **Select a class** to manage students, attendance, tests, and activities
  - **Enroll students** by name (auto-assigns roll numbers)
  - **Remove students** (unassigns from class and reindexes roll numbers)
  - **Mark attendance** for each student by date (present/absent)
  - **Add/edit/delete test records** (subject, date, marks, description)
  - **Add/edit/delete activity records** (subject, date, status, description)
- All actions update Firebase instantly and are reflected for parents and admins.

### Parent Flow
- Parents go to `/parent` to view their child's reports.
- The dashboard shows all teachers, each with their classes as tiles.
- Parents select the relevant teacher and then the class.
- They enter their child's roll number (as assigned by the teacher) to view:
  - **Attendance report** (summary and daily breakdown)
  - **Test report** (all test records for the student)
  - **Activity report** (all activities for the student)
- All data is live and always up to date from Firebase.

### Data Model
- **Teachers**: `{ id, name, pin, classes: [classId, ...] }`
- **Classes**: `{ id, name, teacherId, studentIds: [...] }`
- **Students**: `{ id, name, rollNo, classId }`
- **Attendance**: `{ [studentId]: { [date]: 'Present' | 'Absent' } }`
- **Tests**: `{ [studentId]: { [date]: { subject, marks, totalMarks, description } } }`
- **Activities**: `{ [studentId]: { [date]: { subject, status, description } } }`

---

## Quick Start

### 1. Clone & Install

```bash
# Clone the repo
git clone https://github.com/<your-username>/attendance-app.git
cd attendance-app

# Install dependencies
npm install
```

### 2. Firebase Setup
- Create a Firebase project and Realtime Database
- Copy your config to `src/firebase.js`
- Import your initial data (see `/data` or create your own) into your Firebase DB for demo data

### 3. Run Locally

```bash
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173)

---

## Usage

### Teacher Login
- Go to `/teacher`
- Enter your PIN (provided by admin)
- Manage your classes, students, attendance, tests, and activities

### Parent Dashboard
- Go to `/parent`
- Select a teacher, then a class
- Enter your child's roll number to view attendance, test, and activity reports

### Admin Dashboard
- Go to `/admin`
- Enter the admin PIN (set in your code or Firebase)
- Create, edit, or delete teacher accounts and PINs

---

## Project Structure

```text
attendance-app/
├── Dockerfile
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.js
├── vercel.json
├── public/
│   └── favicon.ico
├── src/
│   ├── App.jsx
│   ├── firebase.js
│   ├── index.css
│   ├── main.jsx
│   ├── components/
│   │   ├── AttendanceSummary.jsx
│   │   ├── AttendanceTable.jsx
│   │   ├── DateSelector.jsx
│   │   ├── Navbar.jsx
│   │   └── StudentRow.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── ParentDashboard.jsx
│   │   ├── TeacherDashboard.jsx
│   │   └── AdminDashboard.jsx
│   └── data/ (deprecated)
│       └── students.json
```

---

## Deployment

### Vercel
- Push to GitHub and import the repo in Vercel
- Set up environment variables if needed (Firebase config is in `src/firebase.js`)
- Or use the provided [live demo](https://attendance-react-weld.vercel.app/)
- Deploy!

### Docker
```bash
docker build -t attendance-app .
docker run -p 3000:3000 attendance-app
```

---

## Customization
- Update school name, branding, and colors in `Navbar.jsx` and Tailwind config
- Change admin PIN in `src/pages/AdminDashboard.jsx`
- Extend data models in Firebase as needed

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

---

## License
MIT
