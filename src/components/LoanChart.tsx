import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

function LoanChart({ income, emi }: { income: number; emi: number }) {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Income",
        data: [income, income, income, income, income],
        borderColor: "#22c55e",
        backgroundColor: "#22c55e33",
        tension: 0.4,
      },
      {
        label: "EMI",
        data: [emi, emi, emi, emi, emi],
        borderColor: "#ef4444",
        backgroundColor: "#ef444433",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  return (
    <div className="mt-6 p-4 bg-white rounded-xl border shadow">
      <h2 className="text-lg font-semibold mb-3">
        📊 EMI vs Income (Advanced)
      </h2>
      <Line data={data} options={options} />
    </div>
  );
}

export default LoanChart;