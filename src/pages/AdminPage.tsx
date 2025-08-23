import React, { useState, useEffect } from 'react';
import { Users, School, GraduationCap, UserCheck, FileText, Search, Plus, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/api/admin';
import { formatUTCIsoToLocal } from '@/utils/dateUtils';
import type { AdminUser, School as SchoolType, ZhiXueAccount, Teacher } from '@/api/admin';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  
  // 如果不是管理员，显示权限不足
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">权限不足</CardTitle>
            <CardDescription>
              您需要管理员权限才能访问此页面
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">管理面板</h1>
        <p className="text-muted-foreground mt-1">
          系统管理和数据维护
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>用户管理</span>
          </TabsTrigger>
          <TabsTrigger value="schools" className="flex items-center space-x-2">
            <School className="h-4 w-4" />
            <span>学校管理</span>
          </TabsTrigger>
          <TabsTrigger value="teachers" className="flex items-center space-x-2">
            <GraduationCap className="h-4 w-4" />
            <span>教师管理</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center space-x-2">
            <UserCheck className="h-4 w-4" />
            <span>学生管理</span>
          </TabsTrigger>
          <TabsTrigger value="exams" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>考试管理</span>
          </TabsTrigger>
        </TabsList>

        {/* 用户管理 */}
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        {/* 学校管理 */}
        <TabsContent value="schools">
          <SchoolManagement />
        </TabsContent>

        {/* 教师管理 */}
        <TabsContent value="teachers">
          <TeacherManagement />
        </TabsContent>

        {/* 学生管理 */}
        <TabsContent value="students">
          <StudentManagement />
        </TabsContent>

        {/* 考试管理 */}
        <TabsContent value="exams">
          <ExamManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// 用户管理组件
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.listUsers({ page, per_page: 10, query: search });
      if (response.data.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>用户管理</CardTitle>
        <CardDescription>
          管理系统用户账号和权限
        </CardDescription>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索用户名..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Button onClick={loadUsers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户名</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>注册时间</TableHead>
                  <TableHead>最后登录</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? '管理员' : '普通用户'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? 'default' : 'destructive'}>
                        {user.is_active ? '活跃' : '禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatUTCIsoToLocal(user.created_at)}</TableCell>
                    <TableCell>
                      {user.last_login ? formatUTCIsoToLocal(user.last_login) : '从未登录'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  上一页
                </Button>
                <span className="text-sm text-muted-foreground">
                  第 {page} 页，共 {totalPages} 页
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  下一页
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// 学校管理组件
const SchoolManagement: React.FC = () => {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.listSchools({ page, per_page: 10, query: search });
      if (response.data.success) {
        setSchools(response.data.schools);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to load schools:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, [page, search]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>学校管理</CardTitle>
        <CardDescription>
          管理系统中的学校信息
        </CardDescription>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索学校名称或ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Button onClick={loadSchools} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>学校ID</TableHead>
                  <TableHead>学校名称</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-mono text-sm">{school.id}</TableCell>
                    <TableCell className="font-medium">{school.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  上一页
                </Button>
                <span className="text-sm text-muted-foreground">
                  第 {page} 页，共 {totalPages} 页
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  下一页
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// 教师管理组件（先简化实现）
const TeacherManagement: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>教师管理</CardTitle>
        <CardDescription>
          管理智学网教师账号
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>教师管理功能开发中</p>
          <p className="text-sm mt-2">将支持教师账号添加、管理、权限配置等功能</p>
        </div>
      </CardContent>
    </Card>
  );
};

// 学生管理组件
const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<ZhiXueAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.listZhiXueAccounts({ page, per_page: 10, query: search });
      if (response.data.success) {
        setStudents(response.data.zhixue_accounts);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [page, search]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>学生管理</CardTitle>
        <CardDescription>
          管理智学网学生账号
        </CardDescription>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索学生用户名..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Button onClick={loadStudents} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户名</TableHead>
                  <TableHead>真实姓名</TableHead>
                  <TableHead>学校</TableHead>
                  <TableHead>学校ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.username}</TableCell>
                    <TableCell>{student.realname}</TableCell>
                    <TableCell>{student.school_name || '未知'}</TableCell>
                    <TableCell className="font-mono text-sm">{student.school_id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  上一页
                </Button>
                <span className="text-sm text-muted-foreground">
                  第 {page} 页，共 {totalPages} 页
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  下一页
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// 考试管理组件（预留）
const ExamManagement: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>考试管理</CardTitle>
        <CardDescription>
          管理系统中的考试数据
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>考试管理功能预留</p>
          <p className="text-sm mt-2">将支持考试数据查看、管理、统计等功能</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPage;