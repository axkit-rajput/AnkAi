import { Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import CopyLabel from "./CopyLabel";
import { createMarkdownComponents } from "./markdownComponents";

/* Copy buttons in one message share a single piece of state, so keys are
   namespaced: a code block is keyed by its own source text, which could
   otherwise collide with the whole-message key. */
const MESSAGE_KEY = "message";

const IDLE_COPY = { key: "", status: "idle" };

/* remark plugins are a stable array so react-markdown does not rebuild its
   processor on every render. */
const REMARK_PLUGINS = [remarkGfm];

function MessageBubble({ role, content, images = [] }) {
  const isUser = role === "user";

  const [lightBox, setLightBox] = useState(null);
  /* Which copy button was pressed, and how it went. */
  const [copyState, setCopyState] = useState(IDLE_COPY);

  const safeImages = Array.isArray(images) ? images : [];

  const safeContent =
    typeof content === "string" ? content : content == null ? "" : String(content);

  /*
   * writeText rejects when the document is not focused or clipboard permission
   * is denied, so the failure is surfaced in the button rather than swallowed -
   * a button that silently does nothing reads as broken.
   */
  const runCopy = async (key, text) => {
    let status = "done";

    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy:", error);
      status = "error";
    }

    setCopyState({ key, status });

    setTimeout(() => {
      setCopyState((prev) => (prev.key === key ? IDLE_COPY : prev));
    }, 2000);
  };

  const copyStatusFor = (key) =>
    copyState.key === key ? copyState.status : "idle";

  /* Rebuilt only when the copy state changes, not on every parent render. */
  const markdownComponents = useMemo(
    () =>
      createMarkdownComponents({
        onCopyCode: (value) => runCopy(value, value),
        copyStatusFor,
        onOpenImage: setLightBox,
      }),
    /* eslint-disable-next-line react-hooks/exhaustive-deps -- runCopy and
       copyStatusFor are recreated every render by design; the copy state is
       what the map actually depends on. */
    [copyState]
  );

  return (
    <>
      <div
        className={`ankai-rise group flex flex-col ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        {/* Attribution. Only the assistant gets one - on the user's own side the
            alignment and the filled bubble already say who is talking. */}
        {!isUser && (
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-white/25">
            <span className="flex h-4 w-4 items-center justify-center rounded-[5px] bg-[var(--ankai-accent-soft)] text-[var(--ankai-accent-text)]">
              <Sparkles size={9} />
            </span>
            AnkAI
          </div>
        )}

        <div
          className={`w-fit overflow-hidden break-words text-[14.5px] leading-relaxed ${
            isUser
              ? "max-w-[88%] rounded-2xl rounded-tr-sm border border-white/[0.07] bg-[#171a21] px-4 py-3 text-white/90 shadow-[0_8px_30px_rgba(0,0,0,0.16)] sm:px-5 md:max-w-[70%]"
              : "max-w-full px-0 py-1 text-white/85"
          }`}
        >
          {safeImages.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-3">
              {safeImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt=""
                  loading="lazy"
                  onClick={() => setLightBox(img)}
                  onError={(event) => {
                    event.currentTarget.remove();
                  }}
                  className="h-28 w-40 cursor-zoom-in rounded-xl border border-white/10 object-cover transition hover:opacity-90"
                />
              ))}
            </div>
          )}

          <Markdown remarkPlugins={REMARK_PLUGINS} components={markdownComponents}>
            {safeContent}
          </Markdown>
        </div>

        {/* Whole-message copy. Revealed on hover where there is a pointer and
            permanently visible on touch, which has no hover to reveal it. */}
        {!isUser && safeContent && (
          <button
            type="button"
            onClick={() => runCopy(MESSAGE_KEY, safeContent)}
            className="ankai-focus mt-1.5 flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-[11.5px] text-white/30 transition hover:bg-white/[0.05] hover:text-white/70 focus-visible:opacity-100 group-hover:opacity-100 sm:opacity-0"
          >
            <CopyLabel status={copyStatusFor(MESSAGE_KEY)} />
          </button>
        )}
      </div>

      {/* Image lightbox */}
      {lightBox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          onClick={() => setLightBox(null)}
        >
          <button
            type="button"
            aria-label="Close image"
            className="ankai-focus absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white/80 transition hover:bg-white/15 hover:text-white"
            onClick={(event) => {
              event.stopPropagation();
              setLightBox(null);
            }}
          >
            <X size={20} />
          </button>

          <img
            src={lightBox}
            alt=""
            onClick={(event) => event.stopPropagation()}
            className="max-h-[85dvh] max-w-[90vw] rounded-2xl border border-white/10 object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  );
}

export default MessageBubble;
