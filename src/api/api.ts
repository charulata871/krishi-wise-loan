const BASE_URL = "http://localhost:5000/api";

// ANALYZE
export const analyzeLoan = async (data: any) => {
  const user = localStorage.getItem("krishi_user");

  const res = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      name: user,
    }),
  });

  if (!res.ok) throw new Error("Analyze failed");
  return res.json();
};

// WEATHER
export const getWeather = async (city = "Delhi") => {
  const res = await fetch(`${BASE_URL}/weather?city=${city}`);

  if (!res.ok) throw new Error("Weather failed");
  return res.json();
};

// SCHEMES
export const getSchemes = async (payload: any) => {
  const res = await fetch(`${BASE_URL}/schemes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Schemes failed");
  return res.json();
};