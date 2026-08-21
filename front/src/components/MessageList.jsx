import React, {
  useEffect,
  useRef,
} from "react";
import { useSelector } from "react-redux";

import MessageBubble from "./MessageBubble";

function MessageList() {
  const { messages = [], isLoading } = useSelector(
    (state) => state.message
  );

  const bottomRef = useRef(null);

  /*
   * Scroll to newest message
   */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading]);

  /*
   * Always work with an array.
   */
  const safeMessages = Array.isArray(messages)
    ? messages
    : [];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[980px] flex-col gap-6 px-5 py-8 md:px-8 md:py-10">
        {safeMessages.map((message, index) => {
          if (!message) return null;

          return (
            <MessageBubble
              key={
                message._id ||
                message.id ||
                `${message.role}-${index}`
              }
              role={message.role}
              content={message.content || ""}
              images={
                Array.isArray(message.images)
                  ? message.images
                  : []
              }
            />
          );
        })}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div
              className="
                flex
                items-center
                gap-1.5
                rounded-xl
                border
                border-white/[0.06]
                bg-white/[0.025]
                px-3.5
                py-3
              "
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--ankai-accent)]" />
              <span
                className="
                  h-1.5
                  w-1.5
                  animate-pulse
                  rounded-full
                  bg-[var(--ankai-accent)]
                  [animation-delay:150ms]
                "
              />
              <span
                className="
                  h-1.5
                  w-1.5
                  animate-pulse
                  rounded-full
                  bg-[var(--ankai-accent)]
                  [animation-delay:300ms]
                "
              />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default MessageList;