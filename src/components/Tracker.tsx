import { useState, useEffect } from "react";
import axios from "axios";

export default function Tracker() {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("");
  const [data, setData] = useState<any[]>([]);

  const fetchData = async () => {
    const res = await axios.get("https://backend-1-xj9l.onrender.com//api/transaction");
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/transaction`,
      {
      type,
      category
    });
    fetchData();
  };

  return (
    <div>
      <h2>Tracker</h2>

      <input placeholder="Amount" onChange={(e) => setAmount(e.target.value)} />

      <select onChange={(e) => setType(e.target.value)}>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      <input placeholder="Category" onChange={(e) => setCategory(e.target.value)} />

      <button onClick={handleSubmit}>Add</button>

      <hr />

      {data.map((item, i) => (
        <div key={i}>
          {item.type} - ₹{item.amount} ({item.category})
        </div>
      ))}
    </div>
  );
}