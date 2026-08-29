import { Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

import MessageBubble from "./MessageBubble";

/* How far from the bottom the user can be and still count as "following" the
   conversation. Roughly one line of text plus padding. */
const PIN_THRESHOLD_PX = 120;

function MessageList() {
  const { messages = [], isLoading } = useSelector(
    (state) => state.message
  );

  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const pinnedToBottomRef = useRef(true);

  /*
   * Follow the newest message, but only while the user is already at the
   * bottom, so scrolling up to re-read history is not interrupted by every
   * incoming chunk. A reply's height keeps changing after it renders - chunks
   * stream in, code blocks lay out, images decode - so the pin is driven by a
   * ResizeObserver on the transcript rather than by the messages array: one
   * scrollTo fired on append lands short of any growth that comes after it.
   * The pin is instant, because an animated scroll to a target that is still
   * moving reads as lag. Scrolling the container (rather than scrollIntoView on
   * a sentinel) keeps the page and the artifact panel out of it.
   */
  useEffect(() => {
    const container = scrollRef.current;
    const content = contentRef.current;

    if (!container || !content) return;

    const pin = () => {
      if (!pinnedToBottomRef.current) return;

      container.scrollTop = container.scrollHeight;
    };

    pin();

    const observer = new ResizeObserver(pin);
    observer.observe(content);

    return () => observer.disconnect();
  }, []);

  const handleScroll = (event) => {
    const container = event.currentTarget;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    pinnedToBottomRef.current = distanceFromBottom <= PIN_THRESHOLD_PX;
  };

  /*
   * Always work with an array.
   */
  const safeMessages = Array.isArray(messages)
    ? messages
    : [];

  return (
    /* The gutters live on the scroll container and the max-width on the column
       inside it, so the transcript and the composer - which is padded the same
       way by ChatArea - end up exactly the same width. */
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="ankai-scroll ankai-transcript h-full overflow-y-auto px-4 sm:px-5 md:px-8"
    >
      <div
        ref={contentRef}
        className="mx-auto flex w-full max-w-[980px] flex-col gap-5 py-6 sm:gap-6 md:py-10"
      >
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

        {/* Thinking indicator. Deliberately CSS-only: it can be on screen for
            a long time, and three pulsing dots cost nothing to keep animating,
            unlike a per-character motion animation. */}
        {isLoading && (
          <div className="ankai-rise flex flex-col items-start">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-white/25">
              <span className="flex h-4 w-4 items-center justify-center rounded-[5px] bg-[var(--ankai-accent-soft)] text-[var(--ankai-accent-text)]">
                <Sparkles size={9} />
              </span>
              AnkAI
            </div>

            <div className="flex items-center gap-2 py-1 text-[13px] text-white/40">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--ankai-accent)]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--ankai-accent)] [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--ankai-accent)] [animation-delay:300ms]" />
              </span>
              Thinking
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageList;