import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ban, Flag, MoreVertical, UserMinus } from "lucide-react";
import { useMatchStore } from "../../store/useMatchStore";

export default function SafetyMenu({ matchId, otherUser }) {
  const navigate = useNavigate();
  const { unmatch, block, report } = useMatchStore();
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState("");

  const afterLeave = () => navigate("/matches");

  return (
    <>
      <div className="dropdown dropdown-end">
        <button tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
          <MoreVertical className="size-5" />
        </button>
        <ul tabIndex={0} className="dropdown-content menu z-40 w-48 rounded-box bg-base-100 p-2 shadow-sketch">
          <li>
            <button onClick={() => setReporting(true)}>
              <Flag className="size-4" /> Report drawing / user
            </button>
          </li>
          <li>
            <button onClick={() => unmatch(matchId).then(afterLeave)}>
              <UserMinus className="size-4" /> Unmatch
            </button>
          </li>
          <li>
            <button
              className="text-error"
              onClick={() => block(otherUser?._id).then(afterLeave)}
            >
              <Ban className="size-4" /> Block
            </button>
          </li>
        </ul>
      </div>

      {reporting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-neutral/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-base-100 ink-border p-4">
            <h3 className="font-script text-2xl">Report {otherUser?.fullName?.split(" ")[0]}</h3>
            <p className="font-hand text-sm text-base-content/60 mt-1">
              Reports go straight to moderation. For an explicit drawing, block as well.
            </p>
            <textarea
              className="textarea textarea-bordered mt-3 w-full"
              rows={3}
              placeholder="What happened?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="mt-3 flex gap-2">
              <button className="btn btn-ghost flex-1" onClick={() => setReporting(false)}>
                Cancel
              </button>
              <button
                className="btn btn-error flex-1"
                onClick={() => {
                  report({ reported: otherUser?._id, matchId, reason });
                  setReporting(false);
                  setReason("");
                }}
              >
                Send report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
