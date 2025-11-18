import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 可复制文本组件 - 在文本旁显示复制按钮
 *
 * @param text - 显示的文本内容
 * @param copyValue - 要复制的值（如果与显示文本不同）
 * @param className - 额外的样式类名
 */
export const CopyableText: React.FC<{
  text: string | React.ReactNode;
  copyValue?: string; // 可选：要复制的值（如果与显示文本不同）
  className?: string;
}> = ({ text, copyValue, className = "" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const valueToCopy =
      copyValue || (typeof text === "string" ? text : String(text));
    navigator.clipboard.writeText(valueToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span>{text}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 flex-shrink-0"
        onClick={handleCopy}
        title={copied ? "已复制" : "复制"}
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  );
};
