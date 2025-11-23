import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Users, School, Database, TrendingUp } from "lucide-react";
import { statisticsAPI } from "@/api/statistics";
import type { Statistics } from "@/types/api";
import { useCountUp } from "@/hooks/useCountUp";

const HomePage: React.FC = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  // 数字动画
  const animatedExams = useCountUp(statistics?.total_exams ?? 0);
  const animatedUsers = useCountUp(statistics?.total_users ?? 0);
  const animatedSchools = useCountUp(statistics?.total_schools ?? 0);
  const animatedSaved = useCountUp(statistics?.saved_exams ?? 0);

  useEffect(() => {
    document.title = "首页 - ZhiXue Lite";
    return () => {
      document.title = "ZhiXue Lite";
    };
  }, []);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await statisticsAPI.getStatistics();
        if (response.success && response.statistics) {
          setStatistics(response.statistics);
        }
      } catch (error) {
        console.error("获取统计数据失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
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
              <div className="text-2xl font-bold">
                {loading ? "--" : statistics ? animatedExams : "--"}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading
                  ? "加载中..."
                  : statistics
                    ? "系统中的考试总数"
                    : "统计数据加载失败"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">用户总数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "--" : statistics ? animatedUsers : "--"}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading
                  ? "加载中..."
                  : statistics
                    ? "系统中的用户总数"
                    : "统计数据加载失败"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">学校总数</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "--" : statistics ? animatedSchools : "--"}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading
                  ? "加载中..."
                  : statistics
                    ? "系统中的学校总数"
                    : "统计数据加载失败"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已保存考试</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "--" : statistics ? animatedSaved : "--"}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading
                  ? "加载中..."
                  : statistics
                    ? "已拉取详情的考试数"
                    : "统计数据加载失败"}
              </p>
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
                查看和管理考试成绩，与智学网密切集成。
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
                详细的成绩分析功能，包括各科成绩、排名信息等。
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>账号管理</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                支持智学网账号绑定，确保数据安全和访问控制。
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
