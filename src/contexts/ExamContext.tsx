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

interface ExamContextType {
  loadingExams: Set<string>;
  getExamData: (examId: string) => Promise<ExamData | null>;
  isLoadingExam: (examId: string) => boolean;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

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
  const [loadingExams] = useState(() => new Set<string>());
  const [loadingPromises] = useState(() => new Map<string, Promise<ExamData | null>>());

  const getExamData = useCallback(async (examId: string): Promise<ExamData | null> => {
    // 如果正在加载，返回现有的 Promise（避免并发请求）
    if (loadingPromises.has(examId)) {
      return loadingPromises.get(examId)!;
    }

    // 创建新的加载 Promise
    const loadPromise = (async () => {
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

          return examData;
        }

        return null;
      } catch (error) {
        console.error('Failed to fetch exam data:', error);
        return null;
      } finally {
        loadingExams.delete(examId);
        loadingPromises.delete(examId);
      }
    })();

    loadingPromises.set(examId, loadPromise);
    return loadPromise;
  }, [loadingExams, loadingPromises]);

  const isLoadingExam = useCallback((examId: string): boolean => {
    return loadingExams.has(examId);
  }, [loadingExams]);

  const value: ExamContextType = {
    loadingExams,
    getExamData,
    isLoadingExam
  };

  return (
    <ExamContext.Provider value={value}>
      {children}
    </ExamContext.Provider>
  );
};