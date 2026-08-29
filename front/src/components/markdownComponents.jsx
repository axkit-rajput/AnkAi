import { ExternalLink } from "lucide-react";
import CopyLabel from "./CopyLabel";
import {
  oneDark,
  resolveLanguage,
  SyntaxHighlighter,
} from "./syntaxHighlighter";

/*
 * Builds the react-markdown component map. It has to be a factory rather than a
 * constant because the code-block header needs the message's copy handlers, but
 * keeping it out of MessageBubble's body keeps that component readable.
 */
export function createMarkdownComponents({
  onCopyCode,
  copyStatusFor,
  onOpenImage,
}) {
  return {
    h1: ({ children }) => (
      <h1 className="mb-3 mt-5 text-2xl font-bold">{children}</h1>
    ),

    h2: ({ children }) => (
      <h2 className="mb-2 mt-4 text-xl font-semibold">{children}</h2>
    ),

    h3: ({ children }) => (
      <h3 className="mb-2 mt-3 text-lg font-semibold">{children}</h3>
    ),

    p: ({ children }) => (
      <p className="mb-3 whitespace-pre-wrap break-words last:mb-0">
        {children}
      </p>
    ),

    ul: ({ children }) => (
      <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>
    ),

    ol: ({ children }) => (
      <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>
    ),

    li: ({ children }) => <li className="break-words">{children}</li>,

    blockquote: ({ children }) => (
      <blockquote className="my-3 border-l-2 border-white/15 pl-4 text-white/50">
        {children}
      </blockquote>
    ),

    hr: () => <hr className="my-5 border-white/[0.08]" />,

    /* Tables are the one block that can be wider than the column, so it gets
       its own scroll container instead of forcing the bubble to scroll. */
    table: ({ children }) => (
      <div className="ankai-scroll my-4 overflow-x-auto">
        <table className="min-w-full border border-white/10 text-sm">
          {children}
        </table>
      </div>
    ),

    thead: ({ children }) => (
      <thead className="bg-white/[0.04]">{children}</thead>
    ),

    th: ({ children }) => (
      <th className="border border-white/10 px-3 py-2 text-left font-medium">
        {children}
      </th>
    ),

    td: ({ children }) => (
      <td className="border border-white/10 px-3 py-2">{children}</td>
    ),

    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-[var(--ankai-accent-text)] underline underline-offset-2 transition hover:opacity-80"
      >
        {children}
        <ExternalLink size={13} />
      </a>
    ),

    strong: ({ children }) => (
      <strong className="font-semibold text-white/90">{children}</strong>
    ),

    em: ({ children }) => <em className="text-white/65">{children}</em>,

    code: ({ className, children }) => {
      const value = String(children).replace(/\n$/, "");

      /* Inline code: react-markdown only sets a className on fenced blocks. */
      if (!className) {
        return (
          <code className="rounded-md border border-white/[0.06] bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12.5px] text-white/75">
            {value}
          </code>
        );
      }

      const language = className.replace("language-", "");

      return (
        <div className="my-4 overflow-hidden rounded-xl border border-[var(--ankai-border)] bg-[#0d0f13]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--ankai-border)] bg-white/[0.025] px-3.5 py-2 sm:px-4">
            <span className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">
              {language || "code"}
            </span>

            <button
              type="button"
              onClick={() => onCopyCode(value)}
              className="ankai-focus flex shrink-0 items-center gap-1.5 text-[11px] text-white/40 transition hover:text-white/80"
            >
              <CopyLabel status={copyStatusFor(value)} />
            </button>
          </div>

          <SyntaxHighlighter
            language={resolveLanguage(language)}
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
          onClick={() => onOpenImage(src)}
          onError={(event) => {
            event.currentTarget.remove();
          }}
          className="my-3 max-h-[420px] max-w-full cursor-zoom-in rounded-xl border border-white/10 object-contain transition hover:opacity-90"
        />
      );
    },
  };
}
