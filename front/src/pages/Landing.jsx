import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight, Brain, Check, Code2, Eye, FileText,Image as ImageIcon,
         MessageCircle, Presentation, Search, Zap, } from "lucide-react";
import { useEffect,useRef,useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const agents = [
  {
    name: "Chat",
    verb: "Explore",
    icon: MessageCircle,
    description: "Explore ideas, ask questions and reason through problems.",
  },
  {
    name: "Coding",
    verb: "Build",
    icon: Code2,
    description: "Write, understand and debug code with an AI coding partner.",
  },
  {
    name: "Search",
    verb: "Research",
    icon: Search,
    description: "Find information and connect scattered sources into answers.",
  },
  {
    name: "PDF",
    verb: "Understand",
    icon: FileText,
    description: "Read documents, extract information and work with files.",
  },
  {
    name: "PPT",
    verb: "Present",
    icon: Presentation,
    description: "Turn ideas and information into polished presentations.",
  },
  {
    name: "Image",
    verb: "Create",
    icon: ImageIcon,
    description: "Generate and work with visual content.",
  },
  {
    name: "Vision",
    verb: "See",
    icon: Eye,
    description: "Understand screenshots, diagrams, charts and visual content.",
  },
  {
    name: "Auto",
    verb: "Execute",
    icon: Zap,
    description: "Give AnkAI a goal and let it plan, coordinate and execute.",
  },
];

const workflow = [
  "Understand the goal",
  "Choose the right agents",
  "Execute the work",
  "Deliver the result",
];

const demoAgents = ["Search", "Vision", "PDF"];

const AgentShowcase = () => {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(
      agents.length - 1,
      Math.max(0, Math.floor(value * agents.length))
    );

    setActive((current) => (current === next ? current : next));
  });

  const content = {
    Chat: {
      eyebrow: "Conversation",
      title: "Explore ideas without leaving your workspace.",
      items: [
        "Ask questions",
        "Reason through problems",
        "Turn ideas into useful outputs",
      ],
    },
    Coding: {
      eyebrow: "Development",
      title: "Build, debug and understand code with AnkAI.",
      items: [
        "Understand unfamiliar code",
        "Find and fix problems",
        "Build features faster",
      ],
    },
    Search: {
      eyebrow: "Research",
      title: "Turn scattered information into clear answers.",
      items: [
        "Search relevant sources",
        "Compare information",
        "Create a concise research result",
      ],
    },
    PDF: {
      eyebrow: "Documents",
      title: "Understand your documents instead of just reading them.",
      items: [
        "Extract important information",
        "Ask questions about documents",
        "Summarize complex material",
      ],
    },
    PPT: {
      eyebrow: "Presentation",
      title: "Turn an idea into a polished presentation.",
      items: [
        "Structure your story",
        "Create presentation content",
        "Turn information into slides",
      ],
    },
    Image: {
      eyebrow: "Visual creation",
      title: "Create visual content from your ideas.",
      items: [
        "Generate visual concepts",
        "Explore creative directions",
        "Turn descriptions into imagery",
      ],
    },
    Vision: {
      eyebrow: "Visual understanding",
      title: "Give AnkAI something to see.",
      items: [
        "Understand screenshots",
        "Analyze diagrams and charts",
        "Extract meaning from visual content",
      ],
    },
    Auto: {
      eyebrow: "Autonomous workflow",
      title: "Give AnkAI the goal. Let the agents handle the work.",
      items: [
        "Understand the objective",
        "Choose the right agents",
        "Coordinate the workflow",
      ],
    },
  };

  const agent = agents[active];
  const AgentIcon = agent.icon;
  const activeContent = content[agent.name];

  return (
    <section
      ref={sectionRef}
      id="capabilities"
      className="relative isolate h-[600vh] bg-[#080a0d]"
    >
      {/* The sticky stage is deliberately the full viewport.
          The parent supplies the scroll distance; this panel does not move. */}
      <div className="sticky top-[88px] z-10 flex h-[calc(100vh-88px)] w-full items-center overflow-hidden px-5 sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            animate={{
              opacity: [0.08, 0.16, 0.08],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-[38%] top-[25%] h-[520px] w-[520px] rounded-full bg-[#665cff]/10 blur-[150px]"
          />

          <div className="absolute inset-x-0 top-0 h-px bg-white/[0.06]" />
        </div>

        {/* UPDATED: wider container + more space for left section */}
        <div className="relative mx-auto grid w-full max-w-[1600px] items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">

          {/* LEFT STORY */}
          <div className="relative z-20">
            <div className="mb-7 flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8174ff]" />

              <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#8174ff]">
                THE ANKAI WORKSPACE
              </span>
            </div>

            <div className="relative min-h-[390px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={agent.name}
                  initial={{
                    opacity: 0,
                    y: 32,
                    filter: "blur(8px)",
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    y: -28,
                    filter: "blur(8px)",
                  }}
                  transition={{
                    duration: 0.48,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="absolute inset-0"
                >
                  <div className="mb-5 flex items-center gap-3 text-white/45">
                    <AgentIcon
                      size={19}
                      strokeWidth={1.5}
                      className="text-[#8174ff]"
                    />

                    <span className="text-sm">{agent.name}</span>
                  </div>

                  {/* UPDATED: smaller left hero heading */}
                  <h2 className="max-w-[520px] font-['Sora'] text-[46px] font-semibold leading-[0.92] tracking-[-0.05em] text-white xl:text-[60px] 2xl:text-[68px]">
                    {agent.verb}.
                    <br />

                    <span className="text-white/[0.28]">
                      {activeContent.eyebrow}.
                    </span>
                  </h2>

                  <p className="mt-8 max-w-[470px] text-[16px] leading-7 text-white/[0.48] sm:text-[17px]">
                    {activeContent.title}
                  </p>

                  <div className="mt-9 space-y-2">
                    {activeContent.items.map((item, index) => (
                      <motion.div
                        key={item}
                        initial={{
                          opacity: 0,
                          x: -12,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay: 0.08 + index * 0.07,
                          duration: 0.35,
                        }}
                        className="flex items-center gap-3 text-[12px] text-white/35"
                      >
                        <span className="h-1 w-1 rounded-full bg-[#8174ff]/70" />
                        {item}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Scroll progress */}
            <div className="mt-3 flex items-center gap-3">
              <span className="w-5 text-xs tabular-nums text-white/25">
                {String(active + 1).padStart(2, "0")}
              </span>

              <div className="flex items-center gap-1.5">
                {agents.map((item, index) => (
                  <motion.span
                    key={item.name}
                    animate={{
                      width: index === active ? 30 : 5,
                      opacity: index === active ? 1 : 0.22,
                    }}
                    transition={{
                      duration: 0.35,
                      ease: "easeOut",
                    }}
                    className="h-1 rounded-full bg-[#8174ff]"
                  />
                ))}
              </div>

              <span className="text-xs tabular-nums text-white/25">
                08
              </span>
            </div>
          </div>

          {/* PRODUCT PREVIEW */}
          <div className="relative z-10">
            <motion.div
              animate={{
                y: active % 2 === 0 ? 0 : -7,
                rotateX: active === 0 ? 0 : -0.5,
              }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}

              className="relative origin-center scale-[0.88] xl:scale-[0.92] 2xl:scale-100"
            >
              <div className="overflow-hidden rounded-[26px] border border-white/[0.09] bg-[#101217] shadow-[0_40px_120px_rgba(0,0,0,0.5)]">

                <div className="flex h-[58px] items-center border-b border-white/[0.07] px-5">
                  <div className="flex gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  </div>

                  <div className="absolute left-1/2 -translate-x-1/2 text-[10px] font-medium tracking-[0.25em] text-white/20">
                    ANKAI WORKSPACE
                  </div>
                </div>

                {/* UPDATED: reduced workspace height + sidebar width */}
                <div className="grid min-h-[430px] grid-cols-[165px_1fr] xl:grid-cols-[180px_1fr]">

                  {/* UPDATED: reduced sidebar padding */}
                  <div className="border-r border-white/[0.07] p-4 xl:p-5">
                    <div className="mb-9 text-lg font-semibold tracking-[-0.03em] text-white/80">
                      AnkAI
                    </div>

                    {agents.map((item, index) => {
                      const Icon = item.icon;

                      return (
                        <motion.div
                          key={item.name}
                          animate={{
                            backgroundColor:
                              index === active
                                ? "rgba(255,255,255,0.075)"
                                : "rgba(255,255,255,0)",
                            color:
                              index === active
                                ? "rgba(255,255,255,0.9)"
                                : "rgba(255,255,255,0.3)",
                          }}
                          transition={{ duration: 0.3 }}
                          className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px]"
                        >
                          <Icon size={15} strokeWidth={1.5} />

                          <span>{item.name}</span>

                          {index === active && (
                            <motion.span
                              layoutId="active-agent-dot"
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 30,
                              }}
                              className="ml-auto h-1.5 w-1.5 rounded-full bg-[#8174ff]"
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* UPDATED: reduced inner preview height */}
                  <div className="relative min-h-[430px] overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={agent.name}
                        initial={{
                          opacity: 0,
                          y: 35,
                          scale: 0.985,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: -35,
                          scale: 0.985,
                        }}
                        transition={{
                          duration: 0.48,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="absolute inset-0 p-7 sm:p-9"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8174ff]/10 ring-1 ring-[#8174ff]/10">
                            <AgentIcon
                              size={19}
                              strokeWidth={1.5}
                              className="text-[#8174ff]"
                            />
                          </div>

                          <div>
                            <div className="text-sm text-white/70">
                              {agent.name}
                            </div>

                            <div className="text-[11px] text-white/25">
                              AnkAI agent
                            </div>
                          </div>
                        </div>

                        {/* UPDATED: smaller preview heading */}
                        <h3 className="mt-8 max-w-[520px] text-[24px] leading-[1.15] tracking-[-0.03em] text-white/90 xl:text-[30px]">
                          {activeContent.title}
                        </h3>

                        <div className="mt-9 space-y-2.5">
                          {activeContent.items.map((item, index) => (
                            <motion.div
                              key={item}
                              initial={{
                                opacity: 0,
                                x: 16,
                              }}
                              animate={{
                                opacity: 1,
                                x: 0,
                              }}
                              transition={{
                                delay: 0.1 + index * 0.08,
                                duration: 0.35,
                              }}
                              className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3.5"
                            >
                              <span className="text-[10px] tabular-nums text-[#8174ff]">
                                {String(index + 1).padStart(2, "0")}
                              </span>

                              <span className="text-[13px] text-white/45">
                                {item}
                              </span>
                            </motion.div>
                          ))}
                        </div>

                        <div className="absolute bottom-6 left-7 right-7 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 sm:left-9 sm:right-9">
                          <div className="flex items-center gap-2">
                            <motion.span
                              animate={{
                                opacity: [0.35, 1, 0.35],
                              }}
                              transition={{
                                duration: 1.8,
                                repeat: Infinity,
                              }}
                              className="h-1.5 w-1.5 rounded-full bg-[#8174ff]"
                            />

                            <span className="text-[11px] text-white/30">
                              {agent.name} agent ready
                            </span>
                          </div>

                          <ArrowUpRight
                            size={15}
                            className="text-white/20"
                          />
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-[#675cff]/[0.06] blur-[90px]" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const [activeAgent, setActiveAgent] = useState(0);
  const [demoStep, setDemoStep] = useState(0);

  useEffect(() => {
    const agentTimer = setInterval(() => {
      setActiveAgent((value) => (value + 1) % agents.length);
    }, 3000);

    const demoTimer = setInterval(() => {
      setDemoStep((value) => (value + 1) % 4);
    }, 2400);

    return () => {
      clearInterval(agentTimer);
      clearInterval(demoTimer);
    };
  }, []);

  const handleTry = () => {
    navigate(userData ? "/app" : "/login");
  };

  const currentAgent = agents[activeAgent];
  const ActiveIcon = currentAgent.icon;

  return (
    <div className="min-h-screen overflow-x-clip bg-[#080a0d] text-[#f5f5f3] selection:bg-[#8174ff]/30">

      {/* =========================
          NAVIGATION
      ========================== */}

<header className="fixed left-0 right-0 top-0 z-[9999] h-[68px] bg-[#080a0d] px-4 pt-3 sm:px-6">
  <div className="relative mx-auto flex h-[64px] max-w-[1320px] items-center rounded-full border border-white/[0.08] bg-[#080a0d] px-3 shadow-[0_10px_40px_rgba(0,0,0,0.18)] sm:px-5">

    {/* LOGO */}
    <button
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }
      className="group flex h-full items-center"
      aria-label="AnkAI home"
    >
      <img
        src="/AnkAi.png"
        alt="AnkAI"
        className="
          h-28
          w-auto
          -translate-x-16
          object-contain
          transition-transform
          duration-300
          group-hover:scale-[1.02]
        "
      />
    </button>

    {/* CENTER NAVIGATION */}
    <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 md:flex">

      <a
        href="#agents"
        className="whitespace-nowrap text-[14px] font-medium text-white/50 transition-colors duration-300 hover:text-white"
      >
        Agents
      </a>

      <a
        href="#auto"
        className="whitespace-nowrap text-[14px] font-medium text-white/50 transition-colors duration-300 hover:text-white"
      >
        Auto
      </a>

      <a
        href="#capabilities"
        className="whitespace-nowrap text-[14px] font-medium text-white/50 transition-colors duration-300 hover:text-white"
      >
        Capabilities
      </a>

      <a
        href="#product"
        className="whitespace-nowrap text-[14px] font-medium text-white/50 transition-colors duration-300 hover:text-white"
      >
        Product
      </a>

      <a
        href="#product"
        className="whitespace-nowrap text-[14px] font-medium text-white/50 transition-colors duration-300 hover:text-white"
      >
        About
      </a>

    </nav>

    {/* RIGHT ACTION */}
    <div className="ml-auto flex items-center gap-4">

      <button
        onClick={handleTry}
        className="group flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-[#080a0d] transition-all duration-300 hover:scale-[1.025] hover:bg-[#f2f2f2] active:scale-[0.98]"
      >
        {userData ? "Open AnkAI" : "Try AnkAI"}

        <ArrowUpRight
          size={16}
          strokeWidth={1.8}
          className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </button>

    </div>

  </div>
</header>

      <main>
        {/* HERO */}
        <section className="relative flex min-h-screen items-center overflow-hidden px-5 pb-16 pt-28">
          {/* Ambient background */}
          <div className="pointer-events-none absolute inset-0">
            <motion.div
              animate={{
                x: [0, 35, -20, 0],
                y: [0, -20, 25, 0],
                scale: [1, 1.08, 0.98, 1],
                opacity: [0.055, 0.09, 0.06, 0.055],
              }}
              transition={{
                duration: 13,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-1/2 top-[28%] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#7668ff] blur-[180px]"
            />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(118,104,255,0.055),transparent_32%),linear-gradient(to_bottom,#080a0d,#080a0d)]" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-[1180px] text-center">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mx-auto mb-9 flex w-fit items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.025] px-4 py-2"
            >
              <motion.span
                animate={{ opacity: [0.45, 1, 0.45], scale: [0.9, 1.15, 0.9] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                className="h-1.5 w-1.5 rounded-full bg-[#8072ff]"
              />
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
                One intelligent workspace
              </span>
            </motion.div>

            {/* The animated word is intentionally contained.
                No translateX(-50%) is used, so it can never escape the viewport. */}
            <motion.h1
  initial={{ opacity: 0, y: 28 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.9,
    ease: [0.22, 1, 0.36, 1],
  }}
  className="mx-auto max-w-[1050px] font-['Sora'] text-[clamp(4rem,9vw,8.5rem)] font-semibold leading-[0.88] tracking-[-0.075em]"
>
  <span className="block text-white">
    Think
  </span>

  <span className="relative mt-3 block min-h-[0.95em] overflow-hidden">
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={currentAgent.verb}
        initial={{
          opacity: 0,
          y: 45,
          filter: "blur(12px)",
        }}
        animate={{
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
        }}
        exit={{
          opacity: 0,
          y: -40,
          filter: "blur(10px)",
        }}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="
          absolute inset-x-0 top-0
          block w-full text-center
          bg-gradient-to-r from-[#9B8CFF] via-[#6C8CFF] to-[#5ED8FF]
          bg-clip-text text-transparent
        "
      >
        {currentAgent.verb}
      </motion.span>
    </AnimatePresence>
  </span>
</motion.h1>

             <motion.div
               initial={{ opacity: 0, y: 14 }}
               animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.75, delay: 0.25 }}
  className="mx-auto mt-12 max-w-[720px]"
>
  <p className="font-['Sora'] text-[18px] leading-[1.7] tracking-[-0.025em] text-white/55 sm:text-[21px]">
    Everything you need to move from{" "}
    <span className="text-white/80">idea</span>{" "}
    to{" "}
    <span className="text-[#8072ff]">outcome.</span>
  </p>

  <div className="mx-auto mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[12px] uppercase tracking-[0.14em] text-white/25">
    <span>Chat</span>
    <span className="text-[#8072ff]/60">·</span>
    <span>Code</span>
    <span className="text-[#8072ff]/60">·</span>
    <span>Research</span>
    <span className="text-[#8072ff]/60">·</span>
    <span>Vision</span>
    <span className="text-[#8072ff]/60">·</span>
    <span>Automation</span>
  </div>
</motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-9 flex justify-center"
            >

            </motion.div>

{/* Animated agent indicator */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.55 }}
  className="
    mx-auto
    -mt-1
    flex
    w-fit
    items-center
    gap-4
    rounded-full
    border border-white/[0.10]
    bg-[#101217]/90
    px-7
    py-4
    shadow-[0_20px_70px_rgba(90,70,255,0.12)]
    backdrop-blur-xl
  "
>
  <AnimatePresence mode="wait" initial={false}>
    <motion.span
      key={currentAgent.name}
      initial={{ opacity: 0, y: 7 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -7 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-3 text-[16px] font-medium text-white/75"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#181b25] ring-1 ring-white/[0.08]">
        <ActiveIcon
          size={19}
          strokeWidth={1.6}
          className="text-[#8072ff]"
        />
      </span>

      {currentAgent.name}
    </motion.span>
  </AnimatePresence>

  <div className="flex items-center gap-2">
    {agents.map((agent, index) => (
      <motion.span
        key={agent.name}
        animate={{
          width: index === activeAgent ? 28 : 5,
          opacity: index === activeAgent ? 1 : 0.3,
        }}
        transition={{ duration: 0.4 }}
        className="h-1.5 rounded-full bg-[#8072ff]"
      />
    ))}
  </div>
</motion.div>

          </div>
        </section>

        {/* SCROLL-DRIVEN AGENT SHOWCASE */}
        <AgentShowcase />

        {/* AGENTS */}
        <section
          id="agents"
          className="border-t border-white/[0.06] px-5 py-32 sm:px-6 lg:py-40"
        >
          <div className="mx-auto max-w-[1180px]">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8072ff]">
                  The workspace
                </span>

                <h2 className="mt-5 font-['Sora'] text-[clamp(2.8rem,5vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.06em]">
                  Eight agents.
                  <br />
                  <span className="text-white/30">One workspace.</span>
                </h2>
              </div>

              <p className="max-w-[560px] text-[16px] leading-7 text-white/40 lg:pt-10">
                AnkAI brings specialized agents into one coherent environment.
                Use the right tool for the job—or let Auto coordinate them for
                you.
              </p>
            </div>

          </div>
        </section>

        {/* AUTO */}
        <section
          id="auto"
          className="border-t border-white/[0.06] px-5 py-32 sm:px-6 lg:py-40"
        >
          <div className="mx-auto max-w-[1180px]">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8072ff]">
                  Beyond chat
                </span>

                <h2 className="mt-5 font-['Sora'] text-[clamp(2.8rem,5vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.06em]">
                  Give AnkAI a goal.
                  <br />
                  <span className="text-white/30">
                    Let it figure out the rest.
                  </span>
                </h2>
              </div>

              <p className="max-w-[560px] text-[16px] leading-7 text-white/40 lg:pt-10">
                Auto can combine search, documents, vision, coding and creation
                into one coordinated workflow. You focus on the outcome—not
                every individual step.
              </p>
            </div>

            <div className="mt-20 grid overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101318] md:grid-cols-2">
              <div className="border-b border-white/[0.07] p-8 md:border-b-0 md:border-r md:p-12">
                <div className="flex items-center gap-2 text-[12px] text-white/45">
                  <Zap size={15} className="text-[#8072ff]" />
                  Auto workflow
                </div>

                <div className="mt-12 space-y-3">
                  {workflow.map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.45,
                        delay: index * 0.08,
                      }}
                      className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
                    >
                      <span className="text-[10px] text-[#8072ff]">
                        0{index + 1}
                      </span>
                      <span className="text-[13px] text-white/60">
                        {item}
                      </span>
                      {index < workflow.length - 1 && (
                        <span className="ml-auto text-white/15">↓</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="relative flex min-h-[440px] items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(128,114,255,0.1),transparent_58%)]" />

                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 30,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute -inset-20 rounded-full border border-dashed border-white/[0.07]"
                  />

                  <motion.div
                    animate={{
                      scale: [1, 1.06, 1],
                      boxShadow: [
                        "0 0 0 rgba(128,114,255,0)",
                        "0 0 70px rgba(128,114,255,0.12)",
                        "0 0 0 rgba(128,114,255,0)",
                      ],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative flex h-28 w-28 items-center justify-center rounded-full border border-[#8072ff]/30 bg-[#8072ff]/10"
                  >
                    <Zap size={28} className="text-[#8072ff]" />
                  </motion.div>

                  {[
                    ["Search", "top-[-78px] left-[105px]"],
                    ["Vision", "bottom-[55px] left-[115px]"],
                    ["Coding", "bottom-[55px] right-[115px]"],
                    ["PDF", "top-[-78px] right-[105px]"],
                  ].map(([name, position]) => (
                    <motion.div
                      key={name}
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        duration: 3 + name.length * 0.15,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className={`absolute ${position} flex items-center gap-2 whitespace-nowrap rounded-full border border-white/[0.08] bg-[#15191f] px-3 py-2`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#8072ff]" />
                      <span className="text-[10px] text-white/45">{name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section
          id="product"
          className="relative overflow-hidden border-t border-white/[0.06] px-5 py-40 sm:px-6"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(128,114,255,0.07),transparent_35%)]" />

          <div className="relative mx-auto max-w-[1000px] text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8072ff]">
              Your workspace
            </span>

            <h2 className="mt-6 font-['Sora'] text-[clamp(3.2rem,7vw,6.8rem)] font-semibold leading-[0.94] tracking-[-0.07em]">
              Work without
              <br />
              <span className="text-white/30">switching tools.</span>
            </h2>

            <p className="mx-auto mt-8 max-w-[560px] text-[16px] leading-7 text-white/40">
              One intelligent workspace for the way you think, build,
              research, create and get things done.
            </p>

            <button
              onClick={handleTry}
              className="group mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[14px] font-semibold text-[#080a0d] transition duration-300 hover:scale-[1.025]"
            >
              {userData ? "Open AnkAI" : "Try AnkAI"}
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] px-5 py-8 sm:px-6">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08]">
              <Brain size={13} />
            </span>
            <span className="font-['Sora'] text-[13px] font-semibold">
              AnkAI
            </span>
          </div>

          <span className="text-[11px] text-white/25">
            An intelligent workspace for modern work.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Landing