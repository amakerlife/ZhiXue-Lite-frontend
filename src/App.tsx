import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import { ExamProvider } from "@/contexts/ExamContext";
import { ConnectionProvider } from "@/contexts/ConnectionContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import Header from "@/components/layout/Header";
import Layout from "@/components/layout/Layout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ExamsPage from "@/pages/ExamsPage";
import ExamDetailPage from "@/pages/ExamDetailPage";
import TasksPage from "@/pages/TasksPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminPage from "@/pages/AdminPage";
import DataViewerPage from "@/pages/DataViewerPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import AboutPage from "@/pages/AboutPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import DataDeletionPage from "@/pages/DataDeletionPage";
import DisclaimerPage from "@/pages/DisclaimerPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { AlertCircle, Mail } from "lucide-react";

// 账号被封禁弹窗组件
const BannedAccountDialog: React.FC = () => {
  const { isBanned, clearBanned } = useAuth();
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    clearBanned();
    navigate("/login");
  };

  return (
    <ResponsiveDialog
      open={isBanned}
      onOpenChange={() => {}} // 不允许关闭
      title="登录状态失效"
      description="登录状态失效，请重新登录。"
      mode="alert"
      variant="destructive"
      confirmText="前往登录"
      onConfirm={handleGoToLogin}
      closable={false}
      icon={<AlertCircle className="h-12 w-12 text-destructive" />}
    />
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

    window.addEventListener("email-not-verified", handleEmailNotVerified);

    return () => {
      window.removeEventListener("email-not-verified", handleEmailNotVerified);
    };
  }, []);

  const handleGoToProfile = () => {
    setIsOpen(false);
    navigate("/profile");
  };

  return (
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title="需要验证邮箱"
      description="您的邮箱尚未验证，无法访问此功能。请前往个人中心验证邮箱。"
      mode="alert"
      confirmText="前往个人中心"
      onConfirm={handleGoToProfile}
      icon={<Mail className="text-yellow-500" />}
    />
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
                    <Route
                      path="/privacy-policy"
                      element={<PrivacyPolicyPage />}
                    />
                    <Route
                      path="/data-deletion"
                      element={<DataDeletionPage />}
                    />
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
