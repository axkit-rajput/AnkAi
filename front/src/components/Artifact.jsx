import { Check, Code2, Copy, Eye, PanelRightClose, PanelRightOpen, X } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { AnimatePresence, easeInOut, motion } from "motion/react"
import Editor from '@monaco-editor/react'

const LANGUAGE_BY_EXTENSION = {
  html: "html",
  css: "css",
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  json: "json",
  py: "python",
  java: "java",
  cpp: "cpp",
  c: "c",
}

const detectLanguage = (fileName = "") => {
  const extension = String(fileName).toLowerCase().split(".").pop()
  return LANGUAGE_BY_EXTENSION[extension] || "plaintext"
}

/* The preview only wires up the three well-known web files; anything else is
   code-only, which is why canPreview hangs off index.html existing. */
const buildPreviewDoc = (files) => {
  const contentOf = (name) => files.find((f) => f?.name === name)?.content || ""

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${contentOf("style.css")}</style>
</head>
<body>
${contentOf("index.html")}
<script>${contentOf("script.js")}</script>
</body>
</html>`
}

/* Lives at module scope on purpose: while this was declared inside Artifact's
   body it became a brand new component type on every render, so React threw
   away and rebuilt the Monaco editor and the preview iframe each time. */
function ArtifactPanel({
  artifact,
  files,
  file,
  tab,
  activeFile,
  canPreview,
  previewDoc,
  copied,
  collapsed,
  onClose,
  onCollapse,
  onExpand,
  onSelectFile,
  onSelectTab,
  onCopy,
}) {
  if (collapsed) {
    return (
      <div className='hidden lg:flex h-full border-l border-[var(--ankai-border-soft)] bg-[var(--ankai-sidebar)] flex-col items-center py-4 gap-3 shrink-0'>
        <button
          onClick={onExpand}
          title='Expand artifact panel'
          className='flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer shrink-0'
        >
          <PanelRightOpen size={16} />
        </button>
        <div className='flex items-center gap-2 flex-1 min-w-0'>
          <div
            className='text-[10px] font-medium text-slate-600 tracking-widest uppercase whitespace-nowrap'
            style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}
          >
            {artifact?.title}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col h-full bg-[var(--ankai-sidebar)]'>
      <div className='h-14 px-4 border-b border-[var(--ankai-border-soft)] flex items-center gap-3 shrink-0'>
        <button
          onClick={onClose ?? onCollapse}
          title={onClose ? "Close artifact panel" : "Collapse artifact panel"}
          className='flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer shrink-0'
        >
          {onClose ? <X size={15} /> : <PanelRightClose size={16} />}
        </button>

        <div className='flex items-center gap-2 flex-1 min-w-0'>
          <div className='flex items-center justify-center w-6 h-6 rounded-md bg-[var(--ankai-accent-soft)] border border-[var(--ankai-accent-border)] shrink-0'>
            <Code2 className="text-[var(--ankai-accent-text)]" size={12} />
          </div>
          <div className='text-[13px] font-medium text-slate-200 truncate'>{artifact?.title}</div>
        </div>

        <div className='flex items-center gap-1 shrink-0'>
          <button
            onClick={onCopy}
            title={copied ? "Copied" : "Copy file"}
            className='flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] rounded-lg transition-colors duration-150 bg-transparent border-none cursor-pointer'
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
        </div>

        {canPreview && (
          <div className='flex items-center gap-1 bg-white/[0.04] border border-[var(--ankai-border-soft)] p-1 rounded-lg'>
            <button
              onClick={() => onSelectTab("code")}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors duration-150 ${tab === "code" ? "bg-[var(--ankai-accent)] text-white" : "text-slate-500 hover:text-slate-200"}`}
            >
              <Code2 size={11} /> Code
            </button>
            <button
              onClick={() => onSelectTab("preview")}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors duration-150 ${tab === "preview" ? "bg-[var(--ankai-accent)] text-white" : "text-slate-500 hover:text-slate-200"}`}
            >
              <Eye size={11} /> Preview
            </button>
          </div>
        )}
      </div>

      {tab === "code" && (
        <div className='no-scrollbar flex h-auto border-b border-[var(--ankai-border-soft)] overflow-x-auto shrink-0'>
          {files.map((f, index) => (
            <button
              key={f?.name || index}
              onClick={() => onSelectFile(index)}
              className={`px-4 py-2.5 text-[11px] font-medium whitespace-nowrap transition-colors duration-150 border-r border-white/[0.05] relative cursor-pointer bg-transparent ${activeFile === index ? "text-[var(--ankai-accent-text)]" : "text-slate-500 hover:text-slate-300"}`}
            >
              {f?.name}
              {activeFile === index && (
                <div className='absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--ankai-accent)] rounded-t-full' />
              )}
            </button>
          ))}
        </div>
      )}

      <div className='flex-1 overflow-hidden'>
        {tab === "preview" && canPreview ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className='w-full h-full'
          >
            <iframe
              title='preview'
              srcDoc={previewDoc}
              sandbox='allow-scripts'
              className='w-full h-full bg-white'
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className='w-full h-full'
          >
            <Editor
              theme='vs-dark'
              path={file?.name}
              language={detectLanguage(file?.name)}
              value={file?.content ?? ""}
              options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, wordWrap: "on", automaticLayout: true, scrollBeyondLastLine: false, padding: { top: 16 }, lineNumbers: "on", renderLineHighlight: "none" }}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}

function Artifact() {
  const { artifacts } = useSelector((state) => state.message)

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  /* Tagged with the artifact id instead of being reset from an effect: a new
     artifact can have fewer files than the last one, and deriving the selection
     avoids both an out-of-range tab and a render-then-reset flash. */
  const [selection, setSelection] = useState({ id: null, index: 0, tab: "code" })

  const artifact = Array.isArray(artifacts) ? artifacts[0] : null
  const files = Array.isArray(artifact?.files) ? artifact.files : []

  /* Returning undefined from a component is a React error - must be null. */
  if (!artifact || files.length === 0) return null

  const artifactId = artifact.id ?? artifact.title ?? null
  const isCurrent = selection.id === artifactId

  const canPreview = files.some((f) => f?.name === "index.html")
  const tab = isCurrent && canPreview ? selection.tab : "code"
  const activeFile = isCurrent ? Math.min(selection.index, files.length - 1) : 0
  const file = files[activeFile]

  const handleCopy = async () => {
    if (!file?.content) return

    try {
      await navigator.clipboard.writeText(file.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy file:", error)
    }
  }

  const panelProps = {
    artifact,
    files,
    file,
    tab,
    activeFile,
    canPreview,
    previewDoc: canPreview ? buildPreviewDoc(files) : "",
    copied,
    onSelectFile: (index) => setSelection({ id: artifactId, index, tab }),
    onSelectTab: (next) => setSelection({ id: artifactId, index: activeFile, tab: next }),
    onCopy: handleCopy,
  }

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-24 right-4 z-40 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-[var(--ankai-accent)] text-white text-[12px] font-medium shadow-lg shadow-black/30 border-none cursor-pointer transition-colors duration-150"
      >
        <Code2 size={13} />
        View Code
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="lg:hidden fixed inset-y-0 right-0 z-50 w-[88vw] max-w-[420px] border-l border-[var(--ankai-border-soft)] overflow-hidden"
            >
              {/* The drawer is never the collapsed rail - that is a desktop affordance. */}
              <ArtifactPanel {...panelProps} collapsed={false} onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ width: 400 }}
        animate={{ width: collapsed ? 48 : 400 }}
        transition={{ duration: 0.25, ease: easeInOut }}
        className='hidden lg:flex h-full border-l border-[var(--ankai-border-soft)] flex-col overflow-hidden shrink-0'
      >
        <ArtifactPanel
          {...panelProps}
          collapsed={collapsed}
          onCollapse={() => setCollapsed(true)}
          onExpand={() => setCollapsed(false)}
        />
      </motion.div>
    </>
  )
}

export default Artifact
