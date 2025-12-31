import React, { useEffect } from "react";
import { TeacherManagement } from "@/pages/AdminPage";

const AdminTeachersPage: React.FC = () => {
  useEffect(() => {
    document.title = "教师管理 - ZhiXue Lite";
    return () => {
      document.title = "ZhiXue Lite";
    };
  }, []);

  return <TeacherManagement />;
};

export default AdminTeachersPage;
