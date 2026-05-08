// EMI Calculation
export const calculateEMI = (
  principal: number,
  annualRate: number,
  tenureMonths: number
) => {
  const R = annualRate / 12 / 100;

  // Zero interest case
  if (R === 0) {
    return principal / tenureMonths;
  }

  const denominator = Math.pow(1 + R, tenureMonths) - 1;

  return denominator === 0
    ? principal / tenureMonths
    : (
        principal *
        R *
        Math.pow(1 + R, tenureMonths)
      ) / denominator;
};

// Debt-to-Income Ratio
export const calculateDTI = (emi: number, income: number) => {
  return Number(((emi / income) * 100).toFixed(2));
};

// Risk Score
export const calculateRisk = (dti: number, creditScore: number) => {
  let risk = 0;

  if (dti >= 70) risk += 50;
  else if (dti >= 40) risk += 30;
  else risk += 10;

  if (creditScore < 600) risk += 40;
  else if (creditScore < 750) risk += 20;
  else risk += 5;

  return Math.min(risk, 100);
};