import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Users, School, TrendingUp } from "lucide-react";

const HomePage: React.FC = () => {
  useEffect(() => {
    document.title = "首页 - ZhiXue Lite";
    return () => {
      document.title = "ZhiXue Lite";
    };
  }, []);
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">
          欢迎 - ZhiXue Lite
        </h1>
        {/* <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          ZhiXue Lite 是一个简化的智学网成绩查询和管理系统，为学生和教师提供便捷的成绩查看和分析功能。
        </p> */}
      </section>

      {/* Statistics Cards */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">系统统计</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">考试总数</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">统计数据暂未实现</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">用户总数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">统计数据暂未实现</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">学校总数</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">统计数据暂未实现</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日活跃</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">统计数据暂未实现</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">主要功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>考试管理</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                查看和管理考试信息，支持从智学网拉取最新的考试数据和成绩信息。
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>成绩分析</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                详细的成绩分析功能，包括各科成绩、排名信息和标准分计算。
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>用户管理</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                管理用户账号，支持智学网账号绑定，确保数据安全和访问控制。
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
