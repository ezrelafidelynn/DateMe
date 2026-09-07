import { Link, useLocation } from "react-router-dom";
import { Flame, Heart, LogOut, Settings, User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const LINKS = [
  { to: "/", label: "Discover", Icon: Flame },
  { to: "/matches", label: "Matches", Icon: Heart },
  { to: "/profile", label: "Profile", Icon: User },
  { to: "/settings", label: "Themes", Icon: Settings },
];

export default function Navbar() {
  const { logout } = useAuthStore();
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b-2 border-base-content/10 bg-base-100/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-content -rotate-1.5 shadow-sketch">
            <Flame className="size-5" />
          </span>
          <span className="font-script text-2xl leading-none">EzMatch</span>
        </Link>

        <nav className="flex items-center gap-1">
          {LINKS.map(({ to, label, Icon }) => {
            const active = pathname === to || (to !== "/" && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`btn btn-sm gap-1.5 ${active ? "btn-primary" : "btn-ghost"}`}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
          <button className="btn btn-sm btn-ghost gap-1.5" onClick={logout}>
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
