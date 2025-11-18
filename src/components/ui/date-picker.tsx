"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "选择日期",
  className,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date | undefined>(date);
  const [value, setValue] = React.useState(formatDate(date));

  // 同步外部date变化到内部state
  React.useEffect(() => {
    setValue(formatDate(date));
    setMonth(date);
  }, [date]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setValue(inputValue);

    // 如果输入为空，清除日期
    if (!inputValue.trim()) {
      onDateChange?.(undefined);
      setMonth(undefined);
      return;
    }

    // 尝试解析输入的日期
    const parsedDate = new Date(inputValue);
    if (isValidDate(parsedDate)) {
      setMonth(parsedDate);
      onDateChange?.(parsedDate);
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    onDateChange?.(selectedDate);
    setValue(formatDate(selectedDate));
    setOpen(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && !disabled) {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div className={cn("relative flex", className)}>
      <Input
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        className="pr-10"
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 p-0"
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="sr-only">选择日期</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
