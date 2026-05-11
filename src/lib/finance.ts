// EMI Calculation
export const calculateEMI = (
  principal: number,
  annualRate: number,
  tenureMonths: number
) => {
  const P = Number(principal);
  const N = Number(tenureMonths);
  const R = Number(annualRate) / 12 / 100;

  if (P <= 0 || N <= 0) return 0;

  if (R === 0) return Number((P / N).toFixed(2));

  const pow = Math.pow(1 + R, N);

  const emi = (P * R * pow) / (pow - 1);

  return Number.isFinite(emi) ? Number(emi.toFixed(2)) : 0;
};
// Debt-to-Income Ratio
export const calculateDTI = (emi: number, income: number) => {
  if (!income) return 0;
  return Number(((emi / income) * 100).toFixed(2));
};

// Risk Score
export const calculateRisk = (dti: number, creditScore: number) => {
  let risk = 0;

  // DTI weight (60%)
  if (dti >= 70) risk += 60;
  else if (dti >= 40) risk += 35;
  else risk += 15;

  // Credit weight (40%)
  if (creditScore < 600) risk += 40;
  else if (creditScore < 750) risk += 20;
  else risk += 5;

  return Math.min(Math.round(risk), 100);
};