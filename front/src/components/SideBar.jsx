import React, { useEffect, useState } from "react";
import {
  Coins,
  LogOut,
  Menu,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  User,
  X,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { getConversations } from "../features/getConversations";
import { createConversation } from "../features/createConversation";
import logOut from "../features/logOut";

import {
  addConversation,
  setConversations,
  setSelectedConversation,
} from "../redux/conversationSlice";
import { setUserdata } from "../redux/userSlice";
import BillingDrawer from "./BillingDrawer";

function SideBar() {
  const dispatch = useDispatch();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [search, setSearch] = useState("");

  const { conversations, selectedConversation } = useSelector(
    (state) => state.conversation
  );
  const { userData } = useSelector((state) => state.user);

useEffect(() => {
  let mounted = true;

  const loadConversations = async () => {
    if (!userData?._id) return;

    try {
      const data = await getConversations();

      console.log("Conversations loaded:", data);

      if (!mounted) return;

      // Make sure Redux always receives an array
      const conversationsData = Array.isArray(data)
        ? data
        : Array.isArray(data?.conversations)
          ? data.conversations
          : Array.isArray(data?.data)
            ? data.data
            : [];

      dispatch(setConversations(conversationsData));
    } catch (error) {
      console.error("Failed to load conversations:", error);

      if (mounted) {
        dispatch(setConversations([]));
      }
    }
  };

  loadConversations();

  return () => {
    mounted = false;
  };
}, [userData?._id, dispatch]);
  const handleCreateConversation = async () => {
    const data = await createConversation();
    dispatch(addConversation(data));
    dispatch(setSelectedConversation(data));
    setMobileOpen(false);
  };

  const filteredConversations = conversations.filter((conv) =>
    (conv.title || "New Chat").toLowerCase().includes(search.toLowerCase())
  );

  const credits = userData?.credits || 0;
  const totalCredits = userData?.totalCredits || 100;
  const creditPct = Math.min(100, Math.round((credits / totalCredits) * 100));

  const Avatar = ({ size = 36 }) =>
    userData?.avatar && !imageError ? (
      <img
        src={userData.avatar}
        onError={() => setImageError(true)}
        style={{ width: size, height: size }}
        className="rounded-full object-cover ring-1 ring-white/10"
        alt=""
      />
    ) : (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-full bg-white/[0.06] text-white/50"
      >
        <User size={size * 0.5} />
      </div>
    );

  /* ---------- COLLAPSED (desktop rail) ---------- */

  if (collapsed) {
    return (
      <>
        <div className="hidden lg:flex h-full w-[64px] shrink-0 flex-col items-center border-r border-[var(--ankai-border-soft)] bg-[var(--ankai-sidebar)] py-4">
          <button
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            className="ankai-focus flex h-9 w-9 items-center justify-center rounded-lg text-white/45 transition hover:bg-white/[0.06] hover:text-white"
          >
            <PanelLeftOpen size={17} />
          </button>

          <button
            onClick={handleCreateConversation}
            title="New chat"
            className="ankai-focus mt-3 flex h-9 w-9 items-center justify-center rounded-lg text-white/45 transition hover:bg-white/[0.06] hover:text-white"
          >
            <Plus size={17} />
          </button>

          <div className="no-scrollbar mt-4 w-full flex-1 space-y-1 overflow-y-auto px-2.5">
            {filteredConversations.map((conv) => {
              const active = selectedConversation?._id === conv._id;
              return (
                <button
                  key={conv._id}
                  onClick={() => dispatch(setSelectedConversation(conv))}
                  title={conv.title || "New Chat"}
                  className={`ankai-focus flex h-9 w-full items-center justify-center rounded-lg transition ${
                    active
                      ? "bg-[var(--ankai-accent-soft)] text-[var(--ankai-accent-text)]"
                      : "text-white/30 hover:bg-white/[0.05] hover:text-white/70"
                  }`}
                >
                  <MessageSquare size={15} />
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowBilling(true)}
            title="Account"
            className="ankai-focus mt-auto"
          >
            <Avatar size={32} />
          </button>
        </div>

        <BillingDrawer open={showBilling} onClose={() => setShowBilling(false)} />
      </>
    );
  }

  /* ---------- FULL SIDEBAR ---------- */

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="ankai-focus fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--ankai-border)] bg-[var(--ankai-sidebar)]/95 text-white/70 backdrop-blur-xl lg:hidden"
      >
        <Menu size={18} />
      </button>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-[280px] shrink-0 flex-col border-r border-[var(--ankai-border-soft)] bg-[var(--ankai-sidebar)] transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="flex h-14 shrink-0 items-center gap-2 px-3.5">
          <img src="/AnkAi.png" alt="AnkAI" className="h-16 w-auto" />

          <button
            onClick={() => setMobileOpen(false)}
            className="ankai-focus ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/[0.06] hover:text-white lg:hidden"
          >
            <X size={16} />
          </button>

          <button
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
            className="ankai-focus ml-auto hidden h-8 w-8 items-center justify-center rounded-lg text-white/35 transition hover:bg-white/[0.06] hover:text-white lg:flex"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        {/* New chat */}
        <div className="px-3 pb-1 pt-1">
          <button
            onClick={handleCreateConversation}
            className="ankai-focus flex w-full items-center gap-2.5 rounded-lg border border-[var(--ankai-border)] px-3 py-2.5 text-[13px] font-medium text-white/85 transition hover:bg-white/[0.05]"
          >
            <Plus size={16} className="text-[var(--ankai-accent-text)]" />
            New chat
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pt-2.5">
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-white/40 transition focus-within:bg-white/[0.05] hover:bg-white/[0.03]">
            <Search size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats"
              className="ankai-focus flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/30"
            />
          </div>
        </div>

        {/* Recents */}
        <div className="mt-4 px-4 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ankai-faint)]">
          {filteredConversations.length ? "Recents" : "No conversations yet"}
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-2.5 pb-3">
          {filteredConversations.map((conv) => {
            const active = selectedConversation?._id === conv._id;

            return (
              <button
                key={conv._id}
                onClick={() => {
                  dispatch(setSelectedConversation(conv));
                  setMobileOpen(false);
                }}
                className={`ankai-focus group mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition ${
                  active
                    ? "bg-[var(--ankai-accent-soft)]"
                    : "hover:bg-white/[0.045]"
                }`}
              >
                <MessageSquare
                  size={14}
                  className={`shrink-0 ${
                    active ? "text-[var(--ankai-accent-text)]" : "text-white/25"
                  }`}
                />
                <p
                  className={`truncate text-[13px] ${
                    active
                      ? "font-medium text-white"
                      : "text-white/60 group-hover:text-white/85"
                  }`}
                >
                  {conv.title || "New Chat"}
                </p>
              </button>
            );
          })}
        </div>

        {/* Footer / account */}
        <div className="border-t border-[var(--ankai-border-soft)] p-3">
          <button
            onClick={() => setShowBilling(true)}
            className="ankai-focus flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition hover:bg-white/[0.05]"
          >
            <Avatar size={32} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-white">
                {userData?.name || "Guest"}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <div className="h-1 w-16 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-[var(--ankai-accent)]"
                    style={{ width: `${creditPct}%` }}
                  />
                </div>
                <span className="text-[10.5px] text-white/35">
                  {credits}/{totalCredits}
                </span>
              </div>
            </div>

            <Coins size={14} className="shrink-0 text-white/25" />
          </button>

          <button
            onClick={() => {
              logOut();
              dispatch(setUserdata(null));
            }}
            className="ankai-focus mt-1 flex w-full items-center gap-2.5 rounded-lg p-2 text-left text-[12.5px] text-white/35 transition hover:bg-white/[0.05] hover:text-white/70"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      </div>

      <BillingDrawer open={showBilling} onClose={() => setShowBilling(false)} />
    </>
  );
}

export default SideBar;
