"use client"

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import HomePage from "./pages/HomePage"
// import AdminDashboard from "./pages/Dashboard"
import AdminAssignTask from "./pages/RequestVisit"
import AccountDataPage from "./pages/ClosePass"
import AdminLogin from "./pages/AdminLogin"
import License from "./pages/ApprovelPage"
import EmployeeStatusPage from "./pages/EmployeeStatusPage"

// 🔒 Auth wrapper
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation()

  const username = sessionStorage.getItem("username")
  const role = sessionStorage.getItem("role")

  // ✅ PUBLIC ROUTES (NO LOGIN REQUIRED)
  const publicRoutes = [
    "/dashboard/quick-task",
    "/dashboard/assign-task",
    "/dashboard/delegation"
  ]

  // ✅ Allow public routes
  if (publicRoutes.some(route => location.pathname.startsWith(route))) {
    return children
  }

  // ❌ Block if not logged in
  if (!username) {
    return <Navigate to="/login" replace />
  }

  // ❌ Role restriction
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard/admin" replace />
  }

  return children
}

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<AdminLogin />} />

        <Route path="/dashboard" element={<Navigate to="/login" replace />} />

        <Route path="/dashboard/assign-task" element={<AdminAssignTask />} />
        <Route path="/dashboard/delegation" element={<AccountDataPage />} />
        <Route path="/dashboard/quick-task" element={<HomePage />} />
        <Route path="/dashboard/license" element={<License />} />
        <Route path="/dashboard/employee" element={<EmployeeStatusPage />} />

        <Route path="*" element={<Navigate to="/dashboard/quick-task" replace />} />

      </Routes>
    </Router>
  )
}

export default App