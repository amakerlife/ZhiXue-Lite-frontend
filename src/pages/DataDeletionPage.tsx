import React, { useEffect } from 'react';

const DataDeletionPage: React.FC = () => {
  useEffect(() => {
    document.title = '数据删除请求 - ZhiXue Lite';
    return () => {
      document.title = 'ZhiXue Lite';
    };
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1>数据删除请求</h1>
        <p>这里是数据删除请求页面的内容，你可以自定义任何HTML内容。</p>
      </div>
    </div>
  );
};

export default DataDeletionPage;
