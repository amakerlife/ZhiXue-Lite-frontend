import React from "react";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import { Button } from "@/components/ui/button";

const ExampleAnalyticsUsage: React.FC = () => {
  const { trackEvent } = useAnalyticsContext();

  const handleButtonClick = () => {
    // 追踪自定义事件
    trackEvent("button_click", {
      button_name: "example_button",
      page: "analytics_example",
      timestamp: Date.now(),
    });
  };

  const handleFormSubmit = () => {
    // 追踪表单提交事件
    trackEvent("form_submit", {
      form_type: "contact",
      user_action: "submit",
    });
  };

  const handleUserAction = (action: string) => {
    // 追踪用户行为
    trackEvent("user_action", {
      action,
      component: "example_component",
    });
  };

  return (
    <div className="space-y-4">
      <h2>分析工具使用示例</h2>

      <Button onClick={handleButtonClick}>点击追踪按钮事件</Button>

      <Button onClick={handleFormSubmit}>追踪表单提交</Button>

      <div className="space-x-2">
        <Button onClick={() => handleUserAction("view")}>查看操作</Button>
        <Button onClick={() => handleUserAction("like")}>点赞操作</Button>
        <Button onClick={() => handleUserAction("share")}>分享操作</Button>
      </div>
    </div>
  );
};

export default ExampleAnalyticsUsage;
