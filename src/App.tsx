import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
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
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import AboutPage from '@/pages/AboutPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import DataDeletionPage from '@/pages/DataDeletionPage';
import DisclaimerPage from '@/pages/DisclaimerPage';
import NotFoundPage from '@/pages/NotFoundPage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertCircle, Mail } from 'lucide-react';

// 账号被封禁弹窗组件
const BannedAccountDialog: React.FC = () => {
  const { isBanned, clearBanned } = useAuth();
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    clearBanned();
    navigate('/login');
  };

  return (
    <AlertDialog open={isBanned}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <AlertDialogTitle>登录状态失效</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            登录状态失效，请重新登录。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleGoToLogin} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            前往登录
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// 邮件未验证弹窗组件
const EmailNotVerifiedDialog: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleEmailNotVerified = () => {
      setIsOpen(true);
    };

    window.addEventListener('email-not-verified', handleEmailNotVerified);

    return () => {
      window.removeEventListener('email-not-verified', handleEmailNotVerified);
    };
  }, []);

  const handleGoToProfile = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <Mail className="h-6 w-6 text-yellow-500" />
            <AlertDialogTitle>需要验证邮箱</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            您的邮箱尚未验证，无法访问此功能。请前往个人中心验证邮箱。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleGoToProfile}>
            前往个人中心
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const App: React.FC = () => {
  return (
    <AnalyticsProvider>
      <ConnectionProvider>
        <AuthProvider>
          <ExamProvider>
            <SidebarProvider>
              <Router>
                <BannedAccountDialog />
                <EmailNotVerifiedDialog />
                <Header />
                <Layout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
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
