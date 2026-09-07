import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Flame, Loader2, Lock, Mail } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="min-h-[calc(100vh)] grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-6">
            <div className="flex flex-col items-center gap-2">
              <div className="size-12 grid place-items-center rounded-xl bg-primary text-primary-content -rotate-1.5 shadow-sketch">
                <Flame className="size-6" />
              </div>
              <h1 className="font-script text-3xl mt-2">Welcome back</h1>
              <p className="text-base-content/60 font-hand text-lg">Your sketchbook missed you</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="form-control">
              <span className="label-text font-medium mb-1">Email</span>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/40" />
                <input
                  type="email"
                  className="input input-bordered w-full pl-10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </label>

            <label className="form-control">
              <span className="label-text font-medium mb-1">Password</span>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </label>

            <button type="submit" className="btn btn-primary w-full" disabled={isLoggingIn}>
              {isLoggingIn ? <Loader2 className="size-5 animate-spin" /> : "Sign in"}
            </button>
          </form>

          <p className="text-center text-base-content/60">
            New here?{" "}
            <Link to="/signup" className="link link-primary">
              Make an account
            </Link>
          </p>
        </div>
      </div>

      <AuthImagePattern
        title="Draw your way to a date"
        subtitle="No polished bios. Just doodles, stamps and shared canvases."
      />
    </div>
  );
}
