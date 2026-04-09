import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/common/AppLayout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import StudentDashboard from './pages/student/StudentDashboard';
import NoteViewerPage from './pages/student/NoteViewerPage';
import QuizPage from './pages/student/QuizPage';
import QuizResultPage from './pages/student/QuizResultPage';
import LearningPathPage from './pages/student/LearningPathPage';
import ProfessorDashboard from './pages/professor/ProfessorDashboard';
import AnalysisReportPage from './pages/professor/AnalysisReportPage';
import { useAuthStore } from './store/authStore';

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'PROFESSOR') return <Navigate to="/professor" replace />;
  return <Navigate to="/student" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<RootRedirect />} />

        {/* 학생 전용 */}
        <Route element={<ProtectedRoute requiredRole="STUDENT" />}>
          <Route element={<AppLayout />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/notes/:lectureId" element={<NoteViewerPage />} />
            <Route path="/student/quiz/:lectureId" element={<QuizPage />} />
            <Route path="/student/quiz/result/:quizSetId" element={<QuizResultPage />} />
            <Route path="/student/learning" element={<LearningPathPage />} />
          </Route>
        </Route>

        {/* 교수 전용 */}
        <Route element={<ProtectedRoute requiredRole="PROFESSOR" />}>
          <Route element={<AppLayout />}>
            <Route path="/professor" element={<ProfessorDashboard />} />
            <Route path="/professor/analysis/:lectureId" element={<AnalysisReportPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
