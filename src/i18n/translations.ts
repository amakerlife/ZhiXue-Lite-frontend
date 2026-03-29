const translations = {
  // Common
  "common.loading": { zh: "加载中...", en: "Loading..." },
  "common.search": { zh: "搜索", en: "Search" },
  "common.cancel": { zh: "取消", en: "Cancel" },
  "common.confirm": { zh: "确认", en: "Confirm" },
  "common.continue": { zh: "继续", en: "Continue" },
  "common.save": { zh: "保存", en: "Save" },
  "common.saving": { zh: "保存中...", en: "Saving..." },
  "common.edit": { zh: "修改", en: "Edit" },
  "common.delete": { zh: "删除", en: "Delete" },
  "common.saved": { zh: "已保存", en: "Saved" },
  "common.unsaved": { zh: "未保存", en: "Not saved" },
  "common.unknown": { zh: "未知", en: "Unknown" },
  "common.download": { zh: "下载", en: "Download" },
  "common.downloading": { zh: "下载中...", en: "Downloading..." },
  "common.retry": { zh: "重试连接", en: "Retry" },
  "common.verified": { zh: "已验证", en: "Verified" },
  "common.unverified": { zh: "未验证", en: "Unverified" },
  "common.allowed": { zh: "允许", en: "Allowed" },
  "common.denied": { zh: "禁止", en: "Denied" },
  "common.captchaLabel": { zh: "安全验证", en: "Security verification" },

  // Navigation / Sidebar
  "nav.home": { zh: "首页", en: "Home" },
  "nav.examList": { zh: "考试列表", en: "Exams" },
  "nav.dataViewer": { zh: "数据查看", en: "Data Viewer" },
  "nav.taskList": { zh: "任务列表", en: "Tasks" },
  "nav.adminPanel": { zh: "管理面板", en: "Admin" },
  "nav.adminUsers": { zh: "用户管理", en: "Users" },
  "nav.adminSchools": { zh: "学校管理", en: "Schools" },
  "nav.adminTeachers": { zh: "教师管理", en: "Teachers" },
  "nav.adminStudents": { zh: "学生管理", en: "Students" },
  "nav.adminExams": { zh: "考试管理", en: "Exams" },
  "nav.adminTasks": { zh: "任务管理", en: "Tasks" },
  "nav.about": { zh: "关于", en: "About" },
  "nav.profile": { zh: "个人中心", en: "Profile" },
  "nav.login": { zh: "登录", en: "Login" },
  "nav.signup": { zh: "注册", en: "Sign up" },
  "nav.verifyEmail": { zh: "邮箱验证", en: "Verify email" },
  "nav.privacyPolicy": { zh: "隐私政策", en: "Privacy policy" },
  "nav.dataDeletion": { zh: "数据删除请求", en: "Data deletion" },
  "nav.disclaimer": { zh: "免责声明", en: "Disclaimer" },

  // Header
  "header.toggleMenu": { zh: "切换菜单", en: "Toggle menu" },
  "header.connectionError": { zh: "连接异常", en: "Error" },
  "header.networkError": { zh: "网络连接异常", en: "Network error" },
  "header.cannotConnect": {
    zh: "无法连接到后端服务器",
    en: "Cannot connect to backend server",
  },
  "header.serviceStatus": { zh: "服务状态", en: "Service status" },
  "header.fetching": { zh: "正在获取...", en: "Loading..." },
  "header.switchUser": { zh: "切换用户", en: "Switch user" },
  "header.switchUserDesc": {
    zh: "输入要切换到的用户名。切换后将以该用户的身份浏览系统。",
    en: "Enter the username to switch to. You will browse the system as that user.",
  },
  "header.username": { zh: "用户名", en: "Username" },
  "header.enterUsername": { zh: "请输入用户名", en: "Enter username" },
  "header.switching": { zh: "切换中...", en: "Switching..." },
  "header.confirmSwitch": { zh: "确认切换", en: "Confirm" },
  "header.exitSu": { zh: "退出 su 模式", en: "Exit su mode" },
  "header.exitingSu": { zh: "退出中...", en: "Exiting..." },
  "header.logout": { zh: "退出登录", en: "Log out" },
  "header.switchUserFailed": { zh: "切换用户失败", en: "Failed to switch user" },
  "header.exitSuFailed": {
    zh: "退出 su 模式失败",
    en: "Failed to exit su mode",
  },

  // App-level dialogs
  "app.sessionExpired": { zh: "登录状态失效", en: "Session expired" },
  "app.sessionExpiredDesc": {
    zh: "登录状态失效，请重新登录。",
    en: "Your session has expired. Please log in again.",
  },
  "app.goToLogin": { zh: "前往登录", en: "Go to login" },
  "app.emailNotVerified": { zh: "需要验证邮箱", en: "Email verification required" },
  "app.emailNotVerifiedDesc": {
    zh: "你的邮箱尚未验证，无法访问此功能。请前往个人中心验证邮箱。",
    en: "Your email is not verified. Please verify your email in Profile to access this feature.",
  },
  "app.goToProfile": { zh: "前往个人中心", en: "Go to Profile" },

  // Login page
  "login.title": { zh: "用户登录", en: "Login" },
  "login.welcome": { zh: "欢迎回来", en: "Welcome back" },
  "login.usernameOrEmail": { zh: "用户名或邮箱", en: "Username or email" },
  "login.usernameOrEmailPlaceholder": {
    zh: "请输入用户名或邮箱",
    en: "Enter your username or email",
  },
  "login.password": { zh: "密码", en: "Password" },
  "login.passwordPlaceholder": { zh: "请输入密码", en: "Enter your password" },
  "login.submit": { zh: "登录", en: "Login" },
  "login.submitting": { zh: "登录中...", en: "Logging in..." },
  "login.useLocalAccount": {
    zh: "请使用本网站账号而非智学网账号",
    en: "Please use your ZhiXue Lite account, not your ZhiXue account",
  },
  "login.noAccount": { zh: "还没有账号？", en: "Don't have an account?" },
  "login.signupNow": { zh: "立即注册", en: "Sign up" },
  "login.captchaRequired": { zh: "请完成验证码验证", en: "Please complete CAPTCHA" },
  "login.captchaFailed": {
    zh: "验证码验证失败，请重试",
    en: "CAPTCHA verification failed, please try again",
  },
  "login.failed": { zh: "登录失败，请稍后重试", en: "Login failed, please try again later" },
  "login.pageTitle": { zh: "用户登录 - ZhiXue Lite", en: "Login - ZhiXue Lite" },

  // Signup page
  "signup.title": { zh: "用户注册", en: "Sign up" },
  "signup.subtitle": {
    zh: "创建新账号来使用 ZhiXue Lite",
    en: "Create a new account to use ZhiXue Lite",
  },
  "signup.username": { zh: "用户名", en: "Username" },
  "signup.usernamePlaceholder": { zh: "请输入用户名", en: "Enter a username" },
  "signup.email": { zh: "邮箱", en: "Email" },
  "signup.emailPlaceholder": { zh: "请输入邮箱地址", en: "Enter your email" },
  "signup.password": { zh: "密码", en: "Password" },
  "signup.passwordPlaceholder": { zh: "请输入密码", en: "Enter a password" },
  "signup.confirmPassword": { zh: "确认密码", en: "Confirm password" },
  "signup.confirmPasswordPlaceholder": {
    zh: "请再次输入密码",
    en: "Enter your password again",
  },
  "signup.submit": { zh: "注册", en: "Sign up" },
  "signup.submitting": { zh: "注册中...", en: "Signing up..." },
  "signup.localAccountNote": {
    zh: "本网站账号独立于智学网，你无须使用智学网用户名注册",
    en: "This account is separate from ZhiXue. You don't need to use your ZhiXue username.",
  },
  "signup.hasAccount": { zh: "已有账号？", en: "Already have an account?" },
  "signup.loginNow": { zh: "立即登录", en: "Log in" },
  "signup.passwordMismatch": {
    zh: "两次输入的密码不一致",
    en: "Passwords do not match",
  },
  "signup.failed": { zh: "注册失败，请稍后重试", en: "Sign up failed, please try again later" },
  "signup.pageTitle": {
    zh: "用户注册 - ZhiXue Lite",
    en: "Sign up - ZhiXue Lite",
  },

  // Home page
  "home.welcome": { zh: "欢迎 - ZhiXue Lite", en: "Welcome - ZhiXue Lite" },
  "home.stats": { zh: "系统统计", en: "Statistics" },
  "home.totalExams": { zh: "考试总数", en: "Total exams" },
  "home.totalExamsDesc": { zh: "系统中的考试总数", en: "Total exams in the system" },
  "home.totalUsers": { zh: "用户总数", en: "Total users" },
  "home.totalUsersDesc": { zh: "系统中的用户总数", en: "Total users in the system" },
  "home.totalSchools": { zh: "学校总数", en: "Total schools" },
  "home.totalSchoolsDesc": {
    zh: "系统中的学校总数",
    en: "Total schools in the system",
  },
  "home.savedExams": { zh: "已保存考试", en: "Saved exams" },
  "home.savedExamsDesc": {
    zh: "已拉取详情的考试数",
    en: "Exams with fetched details",
  },
  "home.statsFailed": { zh: "统计数据加载失败", en: "Failed to load statistics" },
  "home.features": { zh: "主要功能", en: "Features" },
  "home.examMgmt": { zh: "考试管理", en: "Exam management" },
  "home.examMgmtDesc": {
    zh: "查看和管理考试成绩，与智学网密切集成。",
    en: "View and manage exam scores, closely integrated with ZhiXue.",
  },
  "home.scoreAnalysis": { zh: "成绩分析", en: "Score analysis" },
  "home.scoreAnalysisDesc": {
    zh: "详细的成绩分析功能，包括各科成绩、排名信息等。",
    en: "Detailed score analysis including subject scores, rankings, and more.",
  },
  "home.accountMgmt": { zh: "账号管理", en: "Account management" },
  "home.accountMgmtDesc": {
    zh: "支持智学网账号绑定，确保数据安全和访问控制。",
    en: "Supports ZhiXue account binding for secure data access and control.",
  },
  "home.pageTitle": { zh: "首页 - ZhiXue Lite", en: "Home - ZhiXue Lite" },

  // Exams page
  "exams.title": { zh: "考试列表", en: "Exams" },
  "exams.subtitle": {
    zh: "仅显示已缓存的数据，如需更新请点击按钮刷新",
    en: "Showing cached data only. Click refresh to update.",
  },
  "exams.scopeSelf": { zh: "个人", en: "Personal" },
  "exams.scopeSchool": { zh: "校内", en: "School" },
  "exams.scopeAll": { zh: "全部", en: "All" },
  "exams.fetchFromZhixue": { zh: "从智学网重新获取", en: "Refresh from ZhiXue" },
  "exams.fetching": { zh: "获取中...", en: "Fetching..." },
  "exams.fetchingShort": { zh: "获取中", en: "Fetching" },
  "exams.taskPending": { zh: "等待中", en: "Pending" },
  "exams.taskProcessing": { zh: "处理中", en: "Processing" },
  "exams.taskStatusMsg": {
    zh: "此页面现在可以被安全关闭。",
    en: "You can safely close this page now.",
  },
  "exams.fetchingData": { zh: "正在获取考试数据...", en: "Fetching exam data..." },
  "exams.searchPlaceholder": { zh: "搜索考试名称...", en: "Search exams..." },
  "exams.startDate": { zh: "开始日期", en: "Start date" },
  "exams.startDatePlaceholder": { zh: "选择开始日期", en: "Select start date" },
  "exams.endDate": { zh: "结束日期", en: "End date" },
  "exams.endDatePlaceholder": { zh: "选择结束日期", en: "Select end date" },
  "exams.schoolIdFilter": { zh: "学校 ID（可选）", en: "School ID (optional)" },
  "exams.schoolIdPlaceholder": {
    zh: "输入学校 ID 进行过滤",
    en: "Enter school ID to filter",
  },
  "exams.schoolIdHint": {
    zh: "留空则显示所有学校的考试",
    en: "Leave empty to show all schools",
  },
  "exams.noData": { zh: "暂无考试数据", en: "No exam data" },
  "exams.noMatch": { zh: "没有找到匹配的考试", en: "No matching exams found" },
  "exams.noDataFor": {
    zh: (scope: string) =>
      `你还没有任何${scope === "self" ? "个人" : scope === "school" ? "校内" : ""}考试数据`,
    en: (scope: string) =>
      `You don't have any ${scope === "self" ? "personal" : scope === "school" ? "school" : ""} exam data yet`,
  },
  "exams.fetchFromZhixueBtn": { zh: "从智学网获取", en: "Fetch from ZhiXue" },
  "exams.noPermission": { zh: "权限不足", en: "Insufficient permissions" },
  "exams.noPermissionMsg": {
    zh: "你没有拉取考试数据的权限，请联系管理员",
    en: "You don't have permission to fetch exam data. Please contact admin.",
  },
  "exams.needSchoolAccess": {
    zh: "需要学校访问权限",
    en: "School access required",
  },
  "exams.needSchoolAccessMsg": {
    zh: "请先绑定智学网账号或联系管理员分配学校，然后才能获取考试数据",
    en: "Please bind your ZhiXue account or contact admin first.",
  },
  "exams.goBindAccount": { zh: "前往绑定账号", en: "Bind account" },
  "exams.jointExam": {
    zh: (count: number) => `联考 (${count} 校)`,
    en: (count: number) => `Joint (${count} schools)`,
  },
  "exams.savedPartial": {
    zh: (saved: number, total: number) => `已保存 ${saved}/${total} 校`,
    en: (saved: number, total: number) => `Saved ${saved}/${total}`,
  },
  "exams.savedSchools": { zh: "已保存:", en: "Saved:" },
  "exams.unsavedSchools": { zh: "未保存:", en: "Not saved:" },
  "exams.tapToView": { zh: "点击查看详细成绩信息", en: "Tap to view details" },
  "exams.viewDetail": { zh: "查看详情", en: "View" },
  "exams.confirmFetchTitle": {
    zh: "确认加载考试列表",
    en: "Confirm fetch exam list",
  },
  "exams.confirmFetchDesc": {
    zh: "加载考试列表可能需要一些时间，确定要继续吗？",
    en: "Fetching exam list may take a while. Continue?",
  },
  "exams.fetchFailed": { zh: "拉取考试失败", en: "Failed to fetch exams" },
  "exams.taskFailed": { zh: "任务执行失败", en: "Task failed" },
  "exams.taskStatusFailed": {
    zh: "获取任务状态失败",
    en: "Failed to get task status",
  },
  "exams.fetchListFailed": {
    zh: "获取考试列表失败",
    en: "Failed to load exam list",
  },
  "exams.needSchoolAccessTitle": {
    zh: "需要学校访问权限",
    en: "School access required",
  },
  "exams.needSchoolAccessDesc": {
    zh: "你需要先绑定智学网账号或由管理员分配学校才能使用考试列表功能。",
    en: "You need to bind your ZhiXue account or have a school assigned by admin.",
  },
  "exams.afterBinding": {
    zh: "绑定智学网账号后，你可以：",
    en: "After binding your ZhiXue account, you can:",
  },
  "exams.canViewScores": { zh: "查看考试成绩", en: "View exam scores" },
  "exams.canSyncData": { zh: "同步最新数据", en: "Sync latest data" },
  "exams.goBindZhixue": {
    zh: "前往绑定智学网账号",
    en: "Bind ZhiXue account",
  },
  "exams.pageTitle": {
    zh: "考试列表 - ZhiXue Lite",
    en: "Exams - ZhiXue Lite",
  },

  // Exam detail page
  "examDetail.backToList": { zh: "返回考试列表", en: "Back to exams" },
  "examDetail.subtitle": {
    zh: "考试详情和成绩信息",
    en: "Exam details and scores",
  },
  "examDetail.downloadScoresheet": { zh: "下载成绩单", en: "Download scoresheet" },
  "examDetail.downloadingScoresheetShort": { zh: "下载中", en: "Downloading" },
  "examDetail.scoresheetShort": { zh: "成绩单", en: "Scores" },
  "examDetail.loadLatest": { zh: "加载最新详情", en: "Fetch latest" },
  "examDetail.loadingLatest": { zh: "加载中...", en: "Loading..." },
  "examDetail.latestShort": { zh: "最新详情", en: "Fetch" },
  "examDetail.loadingShort": { zh: "加载中", en: "Loading" },
  "examDetail.fetchingTitle": {
    zh: "正在获取考试详情...",
    en: "Fetching exam details...",
  },
  "examDetail.examInfo": { zh: "考试信息", en: "Exam info" },
  "examDetail.examId": { zh: "考试 ID", en: "Exam ID" },
  "examDetail.examDate": { zh: "考试时间", en: "Exam date" },
  "examDetail.dataStatus": { zh: "数据状态", en: "Data status" },
  "examDetail.subjectCount": { zh: "科目数量", en: "Subjects" },
  "examDetail.subjectUnit": { zh: "科", en: "" },
  "examDetail.examType": { zh: "考试类型", en: "Exam type" },
  "examDetail.jointExam": { zh: "联考", en: "Joint exam" },
  "examDetail.selectSchool": { zh: "选择学校", en: "Select school" },
  "examDetail.adminLabel": { zh: "（管理员）", en: "(Admin)" },
  "examDetail.selectSchoolPlaceholder": {
    zh: "请选择要查看的学校",
    en: "Select a school",
  },
  "examDetail.selectSchoolWarning": {
    zh: "请先选择学校以查看成绩详情和导出数据",
    en: "Please select a school to view scores and export data",
  },
  "examDetail.dataIncomplete": {
    zh: "该学校的数据尚未完全保存，成绩信息可能不完整",
    en: "Data for this school is incomplete",
  },
  "examDetail.totalScore": { zh: "总分", en: "Total score" },
  "examDetail.classRank": { zh: "班级排名", en: "Class rank" },
  "examDetail.schoolRank": { zh: "年级排名", en: "Grade rank" },
  "examDetail.noteCalculated1": {
    zh: "本次考试可能为新高考六选三等模式，智学网未提供满分和总分数据。当前满分和总分仅供参考。",
    en: "This exam may use selective subjects. Full score and total are estimated.",
  },
  "examDetail.noteCalculated2": {
    zh: "本次考试可能为新高考六选三等模式，智学网未提供满分数据。当前满分仅供参考。",
    en: "This exam may use selective subjects. Full score is estimated.",
  },
  "examDetail.noteCalculated3": {
    zh: "本次考试可能为新高考六选三等模式，智学网未提供总分数据。当前总分仅供参考。",
    en: "This exam may use selective subjects. Total score is estimated.",
  },
  "examDetail.participantNote": {
    zh: "总参考人数为所有未剔除的人数，可能与实际略有出入。",
    en: "Total participants may not exactly match actual numbers.",
  },
  "examDetail.scoreDetail": { zh: "成绩详情", en: "Score details" },
  "examDetail.subject": { zh: "科目", en: "Subject" },
  "examDetail.scoreSlashFull": { zh: "得分 / 满分", en: "Score / Full" },
  "examDetail.hiddenScores": {
    zh: (subjects: string) => `${subjects}成绩已自动隐藏，`,
    en: (subjects: string) => `Scores for ${subjects} are hidden. `,
  },
  "examDetail.showHidden": { zh: "点击展示", en: "Show" },
  "examDetail.examNotExist": { zh: "考试不存在", en: "Exam not found" },
  "examDetail.unsavedTitle": { zh: "考试详情未保存", en: "Exam details not saved" },
  "examDetail.unsavedDesc": {
    zh: '此考试的详细信息尚未保存到服务器，请点击"加载最新详情"获取成绩信息',
    en: 'Exam details have not been saved yet. Click "Fetch latest" to get scores.',
  },
  "examDetail.confirmFetchTitle": {
    zh: "确认获取考试详情",
    en: "Confirm fetch exam details",
  },
  "examDetail.confirmFetchDesc": {
    zh: "获取考试详情可能需要一些时间，确定要继续吗？",
    en: "Fetching exam details may take a while. Continue?",
  },
  "examDetail.schoolIdInput": {
    zh: "学校 ID（可选，19 位数字）",
    en: "School ID (optional, 19 digits)",
  },
  "examDetail.schoolIdPlaceholder": {
    zh: "输入学校 ID 以拉取指定学校的考试数据",
    en: "Enter school ID to fetch data for a specific school",
  },
  "examDetail.schoolIdHint": {
    zh: "留空则拉取当前用户所属学校的数据",
    en: "Leave empty for your own school's data",
  },
  "examDetail.forceRefresh": {
    zh: "强制刷新（重新从智学网获取数据）",
    en: "Force refresh (re-fetch from ZhiXue)",
  },
  "examDetail.downloadTitle": { zh: "下载成绩单", en: "Download scoresheet" },
  "examDetail.downloadConfirm": {
    zh: "即将下载成绩单 Excel 文件，确定要继续吗？",
    en: "Download scoresheet as Excel file?",
  },
  "examDetail.downloadJointNote": {
    zh: "此考试为联考，请选择下载参数：",
    en: "This is a joint exam. Please select download options:",
  },
  "examDetail.downloadSelectSchool": { zh: "选择学校", en: "Select school" },
  "examDetail.downloadSelectSchoolPlaceholder": {
    zh: "请选择要下载的学校",
    en: "Select school to download",
  },
  "examDetail.exportScope": { zh: "导出范围", en: "Export scope" },
  "examDetail.scopeCurrentSchool": { zh: "仅当前学校", en: "Current school only" },
  "examDetail.scopeAllSchools": { zh: "所有参与学校", en: "All schools" },
  "examDetail.exportScopeNote": {
    zh: "导出所有学校时将包含联考中所有参与学校的成绩数据",
    en: "Exporting all schools includes score data from all participating schools",
  },
  "examDetail.fetchFailed": {
    zh: "获取考试详情失败",
    en: "Failed to load exam details",
  },
  "examDetail.fetchDetailFailed": {
    zh: "拉取考试详情失败",
    en: "Failed to fetch exam details",
  },
  "examDetail.downloadFailed": {
    zh: "下载成绩单失败",
    en: "Failed to download scoresheet",
  },
  "examDetail.pageTitle": {
    zh: (name: string) => `${name} - 考试详情 - ZhiXue Lite`,
    en: (name: string) => `${name} - Exam Detail - ZhiXue Lite`,
  },

  // Profile page
  "profile.title": { zh: "个人中心", en: "Profile" },
  "profile.subtitle": { zh: "管理账号信息和设置", en: "Manage your account" },
  "profile.accountInfo": { zh: "账号信息", en: "Account info" },
  "profile.username": { zh: "用户名", en: "Username" },
  "profile.email": { zh: "邮箱", en: "Email" },
  "profile.emailPlaceholder": { zh: "请输入新邮箱", en: "Enter new email" },
  "profile.password": { zh: "密码", en: "Password" },
  "profile.currentPasswordPlaceholder": {
    zh: "请输入当前密码",
    en: "Enter current password",
  },
  "profile.newPasswordPlaceholder": {
    zh: "请输入新密码",
    en: "Enter new password",
  },
  "profile.confirmPasswordPlaceholder": {
    zh: "请确认新密码",
    en: "Confirm new password",
  },
  "profile.role": { zh: "角色", en: "Role" },
  "profile.lastLogin": { zh: "最后登录", en: "Last login" },
  "profile.neverLogin": { zh: "从未登录", en: "Never" },
  "profile.emailNotVerifiedMsg": {
    zh: "你的邮箱尚未验证，请检查邮箱（包括垃圾邮件）并点击验证链接。",
    en: "Your email is not verified. Please check your inbox (including spam) and click the verification link.",
  },
  "profile.resendEmail": { zh: "重新发送验证邮件", en: "Resend verification email" },
  "profile.resending": { zh: "发送中...", en: "Sending..." },
  "profile.emailSameError": {
    zh: "新邮箱与当前邮箱相同",
    en: "New email is the same as current",
  },
  "profile.passwordMismatch": {
    zh: "两次输入的新密码不一致",
    en: "New passwords do not match",
  },
  "profile.passwordTooShort": {
    zh: "密码长度不能少于6位",
    en: "Password must be at least 6 characters",
  },
  "profile.currentPasswordRequired": {
    zh: "请输入当前密码",
    en: "Please enter current password",
  },
  "profile.emailUpdated": { zh: "邮箱修改成功", en: "Email updated" },
  "profile.passwordUpdated": { zh: "密码修改成功", en: "Password updated" },
  "profile.updateFailed": { zh: "修改失败", en: "Update failed" },
  "profile.userInfoIncomplete": {
    zh: "用户信息不完整",
    en: "User info incomplete",
  },
  "profile.emailSent": {
    zh: "验证邮件已发送，请检查你的邮箱（包括垃圾邮件）",
    en: "Verification email sent. Please check your inbox (including spam).",
  },
  "profile.sendFailed": { zh: "发送失败", en: "Send failed" },
  "profile.permissions": { zh: "权限信息", en: "Permissions" },
  "profile.permissionsDesc": { zh: "当前系统权限设置", en: "Current system permissions" },
  "profile.permissionNote": {
    zh: "个人 - 只能访问自己的数据； 校内 - 可访问同校数据； 全局 - 可访问所有数据。 如需调整权限，请联系管理员。",
    en: "Self - own data only; School - same school data; Global - all data. Contact admin for changes.",
  },
  "profile.permissionNoteLabel": { zh: "权限说明：", en: "Note:" },
  "profile.zhixueAccount": { zh: "智学网账号", en: "ZhiXue account" },
  "profile.zhixueDesc": {
    zh: "绑定智学网账号以查看考试数据和成绩信息",
    en: "Bind your ZhiXue account to view exam data and scores",
  },
  "profile.zhixueBound": { zh: "已绑定智学网账号", en: "ZhiXue account bound" },
  "profile.parentAccount": { zh: "家长账号", en: "Parent account" },
  "profile.zhixueUsername": { zh: "用户名:", en: "Username:" },
  "profile.zhixueName": { zh: "姓名:", en: "Name:" },
  "profile.zhixueSchool": { zh: "学校:", en: "School:" },
  "profile.unbind": { zh: "解绑", en: "Unbind" },
  "profile.teacherAccountNote": {
    zh: "关于教师账号的说明",
    en: "About teacher accounts",
  },
  "profile.bindingStatus": { zh: "账号绑定情况", en: "Binding status" },
  "profile.bindingSafe": {
    zh: "仅该账号绑定了此智学网账号，数据安全",
    en: "Only this account is bound. Data is secure.",
  },
  "profile.bindingMultiple": {
    zh: (count: number) => `此智学网账号已被 ${count} 个用户绑定：`,
    en: (count: number) => `This ZhiXue account is bound to ${count} users:`,
  },
  "profile.bindingMultipleNote": {
    zh: "请确保知悉以上信息，如有疑问请联系管理员。",
    en: "Please be aware. Contact admin if you have questions.",
  },
  "profile.manualSchool": {
    zh: "已由管理员分配学校",
    en: "School assigned by admin",
  },
  "profile.manualSchoolName": {
    zh: (name: string) => `学校: ${name}`,
    en: (name: string) => `School: ${name}`,
  },
  "profile.manualSchoolNote": {
    zh: "注意：绑定智学网账号后，此手动分配的学校将被自动清除。",
    en: "Note: Binding a ZhiXue account will replace this school assignment.",
  },
  "profile.zhixueNotBound": {
    zh: "你还未绑定智学网账号，绑定后可以查看考试数据和成绩信息。",
    en: "You haven't bound a ZhiXue account yet. Bind one to view exam data.",
  },
  "profile.bindZhixue": { zh: "绑定智学网账号", en: "Bind ZhiXue account" },
  "profile.zhixueUsernamePlaceholder": {
    zh: "请输入智学网用户名",
    en: "Enter ZhiXue username",
  },
  "profile.zhixuePasswordLabel": { zh: "智学网密码", en: "ZhiXue password" },
  "profile.zhixuePasswordPlaceholder": {
    zh: "请输入智学网密码",
    en: "Enter ZhiXue password",
  },
  "profile.zhixueUsernameLabel": { zh: "智学网用户名", en: "ZhiXue username" },
  "profile.isParent": { zh: "家长账号", en: "Parent account" },
  "profile.binding": { zh: "绑定中...", en: "Binding..." },
  "profile.confirmBind": { zh: "确认绑定", en: "Confirm" },
  "profile.bindSuccess": {
    zh: "智学网账号绑定成功！",
    en: "ZhiXue account bound successfully!",
  },
  "profile.bindFailed": { zh: "绑定失败", en: "Bind failed" },
  "profile.unbindSuccess": { zh: "智学网账号已解绑", en: "ZhiXue account unbound" },
  "profile.unbindFailed": { zh: "解绑失败", en: "Unbind failed" },
  "profile.bindConfirmTitle": {
    zh: "我们重视你的隐私和数据安全",
    en: "We value your privacy and data security",
  },
  "profile.bindConfirmManualSchoolNote": {
    zh: "注意：绑定智学网账号后，管理员为你手动分配的学校将被自动清除，改为使用智学网账号中的学校信息。",
    en: "Note: Binding a ZhiXue account will replace the admin-assigned school with the one from your ZhiXue account.",
  },
  "profile.bindConfirmBody": {
    zh: "为了验证该智学网账号属于你，并获取必要信息，我们需要使用 AES 对称加密在数据库中加密存储你的智学网密码。我们承诺管理员不会以任何方式在任何情况下获取你的智学网明文密码。",
    en: "To verify your ZhiXue account, we encrypt and store your ZhiXue password using AES encryption. Admins will never have access to your plaintext password.",
  },
  "profile.bindConfirmSecurity": {
    zh: "我们使用世界顶尖云服务商提供的服务器，禁用 root 登录，仅允许使用密钥登录，数据库服务仅在容器中暴露且本地数据仅 root 身份具有读写权限。理论上，攻击者只能通过获取一个随机生成的 256 位 Ed25519 密钥来登录服务器，或利用任意代码执行漏洞来窃取你的数据，但我们基于稳定的、经过世界上千万网站测试的一套通用技术架构打造，发生此类问题的可能性微乎其微。",
    en: "Our server uses top-tier cloud providers with SSH key-only login, containerized database access, and root-only local data permissions. The risk of unauthorized access is extremely low.",
  },
  "profile.bindConfirmDisclaimer": {
    zh: "我们不对你使用本服务而产生的任何后果负任何责任。",
    en: "We are not liable for any consequences arising from your use of this service.",
  },
  "profile.bindConfirmAgree": {
    zh: "点击确认绑定，即表示你理解并同意以上内容。",
    en: "By confirming, you agree to the above.",
  },
  "profile.unbindConfirmTitle": {
    zh: "确认解绑智学网账号",
    en: "Confirm unbind ZhiXue account",
  },
  "profile.unbindConfirmDesc": {
    zh: "确定要解绑智学网账号吗？解绑后将无法查看考试数据。",
    en: "Are you sure? You won't be able to view exam data after unbinding.",
  },
  "profile.unbindConfirmLink": {
    zh: "你可以通过填写支持表单，要求我们从数据库中删除你的智学网密码。",
    en: "You can request deletion of your ZhiXue password via our support form.",
  },
  "profile.supportForm": { zh: "支持表单", en: "support form" },
  "profile.confirmUnbind": { zh: "确认解绑", en: "Confirm unbind" },
  "profile.teacherDialogTitle": {
    zh: "关于教师账号的说明",
    en: "About teacher accounts",
  },
  "profile.teacherDialogBody1": {
    zh: "本网站依赖教师账号获取数据，但由于你的学校没有可用的教师账号，因此功能可能将受到限制。",
    en: "This site relies on teacher accounts for data. Since your school has no available teacher account, some features may be limited.",
  },
  "profile.teacherDialogBody2": {
    zh: "目前，你可能只能获取考试列表，若想查看考试详情，则需要提供至少具有查看相应考试校级报告权限的教师账号。",
    en: "Currently, you may only be able to fetch exam lists. To view exam details, a teacher account with school-level report access is needed.",
  },
  "profile.teacherDialogBody3": {
    zh: "你可以通过邮箱 zxl@makerlife.top 联系管理员申请支持或获取详细信息。",
    en: "Contact admin at zxl@makerlife.top for support.",
  },
  "profile.teacherDialogConfirm": { zh: "我知道了", en: "Got it" },
  "profile.pleaseLogin": { zh: "请先登录", en: "Please log in first" },
  "profile.pageTitle": {
    zh: "个人中心 - ZhiXue Lite",
    en: "Profile - ZhiXue Lite",
  },
} as const;

export type TranslationKey = keyof typeof translations;
export type Lang = "zh" | "en";

export default translations;
