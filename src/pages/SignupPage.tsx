import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import Turnstile, { type TurnstileRef } from "@/components/ui/turnstile";
import { StatusAlert } from "@/components/StatusAlert";
import { useLanguage } from "@/i18n";

const SignupPage: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const { signup } = useAuth();
  const navigate = useNavigate();
  const turnstileRef = useRef<TurnstileRef>(null);

  // 检查是否启用验证码
  const isTurnstileEnabled = import.meta.env.VITE_TURNSTILE_ENABLED === "true";

  useEffect(() => {
    document.title = t("signup.pageTitle") as string;
    return () => {
      document.title = "ZhiXue Lite";
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 只在启用验证码时检查 token
    if (isTurnstileEnabled && !turnstileToken) {
      setError(t("login.captchaRequired") as string);
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t("signup.passwordMismatch") as string);
      setIsLoading(false);
      return;
    }

    try {
      await signup(
        formData.username,
        formData.password,
        formData.email,
        isTurnstileEnabled ? turnstileToken : undefined,
      );
      navigate("/");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : t("signup.failed") as string;
      setError(errorMessage);
      // 重置验证码
      if (isTurnstileEnabled) {
        setTurnstileToken("");
        turnstileRef.current?.reset();
      }
    } finally {
      setIsLoading(false);
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

  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center space-x-2">
            <UserPlus className="h-6 w-6 text-primary" />
            <span>{t("signup.title") as string}</span>
          </CardTitle>
          <CardDescription>{t("signup.subtitle") as string}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <StatusAlert variant="error" message={error} />}

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                {t("signup.username") as string}
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder={t("signup.usernamePlaceholder") as string}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t("signup.email") as string}
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("signup.emailPlaceholder") as string}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {t("signup.password") as string}
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t("signup.passwordPlaceholder") as string}
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                {t("signup.confirmPassword") as string}
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t("signup.confirmPasswordPlaceholder") as string}
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("signup.submitting") as string : t("signup.submit") as string}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <div className="font-bold text-foreground">
              {t("signup.localAccountNote") as string}
            </div>
            <span className="text-muted-foreground">{t("signup.hasAccount") as string}</span>
            <Link to="/login" className="ml-1 text-primary hover:underline">
              {t("signup.loginNow") as string}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;
