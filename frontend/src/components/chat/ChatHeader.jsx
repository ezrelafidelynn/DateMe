import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import RevealAvatar from "../RevealAvatar";
import SafetyMenu from "../safety/SafetyMenu";

export default function ChatHeader({ match }) {
  const them = match.withUser || {};
  const reveal = match.revealProgress || 0;

  return (
    <div className="flex items-center gap-2 border-b-2 border-base-content/10 bg-base-100/80 px-3 py-2">
      <Link to="/matches" className="btn btn-ghost btn-sm btn-circle">
        <ChevronLeft className="size-5" />
      </Link>

      <RevealAvatar drawn={them.drawnAvatar} photo={them.profilePic} progress={reveal} size={40} />

      <div className="min-w-0 flex-1">
        <p className="font-hand text-lg leading-none">{them.fullName?.split(" ")[0]}</p>
        <p className="text-[11px] text-base-content/55">
          {reveal >= 100 ? "photo revealed" : `sketch reveal ${reveal}%`}
        </p>
      </div>

      <SafetyMenu matchId={match._id} otherUser={them} />
    </div>
  );
}
