import React, { useEffect } from "react";
import { ExamManagement } from "@/pages/AdminPage";

const AdminExamsPage: React.FC = () => {
  useEffect(() => {
    document.title = "考试管理 - ZhiXue Lite";
    return () => {
      document.title = "ZhiXue Lite";
    };
  }, []);

  return <ExamManagement />;
};

export default AdminExamsPage;
