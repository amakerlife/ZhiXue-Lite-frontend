import React, { useEffect } from 'react';

const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    document.title = '隐私政策 - ZhiXue Lite';
    return () => {
      document.title = 'ZhiXue Lite';
    };
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">ZhiXue Lite 隐私政策</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8"><strong>最后更新于：2025 年 8 月 30 日</strong></p>

        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">欢迎您使用 ZhiXue Lite！ZhiXue Lite 是一款旨在为您提供更美观、便捷的方式来获取和展示您在智学网上的考试成绩数据的应用程序。我们深知个人信息对您的重要性，并会尽全力保护您的个人信息安全可靠。我们致力于维持您对我们的信任，恪守以下原则，保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最少够用原则、确保安全原则、主体参与原则、公开透明原则等。</p>

        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">本隐私政策将帮助您了解以下内容：</p>
        <ol className="list-decimal list-inside space-y-2 mb-6 text-gray-700 dark:text-gray-300">
          <li>我们如何收集和使用您的个人信息</li>
          <li>我们如何使用 Cookie 和同类技术</li>
          <li>我们如何共享、转让、公开披露您的个人信息</li>
          <li>我们如何保护您的个人信息</li>
          <li>您的权利</li>
          <li>我们如何处理未成年人的个人信息</li>
          <li>本隐私政策如何更新</li>
          <li>如何联系我们</li>
        </ol>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-8">请在使用我们的产品（或服务）前，仔细阅读并了解本《隐私政策》。</p>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">一、 我们如何收集和使用您的个人信息</h2>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">个人信息是指以电子或者其他方式记录的能够单独或者与其他信息结合识别特定自然人身份或者反映特定自然人活动情况的各种信息。ZhiXue Lite 会出于本政策所述的以下目的，收集和使用您的个人信息：</p>

        <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mt-6 mb-3">1. 向您提供产品或服务</h3>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4"><strong>智学网账户信息：</strong>当您使用 ZhiXue Lite 时，我们需要您提供您的智学网账户信息（包括用户名、密码，以及可能的学生姓名和准考证号）以便于我们从智学网获取您的考试成绩数据。您的凭据将仅用于登录智学网获取数据和验证身份。</p>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4"><strong>成绩数据：</strong>我们的核心功能是为您展示您的考试成绩，因此我们会通过智学网的接口获取您的考试成绩、试卷分析、原始答题卡等相关数据。这些数据将仅用于在应用内向您展示。</p>

        <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mt-6 mb-3">2. 优化我们的产品和服务</h3>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">为了改善我们的产品并为您提供更好的服务，我们会使用一些第三方分析工具来收集您在使用 ZhiXue Lite 过程中的一些信息。这些信息是匿名的，无法与您的个人身份信息直接关联。我们使用的第三方服务包括：</p>
        <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700 dark:text-gray-300">
          <li><strong>Google Analytics：</strong>我们可能使用 Google Analytics 来了解我们的用户是如何使用 ZhiXue Lite 的。Google Analytics 会收集您的设备信息、浏览器类型、操作系统、IP 地址以及您在应用内的操作行为（例如点击了哪些按钮、访问了哪些页面）。 Google 会利用这些信息来提升用户体验和改善服务质量。</li>
          <li><strong>Microsoft Clarity：</strong>我们可能使用 Microsoft Clarity 来更好地理解用户需求，并通过会话重放和热图等功能来优化和改进我们的产品。Clarity 会自动检测并遮盖可能包含个人身份信息 (PII) 的数据，以保护您的隐私。</li>
          <li><strong>Umami：</strong>Umami 是一款注重隐私的开源网站分析工具。它默认不使用 Cookie，并且会对 IP 地址进行匿名化处理，以保护访客的隐私。 我们可能使用 Umami 来统计网站的总体使用情况。</li>
        </ul>

        <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mt-6 mb-3">3. 广告服务</h3>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4"><strong>Google AdSense：</strong>为了维持 ZhiXue Lite 的运营，我们可能会使用 Google AdSense 来展示广告。Google AdSense 会使用 Cookie 等技术来收集您的信息，以便向您展示更具相关性的广告。 Google 会遵照其隐私权政策来使用通过个性化广告收集的用户信息。</p>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">二、 我们如何使用 Cookie 和同类技术</h2>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">为确保网站正常运转，我们会在您的计算机或移动设备上存储名为 Cookie 的小数据文件。Cookie 通常包含标识符、站点名称以及一些号码和字符。借助于 Cookie，网站能够存储您的偏好等数据。</p>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">我们不会将 Cookie 用于本政策所述目的之外的任何用途。您可根据自己的偏好管理或删除 Cookie。有关详情，请参见 AboutCookies.org。您可以清除计算机上保存的所有 Cookie，大部分网络浏览器都设有阻止 Cookie 的功能。但如果您这么做，则需要在每一次访问我们的网站时亲自更改用户设置。</p>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">三、 我们如何共享、转让、公开披露您的个人信息</h2>

        <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mt-6 mb-3">1. 共享</h3>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">我们不会与 ZhiXue Lite 服务提供者以外的公司、组织和个人共享您的个人信息，但以下情况除外：</p>
        <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700 dark:text-gray-300">
          <li><strong>在获取明确同意的情况下共享：</strong>获得您的明确同意后，我们会与其他方共享您的个人信息。</li>
          <li>我们可能会根据法律法规规定，或按政府主管部门的强制性要求，对外共享您的个人信息。</li>
          <li><strong>与授权合作伙伴共享：</strong>仅为实现本政策中声明的目的，我们的某些服务将由授权合作伙伴提供。我们可能会与合作伙伴共享您的某些个人信息，以提供更好的客户服务和用户体验。我们仅会出于合法、正当、必要、特定、明确的目的共享您的个人信息，并且只会共享提供服务所必要的个人信息。我们的合作伙伴无权将共享的个人信息用于任何其他用途。</li>
        </ul>

        <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mt-6 mb-3">2. 转让</h3>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">我们不会将您的个人信息转让给任何公司、组织和个人，但以下情况除外：</p>
        <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700 dark:text-gray-300">
          <li><strong>在获取明确同意的情况下转让：</strong>获得您的明确同意后，我们会向其他方转让您的个人信息。</li>
          <li>在涉及合并、收购或破产清算时，如涉及到个人信息转让，我们会在要求新的持有您个人信息的公司、组织继续受此隐私政策的约束，否则我们将要求该公司、组织重新向您征求授权同意。</li>
        </ul>

        <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mt-6 mb-3">3. 公开披露</h3>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">我们仅会在以下情况下，公开披露您的个人信息：</p>
        <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700 dark:text-gray-300">
          <li>获得您明确同意后。</li>
          <li><strong>基于法律的披露：</strong>在法律、法律程序、诉讼或政府主管部门强制性要求的情况下，我们可能会公开披露您的个人信息。</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">四、 我们如何保护您的个人信息</h2>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">我们已使用符合业界标准的安全防护措施保护您提供的个人信息，防止数据遭到未经授权访问、公开披露、使用、修改、损坏或丢失。我们会采取一切合理可行的措施，保护您的个人信息。</p>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">五、 您的权利</h2>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">按照中国相关的法律、法规、标准，以及其他国家、地区的通行做法，我们保障您对自己的个人信息行使以下权利：</p>
        <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700 dark:text-gray-300">
          <li><strong>访问您的个人信息：</strong>您有权访问您的个人信息，法律法规规定的例外情况除外。</li>
          <li><strong>更正您的个人信息：</strong>当您发现我们处理的关于您的个人信息有错误时，您有权要求我们做出更正。</li>
          <li><strong>删除您的个人信息：</strong>在以下情形中，您可以向我们提出删除个人信息的请求：
            <ul className="list-disc list-inside space-y-1 ml-6 mt-2 text-gray-700 dark:text-gray-300">
              <li>如果我们处理个人信息的行为违反法律法规；</li>
              <li>如果我们收集、使用您的个人信息，却未征得您的同意；</li>
              <li>如果我们处理个人信息的行为违反了与您的约定；</li>
              <li>如果您不再使用我们的产品或服务，或您注销了账号；</li>
              <li>如果我们不再为您提供产品或服务。</li>
            </ul>
          </li>
          <li><strong>改变您授权同意的范围：</strong>每个业务功能需要一些基本的个人信息才能得以完成。对于额外收集的个人信息的收集和使用，您可以随时给予或收回您的授权同意。</li>
          <li><strong>个人信息主体注销账户：</strong>您随时可注销此前注册的账户。</li>
          <li><strong>个人信息主体获取个人信息副本：</strong>您有权获取您的个人信息副本。</li>
          <li><strong>响应您的上述请求：</strong>为保障安全，您可能需要提供书面请求，或以其他方式证明您的身份。我们可能会先要求您验证自己的身份，然后再处理您的请求。</li>
        </ul>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">在以下情形中，我们将无法响应您的请求：</p>
        <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700 dark:text-gray-300">
          <li>与国家安全、国防安全直接相关的；</li>
          <li>与公共安全、公共卫生、重大公共利益直接相关的；</li>
          <li>与犯罪侦查、起诉、审判和判决执行等直接相关的；</li>
          <li>有充分证据表明您存在主观恶意或滥用权利的；</li>
          <li>响应您的请求将导致您或其他个人、组织的合法权益受到严重损害的；</li>
          <li>涉及商业秘密的。</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">六、 我们如何处理未成年人的个人信息</h2>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">未满 14 周岁的未成年人需要在父母或其他监护人共同阅读并同意后，方可使用我们的产品、网站和服务。</p>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">对于经父母同意而收集儿童个人信息的情况，我们只会在受到法律允许、父母或监护人明确同意或者保护儿童所必要的情况下使用或公开披露此信息。</p>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">七、 本隐私政策如何更新</h2>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">我们的隐私政策可能变更。未经您明确同意，我们不会削减您按照本隐私政策所应享有的权利。我们会在本页面上发布对本政策所做的任何变更。</p>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">对于重大变更，我们还会提供更为显著的通知。</p>

        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">八、 如何联系我们</h2>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">如果您对本隐私政策有任何疑问、意见或建议，请通过以下方式与我们联系：</p>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">zxl@makerlife.top</p>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-4">我们将尽快审核所涉问题，并将在验证您的用户身份后的十五个工作日内予以回复。</p>

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
