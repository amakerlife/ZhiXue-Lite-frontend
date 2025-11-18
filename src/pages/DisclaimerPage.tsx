import React, { useEffect } from "react";

const DisclaimerPage: React.FC = () => {
  useEffect(() => {
    document.title = "免责声明 - ZhiXue Lite";
    return () => {
      document.title = "ZhiXue Lite";
    };
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
        {/* 在这里添加你自定义的免责声明内容 */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          ZhiXue Lite 免责声明
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          <strong>最后更新于：2025 年 8 月 30 日</strong>
        </p>

        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          请在使用本网站前仔细阅读本免责声明。您对本网站的任何使用行为，均表示您已经阅读、理解并同意接受本声明的全部内容。
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
          一. 服务性质
        </h2>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          ZhiXue Lite
          是一个独立的第三方工具，旨在通过调用"智学网"官方接口，获取您的考试成绩数据，并以更加美观、便捷的方式进行展示。
          <strong>
            本网站并非"智学网"的官方应用，与"智学网"的开发者及运营方无任何关联、合作或许可关系。
          </strong>
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
          二. 数据来源与准确性
        </h2>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          本网站展示的所有成绩数据、分析报告及其他信息均直接来源于"智学网"官方平台。因此，我们无法保证：
        </p>
        <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700 dark:text-gray-300">
          <li>所有数据的绝对准确性、完整性、实时性。</li>
          <li>
            因"智学网"官方平台的数据错误、延迟或接口变更而导致的任何信息偏差。
          </li>
        </ul>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          所有信息应以"智学网"官方平台提供的数据为最终依据。对于因使用本网站提供的信息而造成的任何学术、决策或其他方面的影响，本网站概不负责。
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
          三. 账户安全
        </h2>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          您在使用本网站时需要提供您的"智学网"账户凭据（用户名和密码）以完成登录和数据获取。我们承诺采取合理的安全措施保护您的信息，但您仍需自行承担以下风险：
        </p>
        <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700 dark:text-gray-300">
          <li>
            您有责任妥善保管您的账户信息。因您个人保管不当（如在不安全的网络环境中使用、泄露给他人等）导致的任何损失，由您自行承担。
          </li>
          <li>强烈建议您为"智学网"账户设置独立且高强度的密码，并定期更换。</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
          四. 服务中断与风险
        </h2>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          本网站依赖于"智学网"官方服务的正常运行。我们不保证本网站的服务是永久、不间断或无错误的。在以下情况下，本网站可能会随时中断或终止服务，而无需提前通知：
        </p>
        <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700 dark:text-gray-300">
          <li>"智学网"官方平台进行维护、升级，或更改其服务条款、接口协议。</li>
          <li>本网站进行日常维护、升级或技术改造。</li>
          <li>出现不可抗力因素（如服务器故障、网络攻击、政策法规变更等）。</li>
        </ul>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          对于因服务中断或终止给您造成的任何不便或损失，本网站不承担任何责任。
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
          五. 有限责任
        </h2>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          在任何情况下，ZhiXue Lite
          及其开发者均不对因使用或无法使用本网站而导致的任何直接、间接、偶然、特殊或衍生的损害承担责任。这包括但不限于：数据丢失、利润损失、学业影响、商业中断等。
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
          六. 第三方服务
        </h2>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          本网站使用了包括 Google Analytics, Microsoft Clarity, Umami, Google
          AdSense
          在内的第三方服务。这些服务有其独立的隐私政策和服务条款。我们对这些第三方服务的行为、内容或隐私政策不承担任何责任。
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
          七. 声明的修改
        </h2>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          我们保留随时修改本免责声明的权利。更新后的声明将在本页面上公布，并自公布之日起生效。我们建议您定期查阅，以了解最新版本。
        </p>

        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          一旦您开始使用 ZhiXue
          Lite，即被视为您已完全理解并同意本声明中包含的各项条款。
        </p>
      </div>
    </div>
  );
};

export default DisclaimerPage;
