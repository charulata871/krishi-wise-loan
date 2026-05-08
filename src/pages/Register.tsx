import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoImg from "@/assets/logo.png";
import farmerImg from "@/assets/farmer-illustration.png";
import { Eye, EyeOff, Lock, User, Leaf, Sprout, TrendingUp, ShieldCheck } from "lucide-react";
import axios from "axios";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState("hi");

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);
const handleRegister = async (e) => {
  e.preventDefault();

  setIsLoading(true);

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/register`,
      {
        name,
        password
      }
    );

    // 🔥 SAVE TOKEN
    localStorage.setItem("token", res.data.token);

    // 🔥 AUTO LOGIN → dashboard
    navigate("/dashboard");

  } catch (err: any) {
  console.log(err.response?.data);
  console.log(err.message);

  alert(err.response?.data?.message || "Registration failed ❌");
}
};

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: "var(--gradient-bg)" }}>

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20 animate-spin-slow"
          style={{ background: "radial-gradient(circle, hsl(258 68% 72%), transparent 70%)" }}
        />
        <div className="absolute -bottom-32 right-1/3 w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, hsl(145 50% 60%), transparent 70%)" }}
        />
      </div>

      {/* Language Toggle */}
      <button
        onClick={() => setLang(lang === "en" ? "hi" : "en")}
        className="absolute top-5 right-5 px-4 py-2 rounded-xl bg-card/80 border text-sm font-semibold"
      >
        🌐 {lang === "en" ? "हिंदी" : "English"}
      </button>

      {/* LEFT PANEL */}
      <div
        className={`hidden lg:flex lg:w-1/2 flex-col justify-between p-12 transition-all duration-1000 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="flex items-center gap-3">
          <img src={logoImg} className="w-10 h-10" />
          <h1 className="text-white font-bold">Krishi Loan Advisor</h1>
        </div>

        <div className="text-white">
          <h2 className="text-4xl font-bold mb-3">
            Start your journey 🌱
          </h2>
          <p className="text-white/80">
            Create your account and unlock smart farming finance tools.
          </p>
        </div>

        <div className="flex justify-center">
          <img src={farmerImg} className="w-72" />
        </div>

        <div className="flex gap-2">
          <div className="text-white text-xs">🔒 Secure</div>
          <div className="text-white text-xs">🤖 AI Powered</div>
          <div className="text-white text-xs">🇮🇳 Made for India</div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          <div className="glass-card rounded-3xl p-8">

            <h2 className="text-2xl font-bold mb-2">
              Create Account 🚀
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Register to continue
            </p>

            <form onSubmit={handleRegister} className="space-y-5">

              {/* Name */}
              <div className="relative">
                <User className="absolute left-3 top-3" size={18} />
                <input
                  type="text"
                  placeholder="Enter name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 p-3 rounded-xl border"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-3" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 p-3 rounded-xl border"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-3 rounded-xl"
              >
                {isLoading ? "Registering..." : "Register"}
              </button>

            </form>

            {/* Go to Login */}
            <p className="text-sm mt-4 text-center">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/")}
                className="text-blue-500 cursor-pointer"
              >
                Login
              </span>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;