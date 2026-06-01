const Database = require("better-sqlite3");
const db = new Database("./safety-form.db");

// 添加知识库文章
const articles = [
  {
    title: "风电大件运输基础知识",
    category: "基础知识",
    content: "风电大件运输是指风力发电设备中大型部件的运输作业，主要包括叶片、塔筒、轮毂、机舱等超大、超重货物的道路运输。本指南涵盖运输前准备、路线规划、装载固定等核心环节。",
    author: "系统管理员",
  },
  {
    title: "叶片运输标准操作规程",
    category: "操作规程",
    content: "风机叶片长度通常在50-90米之间，运输难度最大。本规程详细规定了叶片运输的装载方式、运输速度、转弯半径控制、护送车辆配置等关键要求。",
    author: "系统管理员",
  },
  {
    title: "塔筒运输安全指南",
    category: "操作规程",
    content: "塔筒是风力发电机组的支持结构，高度可达100米以上，分段运输。本指南涵盖塔筒分段标准、加固方法、坡道通过技巧、高度限制等内容。",
    author: "系统管理员",
  },
  {
    title: "机舱运输与吊装要点",
    category: "操作规程",
    content: "机舱是风力发电机组的'心脏'，包含发电机、齿轮箱等核心部件，重量通常在80-180吨。本文档介绍机舱运输的承载计算、减震措施和吊装安全要点。",
    author: "系统管理员",
  },
  {
    title: "恶劣天气运输应急预案",
    category: "应急预案",
    content: "风电场多位于偏远地区，运输过程中可能遭遇暴雨、大风、冰雪等恶劣天气。本预案明确各类天气条件下的应对措施、暂停标准、临时停放要求等。",
    author: "系统管理员",
  },
  {
    title: "超限运输许可证办理流程",
    category: "政策法规",
    content: "风电大件运输需办理超限运输许可证。本流程说明许可证申请渠道、所需材料、审批时限、路线勘验要求等，帮助运输企业合规办理。",
    author: "系统管理员",
  },
  {
    title: "夜间运输安全注意事项",
    category: "安全指南",
    content: "为避开交通高峰期，风电大件常需夜间运输。本指南涵盖夜间运输的照明要求、驾驶员轮换制度、紧急情况处置等安全要点。",
    author: "系统管理员",
  },
  {
    title: "山地风电场运输难点分析",
    category: "实战案例",
    content: "山地风电场运输面临坡度大、弯道急、路面窄等挑战。本分析基于多个山地项目经验，总结针对性解决方案和注意事项。",
    author: "系统管理员",
  },
];

// 添加事故案例
const cases = [
  {
    title: "叶片转弯时发生侧倾事故",
    case_type: "运输事故",
    description: "某运输车队在急弯路段运输叶片时，因转弯半径计算错误，导致叶片尾部刮蹭路边护栏，造成叶片表面严重损伤。",
    severity: "严重",
    causes: "路线勘察不充分，转弯半径计算有误；驾驶员经验不足，未能及时调整车速和角度。",
    lessons: "必须进行详细的路线堪察，使用专业软件模拟转弯轨迹；选择经验丰富的驾驶员。",
    prevention: "运输前必须进行详细的路线堪察，使用专业软件模拟转弯轨迹；选择经验丰富的驾驶员；必要时拆卸叶片运输支架重新定位。",
    location: "西北某风电场",
    date: "2024-08-15",
  },
  {
    title: "塔筒运输车辆侧翻",
    case_type: "运输事故",
    description: "某运输公司在山区道路运输塔筒时，因路面湿滑、紧急制动，车辆发生侧翻，塔筒受损，道路中断12小时。",
    severity: "重大",
    causes: "连续下坡路段未使用辅助制动系统；路面湿滑未降低车速；超载运行增加惯性。",
    lessons: "山区运输必须配备刹车冷却装置；雨雪天气增加跟车距离。",
    prevention: "山区运输必须配备刹车冷却装置；雨雪天气增加跟车距离，降低车速；严禁超载运行；配备应急照明和警示标志。",
    location: "西南某山区风电场",
    date: "2024-06-22",
  },
  {
    title: "机舱吊装时挂臂断裂",
    case_type: "吊装事故",
    description: "某风电场机舱吊装作业中，临时吊具挂臂突然断裂，机舱坠落受损，所幸未造成人员伤亡。",
    severity: "重大",
    causes: "吊具存在质量缺陷，未经正规检测；吊装方案未经专家论证；现场指挥协调不当。",
    lessons: "严格审查吊具资质，定期检测；吊装方案必须经专业机构论证。",
    prevention: "严格审查吊具资质，定期检测；吊装方案必须经专业机构论证；特种作业人员持证上岗；设置安全警戒区域。",
    location: "东北某风电场",
    date: "2024-05-10",
  },
  {
    title: "叶片运输途中脱落",
    case_type: "运输事故",
    description: "叶片运输过程中，固定索具松动，叶片在车厢上发生位移，所幸被护送人员及时发现并紧急处置。",
    severity: "严重",
    causes: "固定检查不彻底，长途颠簸导致紧固件松动；未配备专职押车人员。",
    lessons: "每行驶50公里必须检查一次固定情况；配备专职押车人员全程监护。",
    prevention: "每行驶50公里必须检查一次固定情况；配备专职押车人员全程监护；使用高强度专业索具并留有安全余量。",
    location: "内蒙某风电场",
    date: "2024-09-03",
  },
  {
    title: "运输车辆视野盲区碰撞行人",
    case_type: "交通事故",
    description: "某运输车队在风电场内道路行驶时，因车辆过长、转弯视野受限，刮蹭到路边骑摩托车的人员。",
    severity: "一般",
    causes: "风电场内部道路狭窄，视野受限；未安排前方引导车；行人安全意识不足。",
    lessons: "风电场内部道路设置凸面镜；配备前方引导车和警示人员。",
    prevention: "风电场内部道路设置凸面镜；配备前方引导车和警示人员；运输前发布公告，提醒周边居民。",
    location: "华北某风电场",
    date: "2024-07-18",
  },
  {
    title: "深夜运输遭遇山体滑坡",
    case_type: "自然灾害",
    description: "夜间运输途中遭遇突发山体滑坡，运输车辆被落石击中，造成车辆损坏和驾驶员轻伤。",
    severity: "严重",
    causes: "未及时获取天气预报和地质灾害预警；夜间运输难以观察道路两侧情况。",
    lessons: "加强与气象、地质部门联动；雨季避免夜间运输。",
    prevention: "加强与气象、地质部门联动；雨季避免夜间运输；配备GPS定位和紧急通讯设备；制定备用路线。",
    location: "西南山区",
    date: "2024-08-28",
  },
];

// 插入数据
const insertArticle = db.prepare(
  "INSERT INTO knowledge_articles (title, category, content, author) VALUES (?, ?, ?, ?)"
);

const insertCase = db.prepare(
  "INSERT INTO accident_cases (title, case_type, description, severity, causes, lessons, prevention, location, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

console.log("开始添加知识库文章...");
for (const article of articles) {
  insertArticle.run(article.title, article.category, article.content, article.author);
  console.log(`  + ${article.title}`);
}

console.log("\n开始添加事故案例...");
for (const c of cases) {
  insertCase.run(c.title, c.case_type, c.description, c.severity, c.causes, c.lessons, c.prevention, c.location, c.date);
  console.log(`  + ${c.title}`);
}

console.log("\n数据初始化完成！");
console.log(`  - 知识库文章: ${articles.length} 篇`);
console.log(`  - 事故案例: ${cases.length} 个`);

db.close();
