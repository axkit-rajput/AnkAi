import React from "react";
import { useSelector } from "react-redux";
import ChatInput from "./ChatInput";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Late night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function EmptyState() {
  const { userData } = useSelector((state) => state.user);
  const firstName = userData?.name?.split(" ")?.[0];

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="ankai-serif text-[32px] font-normal italic text-white/90 md:text-[38px]">
          {getGreeting()}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-2 text-[14px] text-white/35">
          What would you like to work on today?
        </p>
      </div>

      <ChatInput centered />
    </div>
  );
}

export default EmptyState;
