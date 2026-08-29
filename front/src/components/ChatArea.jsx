import { useEffect } from "react";
import Nav from "./Nav";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import EmptyState from "./EmptyState";
import { useDispatch, useSelector } from "react-redux";
import getMessages from "../features/getMessages";
import {
  clearChat,
  setArtifacts,
  setError,
  setMessages,
} from "../redux/messageSlice";

function ChatArea() {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { messages, isLoading, error } = useSelector((state) => state.message);
  const dispatch = useDispatch();

  const conversationId = selectedConversation?._id;

  useEffect(() => {
    /* Drop the previous conversation's messages and artifacts up front.
       Without this the old thread stays on screen while (or instead of) the
       new one loads. */
    dispatch(clearChat());

    if (!conversationId) return;

    /* Guards against a slow response for a conversation the user has
       already navigated away from overwriting the current thread. */
    let active = true;

    const loadMessages = async () => {
      try {
        const data = await getMessages(conversationId);
        if (!active) return;

        const loaded = Array.isArray(data) ? data : [];
        dispatch(setMessages(loaded));

        const latestArtifactMessage = [...loaded]
          .reverse()
          .find((msg) => Array.isArray(msg?.artifacts) && msg.artifacts.length > 0);

        dispatch(setArtifacts(latestArtifactMessage?.artifacts || []));
      } catch (err) {
        console.error("Failed to load messages:", err);
        if (active) dispatch(setError("Could not load this conversation."));
      }
    };

    loadMessages();

    return () => {
      active = false;
    };
  }, [conversationId, dispatch]);

  const isEmpty = !isLoading && (messages?.length ?? 0) === 0;

  return (
    <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col bg-[var(--ankai-bg)]">
      {/* A 140px blur over a 420px box is one of the most expensive things a
          mobile GPU can be asked to composite, so it is desktop-only. */}
      <div className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block">
        <div className="absolute left-1/2 top-[-160px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[var(--ankai-accent)]/[0.08] blur-[140px]" />
      </div>

      <Nav />

      {error && (
        <div className="relative w-full px-4 pt-3 sm:px-5 md:px-8">
          <div className="mx-auto flex w-full max-w-[980px] items-start gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-[12.5px] text-red-200">
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => dispatch(setError(null))}
              className="ankai-focus shrink-0 text-red-200/60 transition hover:text-red-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <MessageList />
          </div>
          <ChatInput />
        </>
      )}
    </div>
  );
}

export default ChatArea;
