import React, { useEffect } from "react";
import { StudentManagement } from "@/pages/AdminPage";

const AdminStudentsPage: React.FC = () => {
  useEffect(() => {
    document.title = "学生管理 - ZhiXue Lite";
    return () => {
      document.title = "ZhiXue Lite";
    };
  }, []);

  return <StudentManagement />;
};

export default AdminStudentsPage;
