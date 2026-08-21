import { MessageSquare } from "lucide-react";
import React from "react";
import { useSelector } from "react-redux";

function Nav() {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { messages } = useSelector((state) => state.message);

  if (!selectedConversation || messages?.length === 0) return null;

  return (
    <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-[var(--ankai-border-soft)] px-5 lg:px-6">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--ankai-accent-soft)]">
        <MessageSquare size={12} className="text-[var(--ankai-accent-text)]" />
      </div>

      <div className="truncate text-[13.5px] font-medium text-white/85">
        {selectedConversation?.title || "New chat"}
      </div>

      <div className="ml-auto shrink-0 rounded-full border border-[var(--ankai-border)] px-2.5 py-0.5 text-[10.5px] font-medium text-white/35">
        {messages?.length} messages
      </div>
    </div>
  );
}

export default Nav;
