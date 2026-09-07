import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Flame, Loader2, Lock, Mail, User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const { signup, isSigningUp } = useAuthStore();

  const validate = () => {
    if (!formData.fullName.trim()) return toast.error("Name is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Enter a valid email");
    if (formData.password.length < 6) return toast.error("Password needs 6+ characters");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate() === true) signup(formData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-6">
            <div className="flex flex-col items-center gap-2">
              <div className="size-12 grid place-items-center rounded-xl bg-primary text-primary-content rotate-1.5 shadow-sketch">
                <Flame className="size-6" />
              </div>
              <h1 className="font-script text-3xl mt-2">Start your sketchbook</h1>
              <p className="text-base-content/60 font-hand text-lg">Two minutes and a few doodles</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="form-control">
              <span className="label-text font-medium mb-1">Name</span>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/40" />
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="Sam Rivera"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </label>

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

            <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}>
              {isSigningUp ? <Loader2 className="size-5 animate-spin" /> : "Create account"}
            </button>
          </form>

          <p className="text-center text-base-content/60">
            Already sketching?{" "}
            <Link to="/login" className="link link-primary">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <AuthImagePattern
        title="It starts with a doodle"
        subtitle="Draw your avatar, answer prompts by drawing, stamp the people you like."
      />
    </div>
  );
}
