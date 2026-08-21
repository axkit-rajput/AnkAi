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
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import sendMessage from "../features/sendMessage";
import { createConversation } from "../features/createConversation";
import { updateConversation } from "../features/updateConversation";

import {
  addMessage,
  setArtifacts,
  setIsLoading,
  setMessages,
} from "../redux/messageSlice";

import {
  addConversation,
  setConvTitle,
  setSelectedConversation,
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

const SUGGESTIONS = [
  "Write a Netflix clone landing page",
  "Explain how Redis caching works",
  "Build me an analytics dashboard",
  "Summarize this PDF for me",
];

function ChatInput({ centered = false }) {
  const [value, setValue] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("Auto");
  const [selectedFile, setSelectedFile] = useState(null);
  const [listening, setListening] = useState(false);

  const { selectedConversation } = useSelector(
    (state) => state.conversation
  );

  const { isLoading } = useSelector((state) => state.message);

  const dispatch = useDispatch();

  const recognitionRef = useRef(null);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);

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

    try {
      let conversation = selectedConversation;

      /*
       * Create conversation if none exists
       */
      if (!conversation) {
        dispatch(setMessages([]));

        const newConversation = await createConversation();

        dispatch(setSelectedConversation(newConversation));
        dispatch(addConversation(newConversation));

        conversation = newConversation;
      }

      if (!conversation?._id) {
        throw new Error("Conversation ID is missing.");
      }

      /*
       * Give new conversation its first message as title
       */
      if (conversation.title === "New Chat") {
        await updateConversation({
          id: conversation._id,
          title: messageText,
        });

        dispatch(
          setConvTitle({
            conversationId: conversation._id,
            title: messageText.slice(0, 40),
          })
        );
      }

      /*
       * Prepare request
       */
      const formData = new FormData();

      formData.append("prompt", messageText);
      formData.append(
        "conversationId",
        conversation._id
      );
      formData.append(
        "agent",
        selectedAgent.toLowerCase()
      );

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      /*
       * IMPORTANT:
       * Always provide images as [] for user messages.
       * This prevents MessageBubble from crashing.
       */
      dispatch(
        addMessage({
          role: "user",
          content: messageText,
          images: [],
        })
      );

      setValue("");

      /*
       * Send to backend
       */
      const data = await sendMessage(formData);

      /*
       * Assistant response
       */
      dispatch(
        addMessage({
          role: "assistant",
          content: data?.answer || "",
          images: Array.isArray(data?.images)
            ? data.images
            : [],
        })
      );

      dispatch(
        setArtifacts(
          Array.isArray(data?.artifacts)
            ? data.artifacts
            : []
        )
      );
    } catch (error) {
      console.error("Failed to send message:", error);

      /*
       * Show a readable error instead of leaving
       * the interface in a loading state.
       */
      dispatch(
        addMessage({
          role: "assistant",
          content:
            "Sorry, something went wrong while processing your message.",
          images: [],
        })
      );
    } finally {
      dispatch(setIsLoading(false));

      setSelectedFile(null);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
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

  return (
    <div
      className={
        centered
          ? "mx-auto w-full max-w-[680px] px-4"
          : "w-full border-t border-[var(--ankai-border)] bg-[var(--ankai-bg)] px-3 py-4 md:px-6"
      }
    >
      {/* Suggestions */}
      {centered && (
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setValue(suggestion)}
              className="
                rounded-full
                border
                border-[var(--ankai-border)]
                px-3.5
                py-1.5
                text-[12.5px]
                text-white/50
                transition
                hover:border-white/20
                hover:text-white/85
              "
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input container */}
      <div
        className={`
          flex
          flex-col
          gap-2.5
          rounded-2xl
          border
          border-[var(--ankai-border)]
          bg-[var(--ankai-surface)]
          px-4
          pb-3
          pt-3.5
          transition
          focus-within:border-white/20
          ${
            centered
              ? "shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
              : ""
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
            ) : selectedFile.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(selectedFile)}
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
              onClick={() => {
                setSelectedFile(null);

                if (fileRef.current) {
                  fileRef.current.value = "";
                }
              }}
              className="
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
        <div className="flex items-center justify-between gap-2">
          <div
            className="
              no-scrollbar
              flex
              flex-1
              items-center
              gap-1.5
              overflow-x-auto
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

                if (file) {
                  setSelectedFile(file);
                }
              }}
            />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="
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
              className={`
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
              const isActive =
                selectedAgent === agent.label;

              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() =>
                    setSelectedAgent(agent.label)
                  }
                  className={`
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
                        ? "border-[var(--ankai-accent)]/30 bg-[var(--ankai-accent-soft)] text-[var(--ankai-accent)]"
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
            className={`
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              transition
              ${
                value.trim() && !isLoading
                  ? "bg-[var(--ankai-accent)] text-white hover:opacity-90"
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