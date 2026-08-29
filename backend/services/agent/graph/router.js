import { getModel } from "../config/llmModels.js"

const KNOWN_AGENTS = [
  "chat",
  "search",
  "coding",
  "pdf",
  "ppt",
  "vision",
  "pdfRag",
  "imageAnalyzer"
]

/* The client sends the picker id, which may differ in case ("Auto"). Compare
   case-insensitively so an explicit pick is honoured and "auto" still routes. */
const resolveExplicitAgent = (value) => {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase()
  if (!normalized || normalized === "auto") return null

  return KNOWN_AGENTS.find((name) => name.toLowerCase() === normalized) || null
}

export const router = async (state) => {

  const explicitAgent = resolveExplicitAgent(state.agent)

  if (explicitAgent) {
    /* An uploaded file overrides a picker choice that cannot consume it -
       otherwise the file is silently ignored and left in ./temp. */
    if (state.file?.mimetype === "application/pdf" && explicitAgent !== "pdfRag") {
      return { ...state, agent: "pdfRag" }
    }

    if (
      state.file?.mimetype?.startsWith("image/") &&
      explicitAgent !== "imageAnalyzer"
    ) {
      return { ...state, agent: "imageAnalyzer" }
    }

    return { ...state, agent: explicitAgent }
  }

  if (state.file?.mimetype === "application/pdf") {
    return { ...state, agent: "pdfRag" }
  }

  if (state.file?.mimetype?.startsWith("image/")) {
    return { ...state, agent: "imageAnalyzer" }
  }

  const llm = await getModel("router")
  const prompt = `You are an agent router.

Available agents:

- chat
- search
- coding
- pdf
- ppt
- vision 

Rules:

chat:
General conversation,
explanations,
learning,
questions.

search:
Current events,
latest information,
news,
recent developments,
internet lookup.

coding:
Generate code,
debug code,
build projects,
architecture,
API design.

pdf:
Questions about generate PDFs
or document context.

ppt:
Questions about generate ppts
or ppt context.

vision:
  Generate image,
  create image

Return ONLY one word:

chat
search
coding
pdf
ppt
vision

User Query:
 ${state.prompt}
`

  const response = await llm.invoke(prompt)

  /* The model can answer with punctuation, quotes or a whole sentence. Match a
     known agent instead of trusting the raw text, so a stray reply falls back
     to chat rather than dropping into the graph's default edge by accident. */
  const raw = String(response?.content ?? "").toLowerCase()
  const picked =
    ["search", "coding", "pdf", "ppt", "vision", "chat"].find((name) =>
      raw.includes(name)
    ) || "chat"

  return {
    ...state,
    agent: picked
  }
}