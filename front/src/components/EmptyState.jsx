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
    /* Scrollable rather than centred-and-clipped: on a short landscape phone
       viewport the greeting plus the composer is taller than the shell, and a
       hard-centred flex box would put the send button out of reach. */
    <div className="ankai-scroll flex flex-1 flex-col justify-center overflow-y-auto px-4 py-8 pt-16 lg:pt-8">
      {/* Wide enough that the agent strip inside the composer stays on one row
          at desktop widths instead of wrapping. */}
      <div className="mx-auto w-full max-w-[820px]">
        <div className="mb-7 text-center sm:mb-9">
          <h1 className="ankai-serif text-[28px] font-normal italic leading-tight text-white/90 sm:text-[34px] md:text-[40px]">
            {getGreeting()}
            {firstName ? `, ${firstName}` : ""}
          </h1>

          <p className="mt-2.5 text-[13.5px] text-white/35 sm:text-[14px]">
            What would you like to work on today?
          </p>
        </div>

        <ChatInput centered />
      </div>
    </div>
  );
}

export default EmptyState;
