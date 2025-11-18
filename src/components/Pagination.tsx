import React from "react";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        title="首页"
        className="w-7"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        title="上一页"
        className="w-7"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {showPageNumbers ? (
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum =
              Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            return (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? "default" : "outline-solid"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="w-7"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
      ) : (
        <span className="text-sm text-muted-foreground px-2">
          第 {currentPage} 页
        </span>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        title="下一页"
        className="w-7"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        title="末页"
        className="w-7"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>

      <span className="text-sm text-muted-foreground ml-4">
        共 {totalPages} 页
      </span>
    </div>
  );
};
