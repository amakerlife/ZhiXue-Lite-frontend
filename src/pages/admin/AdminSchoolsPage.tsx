import React, { useEffect } from "react";
import { SchoolManagement } from "@/pages/AdminPage";

const AdminSchoolsPage: React.FC = () => {
  useEffect(() => {
    document.title = "学校管理 - ZhiXue Lite";
    return () => {
      document.title = "ZhiXue Lite";
    };
  }, []);

  return <SchoolManagement />;
};

export default AdminSchoolsPage;
