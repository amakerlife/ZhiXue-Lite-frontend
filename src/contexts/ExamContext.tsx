import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { examAPI } from '@/api/exam';

export interface ExamData {
  id: string;
  name: string;
  school_id?: string;
  is_saved: boolean;
  created_at: string;
  scores: Array<{
    subject_id: string;
    subject_name: string;
    score: string;
    standard_score: string;
    class_rank: string;
    school_rank: string;
    sort: number;
  }>;
  totalScores: Array<{
    subject_id: string;
    subject_name: string;
    score: string;
    standard_score: string;
    class_rank: string;
    school_rank: string;
    sort: number;
  }>;
}

interface ExamCacheItem {
  data: ExamData;
  timestamp: number;
}

interface ExamContextType {
  examCache: Map<string, ExamCacheItem>;
  loadingExams: Set<string>;
  getExamData: (examId: string) => Promise<ExamData | null>;
  getCachedExamData: (examId: string) => ExamData | null;
  clearExamCache: (examId?: string) => void;
  isLoadingExam: (examId: string) => boolean;
  updateExamData: (examId: string, data: ExamData) => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

// 缓存有效期：5分钟
const CACHE_DURATION = 5 * 60 * 1000;

export const useExam = () => {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};

interface ExamProviderProps {
  children: ReactNode;
}

export const ExamProvider: React.FC<ExamProviderProps> = ({ children }) => {
  const [examCache] = useState(() => new Map<string, ExamCacheItem>());
  const [loadingExams] = useState(() => new Set<string>());

  const getCachedExamData = useCallback((examId: string): ExamData | null => {
    const cached = examCache.get(examId);
    if (!cached) return null;

    // 检查缓存是否过期
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      examCache.delete(examId);
      return null;
    }

    return cached.data;
  }, [examCache]);

  const updateExamData = useCallback((examId: string, data: ExamData) => {
    examCache.set(examId, {
      data,
      timestamp: Date.now()
    });
  }, [examCache]);

  const getExamData = useCallback(async (examId: string): Promise<ExamData | null> => {
    // 先检查缓存
    const cachedData = getCachedExamData(examId);
    if (cachedData) {
      return cachedData;
    }

    // 如果正在加载，等待加载完成
    if (loadingExams.has(examId)) {
      // 等待加载完成的简单实现
      return new Promise((resolve) => {
        const checkCache = () => {
          const cached = getCachedExamData(examId);
          if (cached || !loadingExams.has(examId)) {
            resolve(cached);
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    try {
      loadingExams.add(examId);

      const response = await examAPI.getUserExamScore(examId);
      if (response.data.success) {
        // 分离总分和科目分数
        const allScores = response.data.scores || [];
        const totalScores = allScores.filter(score =>
          score.subject_name.includes('总') || score.subject_name.includes('合计')
        );
        const subjectScores = allScores.filter(score =>
          !score.subject_name.includes('总') && !score.subject_name.includes('合计')
        );

        const examData: ExamData = {
          id: response.data.id,
          name: response.data.name,
          school_id: response.data.school_id,
          is_saved: response.data.is_saved,
          created_at: response.data.created_at.toString(),
          scores: subjectScores,
          totalScores: totalScores
        };

        updateExamData(examId, examData);
        return examData;
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch exam data:', error);
      return null;
    } finally {
      loadingExams.delete(examId);
    }
  }, [examCache, loadingExams, getCachedExamData, updateExamData]);

  const clearExamCache = useCallback((examId?: string) => {
    if (examId) {
      examCache.delete(examId);
      loadingExams.delete(examId);
    } else {
      examCache.clear();
      loadingExams.clear();
    }
  }, [examCache, loadingExams]);

  const isLoadingExam = useCallback((examId: string): boolean => {
    return loadingExams.has(examId);
  }, [loadingExams]);

  const value: ExamContextType = {
    examCache,
    loadingExams,
    getExamData,
    getCachedExamData,
    clearExamCache,
    isLoadingExam,
    updateExamData
  };

  return (
    <ExamContext.Provider value={value}>
      {children}
    </ExamContext.Provider>
  );
};