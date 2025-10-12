import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import WordList from './pages/WordList';
import WordForm from './pages/WordForm';
import WordDetail from './pages/WordDetail';
import TopicList from './pages/TopicList';
import TopicForm from './pages/TopicForm';
import TopicRouter from './pages/TopicRouter';
import JourneyList from './pages/JourneyList';
import JourneyForm from './pages/JourneyForm';
import JourneyDetail from './pages/JourneyDetail';
import StudentList from './pages/StudentList';
import StudentDetail from './pages/StudentDetail';
import JourneyAssignment from './pages/JourneyAssignment';
import MyJourneys from './pages/MyJourneys';
import FlashcardPractice from './pages/FlashcardPractice';
import QuizPractice from './pages/QuizPractice';
import QuizManagement from './pages/QuizManagement';
import BulkWordCreation from './pages/BulkWordCreation';
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
          <Route
            path="/topics"
            element={
              <ProtectedRoute>
                <TopicList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/topics/new"
            element={
              <ProtectedRoute>
                <TopicForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/topics/:id"
            element={
              <ProtectedRoute>
                <TopicRouter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/topics/:id/edit"
            element={
              <ProtectedRoute>
                <TopicForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/topics/:topicId/flashcards"
            element={
              <ProtectedRoute>
                <FlashcardPractice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/topics/:topicId/quiz"
            element={
              <ProtectedRoute>
                <QuizPractice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/topics/:topicId/quiz/manage"
            element={
              <ProtectedRoute>
                <QuizManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/topics/:topicId/words/bulk"
            element={
              <ProtectedRoute>
                <BulkWordCreation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journeys"
            element={
              <ProtectedRoute>
                <JourneyList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journeys/new"
            element={
              <ProtectedRoute>
                <JourneyForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journeys/:id"
            element={
              <ProtectedRoute>
                <JourneyDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journeys/:id/edit"
            element={
              <ProtectedRoute>
                <JourneyForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <StudentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students/:id"
            element={
              <ProtectedRoute>
                <StudentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journeys/assign"
            element={
              <ProtectedRoute>
                <JourneyAssignment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-journeys"
            element={
              <ProtectedRoute>
                <MyJourneys />
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
