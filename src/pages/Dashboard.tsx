import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, AlertTriangle, Lightbulb, LogOut, IndianRupee,
  Landmark, Clock, BarChart2, Mic, Bell, ChevronRight,
  Leaf, ShieldCheck, X, Sliders, Sparkles, Home, PieChart,
  BookOpen, User2, ArrowUpRight, CheckCircle2, Info,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell,
} from "recharts";
import { Slider } from "@/components/ui/slider";
import logoImg from "../assets/logo.png";
import farmerImg from "@/assets/farmer-illustration.png";
import tractorImg from "@/assets/farm-banner.png";
import LoanChart from "../components/LoanChart";
import { calculateEMI, calculateDTI, calculateRisk } from "@/lib/finance";
import { analyzeLoan, getWeather, getSchemes } from "../api/api";
/* ─── Helpers ─────────────────────────────────────── */
function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

function calcEMI(principal: number, rateAnnual: number, months: number) {
  const r = rateAnnual / 12 / 100;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

/* ─── Count-up hook ────────────────────────────────── */
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return value;
}

/* ─── Risk Meter ───────────────────────────────────── */
const RiskMeter = ({ score, lang }: { score: number; lang: "en" | "hi" }) => {
  const [filled, setFilled] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setFilled(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const isLow = score <= 40;
  const isMed = score > 40 && score <= 70;
  const color = isLow ? "hsl(var(--risk-safe))" : isMed ? "hsl(var(--risk-medium))" : "hsl(var(--risk-high))";
  const label = isLow
    ? lang === "en" ? "Safe" : "सुरक्षित"
    : isMed
    ? lang === "en" ? "Medium" : "मध्यम"
    : lang === "en" ? "High Risk" : "उच्च जोखिम";
  const cls = isLow ? "risk-safe" : isMed ? "risk-medium" : "risk-high";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground font-medium">
          {lang === "en" ? "Debt-to-Income Ratio" : "ऋण-से-आय अनुपात"}
        </span>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${cls}`}>{label}</span>
      </div>

      {/* Segmented gauge */}
      <div className="relative">
        <div className="flex gap-1 h-5 rounded-full overflow-hidden">
          <div className="flex-1 rounded-l-full" style={{ background: "hsl(var(--risk-safe-bg))" }}>
            {filled > 0 && filled <= 40 && (
              <div className="h-full rounded-l-full transition-all duration-1000" style={{ width: `${(filled / 40) * 100}%`, background: "hsl(var(--risk-safe))" }} />
            )}
            {filled > 40 && <div className="h-full rounded-l-full" style={{ background: "hsl(var(--risk-safe))" }} />}
          </div>
          <div className="flex-1" style={{ background: "hsl(var(--risk-medium-bg))" }}>
            {filled > 40 && filled <= 70 && (
              <div className="h-full transition-all duration-1000" style={{ width: `${((filled - 40) / 30) * 100}%`, background: "hsl(var(--risk-medium))" }} />
            )}
            {filled > 70 && <div className="h-full" style={{ background: "hsl(var(--risk-medium))" }} />}
          </div>
          <div className="flex-1 rounded-r-full" style={{ background: "hsl(var(--risk-high-bg))" }}>
            {filled > 70 && (
              <div className="h-full rounded-r-full transition-all duration-1000" style={{ width: `${((filled - 70) / 30) * 100}%`, background: "hsl(var(--risk-high))" }} />
            )}
          </div>
        </div>
        {/* Score indicator */}
        <div
          className="absolute -top-1 transition-all duration-1000 ease-out"
          style={{ left: `calc(${Math.min(filled, 98)}% - 10px)` }}
        >
          <div className="w-5 h-7 rounded-full border-2 border-card shadow-md flex items-end justify-center pb-0.5" style={{ background: color }}>
            <div className="w-1 h-1 rounded-full bg-white" />
          </div>
        </div>
      </div>

      <div className="flex justify-between text-[10px] font-medium">
        <span className="text-risk-safe">{lang === "en" ? "Safe" : "सुरक्षित"} (0-40%)</span>
        <span className="text-risk-medium">{lang === "en" ? "Medium" : "मध्यम"} (41-70%)</span>
        <span className="text-risk-high">{lang === "en" ? "High" : "उच्च"} (71%+)</span>
      </div>

      {/* Big score display */}
      <div className="flex items-center justify-center py-3 rounded-2xl" style={{ background: `${color}18` }}>
        <div className="text-center">
          <p className="text-3xl font-bold" style={{ color }}>{(Number(filled) || 0).toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {lang === "en" ? "Risk Score" : "जोखिम स्कोर"}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ─── Input Card ───────────────────────────────────── */
const InputCard = ({
  icon, label, sublabel, value, onChange, prefix, min, max, step, delay,
}: {
  icon: React.ReactNode; label: string; sublabel: string; value: string;
  onChange: (v: string) => void; prefix?: string; min?: number; max?: number; step?: number; delay: number;
}) => (
  <div
    className="stat-card hover-lift opacity-0 animate-fade-in-up group"
    style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      </div>
    </div>
    <div className="relative">
      {prefix && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-primary">{prefix}</span>
      )}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        className={`krishi-input text-right font-bold text-base ${prefix ? "pl-8" : ""}`}
      />
    </div>
  </div>
);

/* ─── Custom chart tooltip ─────────────────────────── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-2xl p-3.5 shadow-card text-xs space-y-1.5">
        <p className="font-bold text-foreground text-sm">Month {label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-medium">
            {p.name}: ₹{formatINR(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/* ─── Govt Scheme Card ─────────────────────────────── */
const SchemeCard = ({
  icon, name, desc, badge, color, lang,
}: {
  icon: string; name: string; desc: string; badge?: string; color: string; lang: "en" | "hi";
}) => (
  <div className="relative p-4 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-card transition-all duration-300 cursor-pointer group overflow-hidden">
    {badge && (
      <span className="absolute top-2.5 right-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full"
        style={{ background: color + "22", color }}>
        {badge}
      </span>
    )}
    <div className="text-2xl mb-2.5">{icon}</div>
    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{name}</p>
    <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{desc}</p>
    <div className="flex items-center gap-1 mt-2.5 text-[10px] font-semibold" style={{ color }}>
      <span>{lang === "en" ? "Learn more" : "अधिक जानें"}</span>
      <ArrowUpRight size={10} />
    </div>
  </div>
);

/* ─── Main Dashboard ───────────────────────────────── */
const Dashboard = () => {
  const navigate = useNavigate();
 const user = localStorage.getItem("krishi_user") || "Farmer";
  const [lang, setLang] = useState<"en" | "hi">("hi");
  const [isListening, setIsListening] = useState(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "analyze" | "schemes" | "profile">("home");
  const [weather, setWeather] = useState(null);
  const fetchWeatherFallback = async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/weather?city=Delhi`);
    const data = await res.json();
    setWeather(data);
  } catch (err) {
    console.error(err);
  }
};
  // Inputs
  const [income, setIncome] = useState(0);
  const [loanAmt, setLoanAmt] = useState(0);
  const [rate, setRate] = useState(0);
  const [months, setMonths] = useState(0);

  // What-if simulator
  const [whatIfRate, setWhatIfRate] = useState([1]);
  const [whatIfMonths, setWhatIfMonths] = useState([1]);

  // Results
  const [result, setResult] = useState<null | {
  emi: number;
  totalPayment: number;
  interestCost: number;
  riskScore: number;
  risk: string;
  advice: string[];
}>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

const emiDisplay = result?.emi || 0;
const totalDisplay = result?.totalPayment || 0;
const intDisplay = result?.interestCost || 0;
  const [schemes, setSchemes] = useState([]);
  
useEffect(() => {
  const fetchWeatherFallback = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/weather?city=Delhi`);
      if (!res.ok) throw new Error("Fallback failed");

      const data = await res.json();
      setWeather(data);
    } catch (err) {
      console.error("Fallback error:", err);
    }
  };


  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      try {
        const res = await fetch(
  `http://localhost:5000/api/weather?lat=${lat}&lon=${lon}`
);
        if (!res.ok) throw new Error("Location weather failed");

        const data = await res.json();
        setWeather(data);
      } catch (err) {
        console.error("Location fetch error:", err);
        fetchWeatherFallback(); // fallback if API fails
      }
    },
    (err) => {
      console.error("Location error:", err);
      fetchWeatherFallback(); // fallback if user denies location
    }
  );
}, []);
const analyze = async () => {
  setAnalyzing(true);

  try {
    const data = await analyzeLoan({
      income: parseFloat(income),
      loanAmt: parseFloat(loanAmt),
      rate: parseFloat(rate),
      months: parseInt(months),
    });

  setResult({
  emi: data.emi,
  totalPayment: data.totalPayment,
  interestCost: data.interestCost,
  riskScore: data.riskScore,
  risk: data.risk,
  advice: data.advice
  });
    if (data.risk === "High") {
    setShowAlert(true);
    }

    setAnalyzed(true);

    // ✅ CALL SCHEMES HERE
    fetchSchemes();

  } catch (err) {
    console.error("Error:", err);
  }

  setAnalyzing(false);
};
const fetchSchemes = async () => {
  try {
    const res = await getSchemes({
      crop: "rice",
      state: "Bihar",
    });

    console.log("API schemes:", res);

    setSchemes(res?.schemes || []);

  } catch (err) {
    console.error("Schemes error:", err);
    setSchemes([]);
  }
};


  // What-if calculation
  const calculateEMI = (P, annualRate, N) => {
  const R = annualRate / 12 / 100;

  if (R === 0) return P / N;

  const pow = Math.pow(1 + R, N);
  return (P * R * pow) / (pow - 1);
};
  const whatIfEMI = result
  ? calculateEMI(
      Number(loanAmt),
      whatIfRate[0],
      whatIfMonths[0]
    )
  : 0;
  const safeIncome = Number(income) || 1;

const whatIfDTI = (whatIfEMI / safeIncome) * 100;

  // Chart data
  const chartData = result
    ? Array.from({ length: parseInt(months) }, (_, i) => ({
        month: i + 1,
        EMI: Math.round(result.emi),
        Income: parseFloat(income) || 0,
      })).filter((_, i, arr) => i === 0 || i === arr.length - 1 || i % Math.ceil(arr.length / 8) === 0)
    : [];

  // Compare chart data
  const compareData = result
    ? [
        { name: lang === "en" ? "Current" : "वर्तमान", EMI: Math.round(result.emi), fill: "hsl(var(--primary))" },
        { name: lang === "en" ? "What-If" : "क्या होगा", EMI: Math.round(whatIfEMI), fill: whatIfDTI <= 40 ? "hsl(var(--risk-safe))" : whatIfDTI <= 70 ? "hsl(var(--risk-medium))" : "hsl(var(--risk-high))" },
      ]
    : [];

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return lang === "en" ? "Good Morning" : "सुप्रभात";
    if (h < 17) return lang === "en" ? "Good Afternoon" : "शुभ अपराह्न";
    return lang === "en" ? "Good Evening" : "शुभ संध्या";
  };
  const getWeatherIcon = (w: string) => {
  if (!w) return "🌤";

  if (w.includes("Rain")) return "🌧";
  if (w.includes("Cloud")) return "☁️";
  if (w.includes("Clear")) return "☀️";
  if (w.includes("Haze")) return "🌫";
  if (w.includes("Thunder")) return "⛈";

  return "🌤";
};

  return (
    <div className="min-h-screen bg-gradient-bg pb-20 md:pb-6">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
  style={{ background: "var(--gradient-hero)" }}
>
  <img
    src={logoImg}
    alt="Logo"
    className="w-6 h-6 object-contain"
  />
</div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-foreground leading-tight">Krishi Loan Advisor</h1>
              <p className="text-[10px] text-muted-foreground leading-none">AI-Powered Finance</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs font-semibold text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
            >
              🌐 {lang === "en" ? "हिंदी" : "English"}
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
              >
                <Bell size={16} />
                <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-risk-high animate-pulse" />
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-11 w-72 bg-card border border-border rounded-2xl shadow-card-hover z-50 animate-fade-in-up overflow-hidden">
                  <div className="p-3 border-b border-border">
                    <p className="text-sm font-bold text-foreground">{lang === "en" ? "Notifications" : "सूचनाएं"}</p>
                  </div>
                  {[
                    { icon: "🌾", text: lang === "en" ? "Kharif season loan rates updated" : "खरीफ सीजन ऋण दरें अपडेट", time: "2h" },
                    { icon: "💡", text: lang === "en" ? "New PM-KISAN scheme announced" : "नई PM-KISAN योजना घोषित", time: "1d" },
                    { icon: "⚠️", text: lang === "en" ? "Interest rates may rise next month" : "अगले महीने ब्याज दर बढ़ सकती है", time: "2d" },
                  ].map((n, i) => (
                    <div key={i} className="flex gap-2.5 px-3 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer">
                      <span className="text-base">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground leading-relaxed">{n.text}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{n.time} {lang === "en" ? "ago" : "पहले"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-sm">👨‍🌾</div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-foreground truncate max-w-[80px]">{user}</p>
                <p className="text-[10px] text-muted-foreground">{lang === "en" ? "Farmer" : "किसान"}</p>
              </div>
            </div>
            <button
              onClick={() => { localStorage.removeItem("krishi_user"); navigate("/"); }}
              className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

{/* ─── Welcome banner ─── */}
<div
  className="rounded-3xl overflow-hidden opacity-0 animate-fade-in"
  style={{
    background: "var(--gradient-hero)",
    animationDelay: "100ms",
    animationFillMode: "forwards",
  }}
>
  <div className="p-6 md:p-8 flex items-center justify-between">

    {/* LEFT SIDE */}
    <div className="flex-1">

      {/* ✅ WEATHER */}
      {weather && (
        <div className="mt-3 flex items-center gap-3 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-xl w-fit">
          <span className="text-lg">
            {getWeatherIcon(weather?.weather)}
          </span>
          <div>
            <p className="text-white text-xs font-semibold">
              {weather.weather}
            </p>
            <p className="text-white/80 text-[10px]">
              {weather.temp}°C • {weather.riskMsg}
            </p>
          </div>
        </div>
      )}

      {/* ✅ GREETING */}
      <p className="text-white/80 text-sm font-medium mt-3">
        {greetingTime()} 🌅
      </p>

      {/* ✅ TITLE */}
      <h2 className="text-xl md:text-3xl font-bold text-white mt-1">
        {lang === "en"
          ? `Welcome, ${user}! 👨‍🌾`
          : `स्वागत है, ${user}! 👨‍🌾`}
      </h2>

      {/* ✅ SUBTEXT */}
      <p className="text-white/70 text-sm mt-2">
        {lang === "en"
          ? "Let's find the best loan plan for your farm today"
          : "आज अपने खेत के लिए सबसे अच्छी ऋण योजना खोजें"}
      </p>

      {/* ✅ TAGS */}
      <div className="flex flex-wrap gap-2 mt-4">
        {[
          { icon: "🌾", label: lang === "en" ? "Kharif Season" : "खरीफ सीजन" },
          { icon: "💧", label: lang === "en" ? "Good Rainfall" : "अच्छी बारिश" },
          { icon: "📈", label: lang === "en" ? "Market Up" : "बाजार ऊपर" },
        ].map((b) => (
          <div
            key={b.label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-sm"
          >
            <span className="text-sm">{b.icon}</span>
            <p className="text-white/90 text-xs font-semibold">{b.label}</p>
          </div>
        ))}
      </div>
    </div>

    {/* RIGHT SIDE IMAGE */}
    <div className="hidden md:block shrink-0 -mb-8 ml-4">
      <img
        src={farmerImg}
        alt="Farmer"
        className="w-40 h-auto object-contain drop-shadow-xl"
      />
    </div>
  </div>

  {/* Decorative tractor strip */}
  <div className="h-16 bg-white/10 relative overflow-hidden">
    <img
      src={tractorImg}
      alt=""
      className="absolute right-4 bottom-0 h-14 w-auto object-contain opacity-70"
    />
    <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/10" />
  </div>
</div>

        {/* ─── Quick Stats (visible after analysis) ─── */}
        {analyzed && result && (
          <div
            className="grid grid-cols-3 gap-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "50ms", animationFillMode: "forwards" }}
          >
            {[
              { icon: "💰", label: lang === "en" ? "Monthly EMI" : "मासिक EMI", value: `₹${formatINR(emiDisplay)}`, sub: lang === "en" ? "Per month" : "प्रति माह", color: "text-primary" },
              { icon: "🏦", label: lang === "en" ? "Total Payment" : "कुल भुगतान", value: `₹${formatINR(totalDisplay)}`, sub: lang === "en" ? "Full tenure" : "पूरी अवधि", color: "text-foreground" },
              { icon: "📊", label: lang === "en" ? "Interest Cost" : "ब्याज लागत", value: `₹${formatINR(intDisplay)}`, sub: lang === "en" ? "Extra paid" : "अतिरिक्त", color: "text-risk-medium" },
            ].map((s, i) => (
              <div
                key={s.label}
                className="stat-card hover-lift opacity-0 animate-bounce-in"
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: "forwards" }}
              >
                <div className="text-2xl mb-2">{s.icon}</div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-lg md:text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* ─── Input Section ─── */}
        <div
          className="opacity-0 animate-fade-in-up"
          style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 rounded-full bg-primary" />
              <h3 className="text-base font-bold text-foreground">
                {lang === "en" ? "Loan Details" : "ऋण विवरण"}
              </h3>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
              {lang === "en" ? "Fill all fields" : "सभी फ़ील्ड भरें"}
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <InputCard icon={<IndianRupee size={18} />} label={lang === "en" ? "Monthly Income" : "मासिक आय"} sublabel={lang === "en" ? "Per month ₹" : "प्रति माह ₹"} value={income} onChange={setIncome} prefix="₹" min={1000} delay={100} />
            <InputCard icon={<Landmark size={18} />} label={lang === "en" ? "Loan Amount" : "ऋण राशि"} sublabel={lang === "en" ? "Required ₹" : "आवश्यक ₹"} value={loanAmt} onChange={setLoanAmt} prefix="₹" min={1000} delay={200} />
            <InputCard icon={<BarChart2 size={18} />} label={lang === "en" ? "Interest Rate" : "ब्याज दर"} sublabel={lang === "en" ? "Annual %" : "वार्षिक %"} value={rate} onChange={setRate} prefix="%" min={0} max={30} step={0.1} delay={300} />
            <InputCard icon={<Clock size={18} />} label={lang === "en" ? "Duration" : "अवधि"} sublabel={lang === "en" ? "Months" : "महीने"} value={months} onChange={setMonths} min={6} max={360} delay={400} />
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={analyze}
              disabled={analyzing}
              className="krishi-btn-primary flex items-center gap-2.5 px-8 py-3.5 text-base"
            >
              {analyzing ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>{lang === "en" ? "Analyzing..." : "विश्लेषण हो रहा है..."}</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>{lang === "en" ? "Analyze My Loan" : "मेरे ऋण का विश्लेषण करें"}</span>
                </>
              )}
            </button>
            <button
              onClick={() => setIsListening(!isListening)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isListening
                  ? "bg-risk-high text-primary-foreground scale-110"
                  : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
              title="Voice Input"
            >
              <Mic size={18} />
              {isListening && <div className="absolute w-12 h-12 rounded-xl border-2 border-risk-high animate-pulse-ring" />}
            </button>
          </div>
        </div>

        {/* ─── Results ─── */}
        {analyzed && result && (
          <div
            className="space-y-5 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 rounded-full bg-secondary" />
              <h3 className="text-base font-bold text-foreground">
                {lang === "en" ? "Analysis Results" : "विश्लेषण परिणाम"}
              </h3>
              <span className="ml-auto text-xs text-secondary font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} /> {lang === "en" ? "Analysis complete" : "विश्लेषण पूर्ण"}
              </span>
            </div>

            {/* Risk + Advice */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Risk Meter */}
              <div className="stat-card hover-lift">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-risk-medium-bg flex items-center justify-center">
                    <AlertTriangle size={16} className="text-risk-medium" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{lang === "en" ? "Risk Assessment" : "जोखिम मूल्यांकन"}</h4>
                    <p className="text-[10px] text-muted-foreground">{lang === "en" ? "AI-powered analysis" : "AI संचालित विश्लेषण"}</p>
                  </div>
                </div>
                <RiskMeter score={Number(result.riskScore) || 0} lang={lang} />
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-muted">
                    <p className="text-[10px] text-muted-foreground">{lang === "en" ? "EMI / Income" : "EMI / आय"}</p>
                    <p className="font-bold text-foreground text-sm mt-0.5">
                      {((result.emi / (parseFloat(income) || 1)) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted">
                    <p className="text-[10px] text-muted-foreground">{lang === "en" ? "Risk Level" : "जोखिम स्तर"}</p>
                    <p className="font-bold text-foreground text-sm mt-0.5">{result.risk}</p>
                  </div>
                </div>
              </div>

              {/* AI Advice */}
              <div className="stat-card hover-lift">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Lightbulb size={16} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{lang === "en" ? "AI Advice" : "AI सुझाव"}</h4>
                    <p className="text-[10px] text-muted-foreground">{lang === "en" ? "Personalized for your farm" : "आपके खेत के लिए"}</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {result.advice.map((a, i) => (
                    <div
                      key={i}
                      className="flex gap-2.5 p-3 rounded-xl bg-muted/60 text-sm text-foreground leading-relaxed opacity-0 animate-slide-in-left"
                      style={{ animationDelay: `${200 + i * 100}ms`, animationFillMode: "forwards" }}
                    >
                      <span className="shrink-0 text-base">{a.slice(0, 2)}</span>
                      <span className="text-xs">{a.slice(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── Chart ─── */}
            <div className="stat-card">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <TrendingUp size={16} className="text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{lang === "en" ? "EMI vs Income" : "EMI बनाम आय"}</h4>
                    <p className="text-[10px] text-muted-foreground">{lang === "en" ? "Monthly comparison" : "मासिक तुलना"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                    <span className="w-3 h-1.5 rounded-full bg-primary inline-block" /> EMI
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                    <span className="w-3 h-1.5 rounded-full bg-secondary inline-block" /> {lang === "en" ? "Income" : "आय"}
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gEMI" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(258 68% 58%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(258 68% 58%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(145 45% 55%)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(145 45% 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={result.emi} stroke="hsl(258 68% 58%)" strokeDasharray="4 4" strokeWidth={1.5} />
                  <Area type="monotone" dataKey="Income" stroke="hsl(145 45% 55%)" strokeWidth={2.5} fill="url(#gIncome)" dot={false} />
                  <Area type="monotone" dataKey="EMI" stroke="hsl(258 68% 58%)" strokeWidth={2.5} fill="url(#gEMI)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* ─── What-If Simulator ─── */}
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                  <Sliders size={16} className="text-accent-foreground" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">{lang === "en" ? "\"What If\" Simulator" : "\"क्या होगा\" सिमुलेटर"}</h4>
                  <p className="text-[10px] text-muted-foreground">{lang === "en" ? "Adjust and see instant results" : "बदलें और तुरंत परिणाम देखें"}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    {lang === "en" ? "Live" : "लाइव"} ⚡
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-semibold text-foreground">{lang === "en" ? "Interest Rate" : "ब्याज दर"}</label>
                      <span className="text-xs font-bold text-primary">{whatIfRate[0]}%</span>
                    </div>
                    <Slider
                      min={4} max={20} step={0.5}
                      value={whatIfRate}
                      onValueChange={setWhatIfRate}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>4%</span><span>20%</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-semibold text-foreground">{lang === "en" ? "Tenure" : "अवधि"}</label>
                      <span className="text-xs font-bold text-primary">{whatIfMonths[0]} {lang === "en" ? "months" : "महीने"}</span>
                    </div>
                    <Slider
                      min={6} max={360} step={6}
                      value={whatIfMonths}
                      onValueChange={setWhatIfMonths}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>6 {lang === "en" ? "mo" : "महीने"}</span><span>360 {lang === "en" ? "mo" : "महीने"}</span>
                    </div>
                  </div>
                </div>

                {/* What-if results */}
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl" style={{ background: whatIfDTI <= 40 ? "hsl(var(--risk-safe-bg))" : whatIfDTI <= 70 ? "hsl(var(--risk-medium-bg))" : "hsl(var(--risk-high-bg))" }}>
                    <p className="text-xs text-muted-foreground">{lang === "en" ? "New EMI" : "नई EMI"}</p>
                    <p className="text-2xl font-bold mt-0.5" style={{ color: whatIfDTI <= 40 ? "hsl(var(--risk-safe))" : whatIfDTI <= 70 ? "hsl(var(--risk-medium))" : "hsl(var(--risk-high))" }}>
                      ₹{formatINR(Math.round(whatIfEMI))}
                    </p>
                    <p className="text-xs mt-1" style={{ color: whatIfDTI <= 40 ? "hsl(var(--risk-safe))" : whatIfDTI <= 70 ? "hsl(var(--risk-medium))" : "hsl(var(--risk-high))" }}>
                      {lang === "en" ? "Risk" : "जोखिम"}: {whatIfDTI.toFixed(1)}%
                    </p>
                  </div>
                  {compareData.length > 0 && (
                    <ResponsiveContainer width="100%" height={90}>
                      <BarChart data={compareData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip formatter={(v: any) => `₹${formatINR(v)}`} />
                        <Bar dataKey="EMI" radius={[6, 6, 0, 0]}>
                          {compareData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Government Schemes ─── */}
        <div
          className="opacity-0 animate-fade-in-up"
          style={{ animationDelay: analyzed ? "300ms" : "500ms", animationFillMode: "forwards" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 rounded-full bg-secondary" />
            <h3 className="text-base font-bold text-foreground">
              {lang === "en" ? "Government Schemes" : "सरकारी योजनाएं"}
            </h3>
            <span className="ml-auto text-xs text-muted-foreground">{lang === "en" ? "Tap to explore" : "एक्सप्लोर करें"}</span>
          </div>
          {/* Header row */}
<div className="flex items-center mb-2">
  <h3 className="text-lg font-bold">
    {lang === "en" ? "Government Schemes" : "सरकारी योजनाएं"}
  </h3>

  <span className="ml-auto text-xs text-muted-foreground">
    {lang === "en" ? "Tap to explore" : "एक्सप्लोर करें"}
  </span>
</div>

{/* Grid */}
{/* Grid */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-50">
  
  {schemes.length > 0 ? (
    schemes.map((s, i) => (
      <a
        key={s._id || i}
        href={s.link}
        target="_blank"
        rel="noopener noreferrer"
        className="relative p-4 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-card transition-all duration-300 cursor-pointer block"
      >
        <div className="text-2xl mb-2">🌱</div>

        <p className="text-xs font-bold text-foreground">
          {s.name}
        </p>

        <p className="text-[10px] text-muted-foreground mt-1">
          {s.benefit}
        </p>

        <p className="text-[10px] text-muted-foreground">
          {s.eligibility}
        </p>

        {s.link && (
          <p className="mt-2 text-xs text-blue-500 font-semibold hover:underline">
            {lang === "en" ? "Apply Now →" : "आवेदन करें →"}
          </p>
        )}

        <p className="text-[10px] text-primary mt-1">
          ⭐ {lang === "en"
            ? "Recommended for you"
            : "आपके लिए सुझाया गया"}
        </p>
      </a>
    ))
  ) : (
    <>
      {/* fallback cards */}
      <div className="p-4 rounded-2xl bg-card border border-border">
        No schemes available
      </div>
    </>
  )}
</div>
        {/* Empty state */}
        {!analyzed && (
          <div
            className="flex flex-col items-center justify-center py-12 text-center opacity-0 animate-fade-in"
            style={{ animationDelay: "700ms", animationFillMode: "forwards" }}
          >
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-4 animate-float">
              <img src={logoImg} alt="logo" className="w-14 h-14 object-contain" loading="lazy" width={56} height={56} />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {lang === "en" ? "Ready to Analyze!" : "विश्लेषण के लिए तैयार!"}
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              {lang === "en"
                ? "Fill in your loan details above and click Analyze to get personalized AI-powered advice."
                : "ऊपर ऋण विवरण भरें और व्यक्तिगत AI सलाह पाने के लिए विश्लेषण पर क्लिक करें।"}
            </p>
            <div className="flex items-center gap-1.5 mt-3 text-xs text-primary font-semibold">
              <Info size={12} />
              <span>{lang === "en" ? "Supports Hindi & English" : "हिंदी और English दोनों समर्थित"}</span>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* ─── Risk Alert Modal ─── */}
      {showAlert === true && (
        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm flex items-center justify-center z-10 p-4 animate-fade-in">
          <div className="bg-card rounded-3xl p-6 max-w-sm w-full shadow-card-hover border border-risk-high/30 animate-bounce-in">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-risk-high-bg flex items-center justify-center">
                <AlertTriangle size={26} className="text-risk-high" />
              </div>
              <button onClick={() => setShowAlert(false)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X size={16} />
              </button>
            </div>
            <h3 className="font-bold text-foreground text-xl">
              {lang === "en" ? "⚠️ High Risk Alert!" : "⚠️ उच्च जोखिम चेतावनी!"}
            </h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {lang === "en"
                ? "Your EMI-to-income ratio is dangerously high. This loan may be difficult to repay. Consider a smaller loan or longer tenure."
                : "आपका EMI-से-आय अनुपात बहुत अधिक है। इस ऋण को चुकाना मुश्किल हो सकता है।"}
            </p>
            <div className="my-4 p-3 rounded-xl bg-risk-high-bg">
              <p className="text-xs font-bold text-risk-high">
                {lang === "en" ? "Recommended: Extend tenure or reduce loan amount" : "सुझाव: अवधि बढ़ाएं या ऋण राशि कम करें"}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAlert(false)}
                className="flex-1 py-2.5 rounded-xl bg-muted text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors"
              >
                {lang === "en" ? "Dismiss" : "अनदेखा करें"}
              </button>
              <button
                onClick={() => { setShowAlert(false); setMonths(String(Math.min(360, parseInt(months) * 2))); }}
                className="flex-1 py-2.5 rounded-xl text-primary-foreground text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "var(--gradient-primary)" }}
              >
                {lang === "en" ? "Adjust Tenure" : "अवधि बदलें"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Mobile bottom navigation ─── */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-card/95 backdrop-blur-xl border-t border-border px-2 py-2 flex justify-around z-20">
        {[
          { icon: <Home size={20} />, label: lang === "en" ? "Home" : "होम", tab: "home" as const },
          { icon: <BarChart2 size={20} />, label: lang === "en" ? "Analyze" : "विश्लेषण", tab: "analyze" as const },
          { icon: <BookOpen size={20} />, label: lang === "en" ? "Schemes" : "योजनाएं", tab: "schemes" as const },
          { icon: <User2 size={20} />, label: lang === "en" ? "Profile" : "प्रोफाइल", tab: "profile" as const },
        ].map((item) => (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200 ${
              activeTab === item.tab
                ? "text-primary bg-primary/10"
                : "text-muted-foreground"
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-semibold">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
