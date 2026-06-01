const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./safety-form.db');

function getChinaTimeString() {
  const now = new Date();
  const chinaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return chinaTime.toISOString().slice(0, 19).replace("T", " ");
}

// 风电大件运输安全考试题库
const questions = [
  // 单选题
  { type: 'single', question: '风机叶片运输过程中，叶尖扫摆区域的安全距离应保持在多少米以上？', options: ['2米', '5米', '10米', '15米'], answer: 2, score: 4 },
  { type: 'single', question: '塔筒运输时，车辆重心应控制在什么位置最安全？', options: ['前轴上方', '后轴上方', '中轴上方', '整个车辆中心'], answer: 2, score: 4 },
  { type: 'single', question: '超限运输车辆在高速公路上行驶时，最高时速不得超过多少？', options: ['40km/h', '60km/h', '80km/h', '100km/h'], answer: 2, score: 4 },
  { type: 'single', question: '风机叶片运输时，侧风风力超过多少级时应停止运输作业？', options: ['4级', '5级', '6级', '7级'], answer: 2, score: 4 },
  { type: 'single', question: '机舱运输时，吊装绑扎点应选择在什么位置？', options: ['重心上方', '底部', '侧面', '任意位置'], answer: 0, score: 4 },
  { type: 'single', question: '塔筒分段运输时，每段塔筒必须配备什么安全设备？', options: ['防撞垫', '绑扎链条和葫芦', '警示灯', '灭火器'], answer: 1, score: 4 },
  { type: 'single', question: '运输叶片通过弯道时，最小转弯半径应比叶片长度多出多少？', options: ['5%', '10%', '15%', '20%'], answer: 1, score: 4 },
  { type: 'single', question: '公路大件运输需要办理什么手续？', options: ['普通货运证', '超限运输许可证', '危险品运输证', '特种设备证'], answer: 1, score: 4 },
  { type: 'single', question: '叶片运输车辆在夜间行驶时，应开启什么灯光？', options: ['近光灯', '示廓灯和警示灯', '远光灯', '只需开启示廓灯'], answer: 1, score: 4 },
  { type: 'single', question: '风机主轴运输时，主要关注的安全要点是什么？', options: ['防震', '防倾斜', '防撞击', '防潮'], answer: 1, score: 4 },

  // 多选题
  { type: 'multiple', question: '风机叶片运输前的准备工作包括哪些内容？', options: ['路线勘察', '车辆检查', '叶片清洁', '绑扎固定', '天气确认'], answer: [0, 1, 3, 4], score: 6 },
  { type: 'multiple', question: '塔筒运输过程中需要重点监控哪些参数？', options: ['车速', '绑扎张力', '车辆油耗', '道路限高', '重心偏移'], answer: [0, 1, 3, 4], score: 6 },
  { type: 'multiple', question: '叶片运输通过桥梁前必须确认哪些条件？', options: ['桥梁承载能力', '桥面宽度', '驾驶员休息时间', '限高限宽', '桥梁使用寿命'], answer: [0, 1, 3], score: 6 },
  { type: 'multiple', question: '大件运输车辆应配备哪些安全装置？', options: ['警示标志', 'GPS定位', '灭火器', '倒车雷达', '防护栏'], answer: [0, 1, 2, 4], score: 6 },
  { type: 'multiple', question: '机舱卸货前需要确认哪些安全条件？', options: ['地基承载力', '吊装设备检验', '作业人员证件', '天气预报', '道路交通状况'], answer: [0, 1, 2], score: 6 },
  { type: 'multiple', question: '叶片运输中的风险包括哪些？', options: ['侧翻风险', '叶片损坏', '交通堵塞', '环境污染', '叶尖扫摆伤人'], answer: [0, 1, 4], score: 6 },
  { type: 'multiple', question: '特种大件运输车辆应具备哪些特征？', options: ['低平板', '液压升降', '转向轴', '自动挡', '宽轮胎'], answer: [0, 1, 2, 4], score: 6 },
  { type: 'multiple', question: '运输途中遇到恶劣天气时，应采取哪些措施？', options: ['就近寻找服务区停靠', '继续行驶尽快到达', '打开双闪警示灯', '人员下车避雨', '降低车速谨慎驾驶'], answer: [0, 2, 4], score: 6 },

  // 判断题
  { type: 'judge', question: '风机叶片可以竖立放置在普通货车车厢内运输。', options: ['正确', '错误'], answer: false, score: 3 },
  { type: 'judge', question: '塔筒运输时，绑扎链条的张力应保持一致且适度。', options: ['正确', '错误'], answer: true, score: 3 },
  { type: 'judge', question: '超限运输车辆在夜间可以在高速公路应急车道行驶。', options: ['正确', '错误'], answer: false, score: 3 },
  { type: 'judge', question: '机舱运输时无需考虑运输震动对设备的影响。', options: ['正确', '错误'], answer: false, score: 3 },
  { type: 'judge', question: '叶片运输通过隧道时，应提前开启车辆灯光和警示标志。', options: ['正确', '错误'], answer: true, score: 3 },
  { type: 'judge', question: '运输过程中发现绑扎松动应立即停车检查并重新绑扎。', options: ['正确', '错误'], answer: true, score: 3 },
  { type: 'judge', question: '风速超过8级时，叶片运输作业可以继续进行。', options: ['正确', '错误'], answer: false, score: 3 },
  { type: 'judge', question: '主控柜等精密设备运输时不需要额外的防震措施。', options: ['正确', '错误'], answer: false, score: 3 },
  { type: 'judge', question: '大件运输车辆应配备两名以上驾驶员轮流驾驶。', options: ['正确', '错误'], answer: true, score: 3 },
  { type: 'judge', question: '轴承座运输时可以与其他重物叠放。', options: ['正确', '错误'], answer: false, score: 3 },
];

const exam1Name = '2026年5月安全考试';
const exam2Name = '2026年6月安全考试';
const timeStr = getChinaTimeString();

// 使用同步方式执行
db.serialize(() => {
  // 删除现有考试项目
  db.run(`DELETE FROM exam_questions WHERE project_id IN (SELECT id FROM exam_projects WHERE name LIKE '2026年%月安全考试%')`);
  db.run(`DELETE FROM exam_projects WHERE name LIKE '2026年%月安全考试%'`);

  // 创建考试项目1
  db.run(
    `INSERT INTO exam_projects (name, description, pass_score, total_score, duration, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [exam1Name, '2026年5月风电大件运输安全知识考核', 80, 100, 60, 1, timeStr, timeStr]
  );

  // 创建考试项目2
  db.run(
    `INSERT INTO exam_projects (name, description, pass_score, total_score, duration, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [exam2Name, '2026年6月风电大件运输安全知识考核', 80, 100, 60, 1, timeStr, timeStr]
  );

  // 获取项目ID
  db.get(`SELECT id FROM exam_projects WHERE name = ?`, [exam1Name], (err, row) => {
    if (err) { console.error(err); return; }
    const project1Id = row.id;

    db.get(`SELECT id FROM exam_projects WHERE name = ?`, [exam2Name], (err, row) => {
      if (err) { console.error(err); return; }
      const project2Id = row.id;

      console.log(`考试项目1: ${exam1Name}, ID: ${project1Id}`);
      console.log(`考试项目2: ${exam2Name}, ID: ${project2Id}`);

      // 插入题目到项目1
      const qStmt = `INSERT INTO exam_questions (project_id, type, question, options, answer, score, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      let q1Count = 0;
      questions.forEach((q, index) => {
        db.run(qStmt, [project1Id, q.type, q.question, JSON.stringify(q.options), JSON.stringify(q.answer), q.score, index, timeStr]);
        q1Count++;
      });
      console.log(`项目1共添加 ${q1Count} 道题目`);

      // 插入题目到项目2
      let q2Count = 0;
      questions.slice().reverse().forEach((q, index) => {
        db.run(qStmt, [project2Id, q.type, q.question, JSON.stringify(q.options), JSON.stringify(q.answer), q.score, index, timeStr]);
        q2Count++;
      });
      console.log(`项目2共添加 ${q2Count} 道题目`);

      console.log('\n✅ 考试题目生成完成！');
      console.log(`📝 ${exam1Name}: ${q1Count} 道题 (单选题10道 + 多选题8道 + 判断题10道)`);
      console.log(`📝 ${exam2Name}: ${q2Count} 道题`);

      db.close();
    });
  });
});
