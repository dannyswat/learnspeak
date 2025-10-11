import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import WordList from './pages/WordList';
import WordForm from './pages/WordForm';
import WordDetail from './pages/WordDetail';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/words"
            element={
              <ProtectedRoute>
                <WordList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/words/new"
            element={
              <ProtectedRoute>
                <WordForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/words/:id"
            element={
              <ProtectedRoute>
                <WordDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/words/:id/edit"
            element={
              <ProtectedRoute>
                <WordForm />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
