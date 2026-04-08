export const calculateCreditScore = (probability) => (
  Math.min(850, Math.max(300, Math.round(300 + probability * 550)))
);

export const getRiskLevel = (score) => {
  if (score < 500) return "High Risk";
  if (score < 700) return "Medium Risk";
  return "Low Risk";
};

export const getLoanDecision = (score) => (
  score >= 650 ? "Approved" : "Rejected"
);
