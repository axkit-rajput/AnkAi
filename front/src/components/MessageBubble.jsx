import {
  Check,
  Copy,
  ExternalLink,
  X,
} from "lucide-react";
import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function MessageBubble({
  role,
  content,
  images = [],
}) {
  const isUser = role === "user";

  const [lightBox, setLightBox] = useState(null);
  const [copiedCode, setCopiedCode] = useState("");

  const safeImages = Array.isArray(images)
    ? images
    : [];

  const safeContent =
    typeof content === "string"
      ? content
      : content == null
        ? ""
        : String(content);

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);

      setCopiedCode(code);

      setTimeout(() => {
        setCopiedCode("");
      }, 2000);
    } catch (error) {
      console.error(
        "Failed to copy code:",
        error
      );
    }
  };

  return (
    <>
      <div
        className={`flex ${
          isUser
            ? "justify-end"
            : "justify-start"
        }`}
      >
        <div
          className={`
            w-fit
            max-w-[85%]
            break-words
            overflow-hidden
            text-[14.5px]
            leading-relaxed
            md:max-w-[65%]
            ${
              isUser
                ? `
                  rounded-2xl
                  rounded-tr-sm
                  border
                  border-white/[0.07]
                  bg-[#171a21]
                  px-5
                  py-3
                  text-white/90
                  shadow-[0_8px_30px_rgba(0,0,0,0.16)]
                `
                : `
                  px-0
                  py-1
                  text-white/85
                `
            }
          `}
        >
          {/* Images */}
          {safeImages.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-3">
              {safeImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt=""
                  loading="lazy"
                  onClick={() =>
                    setLightBox(img)
                  }
                  onError={(event) => {
                    event.currentTarget.remove();
                  }}
                  className="
                    h-28
                    w-40
                    cursor-zoom-in
                    rounded-xl
                    border
                    border-white/10
                    object-cover
                    transition
                    hover:opacity-90
                  "
                />
              ))}
            </div>
          )}

          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="mb-3 mt-5 text-2xl font-bold">
                  {children}
                </h1>
              ),

              h2: ({ children }) => (
                <h2 className="mb-2 mt-4 text-xl font-semibold">
                  {children}
                </h2>
              ),

              h3: ({ children }) => (
                <h3 className="mb-2 mt-3 text-lg font-semibold">
                  {children}
                </h3>
              ),

              p: ({ children }) => (
                <p className="mb-3 whitespace-pre-wrap break-words last:mb-0">
                  {children}
                </p>
              ),

              ul: ({ children }) => (
                <ul className="my-2 list-disc space-y-1 pl-5">
                  {children}
                </ul>
              ),

              ol: ({ children }) => (
                <ol className="my-2 list-decimal space-y-1 pl-5">
                  {children}
                </ol>
              ),

              li: ({ children }) => (
                <li className="break-words">
                  {children}
                </li>
              ),

              blockquote: ({ children }) => (
                <blockquote className="my-3 border-l-2 border-white/15 pl-4 text-white/50">
                  {children}
                </blockquote>
              ),

              hr: () => (
                <hr className="my-5 border-white/[0.08]" />
              ),

              table: ({ children }) => (
                <div className="my-4 overflow-x-auto">
                  <table className="min-w-full border border-white/10 text-sm">
                    {children}
                  </table>
                </div>
              ),

              thead: ({ children }) => (
                <thead className="bg-white/[0.04]">
                  {children}
                </thead>
              ),

              th: ({ children }) => (
                <th className="border border-white/10 px-3 py-2 text-left font-medium">
                  {children}
                </th>
              ),

              td: ({ children }) => (
                <td className="border border-white/10 px-3 py-2">
                  {children}
                </td>
              ),

              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    inline-flex
                    items-center
                    gap-1
                    text-[var(--ankai-accent)]
                    underline
                    underline-offset-2
                    transition
                    hover:opacity-80
                  "
                >
                  {children}
                  <ExternalLink size={13} />
                </a>
              ),

              strong: ({ children }) => (
                <strong className="font-semibold text-white/90">
                  {children}
                </strong>
              ),

              em: ({ children }) => (
                <em className="text-white/65">
                  {children}
                </em>
              ),

              code: ({
                className,
                children,
              }) => {
                const value = String(
                  children
                ).replace(/\n$/, "");

                /*
                 * Inline code
                 */
                if (!className) {
                  return (
                    <code
                      className="
                        rounded-md
                        border
                        border-white/[0.06]
                        bg-white/[0.06]
                        px-1.5
                        py-0.5
                        font-mono
                        text-[12.5px]
                        text-white/75
                      "
                    >
                      {value}
                    </code>
                  );
                }

                /*
                 * Code block
                 */
                const language =
                  className.replace(
                    "language-",
                    ""
                  );

                return (
                  <div
                    className="
                      my-4
                      overflow-hidden
                      rounded-xl
                      border
                      border-[var(--ankai-border)]
                      bg-[#0d0f13]
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-[var(--ankai-border)]
                        bg-white/[0.025]
                        px-4
                        py-2
                      "
                    >
                      <span
                        className="
                          text-[10px]
                          font-medium
                          uppercase
                          tracking-[0.12em]
                          text-white/30
                        "
                      >
                        {language || "code"}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          copyCode(value)
                        }
                        className="
                          flex
                          items-center
                          gap-1.5
                          text-[11px]
                          text-white/40
                          transition
                          hover:text-white/80
                        "
                      >
                        {copiedCode === value ? (
                          <>
                            <Check size={14} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>

                    <SyntaxHighlighter
                      language={
                        language || "text"
                      }
                      style={oneDark}
                      wrapLongLines
                      showLineNumbers
                      customStyle={{
                        margin: 0,
                        padding: "16px",
                        background: "#0d1117",
                        fontSize: "13px",
                        lineHeight: "1.6",
                      }}
                    >
                      {value}
                    </SyntaxHighlighter>
                  </div>
                );
              },

              img: ({ src, alt }) => {
                if (!src) return null;

                return (
                  <img
                    src={src}
                    alt={alt || ""}
                    loading="lazy"
                    onClick={() =>
                      setLightBox(src)
                    }
                    onError={(event) => {
                      event.currentTarget.remove();
                    }}
                    className="
                      my-3
                      max-h-[420px]
                      max-w-full
                      cursor-zoom-in
                      rounded-xl
                      border
                      border-white/10
                      object-contain
                      transition
                      hover:opacity-90
                    "
                  />
                );
              },
            }}
          >
            {safeContent}
          </Markdown>
        </div>
      </div>

      {/* Image lightbox */}
      {lightBox && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/80
            p-6
            backdrop-blur-sm
          "
          onClick={() =>
            setLightBox(null)
          }
        >
          <button
            type="button"
            className="
              absolute
              right-5
              top-5
              rounded-full
              bg-white/10
              p-2
              text-white/80
              transition
              hover:bg-white/15
              hover:text-white
            "
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
            onClick={(event) =>
              event.stopPropagation()
            }
            className="
              max-h-[85vh]
              max-w-[90vw]
              rounded-2xl
              border
              border-white/10
              object-contain
              shadow-2xl
            "
          />
        </div>
      )}
    </>
  );
}

export default MessageBubble;