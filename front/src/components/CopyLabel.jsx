import { AlertCircle, Check, Copy } from "lucide-react";

/*
 * The contents of a copy button, for both code blocks and whole messages.
 * Its own module so react-refresh keeps working: the markdown component map it
 * is used from exports a factory rather than components.
 */
function CopyLabel({ status }) {
  if (status === "done") {
    return (
      <>
        <Check size={13} />
        Copied
      </>
    );
  }

  if (status === "error") {
    return (
      <>
        <AlertCircle size={13} />
        Copy failed
      </>
    );
  }

  return (
    <>
      <Copy size={13} />
      Copy
    </>
  );
}

export default CopyLabel;
