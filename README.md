# DAR-E-ARQAM SCHOOL Attendance & Reporting App

A modern, Firebase-powered school attendance and reporting system for teachers, parents, and admins. Built with React, Vite, React Router, and Tailwind CSS. Supports robust multi-teacher, multi-parent, and admin flows with real-time data, PIN-based login, and a beautiful, mobile-friendly UI.

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

## Quick Start

### 1. Clone & Install

```bash
# Clone the repo
git clone https://github.com/your-username/attendance-app.git
cd attendance-app

# Install dependencies
npm install
```

### 2. Firebase Setup
- Create a Firebase project and Realtime Database
- Copy your config to `src/firebase.js` (already set up for demo)
- Import the provided JSON (see `/data` or ask admin) into your Firebase DB for demo data

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
- Enter the admin PIN (default: `Date@3103`)
- Create, edit, or delete teacher accounts and PINs

---

## Project Structure

```
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

## Credits
- Built with ❤️ by your team using React, Vite, Tailwind CSS, and Firebase.
- Inspired by modern school management needs.

---

## License
MIT (or your preferred license)
