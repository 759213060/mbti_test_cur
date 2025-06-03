import { sdk } from "@farcaster/frame-sdk";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useSignMessage } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import Particles from "react-tsparticles";
import { loadLinksPreset } from "tsparticles-preset-links";
import "./index.css";
import useSound from "use-sound";
import type { Engine } from "tsparticles-engine";

// SVG插画组件
function MBTIArt() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{margin: '0 auto 18px auto', display: 'block'}}>
      <ellipse cx="60" cy="60" rx="56" ry="56" fill="#f3eaff" fillOpacity="0.45"/>
      <ellipse cx="60" cy="60" rx="44" ry="44" fill="#a777e3" fillOpacity="0.18"/>
      <ellipse cx="60" cy="60" rx="32" ry="32" fill="#fff" fillOpacity="0.7"/>
      <circle cx="60" cy="60" r="18" fill="#a777e3" fillOpacity="0.9"/>
      <ellipse cx="60" cy="60" rx="10" ry="16" fill="#fff" fillOpacity="0.9"/>
      <ellipse cx="60" cy="60" rx="5" ry="8" fill="#a777e3" fillOpacity="0.7"/>
    </svg>
  );
}

const mbtiQuestions = [
  {
    question: "你更喜欢哪种社交方式？",
    options: [
      { text: "和很多人一起热闹地聚会", value: "E" },
      { text: "和一两个朋友安静地聊天", value: "I" },
    ],
  },
  {
    question: "你在新环境中通常？",
    options: [
      { text: "主动结识新朋友", value: "E" },
      { text: "等待别人来接近你", value: "I" },
    ],
  },
  {
    question: "你更倾向于关注？",
    options: [
      { text: "现实和细节", value: "S" },
      { text: "想象和可能性", value: "N" },
    ],
  },
  {
    question: "你记忆事情时更容易记住？",
    options: [
      { text: "具体的事实和细节", value: "S" },
      { text: "整体印象和意义", value: "N" },
    ],
  },
  {
    question: "你做决定时更看重？",
    options: [
      { text: "逻辑和客观", value: "T" },
      { text: "感受和主观", value: "F" },
    ],
  },
  {
    question: "遇到冲突时你更？",
    options: [
      { text: "坚持原则", value: "T" },
      { text: "照顾他人感受", value: "F" },
    ],
  },
  {
    question: "你更喜欢哪种生活方式？",
    options: [
      { text: "有计划有条理", value: "J" },
      { text: "灵活随性", value: "P" },
    ],
  },
  {
    question: "面对突发事件时你更？",
    options: [
      { text: "按计划应对", value: "J" },
      { text: "随机应变", value: "P" },
    ],
  },
  {
    question: "你更喜欢的工作环境是？",
    options: [
      { text: "结构清晰、规则明确", value: "J" },
      { text: "自由灵活、变化多", value: "P" },
    ],
  },
  {
    question: "你更容易被什么吸引？",
    options: [
      { text: "新奇的想法和创意", value: "N" },
      { text: "实际可行的方案", value: "S" },
    ],
  },
  {
    question: "你更喜欢表达？",
    options: [
      { text: "直接坦率", value: "T" },
      { text: "委婉含蓄", value: "F" },
    ],
  },
  {
    question: "你更喜欢的聚会？",
    options: [
      { text: "热闹非凡", value: "E" },
      { text: "温馨小圈子", value: "I" },
    ],
  },
];

const mbtiTypes = {
  ESTJ: "执行者 | 现实主义者，擅长组织和管理，注重效率和规则。",
  ESFJ: "照顾者 | 热情友好，乐于助人，重视和谐与团队合作。",
  ENFJ: "主人公 | 富有同理心，善于激励他人，具备领导魅力。",
  ENTJ: "指挥官 | 战略家，目标导向，善于规划和决策。",
  ISTJ: "检查员 | 可靠务实，注重细节，责任心强。",
  ISFJ: "守护者 | 体贴温和，乐于奉献，重视传统。",
  INFJ: "提倡者 | 理想主义者，富有洞察力，关心他人。",
  INTJ: "策划者 | 独立思考，善于分析，追求卓越。",
  ESTP: "冒险家 | 充满活力，喜欢挑战，善于应变。",
  ESFP: "表演者 | 热情洋溢，享受生活，乐于表达。",
  ENFP: "竞选者 | 创意丰富，乐观开朗，善于激励。",
  ENTP: "辩论家 | 机智幽默，善于创新，喜欢辩论。",
  ISTP: "工匠 | 实用主义者，动手能力强，喜欢探索。",
  ISFP: "艺术家 | 温柔敏感，追求美感，享受当下。",
  INFP: "调停者 | 富有理想，善解人意，追求和谐。",
  INTP: "逻辑学家 | 理性客观，喜欢思考，追求真理。",
};

const resultBgMap: Record<string, string> = {
  E: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
  I: "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)",
  S: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  N: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
  T: "linear-gradient(135deg, #f857a6 0%, #ff5858 100%)",
  F: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  J: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  P: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
};

function App() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  const [showTest, setShowTest] = useState(false);

  // 粒子动效配置
  const particlesInit = async (main: Engine) => {
    await loadLinksPreset(main);
  };

  return (
    <div className="mbti-app-bg" style={{position: 'relative', overflow: 'hidden'}}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          preset: "links",
          background: { color: "transparent" },
          fullScreen: { enable: false },
          particles: {
            color: { value: ["#a777e3", "#6e8efb", "#ffd200"] },
            links: { enable: true, color: "#fff", opacity: 0.18 },
            move: { enable: true, speed: 1.2 },
            opacity: { value: 0.25 },
            size: { value: { min: 1, max: 2.5 } },
            number: { value: 48, density: { enable: true, area: 800 } },
          },
        }}
        style={{position: 'absolute', inset: 0, zIndex: 0}}
      />
      <AnimatePresence mode="wait">
        {!showTest && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="mbti-welcome mbti-glass"
            style={{position: 'relative', zIndex: 1}}
          >
            <MBTIArt />
            <h1 className="mbti-title">MBTI 人格测试</h1>
            <p className="mbti-desc">发现你的性格类型，探索自我与世界的关系</p>
            <motion.button
              whileHover={{ scale: 1.10 }}
              whileTap={{ scale: 0.96 }}
              className="mbti-btn mbti-main-btn"
              onClick={() => setShowTest(true)}
            >
              开始测试
            </motion.button>
            <div style={{ marginTop: 32 }}>
      <ConnectMenu />
            </div>
          </motion.div>
        )}
        {showTest && <MBTITest onBack={() => setShowTest(false)} />}
      </AnimatePresence>
    </div>
  );
}

function MBTITest({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [direction, setDirection] = useState(1); // 1: next, -1: prev
  const [playClick] = useSound(
    ["/click.mp3", "/click.wav"],
    {
      volume: 0.35,
      onload: () => console.log("click sound loaded"),
      onplay: () => console.log("click sound played"),
      onloaderror: (_: string, err: any) => console.error("click sound load error", err),
      onplayerror: (_: string, err: any) => console.error("click sound play error", err),
    }
  );
  const [playSuccess] = useSound(["/success.mp3", "/success.wav"], { volume: 0.45 });

  const handleAnswer = (value: string) => {
    playClick();
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    setDirection(1);
    if (step < mbtiQuestions.length - 1) {
      setTimeout(() => setStep((s) => s + 1), 200);
    } else {
      setTimeout(() => setShowResult(true), 300);
      setTimeout(() => playSuccess(), 350);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      playClick();
      setDirection(-1);
      setTimeout(() => {
        setStep((s) => s - 1);
        setAnswers((a) => a.slice(0, -1));
      }, 200);
    }
  };

  const getResult = () => {
    // 统计每个维度的选择
    let E = 0, I = 0, S = 0, N = 0, T = 0, F = 0, J = 0, P = 0;
    answers.forEach((v) => {
      if (v === "E") E++;
      if (v === "I") I++;
      if (v === "S") S++;
      if (v === "N") N++;
      if (v === "T") T++;
      if (v === "F") F++;
      if (v === "J") J++;
      if (v === "P") P++;
    });
    const type = [E >= I ? "E" : "I", S >= N ? "S" : "N", T >= F ? "T" : "F", J >= P ? "J" : "P"].join("");
    return type;
  };

  if (!mbtiQuestions[step]) return <div style={{color:'#fff',textAlign:'center',padding:'48px 0'}}>题目加载出错，请刷新页面</div>;

  return (
    <motion.div
      key="mbti-test"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="mbti-test-card mbti-glass"
      style={{position: 'relative', zIndex: 1}}
    >
      <MBTIArt />
      <motion.button className="mbti-back" onClick={onBack} whileTap={{ scale: 0.9 }}>
        ← 返回
      </motion.button>
      {!showResult ? (
        <div style={{ minHeight: 260 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: direction > 0 ? 80 : -80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -80 : 80 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            >
              <h2 className="mbti-question">{mbtiQuestions[step].question}</h2>
              <div className="mbti-options">
                {mbtiQuestions[step].options.map((opt) => (
                  <motion.button
                    key={opt.value + step}
                    className="mbti-btn mbti-option-btn"
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleAnswer(opt.value)}
                  >
                    {opt.text}
                  </motion.button>
                ))}
              </div>
              <div className="mbti-progress">
                问题 {step + 1} / {mbtiQuestions.length}
              </div>
              <div className="mbti-step-actions">
                <motion.button
                  className="mbti-btn mbti-prev-btn"
                  onClick={handlePrev}
                  disabled={step === 0}
                  whileTap={{ scale: 0.95 }}
                  style={{ opacity: step === 0 ? 0.4 : 1 }}
                >
                  上一题
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <MBTIResult type={getResult()} onBack={onBack} answers={answers} />
      )}
    </motion.div>
  );
}

function MBTIResult({ type, onBack, answers }: { type: string; onBack: () => void; answers: string[] }) {
  const desc = mbtiTypes[type as keyof typeof mbtiTypes] || "未知类型";
  // 取主导维度决定背景
  const main = type[0];
  const bg = resultBgMap[main] || resultBgMap.E;
  return (
    <motion.div
      key="mbti-result"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      className="mbti-result"
      style={{ background: bg, borderRadius: 24, padding: 32, boxShadow: "0 8px 32px #0002" }}
    >
      <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.5rem', marginBottom: 12 }}>你的MBTI类型是：</h2>
      <div className="mbti-type" style={{ fontSize: '2.6rem', marginBottom: 8 }}>{type}</div>
      <div className="mbti-type-desc" style={{ fontSize: '1.15rem', color: '#fff', marginBottom: 18 }}>{desc}</div>
      <motion.button className="mbti-btn mbti-main-btn" whileTap={{ scale: 0.95 }} onClick={onBack}>
        再测一次
      </motion.button>
      <div className="mbti-answers-hint">你的答题分布：{answers.join('、')}</div>
    </motion.div>
  );
}

function ConnectMenu() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  if (isConnected) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mbti-connect-info">
        <div>已连接账号:</div>
        <div>{address}</div>
        <SignButton />
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={() => { connect({ connector: connectors[0] }); }}
      className="mbti-btn mbti-main-btn"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      连接钱包
    </motion.button>
  );
}

function SignButton() {
  const { signMessage, isPending, data, error } = useSignMessage();

  return (
    <div style={{ marginTop: 8 }}>
      <motion.button
        type="button"
        onClick={() => { signMessage({ message: "hello world" }); }}
        disabled={isPending}
        className="mbti-btn mbti-sign-btn"
        whileTap={{ scale: 0.95 }}
      >
        {isPending ? "签名中..." : "签名"}
      </motion.button>
      {data && (
        <div className="mbti-signature">
          <div>签名结果</div>
          <div style={{ wordBreak: "break-all" }}>{data}</div>
        </div>
      )}
      {error && (
        <div className="mbti-signature-error">
          <div>错误</div>
          <div>{error.message}</div>
        </div>
      )}
    </div>
  );
}

export default App;
