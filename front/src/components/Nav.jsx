import {
  Code2,
  FileText,
  Globe,
  ImageIcon,
  MessageSquare,
  Presentation,
  Zap,
} from "lucide-react";
import { useSelector } from "react-redux";

/* Mirrors the agent list in ChatInput so the bar can label the route a reply
   will take without the two components having to talk to each other. */
const AGENT_META = {
  auto: { icon: Zap, label: "Auto" },
  chat: { icon: MessageSquare, label: "Chat" },
  coding: { icon: Code2, label: "Coding" },
  pdf: { icon: FileText, label: "PDF" },
  ppt: { icon: Presentation, label: "PPT" },
  vision: { icon: ImageIcon, label: "Vision" },
  search: { icon: Globe, label: "Search" },
};

function Nav() {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { messages, selectedAgent } = useSelector((state) => state.message);

  if (!selectedConversation || messages?.length === 0) return null;

  const agent = AGENT_META[selectedAgent] || AGENT_META.auto;
  const AgentIcon = agent.icon;
  const count = messages?.length ?? 0;

  return (
    /* pl-16 on small screens keeps the title clear of the fixed sidebar
       trigger, which is a 40px button inset 16px from the left edge. */
    <header className="relative z-20 flex h-14 shrink-0 items-center gap-3 border-b border-[var(--ankai-border-soft)] bg-[var(--ankai-bg)] pl-16 pr-4 lg:pl-6 lg:pr-6">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[13.5px] font-medium leading-tight text-white/90">
          {selectedConversation?.title || "New chat"}
        </h1>

        <p className="mt-0.5 text-[11px] leading-tight text-white/30">
          {count} {count === 1 ? "message" : "messages"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--ankai-accent-border)] bg-[var(--ankai-accent-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--ankai-accent-text)]">
        <AgentIcon size={12} />
        {agent.label}
      </div>
    </header>
  );
}

export default Nav;
