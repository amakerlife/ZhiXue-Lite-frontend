import React, { useState, useEffect } from 'react';
import { Download, Eye, AlertCircle, RefreshCw, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { examAPI } from '@/api/exam';
import type { Score } from '@/types/api';

interface AnswerSheetViewerProps {
  examId: string;
  scores: Score[];
  studentId?: string; // 可选的学生 ID，用于数据查看页面
  studentName?: string; // 可选的学生姓名，用于数据查看页面
}

const AnswerSheetViewer: React.FC<AnswerSheetViewerProps> = ({ examId, scores, studentId, studentName }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [enlargedDialogOpen, setEnlargedDialogOpen] = useState(false);
  const [imageCache, setImageCache] = useState<Map<string, string>>(new Map());

  // 过滤出有效的科目（排除总分等）
  const validSubjects = scores.filter(score =>
    !score.subject_name.includes('总') &&
    !score.subject_name.includes('合计') &&
    score.subject_id &&
    score.subject_id.trim() !== ''
  );

  // 清理缓存的URL以避免内存泄漏
  useEffect(() => {
    return () => {
      imageCache.forEach((url) => {
        window.URL.revokeObjectURL(url);
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 生成缓存key
  const getCacheKey = (examId: string, subjectId: string, studentId?: string, studentName?: string) => {
    if (studentId) return `${examId}-${subjectId}-id-${studentId}`;
    if (studentName) return `${examId}-${subjectId}-name-${studentName}`;
    return `${examId}-${subjectId}`;
  };

  const handleViewAnswerSheet = async () => {
    if (!selectedSubjectId) {
      setError('请选择科目');
      return;
    }

    setError(null);
    setDialogOpen(true);

    // 检查缓存
    const cacheKey = getCacheKey(examId, selectedSubjectId, studentId, studentName);
    const cachedUrl = imageCache.get(cacheKey);

    if (cachedUrl) {
      setImageUrl(cachedUrl);
      return;
    }

    // 缓存中没有，发起请求
    try {
      setLoading(true);
      setImageUrl(null);

      const response = await examAPI.generateAnswersheet(examId, selectedSubjectId, studentId, studentName);

      // 创建图片URL并缓存
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setImageUrl(url);

      // 更新缓存
      const newCache = new Map(imageCache);
      newCache.set(cacheKey, url);
      setImageCache(newCache);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '获取答题卡失败';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAnswerSheet = async () => {
    if (!selectedSubjectId) {
      setError('请选择科目');
      return;
    }

    const selectedSubject = validSubjects.find(s => s.subject_id === selectedSubjectId);

    try {
      setError(null);

      // 检查缓存，如果有缓存就直接下载
      const cacheKey = getCacheKey(examId, selectedSubjectId, studentId, studentName);
      const cachedUrl = imageCache.get(cacheKey);

      if (cachedUrl) {
        // 使用缓存的图片进行下载
        const link = document.createElement('a');
        link.href = cachedUrl;
        link.setAttribute('download', `${selectedSubject?.subject_name || '答题卡'}.png`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      }

      // 缓存中没有，发起请求
      setLoading(true);
      const response = await examAPI.generateAnswersheet(examId, selectedSubjectId, studentId, studentName);

      // 创建URL并缓存
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const newCache = new Map(imageCache);
      newCache.set(cacheKey, url);
      setImageCache(newCache);

      // 下载
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedSubject?.subject_name || '答题卡'}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || '下载答题卡失败';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    // 不再清理imageUrl，因为我们需要缓存它
  };

  const handleEnlargedDialogClose = () => {
    setEnlargedDialogOpen(false);
  };

  const handleImageClick = () => {
    if (imageUrl) {
      setEnlargedDialogOpen(true);
    }
  };

  if (validSubjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>答题卡</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/25">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无可用科目</h3>
            <p className="text-muted-foreground">
              当前考试没有可用的科目答题卡数据
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="h-5 w-5" />
          <span>答题卡</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <label className="text-sm font-medium">选择科目</label>
          <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
            <SelectTrigger>
              <SelectValue placeholder="请选择要查看的科目" />
            </SelectTrigger>
            <SelectContent>
              {validSubjects.map((subject) => (
                <SelectItem key={subject.subject_id} value={subject.subject_id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{subject.subject_name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {subject.score || '-'}/{subject.standard_score || '-'}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={handleViewAnswerSheet}
            disabled={!selectedSubjectId}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            查看答题卡
          </Button>

          <Button
            onClick={handleDownloadAnswerSheet}
            disabled={!selectedSubjectId || loading}
            variant="outline"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            下载
          </Button>
        </div>

        {/* 答题卡查看Dialog */}
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>
                {validSubjects.find(s => s.subject_id === selectedSubjectId)?.subject_name} - 答题卡
              </DialogTitle>
            </DialogHeader>

            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
                <p className="text-red-700">{error}</p>
              </div>
            ) : imageUrl ? (
              <div className="flex justify-center">
                <div className="relative group cursor-pointer" onClick={handleImageClick}>
                  <img
                    src={imageUrl}
                    alt="答题卡"
                    className="max-w-full h-auto border rounded-lg shadow-sm transition-opacity hover:opacity-75"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                    <div className="bg-white/90 rounded-full p-2">
                      <ZoomIn className="h-6 w-6 text-gray-700" />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* 放大图片的Dialog */}
        <Dialog open={enlargedDialogOpen} onOpenChange={handleEnlargedDialogClose}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-2">
            <DialogHeader className="pb-2">
              <DialogTitle>
                {validSubjects.find(s => s.subject_id === selectedSubjectId)?.subject_name} - 答题卡（放大视图）
              </DialogTitle>
            </DialogHeader>
            {imageUrl && (
              <div className="overflow-auto max-h-[85vh]">
                <img
                  src={imageUrl}
                  alt="答题卡放大视图"
                  className="w-full h-auto border rounded"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>

        <div className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="font-medium text-blue-900">数据仅供参考，请以智学网官方成绩为准</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnswerSheetViewer;