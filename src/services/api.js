const BASE_URL = "https://backend-1-xj9l.onrender.com/api";

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
  const user = localStorage.getItem("krishi_user") || "Farmer";

  const res = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      ...data,
      name: user,
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
  const user = localStorage.getItem("krishi_user") || "Farmer";

  const res = await fetch(`${BASE_URL}/history/${user}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("History failed");

  return res.json();
};