import { MapPin } from "lucide-react";
import SketchPlayer from "../draw/SketchPlayer";

export default function ProfileCard({ user }) {
  const answers = user.doodleAnswers?.filter((d) => d.image || d.strokes) || [];

  return (
    <div
      data-theme={user.notebookTheme || undefined}
      className="paper w-full overflow-hidden rounded-2xl ink-border shadow-sketch-lg"
    >
      <div className="bg-base-100/70 p-4">
        <div className="flex items-center gap-3">
          <img
            src={user.drawnAvatar || "/avatar.png"}
            alt={user.fullName}
            className="size-20 rounded-full bg-base-200 object-cover ink-border-sm -rotate-1.5"
          />
          <div className="min-w-0">
            <h2 className="font-script text-3xl leading-none">
              {user.fullName?.split(" ")[0]}
              {user.age ? <span className="text-base-content/60">, {user.age}</span> : null}
            </h2>
            {user.location?.label && (
              <p className="mt-1 flex items-center gap-1 text-sm text-base-content/60">
                <MapPin className="size-3.5" />
                {user.location.label}
                {user.distanceKm != null && ` · ${Math.round(user.distanceKm)} km`}
              </p>
            )}
          </div>
        </div>

        {user.bio && <p className="mt-3 font-hand text-lg">{user.bio}</p>}

        {user.interests?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {user.interests.map((tag) => (
              <span key={tag} className="badge badge-outline font-hand">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {answers.length > 0 && (
        <div className="grid grid-cols-2 gap-px bg-base-content/10">
          {answers.slice(0, 4).map((d) => (
            <div key={d.promptId} className="bg-base-100 p-2">
              <p className="mb-1 text-xs font-hand text-base-content/60">{d.prompt}</p>
              <SketchPlayer
                strokes={d.strokes}
                image={d.image}
                aspect={1.3}
                className="rounded-lg ink-border-sm overflow-hidden"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
