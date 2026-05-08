import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoImg from "@/assets/logo.png";
import farmerImg from "@/assets/farmer-illustration.png";
import { Eye, EyeOff, Lock, User, Leaf, Sprout, TrendingUp, ShieldCheck } from "lucide-react";
import axios from "axios";
import mainlogo from "@/assets/mainlogo.png";

const LoginPage = () => {
  const handleLogin = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/login`,
        {
          name,
          password
        }
      );

      console.log("RESPONSE 👉", res.data);

      localStorage.setItem("token", res.data.token);

      console.log("TOKEN SAVED 👉", localStorage.getItem("token"));

      navigate("/dashboard");

    } catch (err) {
      console.log("ERROR ❌", err);
      alert("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("en");

  const texts = {
    en: {
      tagline: "Smart farming finance made simple",
      subtitle: "Your trusted AI companion for farm loans",
      namePlaceholder: "Enter your name",
      nameLabel: "Farmer Name",
      passwordPlaceholder: "Enter your password",
      passwordLabel: "Password",
      loginBtn: "Login to Dashboard",
      demo: "Demo: Enter any name + password to continue",
      lang: "हिंदी",
      stats: ["₹10L+ Loans Analyzed", "50K+ Farmers Helped", "98% Accuracy"],
      heroTitle: "Grow your farm,\nnot your debt",
      heroSubtitle: "AI-powered loan analysis designed\nspecifically for Indian farmers",
    },
    hi: {
      tagline: "स्मार्ट खेती वित्त, सरल और सुरक्षित",
      subtitle: "किसान ऋण के लिए आपका भरोसेमंद AI साथी",
      namePlaceholder: "अपना नाम दर्ज करें",
      nameLabel: "किसान का नाम",
      passwordPlaceholder: "पासवर्ड दर्ज करें",
      passwordLabel: "पासवर्ड",
      loginBtn: "डैशबोर्ड में लॉगिन करें",
      demo: "डेमो: कोई भी नाम + पासवर्ड दर्ज करें",
      lang: "English",
      stats: ["₹10L+ ऋण विश्लेषित", "50K+ किसान लाभान्वित", "98% सटीकता"],
      heroTitle: "खेत बढ़ाएं,\nकर्ज नहीं",
      heroSubtitle: "भारतीय किसानों के लिए\nAI-संचालित ऋण विश्लेषण",
    },
  };

  const t = texts[lang];

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  
  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: "var(--gradient-bg)" }}>
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large orbs */}
        <div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20 animate-spin-slow"
          style={{ background: "radial-gradient(circle, hsl(258 68% 72%), transparent 70%)" }}
        />
        <div
          className="absolute -bottom-32 right-1/3 w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, hsl(145 50% 60%), transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 -right-20 w-72 h-72 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(280 60% 68%), transparent 70%)" }}
        />
        {/* Leaf pattern overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="leaves" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M30 5 Q45 20 30 35 Q15 20 30 5Z" fill="hsl(258 68% 58%)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#leaves)" />
        </svg>
      </div>

      {/* Language toggle */}
      <button
        onClick={() => setLang(lang === "en" ? "hi" : "en")}
        className="absolute top-5 right-5 px-4 py-2 rounded-xl bg-card/80 backdrop-blur-sm border border-border text-sm font-semibold text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200 z-20"
      >
        🌐 {t.lang}
      </button>

      {/* LEFT PANEL — Hero / Illustration (hidden on mobile) */}
      <div
        className={`hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative transition-all duration-1000 ${
          mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
        }`}
        style={{ background: "var(--gradient-hero)" }}
      >
        {/* Logo top-left */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <img src={logoImg} alt="Logo" className="w-7 h-7 object-contain" width={28} height={28} />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Krishi Loan Advisor</h1>
            <p className="text-white/70 text-xs">AI-Powered Finance</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="flex-1 flex flex-col justify-center -mt-8">
          <div className="mb-6">
           
            <h2 className="text-4xl font-bold text-white leading-tight whitespace-pre-line">{t.heroTitle}</h2>
            <p className="text-white/75 mt-3 text-base leading-relaxed whitespace-pre-line">{t.heroSubtitle}</p>
          </div>

          

          {/* Farmer illustration with float animation */}
          <div className="flex justify-center animate-float">
            <img
              src={farmerImg}
              alt="Happy farmer with smartphone"
              className="w-72 h-auto object-contain drop-shadow-2xl"
              width={288}
              height={288}
            />
          </div>
        </div>

    
        
      </div>

      {/* RIGHT PANEL — Login form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6">
        <div
          className={`w-full max-w-md transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Mobile logo (visible only on mobile) */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 animate-bounce-in"
              style={{ background: "var(--gradient-hero)" }}
            >
              <img src={logoImg} alt="Logo" className="w-11 h-11 object-contain" width={44} height={44} />
            </div>
            <h1 className="text-xl font-bold text-foreground">Krishi Loan Advisor</h1>
            <p className="text-sm text-primary font-medium mt-1">{t.tagline}</p>
          </div>

          {/* Card */}
          <div className="glass-card rounded-3xl p-8 md:p-10">
            {/* Card header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                {lang === "en" ? "Login to your account!" : "वापस स्वागत है! 👋"}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
            </div>

            {/* Form */}
            <form
  onSubmit={(e) => {
    console.log("FORM SUBMITTED ✅");
    handleLogin(e);
  }}
  className="space-y-5"
>
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground pl-1">{t.nameLabel}</label>
                <div className="relative">
                  <div
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                      focusedField === "name" ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <User size={17} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    placeholder={t.namePlaceholder}
                    className="krishi-input pl-10"
                    required
                  />
                  {focusedField === "name" && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base">👨‍🌾</div>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground pl-1">{t.passwordLabel}</label>
                <div className="relative">
                  <div
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                      focusedField === "password" ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <Lock size={17} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder={t.passwordPlaceholder}
                    className="krishi-input pl-10 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={isLoading}
                className="krishi-btn-primary w-full mt-2 flex items-center justify-center gap-2.5 text-base py-3.5"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>{lang === "en" ? "Logging in..." : "लॉगिन हो रहा है..."}</span>
                  </>
                ) : (
                  <>
                    <span>{t.loginBtn}</span>
                    <span className="text-lg">→</span>
                  </>
                )}
              </button>
              <p className="text-sm mt-3 text-center">
  Don’t have an account?{" "}
  <span
    onClick={() => navigate("/register")}
    className="text-blue-500 cursor-pointer hover:underline"
  >
    Register here
  </span>
</p>
            </form>

</div>  {/* ✅ CLOSE glass-card */}

{/* Mobile farmer illustration */}
<div className="lg:hidden flex justify-center mt-6">
            <img
              src={farmerImg}
              alt="Farmer illustration"
              className="w-36 h-auto object-contain opacity-80 animate-float"
              loading="lazy"
              width={144}
              height={144}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
