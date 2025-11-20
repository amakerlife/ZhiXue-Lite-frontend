import React, { useState, useEffect, useCallback } from "react";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";
import { examAPI, type ExamSelections } from "@/api/exam";
import { type AxiosError } from "axios";
import type { User } from "@/types/api";

interface ExamFetchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFetch: (params: {
    query_type?: string;
    school_id?: string;
    params?: Record<string, unknown>;
  }) => void;
  user: User | null;
}

interface FetchParams {
  queryType: string;
  academicYear?: string;
  termId?: string;
  beginTime?: string;
  endTime?: string;
  gradeCode?: string;
  examTypeCode?: string;
  schoolInYearCode?: string;
}

export const ExamFetchDialog: React.FC<ExamFetchDialogProps> = ({
  open,
  onOpenChange,
  onFetch,
  user,
}) => {
  const [selections, setSelections] = useState<ExamSelections | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchMode, setFetchMode] = useState<"self" | "school">("self");
  const [schoolId, setSchoolId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<FetchParams>({
    queryType: "academicYear",
  });

  // 检查用户权限
  // FETCH_DATA = 0，权限级别：1=SELF, 2=SCHOOL, 3=GLOBAL
  const canFetchSchoolData =
    user &&
    (examAPI.hasPermission(user, 0, 2) || // FETCH_DATA权限，SCHOOL级别
      examAPI.hasPermission(user, 0, 3)); // FETCH_DATA权限，GLOBAL级别

  const hasGlobalPermission = Boolean(
    user && examAPI.hasPermission(user, 0, 3),
  );
  const hasSchoolOnlyPermission = Boolean(
    user &&
      examAPI.hasPermission(user, 0, 2) &&
      !examAPI.hasPermission(user, 0, 3),
  );

  // 处理空字符串 code 的问题，给空字符串一个特殊值
  const normalizeCode = (code: string) => {
    return code === "" ? "__all__" : code;
  };

  // 反向处理，将特殊值还原为空字符串
  const denormalizeCode = (code: string) => {
    return code === "__all__" ? "" : code;
  };

  const handleParamChange = (field: keyof FetchParams, value: string) => {
    const decodedValue = denormalizeCode(value);

    if (field === "academicYear") {
      // 当学年变化时，清空学期和时间选择
      setParams((prev) => ({
        ...prev,
        academicYear: decodedValue,
        termId: undefined,
        beginTime: undefined,
        endTime: undefined,
      }));
    } else {
      setParams((prev) => ({
        ...prev,
        [field]: decodedValue,
      }));
    }
  };

  // 学校ID验证函数
  const validateSchoolId = (id: string): boolean => {
    if (!id.trim()) return false;

    // 学校 ID 必须是 19 位数字
    if (!/^\d{19}$/.test(id)) {
      return false;
    }

    return true;
  };

  const loadSelections = useCallback(
    async (targetSchoolId?: string) => {
      // 对于 GLOBAL 权限用户，需要验证学校 ID
      if (
        hasGlobalPermission &&
        targetSchoolId &&
        !validateSchoolId(targetSchoolId)
      ) {
        setError("学校 ID 格式不正确，必须是 19 位数字");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // 对于 SCHOOL 权限用户，不传递学校 ID，让后端自动使用用户的学校 ID
        const response = await examAPI.getFetchListParams(targetSchoolId || "");
        if (response.data.success) {
          setSelections(response.data.params);
        } else {
          setError(response.data.message || "加载配置参数失败");
        }
      } catch (error: unknown) {
        const axiosError = error as AxiosError<{ message?: string }>;
        setError(
          axiosError.response?.data?.message ||
            "加载配置参数失败，请检查学校 ID 是否正确",
        );
        setSelections(null);
      } finally {
        setLoading(false);
      }
    },
    [hasGlobalPermission],
  );

  // 当选择 school 模式时自动加载参数
  useEffect(() => {
    if (open && fetchMode === "school") {
      if (hasSchoolOnlyPermission) {
        // SCHOOL 权限用户：直接加载，不需要学校 ID
        loadSelections();
      } else if (hasGlobalPermission && schoolId) {
        // GLOBAL 权限用户：需要有学校 ID 才加载
        loadSelections(schoolId);
      }
    }
  }, [
    open,
    fetchMode,
    hasSchoolOnlyPermission,
    hasGlobalPermission,
    schoolId,
    loadSelections,
  ]);

  const handleSchoolIdChange = (value: string) => {
    setSchoolId(value);
    setError(null);
    setSelections(null); // 清除之前的配置
  };

  const handleFetch = () => {
    if (fetchMode === "self") {
      onFetch({ query_type: "self" });
    } else {
      // 对于 GLOBAL 权限用户，需要验证学校 ID
      if (hasGlobalPermission && !validateSchoolId(schoolId)) {
        setError("请输入有效的学校 ID");
        return;
      }

      // 构建查询参数
      const queryParams: Record<string, unknown> = {
        queryType: params.queryType,
      };

      if (params.queryType === "academicYear") {
        if (params.beginTime && params.endTime) {
          queryParams.beginTime = params.beginTime;
          queryParams.endTime = params.endTime;
        }
        // 年级暂时不传递，默认全部
        if (params.examTypeCode) queryParams.examTypeCode = params.examTypeCode;
      } else if (params.queryType === "schoolInYear") {
        if (params.schoolInYearCode)
          queryParams.schoolInYearCode = params.schoolInYearCode;
        if (params.examTypeCode) queryParams.examTypeCode = params.examTypeCode;
      }

      onFetch({
        query_type: "school_id",
        // 对于 SCHOOL 权限用户，不传学校 ID，让后端自动使用用户的学校 ID
        school_id: hasGlobalPermission ? schoolId : "",
        params: queryParams,
      });
    }
    onOpenChange(false);
  };

  const getTermOptions = () => {
    if (!selections?.academicYearTerm || !params.academicYear) {
      return [];
    }

    // academicYearTerm 是数组，需要遍历找到对应学年的数据
    for (const termObj of selections.academicYearTerm) {
      if (termObj[params.academicYear]) {
        return termObj[params.academicYear];
      }
    }

    return [];
  };

  const handleTermChange = (termId: string) => {
    const termOptions = getTermOptions();
    const selectedTerm = termOptions.find((term) => term.termId === termId);

    if (selectedTerm && selections?.teachingCycle) {
      // teachingCycle 也是数组，需要遍历找到对应 termId 的数据
      for (const cycleObj of selections.teachingCycle) {
        if (cycleObj[termId]) {
          const cycles = cycleObj[termId];
          if (cycles && cycles.length > 0) {
            const cycle = cycles[0]; // 使用第一个周期
            setParams((prev) => ({
              ...prev,
              termId,
              beginTime: cycle.beginTime,
              endTime: cycle.endTime,
            }));
            return;
          }
        }
      }
    }

    // 如果没有找到 teachingCycle 数据，只设置 termId
    setParams((prev) => ({
      ...prev,
      termId,
    }));
  };

  // 渲染表单内容（Desktop 和 Mobile 共用）
  const renderFormContent = () => (
    <div className="space-y-6">
      {/* 拉取模式选择 */}
      <div>
        <h3 className="text-sm font-medium mb-3">拉取模式</h3>
        <Select
          value={fetchMode}
          onValueChange={(value: "self" | "school") => setFetchMode(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="self">个人考试列表</SelectItem>
            {canFetchSchoolData && (
              <SelectItem value="school">学校考试列表</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* 学校考试列表配置 */}
      {fetchMode === "school" && (
        <>
          {/* 学校ID输入 */}
          {hasGlobalPermission && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="school-id">学校 ID</Label>
                <Input
                  id="school-id"
                  value={schoolId}
                  onChange={(e) => handleSchoolIdChange(e.target.value)}
                  placeholder="请输入 19 位数字学校 ID"
                  className={error ? "border-red-500" : ""}
                />
                <p className="text-xs text-muted-foreground">
                  学校 ID 必须是 19 位数字
                </p>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
            </div>
          )}

          {/* 学校信息显示（仅对SCHOOL权限用户） */}
          {hasSchoolOnlyPermission && schoolId && (
            <div className="space-y-2">
              <Label>学校 ID</Label>
              <div className="px-3 py-2 bg-muted rounded-md text-sm">
                {schoolId}
              </div>
              <p className="text-xs text-muted-foreground">
                使用您绑定账号的学校数据
              </p>
            </div>
          )}

          {/* 查询参数配置 */}
          {(hasSchoolOnlyPermission || (hasGlobalPermission && schoolId)) && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">查询配置</Label>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>加载配置参数中...</span>
                </div>
              ) : selections ? (
                <div className="space-y-4">
                  {/* 查询类型 */}
                  <div className="space-y-2">
                    <Label>查询类型</Label>
                    <Select
                      value={normalizeCode(params.queryType)}
                      onValueChange={(value) =>
                        handleParamChange("queryType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(selections?.queryTypeList || []).map((item) => (
                          <SelectItem
                            key={item.code || "__all__"}
                            value={normalizeCode(item.code)}
                          >
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 按学年查询 */}
                  {params.queryType === "academicYear" && (
                    <>
                      <div className="space-y-2">
                        <Label>学年</Label>
                        <Select
                          value={normalizeCode(params.academicYear || "")}
                          onValueChange={(value) =>
                            handleParamChange("academicYear", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择学年" />
                          </SelectTrigger>
                          <SelectContent>
                            {(selections?.academicYear || []).map((item) => (
                              <SelectItem
                                key={item.code || "__all__"}
                                value={normalizeCode(item.code)}
                              >
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {params.academicYear && getTermOptions().length > 0 && (
                        <div className="space-y-2">
                          <Label>学期</Label>
                          <Select
                            value={params.termId || ""}
                            onValueChange={handleTermChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="选择学期" />
                            </SelectTrigger>
                            <SelectContent>
                              {getTermOptions().map((term) => (
                                <SelectItem
                                  key={term.termId}
                                  value={term.termId}
                                >
                                  {term.termName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}

                  {/* 按级别查询 */}
                  {params.queryType === "schoolInYear" && (
                    <div className="space-y-2">
                      <Label>级别</Label>
                      <Select
                        value={normalizeCode(params.schoolInYearCode || "")}
                        onValueChange={(value) =>
                          handleParamChange("schoolInYearCode", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择级别" />
                        </SelectTrigger>
                        <SelectContent>
                          {(selections?.schoolInYearList || []).map((item) => (
                            <SelectItem
                              key={item.code || "__all__"}
                              value={normalizeCode(item.code)}
                            >
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* 报告类型 */}
                  <div className="space-y-2">
                    <Label>报告类型</Label>
                    <Select
                      value={normalizeCode(params.examTypeCode || "")}
                      onValueChange={(value) =>
                        handleParamChange("examTypeCode", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择报告类型（可选）" />
                      </SelectTrigger>
                      <SelectContent>
                        {(selections?.examTypeList || []).map((type) => (
                          <SelectItem
                            key={type.code || "__all__"}
                            value={normalizeCode(type.code)}
                          >
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {error && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-md">
              <div className="flex items-center space-x-2 text-red-800">
                <span className="text-sm font-medium">错误</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="拉取考试列表"
      className="max-w-2xl max-h-[80vh] overflow-y-auto"
      footer={(isDesktop) => (
        <>
          {isDesktop ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button
                onClick={handleFetch}
                disabled={
                  fetchMode === "school"
                    ? loading ||
                      error !== null ||
                      (hasGlobalPermission && !schoolId)
                    : false
                }
              >
                开始拉取
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleFetch}
                disabled={
                  fetchMode === "school"
                    ? loading ||
                      error !== null ||
                      (hasGlobalPermission && !schoolId)
                    : false
                }
              >
                开始拉取
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">取消</Button>
              </DrawerClose>
            </>
          )}
        </>
      )}
    >
      {renderFormContent()}
    </ResponsiveDialog>
  );
};
