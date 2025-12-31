import React, { useEffect } from "react";
import { UserManagement } from "@/pages/AdminPage";

const AdminUsersPage: React.FC = () => {
  useEffect(() => {
    document.title = "用户管理 - ZhiXue Lite";
    return () => {
      document.title = "ZhiXue Lite";
    };
  }, []);

  return <UserManagement />;
};

export default AdminUsersPage;
