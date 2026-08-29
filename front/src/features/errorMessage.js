/* Turns an axios failure into the most useful message we have:
   the backend's own text when present, otherwise a generic fallback. */

/*
 * A gateway whose upstream is down used to answer with Express's HTML error
 * page, and this helper handed that whole document to the UI - a DOCTYPE landed
 * inside the login card. So a string body is only trusted when it is short and
 * is not markup. The gateway now returns JSON for that case, but a raw string
 * can still arrive from any proxy or CDN in front of it.
 */
const MAX_TEXT_LENGTH = 200;

const looksLikeMarkup = (text) => /^\s*<(?:!doctype|\?xml|html|head|body|pre)\b/i.test(text);

export const getErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again."
) => {
  const data = error?.response?.data;

  /* JSON first: it is the shape our own services answer with. */
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof data === "string") {
    const text = data.trim();

    if (text && !looksLikeMarkup(text) && text.length <= MAX_TEXT_LENGTH) {
      return text;
    }
  }

  if (error?.message === "Network Error") {
    return "Cannot reach the server. Check your connection and try again.";
  }

  /* Anything 5xx is the server's problem, not something the user typed - and
     saying so is more useful than a bare "something went wrong". */
  const status = error?.response?.status;

  if (typeof status === "number" && status >= 500) {
    return "The server is not responding. Please try again in a moment.";
  }

  return fallback;
};
