import React, { useEffect } from 'react';

const AboutPage: React.FC = () => {
    useEffect(() => {
        document.title = '关于 - ZhiXue Lite';
        return () => {
            document.title = 'ZhiXue Lite';
        };
    }, []);

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">关于我们</h1>

                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">欢迎您使用 ZhiXue Lite！ZhiXue Lite 是一款旨在为您提供更美观、便捷的方式来获取和展示您在智学网上的考试成绩数据的应用程序。</p>

                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4"><strong>请注意</strong>：ZhiXue-Lite 是一个独立的第三方项目，与"智学网"官方没有任何关联。本项目仅供学习和交流使用。</p>
                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">如有任何问题或建议，请通过以下方式与我们联系：</p>
                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">zxl@makerlife.top</p>
                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">我们将尽快审核所涉问题，并将在验证您的用户身份后的十五个工作日内予以回复。</p>
            </div>
        </div>
    );
};

export default AboutPage;
