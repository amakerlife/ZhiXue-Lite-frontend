import React, { useEffect } from "react";
import TaskManagement from "@/pages/admin/TaskManagement";

const AdminTasksPage: React.FC = () => {
  useEffect(() => {
    document.title = "任务管理 - ZhiXue Lite";
    return () => {
      document.title = "ZhiXue Lite";
    };
  }, []);

  return <TaskManagement />;
};

export default AdminTasksPage;
