export const featureFields = [
  { name: "age", label: "Age (Years)", description: "18-100", type: "number", range: [18, 100] },
  { name: "job", label: "Job Level", description: "0-3 (0=Unskilled, 3=Highly Skilled)", type: "number", range: [0, 3] },
  { name: "housing", label: "Housing Status", description: "0=Own, 1=Rent, 2=Free", type: "number", range: [0, 2] },
  { name: "saving", label: "Saving Accounts", description: "0-3 (0=Unknown)", type: "number", range: [0, 3] },
  { name: "checking", label: "Checking Account", description: "0-3 (0=Unknown)", type: "number", range: [0, 3] },
  { name: "credit", label: "Credit Amount", description: "$0-50000", type: "number", range: [0, 50000] },
  { name: "duration", label: "Duration (Months)", description: "1-60 months", type: "number", range: [1, 60] },
  { name: "purpose", label: "Loan Purpose", description: "0-4", type: "number", range: [0, 4] },
  { name: "sex", label: "Gender", description: "0=Female, 1=Male", type: "number", range: [0, 1] },
  { name: "other", label: "Other Feature", description: "0/1", type: "number", range: [0, 1] },
];
