import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  artifacts: [],
  isLoading: false,
  error: null,
  /* Agent picked in the composer. Kept here so it survives the
     EmptyState -> MessageList remount of ChatInput. Must match an AGENTS id
     in ChatInput ("auto", not "Auto") - the backend router compares it
     case-sensitively against "auto" to decide whether to auto-route. */
  selectedAgent: "auto",
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = Array.isArray(action.payload) ? action.payload : [];
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setArtifacts: (state, action) => {
      state.artifacts = Array.isArray(action.payload) ? action.payload : [];
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSelectedAgent: (state, action) => {
      state.selectedAgent = action.payload;
    },
    /* Wipe everything tied to a single conversation. Dispatched whenever the
       selected conversation changes so one chat never shows another's history. */
    clearChat: (state) => {
      state.messages = [];
      state.artifacts = [];
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setMessages,
  addMessage,
  setArtifacts,
  setIsLoading,
  setError,
  setSelectedAgent,
  clearChat,
} = messageSlice.actions;

export default messageSlice.reducer;
