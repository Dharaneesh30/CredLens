export const riskDistributionData = [
  { name: "Low Risk", value: 45, fill: "#4caf50" },
  { name: "Medium Risk", value: 35, fill: "#ff9800" },
  { name: "High Risk", value: 20, fill: "#f44336" },
];

export const ageDistributionData = [
  { range: "18-25", count: 120 },
  { range: "26-35", count: 280 },
  { range: "36-45", count: 350 },
  { range: "46-55", count: 200 },
  { range: "55+", count: 150 },
];

export const creditAmountDistribution = [
  { range: "$0-5K", count: 250 },
  { range: "$5K-10K", count: 380 },
  { range: "$10K-20K", count: 420 },
  { range: "$20K-30K", count: 280 },
  { range: "$30K+", count: 170 },
];

export const edaInsights = [
  "Low-risk applicants make up the largest share of the dataset, while high-risk applicants remain a smaller but critical segment.",
  "Majority of borrowers fall in the 26-45 age range, which should be a focus for model calibration.",
  "Credit amounts cluster below $20K, with fewer applications in the highest loan tiers.",
  "The dataset appears balanced enough for classification, but edge cases should be reviewed for housing and savings categories.",
];
