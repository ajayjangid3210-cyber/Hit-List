import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Tasks from './pages/Tasks';
import KanbanBoard from './pages/KanbanBoard';
import CalendarPage from './pages/CalendarPage';
import Team from './pages/Team';
import Reports from './pages/Reports';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TaskProvider>
          <Routes>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard"     element={<Dashboard />} />
              <Route path="/projects"      element={<Projects />} />
              <Route path="/projects/:id"  element={<ProjectDetail />} />
              <Route path="/tasks"         element={<Tasks />} />
              <Route path="/kanban"        element={<KanbanBoard />} />
              <Route path="/calendar"      element={<CalendarPage />} />
              <Route path="/team"          element={<Team />} />
              <Route path="/reports"       element={<Reports />} />
              <Route path="/settings"      element={<SettingsPage />} />
            </Route>

            <Route path="/"  element={<Navigate to="/dashboard" replace />} />
            <Route path="*"  element={<NotFound />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'bg-surface-dark border border-white/10 text-slate-200',
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
