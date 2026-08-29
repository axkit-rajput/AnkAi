import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

/* PrismLight instead of Prism: the full Prism build registers every language
   refractor ships with, which alone was several hundred kB of the bundle. These
   are the languages the agents actually emit. */
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import c from "react-syntax-highlighter/dist/esm/languages/prism/c";
import cpp from "react-syntax-highlighter/dist/esm/languages/prism/cpp";
import csharp from "react-syntax-highlighter/dist/esm/languages/prism/csharp";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import rust from "react-syntax-highlighter/dist/esm/languages/prism/rust";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";

const LANGUAGES = {
  bash,
  c,
  cpp,
  csharp,
  css,
  go,
  html: markup,
  java,
  javascript,
  json,
  jsx,
  markdown,
  markup,
  python,
  rust,
  shell: bash,
  sh: bash,
  sql,
  tsx,
  typescript,
  ts: typescript,
  js: javascript,
  py: python,
  yaml,
  yml: yaml,
};

for (const [name, definition] of Object.entries(LANGUAGES)) {
  SyntaxHighlighter.registerLanguage(name, definition);
}

/* Anything not registered above renders as plain text rather than throwing. */
export const resolveLanguage = (name = "") =>
  Object.hasOwn(LANGUAGES, name.toLowerCase()) ? name.toLowerCase() : "text";

export { oneDark, SyntaxHighlighter };
