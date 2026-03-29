import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Link2,
  Unlink,
  RefreshCw,
  Lock,
  CheckCircle,
  XCircle,
  Send,
  CircleHelp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n";
import { authAPI } from "@/api/auth";
import { formatUTCIsoToLocal } from "@/utils/dateUtils";
import {
  getUserRoleLabel,
  getRoleVariant,
  getUserPermissions,
} from "@/utils/permissions";
import Turnstile, { type TurnstileRef } from "@/components/ui/turnstile";
import { trackAnalyticsEvent } from "@/utils/analytics";
import { StatusAlert } from "@/components/StatusAlert";

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [connectForm, setConnectForm] = useState({
    username: "",
    password: "",
    is_parent: false,
    showForm: false,
  });
  const [connectConfirmOpen, setConnectConfirmOpen] = useState(false);
  const [disconnectConfirmOpen, setDisconnectConfirmOpen] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const turnstileRef = useRef<TurnstileRef>(null);

  // 检查是否启用验证码
  const isTurnstileEnabled = import.meta.env.VITE_TURNSTILE_ENABLED === "true";

  // 智学网绑定信息
  const [bindingInfo, setBindingInfo] = useState<{ username: string }[]>([]);
  const [loadingBindingInfo, setLoadingBindingInfo] = useState(false);

  // 修改用户信息相关状态
  const [editMode, setEditMode] = useState<"none" | "email" | "password">(
    "none",
  );
  const [editForm, setEditForm] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 邮件验证相关状态
  const [resendingEmail, setResendingEmail] = useState(false);

  // 教师账号说明弹窗状态
  const [teacherAccountDialogOpen, setTeacherAccountDialogOpen] =
    useState(false);

  useEffect(() => {
    document.title = t("profile.pageTitle") as string;
    return () => {
      document.title = "ZhiXue Lite";
    };
  }, []);

  // 进入个人中心时获取最新用户数据
  useEffect(() => {
    const loadLatestUserData = async () => {
      await refreshUser();
    };

    loadLatestUserData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 当用户信息加载完成且有智学网账号时，加载绑定信息
  useEffect(() => {
    if (user?.zhixue_info?.username) {
      loadBindingInfo();
    }
  }, [user?.zhixue_info?.username]); // eslint-disable-line react-hooks/exhaustive-deps

  // 处理锚点导航
  useEffect(() => {
    if (location.hash) {
      // 延迟一点确保 DOM 已渲染
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [location.hash, user]);

  const handleConnectZhixue = (e: React.FormEvent) => {
    e.preventDefault();
    if (isTurnstileEnabled && !turnstileToken) {
      setError(t("login.captchaRequired") as string);
      return;
    }
    setConnectConfirmOpen(true);
  };

  const confirmConnectZhixue = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authAPI.bindZhixue({
        username: connectForm.username,
        password: connectForm.password,
        turnstile_token: isTurnstileEnabled ? turnstileToken : undefined,
        is_parent: connectForm.is_parent,
      });

      if (response.data.success) {
        setSuccess(t("profile.bindSuccess") as string);
        setConnectForm({
          username: "",
          password: "",
          is_parent: false,
          showForm: false,
        });
        if (isTurnstileEnabled) {
          setTurnstileToken("");
        }

        trackAnalyticsEvent("zhixue_bind_success", {
          username: user?.username,
          zhixue_username: connectForm.username,
          has_captcha: !!turnstileToken,
        });

        await refreshUser();
        // 绑定成功后加载绑定信息
        await loadBindingInfo();
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || t("profile.bindFailed") as string;
      setError(errorMessage);

      trackAnalyticsEvent("zhixue_bind_failed", {
        username: user?.username,
        zhixue_username: connectForm.username,
        error_message: errorMessage,
        has_captcha: !!turnstileToken,
      });
      // 重置验证码
      if (isTurnstileEnabled) {
        setTurnstileToken("");
        turnstileRef.current?.reset();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
    setError(null);
  }, []);

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken("");
    setError(t("login.captchaFailed") as string);
    // 自动重置验证码
    turnstileRef.current?.reset();
  }, []);

  // 加载智学网账号绑定信息
  const loadBindingInfo = async () => {
    if (!user?.zhixue_info?.username) {
      setBindingInfo([]);
      return;
    }

    setLoadingBindingInfo(true);
    try {
      const response = await authAPI.getZhixueBindingInfo();
      if (response.data.success) {
        setBindingInfo(response.data.binding_info);
      }
    } catch {
      // 如果获取失败，不显示错误给用户，只是不显示绑定信息
      setBindingInfo([]);
    } finally {
      setLoadingBindingInfo(false);
    }
  };

  const handleDisconnectZhixue = () => {
    setDisconnectConfirmOpen(true);
  };

  const confirmDisconnectZhixue = async () => {
    const currentZhixueUsername = user?.zhixue_info?.username; // 保存当前智学网用户名

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authAPI.unbindZhixue();
      if (response.data.success) {
        setSuccess(t("profile.unbindSuccess") as string);

        trackAnalyticsEvent("zhixue_unbind_success", {
          username: user?.username,
          zhixue_username: currentZhixueUsername,
        });

        await refreshUser();
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || t("profile.unbindFailed") as string;
      setError(errorMessage);

      trackAnalyticsEvent("zhixue_unbind_failed", {
        username: user?.username,
        zhixue_username: currentZhixueUsername,
        error_message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // 初始化编辑表单
  const startEdit = (type: "email" | "password") => {
    setError(null);
    setSuccess(null);
    setEditMode(type);
    if (type === "email") {
      setEditForm((prev) => ({ ...prev, email: user?.email || "" }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    }
  };

  const cancelEdit = () => {
    setEditMode("none");
    setEditForm({
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // 提交修改
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError(t("profile.userInfoIncomplete") as string);
      return;
    }

    // 验证逻辑
    if (editMode === "email") {
      if (editForm.email === user.email) {
        setError(t("profile.emailSameError") as string);
        return;
      }
    } else if (editMode === "password") {
      if (editForm.newPassword !== editForm.confirmPassword) {
        setError(t("profile.passwordMismatch") as string);
        return;
      }
      if (editForm.newPassword.length < 6) {
        setError(t("profile.passwordTooShort") as string);
        return;
      }
      if (!editForm.currentPassword) {
        setError(t("profile.currentPasswordRequired") as string);
        return;
      }
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: {
        email?: string;
        currentPassword?: string;
        password?: string;
      } = {};

      if (editMode === "email") {
        updateData.email = editForm.email;
      } else if (editMode === "password") {
        updateData.currentPassword = editForm.currentPassword;
        updateData.password = editForm.newPassword;
      }

      const response = await authAPI.updateCurrentUser(updateData);

      if (response.data.success) {
        setSuccess(editMode === "email" ? t("profile.emailUpdated") as string : t("profile.passwordUpdated") as string);

        trackAnalyticsEvent("user_profile_update_success", {
          username: user?.username,
          update_type: editMode,
          field_updated: editMode === "email" ? "email" : "password",
        });

        setEditMode("none");
        setEditForm({
          email: "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        await refreshUser();
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || t("profile.updateFailed") as string;
      setError(errorMessage);

      trackAnalyticsEvent("user_profile_update_failed", {
        username: user?.username,
        update_type: editMode,
        field_updated: editMode === "email" ? "email" : "password",
        error_message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // 重发验证邮件
  const handleResendVerificationEmail = async () => {
    setResendingEmail(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authAPI.resendVerificationEmail();
      if (response.data.success) {
        setSuccess(t("profile.emailSent") as string);

        trackAnalyticsEvent("email_verification_resend_success", {
          username: user?.username,
          email: user?.email,
        });
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || t("profile.sendFailed") as string;
      setError(errorMessage);

      trackAnalyticsEvent("email_verification_resend_failed", {
        username: user?.username,
        email: user?.email,
        error_message: errorMessage,
      });
    } finally {
      setResendingEmail(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t("profile.pleaseLogin") as string}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t("profile.title") as string}</h1>
        <p className="text-muted-foreground mt-1">{t("profile.subtitle") as string}</p>
      </div>

      {/* Success/Error Messages */}
      {success && <StatusAlert variant="success" message={success} />}
      {error && <StatusAlert variant="error" message={error} />}

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{t("profile.accountInfo") as string}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t("profile.username") as string}
              </label>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{user.username}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="user-email"
                className="text-sm font-medium text-muted-foreground"
              >
                {t("profile.email") as string}
              </label>
              {editMode === "email" ? (
                <form onSubmit={handleUpdateUser} className="space-y-3">
                  <Input
                    id="user-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder={t("profile.emailPlaceholder") as string}
                    required
                  />
                  <div className="flex items-center space-x-2">
                    <Button type="submit" size="sm" disabled={loading}>
                      {loading ? t("common.saving") as string : t("common.save") as string}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={cancelEdit}
                    >
                      {t("common.cancel") as string}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{user.email}</span>
                      {user.email_verified ? (
                        <Badge
                          variant="outline"
                          className="flex items-center space-x-1 text-green-700 bg-green-50 border-green-200"
                        >
                          <CheckCircle className="h-3 w-3" />
                          <span>{t("common.verified") as string}</span>
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="flex items-center space-x-1 text-red-700 bg-red-50 border-red-200"
                        >
                          <XCircle className="h-3 w-3" />
                          <span>{t("common.unverified") as string}</span>
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit("email")}
                    >
                      {t("common.edit") as string}
                    </Button>
                  </div>
                  {!user.email_verified && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-yellow-800 flex-1">
                          {t("profile.emailNotVerifiedMsg") as string}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResendVerificationEmail}
                          disabled={resendingEmail}
                          className="shrink-0"
                        >
                          {resendingEmail ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              {t("profile.resending") as string}
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              {t("profile.resendEmail") as string}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="user-password"
                className="text-sm font-medium text-muted-foreground"
              >
                {t("profile.password") as string}
              </label>
              {editMode === "password" ? (
                <form onSubmit={handleUpdateUser} className="space-y-3">
                  <Input
                    id="current-password"
                    type="password"
                    value={editForm.currentPassword}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder={t("profile.currentPasswordPlaceholder") as string}
                    required
                  />
                  <Input
                    id="new-password"
                    type="password"
                    value={editForm.newPassword}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder={t("profile.newPasswordPlaceholder") as string}
                    required
                  />
                  <Input
                    id="confirm-password"
                    type="password"
                    value={editForm.confirmPassword}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder={t("profile.confirmPasswordPlaceholder") as string}
                    required
                  />
                  <div className="flex items-center space-x-2">
                    <Button type="submit" size="sm" disabled={loading}>
                      {loading ? t("common.saving") as string : t("common.save") as string}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={cancelEdit}
                    >
                      {t("common.cancel") as string}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">••••••••</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit("password")}
                  >
                    {t("common.edit") as string}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t("profile.role") as string}
              </label>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <Badge variant={getRoleVariant(user.role)}>
                  {getUserRoleLabel(user.role)}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t("profile.lastLogin") as string}
              </label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {user.last_login
                    ? formatUTCIsoToLocal(user.last_login)
                    : t("profile.neverLogin") as string}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5" />
            <span>{t("profile.permissions") as string}</span>
          </CardTitle>
          <CardDescription>{t("profile.permissionsDesc") as string}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {getUserPermissions(user).map((permission) => (
              <div key={permission.type} className="text-sm">
                <span
                  className={
                    permission.allowed
                      ? "text-green-700 font-medium"
                      : "text-red-700 font-medium"
                  }
                >
                  {permission.allowed ? t("common.allowed") as string : t("common.denied") as string}
                </span>
                <span className="text-gray-700 mx-1">{permission.action}</span>
                {permission.allowed && (
                  <span className="text-blue-700 font-medium">
                    {permission.levelDescription}
                  </span>
                )}
                <span className="text-gray-700 mx-1">{permission.object}</span>
              </div>
            ))}
          </div>

          {user?.role !== "admin" && (
            <div className="mt-4 p-3 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground">
                <strong>{t("profile.permissionNoteLabel") as string}</strong>
                {t("profile.permissionNote") as string}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ZhiXue Account Connection */}
      <Card id="zhixue-binding">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Link2 className="h-5 w-5" />
            <span>{t("profile.zhixueAccount") as string}</span>
          </CardTitle>
          <CardDescription>
            {t("profile.zhixueDesc") as string}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.zhixue_info?.username ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-green-900 flex items-center gap-2">
                      {t("profile.zhixueBound") as string}
                      {user.zhixue_info?.is_parent && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
                        >
                          {t("profile.parentAccount") as string}
                        </Badge>
                      )}
                    </p>
                    {/* 桌面端：一行显示，用竖线分割 */}
                    <p className="text-sm text-green-700 mt-1 hidden sm:block">
                      {t("profile.zhixueUsername") as string} {user.zhixue_info.username} | {t("profile.zhixueName") as string}{" "}
                      {user.zhixue_info.realname} | {t("profile.zhixueSchool") as string}{" "}
                      {user.zhixue_info.school_name}
                    </p>
                    {/* 移动端：多行显示，无竖线 */}
                    <div className="text-sm text-green-700 mt-1 space-y-0.5 sm:hidden">
                      <p>{t("profile.zhixueUsername") as string} {user.zhixue_info.username}</p>
                      <p>{t("profile.zhixueName") as string} {user.zhixue_info.realname}</p>
                      <p>{t("profile.zhixueSchool") as string} {user.zhixue_info.school_name}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnectZhixue}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700 shrink-0"
                  >
                    <Unlink className="h-4 w-4 mr-2" />
                    {t("profile.unbind") as string}
                  </Button>
                </div>

                {/* 教师账号说明按钮 - 仅当学校没有教师账号时显示 */}
                {user.zhixue_info.school_has_teacher === false && (
                  <div className="mt-2">
                    <Button
                      variant="link"
                      onClick={() => setTeacherAccountDialogOpen(true)}
                      className="text-green-700 hover:text-green-900 p-0 h-auto text-xs gap-0.5"
                    >
                      <CircleHelp className="h-3 w-3" />
                      {t("profile.teacherAccountNote") as string}
                    </Button>
                  </div>
                )}
              </div>

              {/* 显示绑定信息 - 根据绑定用户数量调整显示 */}
              <div
                className={`rounded-md p-4 border ${
                  bindingInfo.length <= 1
                    ? "bg-green-50 border-green-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4
                    className={`font-medium ${
                      bindingInfo.length <= 1
                        ? "text-green-900"
                        : "text-yellow-900"
                    }`}
                  >
                    {t("profile.bindingStatus") as string}
                  </h4>
                  {loadingBindingInfo && (
                    <RefreshCw
                      className={`h-4 w-4 animate-spin ${
                        bindingInfo.length <= 1
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    />
                  )}
                </div>

                {bindingInfo.length <= 1 ? (
                  // 只有当前用户绑定，显示安全信息
                  <div className="space-y-2">
                    <p className="text-sm text-green-700">
                      {t("profile.bindingSafe") as string}
                    </p>
                  </div>
                ) : (
                  // 多个用户绑定，显示警告信息和用户列表
                  <div className="space-y-2">
                    <p className="text-sm text-yellow-800 font-medium">
                      {(t("profile.bindingMultiple") as unknown as (n: number) => string)(bindingInfo.length)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {bindingInfo.map((info) => (
                        <Badge
                          key={info.username}
                          variant="outline"
                          className="text-yellow-800 border-yellow-400 bg-yellow-100"
                        >
                          {info.username}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-yellow-700 mt-2">
                      {t("profile.bindingMultipleNote") as string}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 显示手动分配的学校信息 */}
              {user.is_manual_school && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="font-medium text-blue-900">
                    {t("profile.manualSchool") as string}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    {(t("profile.manualSchoolName") as unknown as (s: string) => string)(user.zhixue_info?.school_name || "...")}
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    {t("profile.manualSchoolNote") as string}
                  </p>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-yellow-800">
                  {t("profile.zhixueNotBound") as string}
                </p>
              </div>

              {!connectForm.showForm ? (
                <Button
                  onClick={() => {
                    setError(null);
                    setSuccess(null);
                    setConnectForm((prev) => ({ ...prev, showForm: true }));
                    // 重置验证码状态
                    if (isTurnstileEnabled) {
                      setTurnstileToken("");
                      setTimeout(() => turnstileRef.current?.reset(), 100);
                    }
                  }}
                  className="w-full md:w-auto"
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  {t("profile.bindZhixue") as string}
                </Button>
              ) : (
                <form onSubmit={handleConnectZhixue} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="zhixue-username"
                      className="text-sm font-medium"
                    >
                      {t("profile.zhixueUsernameLabel") as string}
                    </label>
                    <Input
                      id="zhixue-username"
                      type="text"
                      value={connectForm.username}
                      onChange={(e) =>
                        setConnectForm((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      placeholder={t("profile.zhixueUsernamePlaceholder") as string}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="zhixue-password"
                      className="text-sm font-medium"
                    >
                      {t("profile.zhixuePasswordLabel") as string}
                    </label>
                    <Input
                      id="zhixue-password"
                      type="password"
                      value={connectForm.password}
                      onChange={(e) =>
                        setConnectForm((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      placeholder={t("profile.zhixuePasswordPlaceholder") as string}
                      disabled={loading}
                      required
                    />
                  </div>

                  {isTurnstileEnabled && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("common.captchaLabel") as string}</label>
                      <Turnstile
                        ref={turnstileRef}
                        siteKey={
                          import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY ||
                          "1x00000000000000000000AA"
                        }
                        onVerify={handleTurnstileVerify}
                        onError={handleTurnstileError}
                        theme="auto"
                        className="w-full"
                        enabled={isTurnstileEnabled}
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? t("profile.binding") as string : t("profile.confirmBind") as string}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setConnectForm({
                          username: "",
                          password: "",
                          is_parent: false,
                          showForm: false,
                        });
                        if (isTurnstileEnabled) {
                          setTurnstileToken("");
                          turnstileRef.current?.reset();
                        }
                      }}
                      disabled={loading}
                    >
                      {t("common.cancel") as string}
                    </Button>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is_parent"
                          checked={connectForm.is_parent}
                          onCheckedChange={(checked) =>
                            setConnectForm((prev) => ({
                              ...prev,
                              is_parent: checked === true,
                            }))
                          }
                        />
                        <Label htmlFor="is_parent" className="cursor-pointer">
                          {t("profile.isParent") as string}
                        </Label>
                      </div>
                    </div>
                </form>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ResponsiveDialog
        open={connectConfirmOpen}
        onOpenChange={setConnectConfirmOpen}
        title={t("profile.bindConfirmTitle") as string}
        mode="confirm"
        variant="warning"
        confirmText={t("profile.confirmBind") as string}
        cancelText={t("common.cancel") as string}
        onConfirm={confirmConnectZhixue}
        className="sm:max-w-xl"
      >
        <div className="space-y-3 text-sm">
          {user.is_manual_school && (
            <p className="text-orange-800 font-medium">
              {t("profile.bindConfirmManualSchoolNote") as string}
            </p>
          )}
          <p>
            {t("profile.bindConfirmBody") as string}
          </p>
          <p>
            {t("profile.bindConfirmSecurity") as string}
          </p>
          <p>{t("profile.bindConfirmDisclaimer") as string}</p>
          <p className="font-medium text-foreground">
            {t("profile.bindConfirmAgree") as string}
          </p>
        </div>
      </ResponsiveDialog>

      <ConfirmDialog
        open={disconnectConfirmOpen}
        onOpenChange={setDisconnectConfirmOpen}
        title={t("profile.unbindConfirmTitle") as string}
        description={
          <>
            {t("profile.unbindConfirmDesc") as string}
            <br />
            <br />
            {t("profile.unbindConfirmLink") as string}{" "}
            <a
              href="https://forms.office.com/Pages/ResponsePage.aspx?id=DQSIkWdsW0yxEjajBLZtrQAAAAAAAAAAAAZ__gdDJJxUN0dVWVFMTDYySkpCVDFRWUU0WlUzVVpPTy4u"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {t("profile.supportForm") as string}
            </a>
          </>
        }
        confirmText={t("profile.confirmUnbind") as string}
        cancelText={t("common.cancel") as string}
        variant="destructive"
        onConfirm={confirmDisconnectZhixue}
      />

      {/* 教师账号说明弹窗 */}
      <ResponsiveDialog
        open={teacherAccountDialogOpen}
        onOpenChange={setTeacherAccountDialogOpen}
        title={t("profile.teacherDialogTitle") as string}
        mode="alert"
        confirmText={t("profile.teacherDialogConfirm") as string}
        onConfirm={() => setTeacherAccountDialogOpen(false)}
      >
        <div className="space-y-3 text-sm">
          <p>
            {t("profile.teacherDialogBody1") as string}
          </p>
          <p>
            {t("profile.teacherDialogBody2") as string}
          </p>
          <p>
            {t("profile.teacherDialogBody3") as string}
          </p>
        </div>
      </ResponsiveDialog>
    </div>
  );
};

export default ProfilePage;
