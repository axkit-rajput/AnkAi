import {
  ArrowUp,
  Code2,
  FileText,
  Globe,
  ImageIcon,
  MessageSquare,
  Mic,
  MicOff,
  Paperclip,
  Presentation,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import sendMessage from "../features/sendMessage";
import { createConversation } from "../features/createConversation";
import { updateConversation } from "../features/updateConversation";
import { getErrorMessage } from "../features/errorMessage";

import {
  addMessage,
  setArtifacts,
  setError,
  setIsLoading,
  setMessages,
  setSelectedAgent,
} from "../redux/messageSlice";

import {
  addConversation,
  setConvTitle,
  setSelectedConversation,
  touchConversation,
} from "../redux/conversationSlice";

const AGENTS = [
  { id: "auto", icon: Zap, label: "Auto" },
  { id: "chat", icon: MessageSquare, label: "Chat" },
  { id: "coding", icon: Code2, label: "Coding" },
  { id: "pdf", icon: FileText, label: "PDF" },
  { id: "ppt", icon: Presentation, label: "PPT" },
  { id: "vision", icon: ImageIcon, label: "Vision" },
  { id: "search", icon: Globe, label: "Search" },
];

/* Conversation titles are derived from the first message. Keep the client and
   the server on the same limit so the sidebar does not change after a reload. */
const TITLE_MAX_LENGTH = 40;

const MAX_FILE_BYTES = 20 * 1024 * 1024;

/* Starter cards. Each one also picks the agent it needs, so a first-time user
   does not have to know which of the seven routes handles their request. */
const SUGGESTIONS = [
  {
    agent: "coding",
    icon: Code2,
    title: "Build a landing page",
    prompt: "Build a Netflix style landing page with a hero, rows of cards and a footer.",
  },
  {
    agent: "chat",
    icon: MessageSquare,
    title: "Explain a concept",
    prompt: "Explain how Redis caching works, with a diagram of the request flow.",
  },
  {
    agent: "search",
    icon: Globe,
    title: "Research a topic",
    prompt: "Research the current state of on-device AI models and summarise the tradeoffs.",
  },
  {
    agent: "ppt",
    icon: Presentation,
    title: "Draft a deck",
    prompt: "Draft a 10 slide deck introducing our analytics platform to new customers.",
  },
];

function ChatInput({ centered = false }) {
  const [value, setValue] = useState("");
  /* { file, previewUrl } - kept together so the thumbnail URL always belongs to
     the file currently attached. */
  const [attachment, setAttachment] = useState(null);
  const [listening, setListening] = useState(false);

  const { selectedConversation } = useSelector((state) => state.conversation);

  const { isLoading, selectedAgent } = useSelector((state) => state.message);

  const dispatch = useDispatch();

  const recognitionRef = useRef(null);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);
  const previewUrlRef = useRef(null);

  const selectedFile = attachment?.file || null;
  const filePreview = attachment?.previewUrl || null;

  /*
   * Attachment thumbnail. The blob URL is created and revoked here, at the
   * point the attachment actually changes, so nothing is leaked and no render
   * pass can hand out a URL that has already been revoked.
   */
  const replaceAttachment = (file) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (!file) {
      setAttachment(null);
      return;
    }

    const previewUrl = file.type?.startsWith("image/")
      ? URL.createObjectURL(file)
      : null;

    previewUrlRef.current = previewUrl;
    setAttachment({ file, previewUrl });
  };

  useEffect(
    () => () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    },
    []
  );

  /*
   * Speech recognition
   */
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index++
      ) {
        transcript += event.results[index][0].transcript;
      }

      setValue(transcript);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  /*
   * Auto resize textarea
   */
  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "0px";
    textarea.style.height =
      Math.min(textarea.scrollHeight, 180) + "px";
  }, [value]);

  /*
   * Microphone
   */
  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert(
        "Speech recognition is not supported in this browser."
      );
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch (error) {
        console.error("Microphone error:", error);
      }
    }
  };

  /*
   * Send message
   */
  const handleSendMessage = async () => {
    const messageText = value.trim();

    if (!messageText || isLoading) return;

    dispatch(setIsLoading(true));
    dispatch(setError(null));

    /* Keep a copy so the text can be restored if we never reach the server. */
    const fileToSend = selectedFile;
    let userMessageAdded = false;

    try {
      let conversation = selectedConversation;

      /*
       * Create conversation if none exists
       */
      if (!conversation) {
        dispatch(setMessages([]));

        const newConversation = await createConversation();

        if (!newConversation?._id) {
          throw new Error(
            "Could not start a new conversation. Please try again."
          );
        }

        dispatch(addConversation(newConversation));
        dispatch(setSelectedConversation(newConversation));

        conversation = newConversation;
      }

      /*
       * Prepare request
       */
      const formData = new FormData();

      formData.append("prompt", messageText);
      formData.append("conversationId", conversation._id);
      formData.append("agent", selectedAgent);

      if (fileToSend) {
        formData.append("file", fileToSend);
      }

      /*
       * Show the user's message immediately.
       * images is always an array so MessageBubble never has to guess.
       */
      dispatch(
        addMessage({
          role: "user",
          content: messageText,
          images: [],
        })
      );

      userMessageAdded = true;

      setValue("");
      replaceAttachment(null);

      if (fileRef.current) {
        fileRef.current.value = "";
      }

      /*
       * Give a brand new conversation its first message as title.
       * Done after the message is on screen so a slow rename never
       * delays the reply.
       */
      if (!conversation.title || conversation.title === "New Chat") {
        const title = messageText.slice(0, TITLE_MAX_LENGTH);

        dispatch(
          setConvTitle({
            conversationId: conversation._id,
            title,
          })
        );

        await updateConversation({ id: conversation._id, title });
      }

      /*
       * Send to backend
       */
      const data = await sendMessage(formData);

      dispatch(
        addMessage({
          role: "assistant",
          content:
            data?.answer ||
            "The assistant returned an empty response. Please try again.",
          images: Array.isArray(data?.images) ? data.images : [],
        })
      );

      /* Only replace the artifact panel when this reply actually produced
         artifacts, matching how a reloaded conversation resolves them. */
      if (Array.isArray(data?.artifacts) && data.artifacts.length > 0) {
        dispatch(setArtifacts(data.artifacts));
      }

      dispatch(touchConversation(conversation._id));
    } catch (error) {
      console.error("Failed to send message:", error);

      const message = getErrorMessage(
        error,
        error?.message || "Sorry, something went wrong while processing your message."
      );

      dispatch(setError(message));

      if (userMessageAdded) {
        dispatch(
          addMessage({
            role: "assistant",
            content: message,
            images: [],
          })
        );
      } else {
        /* Nothing was sent, so give the user their text back. */
        setValue(messageText);
      }
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  /*
   * Enter = send
   * Shift + Enter = new line
   */
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  /* Load the prompt but stop short of sending it: the wording is a starting
     point most people want to edit before it goes out. */
  const applySuggestion = (suggestion) => {
    dispatch(setSelectedAgent(suggestion.agent));
    setValue(suggestion.prompt);
    textareaRef.current?.focus();
  };

  return (
    <div
      className={
        centered
          ? "w-full"
          : "ankai-safe-bottom w-full border-t border-[var(--ankai-border-soft)] bg-[var(--ankai-bg)] px-4 pb-3 pt-3 sm:px-5 md:px-8 md:pb-4"
      }
    >
      {/* Starter cards */}
      {centered && (
        <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
          {SUGGESTIONS.map((suggestion) => {
            const Icon = suggestion.icon;

            return (
              <button
                key={suggestion.title}
                type="button"
                onClick={() => applySuggestion(suggestion)}
                className="
                  ankai-focus
                  group
                  flex
                  items-start
                  gap-3
                  rounded-xl
                  border
                  border-[var(--ankai-border-soft)]
                  bg-[var(--ankai-surface)]/60
                  px-3.5
                  py-3
                  text-left
                  transition
                  hover:border-[var(--ankai-accent-border)]
                  hover:bg-[var(--ankai-surface)]
                "
              >
                <span
                  className="
                    mt-0.5
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-[var(--ankai-accent-soft)]
                    text-[var(--ankai-accent-text)]
                  "
                >
                  <Icon size={14} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-white/85">
                    {suggestion.title}
                  </span>

                  <span className="mt-0.5 line-clamp-2 block text-[11.5px] leading-snug text-white/35">
                    {suggestion.prompt}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Input container. The docked variant is width-matched to the transcript
          column. It can sit up to a scrollbar-width off-centre from it, because
          the transcript reserves a stable gutter and the composer does not. */}
      <div
        className={`
          mx-auto
          flex
          w-full
          flex-col
          gap-2.5
          rounded-2xl
          border
          border-[var(--ankai-border)]
          bg-[var(--ankai-surface)]
          px-3.5
          pb-2.5
          pt-3
          transition
          focus-within:border-[var(--ankai-accent-border)]
          sm:px-4
          sm:pb-3
          sm:pt-3.5
          ${
            centered
              ? "shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
              : "max-w-[980px]"
          }
        `}
      >
        {/* Selected file */}
        {selectedFile && (
          <div className="
            flex
            items-center
            gap-2.5
            rounded-xl
            border
            border-[var(--ankai-border)]
            bg-white/[0.03]
            px-3
            py-2
          ">
            {selectedFile.type === "application/pdf" ? (
              <FileText
                size={16}
                className="shrink-0 text-red-400"
              />
            ) : filePreview ? (
              <img
                src={filePreview}
                alt=""
                className="
                  h-9
                  w-9
                  shrink-0
                  rounded-lg
                  object-cover
                "
              />
            ) : null}

            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] text-white/85">
                {selectedFile.name}
              </p>

              <p className="text-[10.5px] text-white/35">
                {Math.ceil(selectedFile.size / 1024)} KB
              </p>
            </div>

            <button
              type="button"
              onClick={() => replaceAttachment(null)}
              aria-label="Remove attachment"
              className="
                ankai-focus
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                text-white/35
                transition
                hover:bg-white/[0.06]
                hover:text-white
              "
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          placeholder="Message AnkAI..."
          value={value}
          onChange={(event) =>
            setValue(event.target.value)
          }
          onKeyDown={handleKeyDown}
          rows={1}
          className="
            no-scrollbar
            max-h-[180px]
            w-full
            resize-none
            overflow-y-auto
            bg-transparent
            text-[14.5px]
            leading-relaxed
            text-white/90
            outline-none
            placeholder:text-white/25
          "
        />

        {/* Bottom controls */}
        <div className="flex items-end justify-between gap-2">
          {/* Phones scroll the strip horizontally, because a second row of
              chips costs scarce vertical space there. From sm up it wraps
              instead, so nothing is hidden behind a scroll with no scrollbar. */}
          <div
            className="
              no-scrollbar
              ankai-fade-x
              flex
              min-w-0
              flex-1
              items-center
              gap-1.5
              overflow-x-auto
              pr-2
              sm:flex-wrap
              sm:gap-y-1.5
              sm:overflow-x-visible
              sm:pr-0
            "
          >
            {/* File */}
            <input
              type="file"
              accept=".pdf,image/*"
              hidden
              ref={fileRef}
              onChange={(event) => {
                const file = event.target.files?.[0];

                event.target.value = "";

                if (!file) return;

                const isAllowed =
                  file.type === "application/pdf" ||
                  file.type.startsWith("image/");

                if (!isAllowed) {
                  dispatch(
                    setError("Only PDF and image files can be attached.")
                  );
                  return;
                }

                if (file.size > MAX_FILE_BYTES) {
                  dispatch(
                    setError("Attachments must be 20 MB or smaller.")
                  );
                  return;
                }

                dispatch(setError(null));
                replaceAttachment(file);
              }}
            />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Attach a PDF or image"
              className="
                ankai-focus
                ankai-touch
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                text-white/35
                transition
                hover:bg-white/[0.06]
                hover:text-white/80
              "
            >
              <Paperclip size={15} />
            </button>

            {/* Microphone */}
            <button
              type="button"
              onClick={toggleMic}
              aria-label={listening ? "Stop dictation" : "Start dictation"}
              aria-pressed={listening}
              className={`
                ankai-focus
                ankai-touch
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                transition
                ${
                  listening
                    ? "bg-red-500/15 text-red-400"
                    : "text-white/35 hover:bg-white/[0.06] hover:text-white/80"
                }
              `}
            >
              {listening ? (
                <Mic size={15} />
              ) : (
                <MicOff size={15} />
              )}
            </button>

            <div className="mx-1 h-4 w-px shrink-0 bg-[var(--ankai-border)]" />

            {/* Agents */}
            {AGENTS.map((agent) => {
              const Icon = agent.icon;
              const isActive = selectedAgent === agent.id;

              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => dispatch(setSelectedAgent(agent.id))}
                  aria-pressed={isActive}
                  className={`
                    ankai-focus
                    inline-flex
                    shrink-0
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    px-2.5
                    py-1.5
                    text-[11.5px]
                    font-medium
                    transition
                    ${
                      isActive
                        ? "border-[var(--ankai-accent-border)] bg-[var(--ankai-accent-soft)] text-[var(--ankai-accent-text)]"
                        : "border-transparent text-white/35 hover:bg-white/[0.05] hover:text-white/70"
                    }
                  `}
                >
                  <Icon size={12.5} />
                  {agent.label}
                </button>
              );
            })}
          </div>

          {/* Send */}
          <button
            type="button"
            disabled={!value.trim() || isLoading}
            onClick={handleSendMessage}
            aria-label="Send message"
            className={`
              ankai-focus
              ankai-touch
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              transition
              ${
                value.trim() && !isLoading
                  ? "bg-[var(--ankai-accent)] text-white hover:bg-[var(--ankai-accent-hover)]"
                  : "cursor-not-allowed bg-white/[0.06] text-white/25"
              }
            `}
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>

      {centered && (
        <p className="mt-3 text-center text-[11px] text-white/25">
          AnkAI can make mistakes. Check important information.
        </p>
      )}
    </div>
  );
}

export default ChatInput;