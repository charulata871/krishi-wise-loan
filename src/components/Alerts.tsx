import { useState, useEffect } from "react";
import axios from "axios";

export default function Alerts({ emi, income }: { emi: number; income: number }) {
  const [alerts, setAlerts] = useState<string[]>([]);

  const getAlerts = async () => {
    try {
     const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/alerts`,
      {
        emi,
        income,
      });

      setAlerts(res.data.alerts);
    } catch (err) {
      console.error("Alert fetch error:", err);
    }
  };

  useEffect(() => {
    if (emi && income) {
      getAlerts();
    }
  }, [emi, income]);

  return (
    <div className="space-y-2">
      {alerts.map((a, i) => (
        <div key={i} className="p-2 rounded-lg bg-yellow-100 text-sm">
          {a}
        </div>
      ))}
    </div>
  );
}