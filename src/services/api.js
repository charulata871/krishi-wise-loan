const BASE_URL = "http://localhost:5000/api";

// 🔐 Helper for auth header
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: token ? token : "",
  };
};

// 🔍 Analyze Loan
export const analyzeLoan = async (data) => {
  const user =
    JSON.parse(localStorage.getItem("krishi_user") || "{}")?.name ||
    "Farmer";
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      ...data,
      name: user, // ✅ FIXED (backend expects name)
    }),
  });

  if (!res.ok) throw new Error("Analyze failed");

  return res.json();
};

// 🌦 Weather
export const getWeather = async (city = "Delhi") => {
  const res = await fetch(`${BASE_URL}/weather?city=${city}`);

  if (!res.ok) throw new Error("Weather failed");

  return res.json();
};

// 📜 History
export const getHistory = async () => {
  const user =
    JSON.parse(localStorage.getItem("krishi_user") || "{}")?.name ||
    "Farmer";

  const res = await fetch(`${BASE_URL}/history/${user}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("History failed");

  return res.json();
};