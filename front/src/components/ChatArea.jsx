import React, { useEffect } from "react";
import Nav from "./Nav";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import EmptyState from "./EmptyState";
import { useDispatch, useSelector } from "react-redux";
import getMessages from "../features/getMessages";
import { setArtifacts, setMessages } from "../redux/messageSlice";

function ChatArea() {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { messages } = useSelector((state) => state.message);
  const dispatch = useDispatch();

  useEffect(() => {
    const getMesg = async () => {
      if (selectedConversation) {
        if (selectedConversation.title === "New Chat") return;
        const data = await getMessages(selectedConversation?._id);
        dispatch(setMessages(data));
        const latestArtifactMessage = [...data]
          .reverse()
          .find((msg) => msg.artifacts && msg.artifacts.length > 0);
        dispatch(setArtifacts(latestArtifactMessage?.artifacts || []));
      }
    };

    getMesg();
  }, [selectedConversation?._id]);

  const isEmpty = messages?.length === 0;

  return (
    <div className="relative flex min-w-0 flex-1 flex-col bg-[var(--ankai-bg)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-160px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[var(--ankai-accent)]/[0.08] blur-[140px]" />
      </div>

      <Nav />

      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          <div className="relative flex-1 overflow-hidden">
            <MessageList />
          </div>
          <ChatInput />
        </>
      )}
    </div>
  );
}

export default ChatArea;
