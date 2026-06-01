import React, { useState, useEffect, useCallback, useRef } from 'react';

// ==================== 题库接口 ====================
interface Question {
  id: number;
  type: "single" | "multiple" | "judge";
  question: string;
  options: string[];
  answer: number | number[] | boolean;
  score: number;
}

// ==================== 登记组件 ====================

function ExamRegistration({
  onStart,
  initialInfo
}: {
  onStart: (info: { company: string; name: string; position: string; projectId: number }) => void;
  initialInfo?: { company: string; name: string; position: string } | null;
}) {
  const [company, setCompany] = useState(initialInfo?.company || '');
  const [name, setName] = useState(initialInfo?.name || '');
  const [position, setPosition] = useState(initialInfo?.position || '');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch('/api/exam/projects?active=true');
        const data = await res.json();
        if (data.success) {
          setProjects(data.data);
          if (data.data.length > 0) {
            setSelectedProjectId(data.data[0].id);
          }
        }
      } catch (error) {
        console.error('加载考试项目失败', error);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !name.trim() || !position.trim() || !selectedProjectId) return;
    onStart({ company: company.trim(), name: name.trim(), position: position.trim(), projectId: selectedProjectId });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-md mt-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <div className="text-center text-steel-400">加载中...</div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="mx-auto max-w-md mt-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <div className="text-center text-steel-400">暂无可参加的考试项目，请稍后再试。</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md mt-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
        <h2 className="text-center text-2xl font-bold text-white mb-2">考生登记</h2>
        <p className="text-center text-sm text-steel-400 mb-8">请选择考试项目并填写信息开始考试</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white mb-2">选择考试项目 *</label>
            <select
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(parseInt(e.target.value))}
              required
              className="w-full rounded-xl border border-white/10 bg-navy-950/50 px-4 py-3 text-white placeholder:text-steel-500 focus:border-orange-safety focus:outline-none focus:ring-2 focus:ring-orange-safety/20"
            >
              <option value="">请选择考试项目</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          {selectedProjectId && projects.find(p => p.id === selectedProjectId) && (
            <div className="rounded-xl bg-white/5 p-4 border border-white/10">
              <div className="text-sm text-steel-400">
                <div>及格分数：<span className="text-white">{projects.find(p => p.id === selectedProjectId)?.pass_score}/{projects.find(p => p.id === selectedProjectId)?.total_score}</span></div>
                <div>考试时长：<span className="text-white">{projects.find(p => p.id === selectedProjectId)?.duration}分钟</span></div>
                {projects.find(p => p.id === selectedProjectId)?.description && (
                  <div className="mt-2">{projects.find(p => p.id === selectedProjectId)?.description}</div>
                )}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">公司名称 *</label>
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} required
              className="w-full rounded-xl border border-white/10 bg-navy-950/50 px-4 py-3 text-white placeholder:text-steel-500 focus:border-orange-safety focus:outline-none focus:ring-2 focus:ring-orange-safety/20"
              placeholder="请输入公司名称" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">姓名 *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full rounded-xl border border-white/10 bg-navy-950/50 px-4 py-3 text-white placeholder:text-steel-500 focus:border-orange-safety focus:outline-none focus:ring-2 focus:ring-orange-safety/20"
              placeholder="请输入姓名" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">岗位 *</label>
            <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} required
              className="w-full rounded-xl border border-white/10 bg-navy-950/50 px-4 py-3 text-white placeholder:text-steel-500 focus:border-orange-safety focus:outline-none focus:ring-2 focus:ring-orange-safety/20"
              placeholder="请输入岗位（如：运输司机、物流主管、安全员）" />
          </div>
          <button type="submit"
            className="w-full rounded-full bg-orange-safety py-3 text-sm font-bold text-navy-950 shadow-lg shadow-orange-safety/25 transition hover:bg-orange-safetyLight"
          >
            开始考试
          </button>
        </form>
      </div>
    </div>
  );
}

// ==================== 答题组件 ====================

interface AnswerMap {
  [questionId: number]: number | number[] | boolean;
}

function ExamQuiz({
  questions,
  answers,
  onAnswerChange,
  onSubmit,
  timeLeft,
  questionNumbers,
}: {
  questions: Question[];
  answers: AnswerMap;
  onAnswerChange: (qid: number, value: number | number[] | boolean) => void;
  onSubmit: () => void;
  timeLeft: number;
  questionNumbers: Map<number, number>;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const currentQ = questions[currentIdx];

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const answeredCount = questions.filter((q) => {
    const a = answers[q.id];
    if (a === undefined || a === null) return false;
    if (Array.isArray(a)) return a.length > 0;
    return true;
  }).length;

  const isAllAnswered = answeredCount === questions.length;

  // 计算倒计时百分比
  const totalSec = (timeLeft + (questions.length > 0 ? 0 : 0)) || 3600;
  const pct = Math.max(0, (timeLeft / totalSec) * 100);
  const timeWarning = timeLeft < 300;

  // 处理答案变更
  const handleSingle = (val: number) => onAnswerChange(currentQ.id, val);
  const handleMultiple = (optIdx: number) => {
    const prev: number[] = (answers[currentQ.id] as number[]) || [];
    const next = prev.includes(optIdx) ? prev.filter((i) => i !== optIdx) : [...prev, optIdx];
    onAnswerChange(currentQ.id, next);
  };
  const handleJudge = (val: boolean) => onAnswerChange(currentQ.id, val);

  const getAnswered = (q: Question): boolean => {
    const a = answers[q.id];
    if (a === undefined || a === null) return false;
    if (Array.isArray(a)) return a.length > 0;
    return true;
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* 顶部倒计时 + 进度条 */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-steel-400">
            已答 <span className="text-white font-bold">{answeredCount}</span> / {questions.length} 题
          </span>
          <span className={`text-sm font-mono font-bold ${timeWarning ? "text-red-400 animate-pulse" : "text-cyan-wind"}`}>
            ⏱ {formatTime(timeLeft)}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-cyan-wind transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex gap-6">
        {/* 题号导航（侧边栏） */}
        <div className="hidden md:block w-32 shrink-0">
          <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, idx) => {
                const isCurrent = currentQ.id === q.id;
                const answered = getAnswered(q);
                return (
                  <button key={q.id} onClick={() => setCurrentIdx(idx)}
                    className={`h-7 w-7 rounded-lg text-[11px] font-bold transition ${
                      isCurrent
                        ? "bg-orange-safety text-navy-950"
                        : answered
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-white/5 text-steel-400 border border-white/10 hover:border-orange-safety/50"
                    }`}>
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2 text-[10px] text-steel-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-green-500/40" /> 已答
                <span className="ml-2 h-2.5 w-2.5 rounded-sm bg-white/10" /> 未答
              </div>
            </div>
          </div>
        </div>

        {/* 题目主体 */}
        <div className="flex-1 min-w-0">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
            {/* 题型标签 */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                currentQ.type === "single" ? "bg-blue-500/20 text-blue-400" :
                currentQ.type === "multiple" ? "bg-purple-500/20 text-purple-400" :
                "bg-amber-500/20 text-amber-400"
              }`}>
                {currentQ.type === "single" ? "单选题" : currentQ.type === "multiple" ? "多选题" : "判断题"}
              </span>
              <span className="text-xs text-steel-500">
                {currentQ.score} 分
              </span>
              <span className="text-xs text-steel-500">
                第 {currentIdx + 1} / {questions.length} 题
              </span>
            </div>

            {/* 题目 */}
            <h3 className="text-lg font-bold text-white mb-6 leading-relaxed">
              {currentQ.question}
            </h3>

            {/* 选项 */}
            <div className="space-y-3">
              {currentQ.type === "judge" ? (
                currentQ.options.map((opt, idx) => {
                  const val = idx === 0;
                  const isSelected = answers[currentQ.id] === val;
                  return (
                    <button key={idx} onClick={() => handleJudge(val)}
                      className={
                        "w-full rounded-xl border px-5 py-4 text-left text-sm font-medium transition " +
                        (isSelected
                          ? "border-orange-safety bg-orange-safety/15 text-orange-safety"
                          : "border-white/10 bg-white/5 text-steel-300 hover:border-orange-safety/40 hover:bg-orange-safety/5")
                      }>
                      {opt}
                    </button>
                  );
                })
              ) : currentQ.type === "single" ? (
                currentQ.options.map((opt, idx) => {
                  const isSelected = answers[currentQ.id] === idx;
                  return (
                    <button key={idx} onClick={() => handleSingle(idx)}
                      className={
                        "w-full rounded-xl border px-5 py-4 text-left text-sm font-medium transition " +
                        (isSelected
                          ? "border-orange-safety bg-orange-safety/15 text-orange-safety"
                          : "border-white/10 bg-white/5 text-steel-300 hover:border-orange-safety/40 hover:bg-orange-safety/5")
                      }>
                      <span className={
                        "inline-flex items-center justify-center w-6 h-6 rounded-full border text-xs mr-3 shrink-0 " +
                        (isSelected ? "border-orange-safety bg-orange-safety text-navy-950" : "border-white/20 text-steel-400")
                      }>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {opt}
                    </button>
                  );
                })
              ) : (
                currentQ.options.map((opt, idx) => {
                  const selected: number[] = (answers[currentQ.id] as number[]) || [];
                  const isSelected = selected.includes(idx);
                  return (
                    <button key={idx} onClick={() => handleMultiple(idx)}
                      className={`w-full rounded-xl border px-5 py-4 text-left text-sm font-medium transition ${
                        isSelected
                          ? "border-purple-500 bg-purple-500/15 text-purple-400"
                          : "border-white/10 bg-white/5 text-steel-300 hover:border-purple-500/40 hover:bg-purple-500/5"
                      }`}>
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs mr-3 shrink-0 ${
                        isSelected ? "bg-purple-500 text-white" : "border border-white/20 text-steel-400"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {opt}
                    </button>
                  );
                })
              )}
            </div>

            {/* 导航按钮 */}
            <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/10">
              <button onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0}
                className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                上一题
              </button>

              {currentIdx < questions.length - 1 ? (
                <button onClick={() => setCurrentIdx(currentIdx + 1)}
                  className="rounded-full bg-orange-safety px-5 py-2 text-sm font-bold text-navy-950 shadow-lg shadow-orange-safety/25 transition hover:bg-orange-safetyLight"
                >
                  下一题
                </button>
              ) : (
                <button onClick={onSubmit} disabled={!isAllAnswered}
                  className={`rounded-full px-6 py-2.5 text-sm font-bold transition ${
                    isAllAnswered
                      ? "bg-green-500 text-white shadow-lg shadow-green-500/25 hover:bg-green-400"
                      : "bg-white/10 text-steel-500 cursor-not-allowed"
                  }`}>
                  交卷
                </button>
              )}
            </div>

            {currentIdx === questions.length - 1 && !isAllAnswered && (
              <p className="mt-3 text-center text-xs text-steel-500">
                请先完成所有题目再交卷（剩余 {questions.length - answeredCount} 题未答）
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 底部移动端题号 */}
      <div className="mt-4 md:hidden">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
          <div className="flex flex-wrap gap-1.5 justify-center">
            {questions.map((q, idx) => {
              const isCurrent = currentQ.id === q.id;
              const answered = getAnswered(q);
              return (
                <button key={q.id} onClick={() => setCurrentIdx(idx)}
                  className={`h-7 w-7 rounded-lg text-[11px] font-bold transition ${
                    isCurrent
                      ? "bg-orange-safety text-navy-950"
                      : answered
                        ? "bg-green-500/20 text-green-400"
                        : "bg-white/5 text-steel-400 border border-white/10"
                  }`}>
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 结果组件 ====================

interface ExamRecord {
  id: number;
  score: number;
  total_score: number;
  duration: number;
  passed: number;
  created_at: string;
}

function ExamResult({
  score,
  duration,
  questions,
  answers,
  userInfo,
  projectId,
  onRetry,
  onBackToStudy,
}: {
  score: number;
  duration: number;
  questions: Question[];
  answers: AnswerMap;
  userInfo: { company: string; name: string; position: string };
  projectId: number;
  onRetry: () => void;
  onBackToStudy: () => void;
}) {
  const [historyRecords, setHistoryRecords] = useState<ExamRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // 加载历史考试记录
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`/api/exam/records?projectId=${projectId}&name=${encodeURIComponent(userInfo.name)}`);
        const data = await res.json();
        if (data.success) {
          setHistoryRecords(data.data);
        }
      } catch (error) {
        console.error('加载历史记录失败', error);
      }
    }
    if (projectId && userInfo?.name) {
      loadHistory();
    }
  }, [projectId, userInfo]);

  const passed = score >= (questions.reduce((sum, q) => sum + q.score, 0) * 0.8);
  const totalScore = questions.reduce((sum, q) => sum + q.score, 0);

  const wrongQuestions = questions.filter((q) => {
    const userAns = answers[q.id];
    if (userAns === undefined || userAns === null) return true;
    if (Array.isArray(userAns)) {
      const correct = q.answer as number[];
      if (userAns.length !== correct.length) return true;
      return !userAns.every((v) => correct.includes(v));
    }
    return userAns !== q.answer;
  });

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}分${sec}秒`;
  };

  const answerLabel = (q: Question, ans: number | number[] | boolean | undefined): string => {
    if (ans === undefined || ans === null) return "未作答";
    if (q.type === "judge") return ans ? "正确" : "错误";
    if (Array.isArray(ans)) return ans.map((i) => String.fromCharCode(65 + i)).join("、");
    return String.fromCharCode(65 + ans);
  };

  return (
    <div className="mx-auto max-w-3xl mt-6">
      {/* 得分卡片 */}
      <div className={`rounded-3xl border p-8 text-center backdrop-blur-sm ${
        passed ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
      }`}>
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
          passed ? "bg-green-500/20" : "bg-red-500/20"
        }`}>
          <span className={`text-4xl font-black ${passed ? "text-green-400" : "text-red-400"}`}>
            {passed ? "✓" : "✗"}
          </span>
        </div>
        <h2 className={`text-3xl font-black mb-2 ${passed ? "text-green-400" : "text-red-400"}`}>
          {passed ? "考试通过" : "考试未通过"}
        </h2>
        <div className="mt-6 inline-block rounded-2xl border border-white/10 bg-white/5 px-8 py-4">
          <span className="text-5xl font-black text-white">{score}</span>
          <span className="text-lg text-steel-400 ml-1">/ {totalScore} 分</span>
        </div>
      </div>

      {/* 考试信息 */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm text-center">
          <div className="text-xs text-steel-500 mb-1">用时</div>
          <div className="text-lg font-bold text-white">{formatDuration(duration)}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm text-center">
          <div className="text-xs text-steel-500 mb-1">正确率</div>
          <div className="text-lg font-bold text-white">{Math.round((score / totalScore) * 100)}%</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm text-center">
          <div className="text-xs text-steel-500 mb-1">考生</div>
          <div className="text-sm font-bold text-white truncate">{userInfo.name}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm text-center">
          <div className="text-xs text-steel-500 mb-1">公司</div>
          <div className="text-sm font-bold text-white truncate">{userInfo.company}</div>
        </div>
      </div>

      {/* 错题回顾 */}
      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-white mb-4">
          错题回顾（{wrongQuestions.length} 题）
        </h3>
        {wrongQuestions.length === 0 ? (
          <p className="text-steel-400 text-sm">全部正确，无错题！</p>
        ) : (
          <div className="space-y-4">
            {wrongQuestions.map((q) => (
              <div key={q.id} className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    q.type === "single" ? "bg-blue-500/20 text-blue-400" :
                    q.type === "multiple" ? "bg-purple-500/20 text-purple-400" :
                    "bg-amber-500/20 text-amber-400"
                  }`}>
                    {q.type === "single" ? "单选" : q.type === "multiple" ? "多选" : "判断"}
                  </span>
                  <span className="text-xs text-steel-500">{q.score}分</span>
                </div>
                <p className="text-sm text-white font-medium mb-2">{q.question}</p>
                <p className="text-sm text-steel-400">
                  你的答案：{answerLabel(q, answers[q.id])}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 历史考试记录 */}
      {historyRecords.length > 0 && (
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-lg font-bold text-white">
              历史成绩（{historyRecords.length} 次）
            </h3>
            <span className="text-steel-400">
              {showHistory ? '收起' : '查看'}
            </span>
          </button>
          {showHistory && (
            <div className="mt-4 space-y-2">
              {historyRecords.map((record, index) => (
                <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-steel-500">#{index + 1}</span>
                    <span className="text-sm text-steel-400">
                      {new Date(record.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-bold ${record.passed ? 'text-green-400' : 'text-red-400'}`}>
                      {record.score}/{record.total_score} 分
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      record.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {record.passed ? '通过' : '未通过'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 重新考试 */}
      <div className="mt-8 flex gap-4">
        {passed ? (
          <button onClick={onBackToStudy}
            className="flex-1 rounded-full bg-white/10 py-3.5 text-sm font-bold text-white border border-white/20 shadow-lg transition hover:bg-white/20"
          >
            返回学习
          </button>
        ) : (
          <button onClick={onRetry}
            className="flex-1 rounded-full bg-orange-safety py-3.5 text-sm font-bold text-navy-950 shadow-lg shadow-orange-safety/25 transition hover:bg-orange-safetyLight"
          >
            重新考试
          </button>
        )}
      </div>
    </div>
  );
}

// ==================== 主组件 ====================

export function ExamSystem() {
  const [phase, setPhase] = useState<"register" | "exam" | "result">("register");
  const [userInfo, setUserInfo] = useState<{ company: string; name: string; position: string } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [score, setScore] = useState(0);
  const [duration, setDuration] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [savedUserInfo, setSavedUserInfo] = useState<{ company: string; name: string; position: string } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 开始考试
  const handleStart = async (info: { company: string; name: string; position: string; projectId: number }) => {
    setLoading(true);
    try {
      // 加载项目信息和题目
      const res = await fetch(`/api/exam/projects/${info.projectId}`);
      const data = await res.json();
      if (data.success) {
        setCurrentProject(data.data);
        // 转换题目格式
        const formattedQuestions = data.data.questions.map((q: any) => ({
          id: q.id,
          type: q.type,
          question: q.question,
          options: q.type !== 'judge' ? JSON.parse(q.options) : ['正确', '错误'],
          answer: JSON.parse(q.answer),
          score: q.score
        }));
        setQuestions(formattedQuestions);
        setTimeLeft(data.data.duration * 60);
        setUserInfo({ company: info.company, name: info.name, position: info.position });
        setAnswers({});
        setPhase("exam");
      }
    } catch (error) {
      console.error('加载考试失败', error);
    } finally {
      setLoading(false);
    }
  };

  // 倒计时
  useEffect(() => {
    if (phase !== "exam") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // 交卷
  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    const actualDuration = currentProject ? (currentProject.duration * 60 - timeLeft) : (3600 - timeLeft);
    setDuration(actualDuration);

    // 计分
    let total = 0;
    for (const q of questions) {
      const userAns = answers[q.id];
      if (userAns === undefined || userAns === null) continue;
      if (Array.isArray(userAns)) {
        const correct = q.answer as number[];
        if (userAns.length === correct.length && userAns.every((v) => correct.includes(v))) {
          total += q.score;
        }
      } else if (q.type === "judge") {
        if (userAns === q.answer) total += q.score;
      } else {
        if (userAns === q.answer) total += q.score;
      }
    }
    setScore(total);

    // 保存考试记录
    try {
      await fetch('/api/exam/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: currentProject?.id,
          company: userInfo?.company,
          name: userInfo?.name,
          position: userInfo?.position,
          score: total,
          total_score: questions.reduce((sum, q) => sum + q.score, 0),
          duration: actualDuration,
          passed: total >= (questions.reduce((sum, q) => sum + q.score, 0) * 0.8),
          answers: answers
        })
      });

      // 保存用户信息，以便重考时复用
      if (userInfo) {
        setSavedUserInfo(userInfo);
      }
    } catch (error) {
      console.error('保存考试记录失败', error);
    }

    setPhase("result");
    setSubmitting(false);
  }, [answers, questions, timeLeft, userInfo, currentProject, submitting]);

    // 重新考试
    const handleRetry = () => {
      setPhase("register");
      setQuestions([]);
      setAnswers({});
      setTimeLeft(3600);
      setScore(0);
      setDuration(0);
    };

    // 返回学习页面
    const handleBackToStudy = () => {
      window.location.href = '/';
    };

  // 答案变更
  const handleAnswerChange = (qid: number, value: number | number[] | boolean) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-md mt-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <div className="text-center text-steel-400">加载中...</div>
        </div>
      </div>
    );
  }

  if (phase === "register") {
    return <ExamRegistration onStart={handleStart} initialInfo={savedUserInfo} />;
  }

  if (phase === "exam") {
    return (
      <ExamQuiz
        questions={questions}
        answers={answers}
        onAnswerChange={handleAnswerChange}
        onSubmit={handleSubmit}
        timeLeft={timeLeft}
        questionNumbers={new Map()}
      />
    );
  }

  return (
    <ExamResult
      score={score}
      duration={duration}
      questions={questions}
      answers={answers}
      userInfo={userInfo!}
      projectId={currentProject?.id}
      onRetry={handleRetry}
      onBackToStudy={handleBackToStudy}
    />
  );
}
