import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  conversations: [],
  selectedConversation: null,
};

const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = Array.isArray(action.payload) ? action.payload : [];
    },
    addConversation: (state, action) => {
      const conversation = action.payload;
      if (!conversation?._id) return;
      if (state.conversations.some((conv) => conv._id === conversation._id)) return;
      state.conversations.unshift(conversation);
    },
    setSelectedConversation: (state, action) => {
      const conversation = action.payload;
      state.selectedConversation = conversation?._id ? conversation : null;
    },
    setConvTitle: (state, action) => {
      const { title, conversationId } = action.payload;

      state.conversations = state.conversations.map((conv) =>
        conv._id === conversationId ? { ...conv, title } : conv
      );

      if (state.selectedConversation?._id === conversationId) {
        state.selectedConversation = { ...state.selectedConversation, title };
      }
    },
    /* Move a conversation to the top of the list after new activity, so the
       sidebar order matches the server's updatedAt sort on the next load. */
    touchConversation: (state, action) => {
      const conversationId = action.payload;
      const index = state.conversations.findIndex(
        (conv) => conv._id === conversationId
      );
      if (index > 0) {
        const [conversation] = state.conversations.splice(index, 1);
        state.conversations.unshift(conversation);
      }
    },
    resetConversations: () => initialState,
  },
});

export const {
  setConversations,
  addConversation,
  setSelectedConversation,
  setConvTitle,
  touchConversation,
  resetConversations,
} = conversationSlice.actions;

export default conversationSlice.reducer;
