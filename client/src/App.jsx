import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Dashboard from './pages/Dashboard.jsx'
import PatientDetails from './pages/PatientDetails.jsx'
import Patients from './pages/Patients.jsx'
import Login from './pages/Login.jsx'
import Appointments from './pages/Appointments.jsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login/>}/>
      <Route element={<ProtectedRoute/>}>
          <Route path="/" element={<Dashboard/>}/>
          <Route path="/patients" element={<Patients/>}/>
          <Route path="/patients/:id" element={<PatientDetails/>}/>
          <Route path="/appointments" element={<Appointments/>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
