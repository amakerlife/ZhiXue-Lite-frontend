import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AnalyticsProvider } from '@/contexts/AnalyticsContext';
import { ExamProvider } from '@/contexts/ExamContext';
import { ConnectionProvider } from '@/contexts/ConnectionContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import Header from '@/components/layout/Header';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ExamsPage from '@/pages/ExamsPage';
import ExamDetailPage from '@/pages/ExamDetailPage';
import TasksPage from '@/pages/TasksPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminPage from '@/pages/AdminPage';
import DataViewerPage from '@/pages/DataViewerPage';
import AboutPage from '@/pages/AboutPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import DataDeletionPage from '@/pages/DataDeletionPage';
import DisclaimerPage from '@/pages/DisclaimerPage';
import NotFoundPage from '@/pages/NotFoundPage';

const App: React.FC = () => {
  return (
    <AnalyticsProvider>
      <ConnectionProvider>
        <AuthProvider>
          <ExamProvider>
            <SidebarProvider>
              <Router>
                <Header />
                <Layout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/exams" element={<ExamsPage />} />
                    <Route path="/exams/:examId" element={<ExamDetailPage />} />
                    <Route path="/data-viewer" element={<DataViewerPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/data-deletion" element={<DataDeletionPage />} />
                    <Route path="/disclaimer" element={<DisclaimerPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Layout>
              </Router>
            </SidebarProvider>
          </ExamProvider>
        </AuthProvider>
      </ConnectionProvider>
    </AnalyticsProvider>
  );
};

export default App;
