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
import { useLanguage } from "@/i18n";

const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  // 数字动画
  const animatedExams = useCountUp(statistics?.total_exams ?? 0);
  const animatedUsers = useCountUp(statistics?.total_users ?? 0);
  const animatedSchools = useCountUp(statistics?.total_schools ?? 0);
  const animatedSaved = useCountUp(statistics?.saved_exams ?? 0);

  useEffect(() => {
    document.title = t("home.pageTitle") as string;
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
          {t("home.welcome") as string}
        </h1>
        {/* <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          ZhiXue Lite 是一个简化的智学网成绩查询和管理系统，为学生和教师提供便捷的成绩查看和分析功能。
        </p> */}
      </section>

      {/* Statistics Cards */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">{t("home.stats") as string}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("home.totalExams") as string}</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "--" : statistics ? animatedExams : "--"}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading
                  ? (t("common.loading") as string)
                  : statistics
                    ? (t("home.totalExamsDesc") as string)
                    : (t("home.statsFailed") as string)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("home.totalUsers") as string}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "--" : statistics ? animatedUsers : "--"}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading
                  ? (t("common.loading") as string)
                  : statistics
                    ? (t("home.totalUsersDesc") as string)
                    : (t("home.statsFailed") as string)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("home.totalSchools") as string}</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "--" : statistics ? animatedSchools : "--"}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading
                  ? (t("common.loading") as string)
                  : statistics
                    ? (t("home.totalSchoolsDesc") as string)
                    : (t("home.statsFailed") as string)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("home.savedExams") as string}</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "--" : statistics ? animatedSaved : "--"}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading
                  ? (t("common.loading") as string)
                  : statistics
                    ? (t("home.savedExamsDesc") as string)
                    : (t("home.statsFailed") as string)}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">{t("home.features") as string}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>{t("home.examMgmt") as string}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t("home.examMgmtDesc") as string}
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>{t("home.scoreAnalysis") as string}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t("home.scoreAnalysisDesc") as string}
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>{t("home.accountMgmt") as string}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t("home.accountMgmtDesc") as string}
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
